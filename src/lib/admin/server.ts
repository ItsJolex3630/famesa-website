// =============================================================================
// FAMESA SUITE · Capa servidor para las rutas /api/* de Next (Edge Runtime).
// Cloudflare Pages (@cloudflare/next-on-pages) sirve estas rutas vía _worker.js;
// el directorio functions/ no se despliega en modo avanzado.
// =============================================================================
import { createClient, type Client } from "@libsql/client/web";
import { SignJWT, jwtVerify } from "jose";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new HttpError(500, "Base de datos no configurada en el servidor");
    }
    client = createClient({ url, authToken });
  }
  return client;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function readBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Cuerpo de la petición inválido");
  }
}

export function str(value: unknown, max = 500): string {
  return String(value ?? "").slice(0, max).trim();
}

export function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return json({ ok: false, error: error.message }, error.status);
  }
  console.error("FAMESA SUITE API error:", error);
  return json({ ok: false, error: "Error interno del servidor" }, 500);
}

export function assertMethod(request: Request, allowed: string | string[]): void {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(request.method.toUpperCase())) {
    throw new HttpError(405, "Método no permitido");
  }
}

// --- Autenticación JWT (jose) ---
const encoder = new TextEncoder();
function secretKey(): Uint8Array {
  return encoder.encode(process.env.ADMIN_JWT_SECRET || "famesa-suite-bootstrap-secret-change-me");
}

export interface SessionUser {
  email: string;
  role: string;
  name: string;
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "ventas"),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match && match[1] ? match[1].trim() : null;
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = bearer(request);
  return token ? verifySession(token) : null;
}

export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await currentUser(request);
  if (!user) throw new HttpError(401, "Sesión requerida");
  return user;
}

export async function requireRole(request: Request, roles: string[]): Promise<SessionUser> {
  const user = await requireUser(request);
  if (!roles.includes(user.role)) throw new HttpError(403, "Tu rol no permite esta operación");
  return user;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "login"
  | "export";

export async function logAudit(
  entity: string,
  entityId: string,
  action: AuditAction,
  details: string,
  userEmail = "sistema",
): Promise<void> {
  try {
    const db = getDb();
    await db.execute({
      sql: "INSERT INTO audit_log (user_email, entity, entity_id, action, details) VALUES (?, ?, ?, ?, ?)",
      args: [userEmail, entity, entityId, action, details],
    });
  } catch (error) {
    console.error("audit_log error:", error);
  }
}

/** Correlativo desde settings.seq_* */
export async function nextSeq(key: string, fallback: number): Promise<number> {
  const db = getDb();
  const current = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: [key] });
  const seq = num(current.rows[0]?.value, fallback) + 1;
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
    args: [key, String(seq)],
  });
  return seq;
}

export async function getRate(): Promise<number> {
  const db = getDb();
  const result = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
  return num(result.rows[0]?.value, 54.8);
}
