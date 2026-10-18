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
    const url = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new HttpError(500, "Base de datos no configurada en el servidor");
    }
    client = createClient({ url, authToken });
  }
  return client;
}

export function isDbConfigured(): boolean {
  return Boolean((process.env.TURSO_URL || process.env.TURSO_DATABASE_URL) && process.env.TURSO_AUTH_TOKEN);
}

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
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

/** Secreto de arranque histórico: NUNCA debe usarse en producción. */
const INSECURE_JWT_FALLBACK = "famesa-suite-bootstrap-secret-change-me";
const MIN_SECRET_LENGTH = 16;

/**
 * Devuelve la clave de firma JWT con principio FAIL-CLOSED.
 * En producción, si el secreto falta, es corto o conserva el valor por defecto,
 * lanza HttpError(500) y el acceso queda denegado. En desarrollo permite el
 * fallback para no romper la experiencia local.
 */
function secretKey(): Uint8Array {
  const raw = process.env.ADMIN_JWT_SECRET?.trim();
  const isWeak = !raw || raw.length < MIN_SECRET_LENGTH || raw === INSECURE_JWT_FALLBACK;
  if (isWeak) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(500, "ADMIN_JWT_SECRET no configurado o inseguro en producción");
    }
    return encoder.encode(INSECURE_JWT_FALLBACK);
  }
  return encoder.encode(raw);
}

// --- Verificación Criptográfica de Clave API (Tiempo Constante) ---

/**
 * Obtiene la clave API del entorno garantizando Fail-Closed.
 * Si no está definida o es demasiado corta, arroja HttpError(500).
 */
export function getAdminApiKey(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.trim().length < MIN_SECRET_LENGTH) {
    throw new HttpError(
      500,
      "Clave API administrativa (ADMIN_API_KEY) no configurada o insegura en el servidor.",
    );
  }
  return key.trim();
}

/**
 * Compara dos cadenas en tiempo constante mediante digest SHA-256 y XOR.
 * Es compatible tanto con Node.js como con Edge Runtime (Vercel/Cloudflare).
 */
export async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const bufA = await crypto.subtle.digest("SHA-256", encoder.encode(a));
  const bufB = await crypto.subtle.digest("SHA-256", encoder.encode(b));
  const viewA = new Uint8Array(bufA);
  const viewB = new Uint8Array(bufB);

  let mismatch = 0;
  for (let i = 0; i < viewA.length; i += 1) {
    mismatch |= viewA[i] ^ viewB[i];
  }
  return mismatch === 0;
}

/**
 * Valida si la clave API candidata coincide exactamente con la configurada.
 * Nunca lanza: ante cualquier fallo (clave ausente o no configurada) devuelve false.
 */
export async function verifyAdminApiKey(candidateKey: string): Promise<boolean> {
  if (!candidateKey || typeof candidateKey !== "string") return false;
  try {
    const masterKey = getAdminApiKey();
    return await timingSafeCompare(candidateKey.trim(), masterKey);
  } catch {
    return false;
  }
}

/**
 * Extrae la IP del cliente tras el proxy (compatible Vercel / Cloudflare Pages).
 */
export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  const xff = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const first = xff ? xff.split(",")[0] : "";
  const raw = (cf || first || real || "unknown").trim();
  return raw.slice(0, 100) || "unknown";
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

export function sessionCookie(request: Request): string | null {
  const raw = request.headers.get("cookie") || "";
  if (!raw) return null;
  const parts = raw.split(";");
  for (const part of parts) {
    const [k, ...v] = part.trim().split("=");
    if (k === "famesa_admin_session" && v.length > 0) {
      return decodeURIComponent(v.join("=").trim());
    }
  }
  return null;
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = bearer(request) || sessionCookie(request);
  if (token) {
    const verified = await verifySession(token);
    if (verified) return verified;
  }
  const apiKey = request.headers.get("x-api-key")?.trim();
  if (apiKey && (await verifyAdminApiKey(apiKey))) {
    return { email: "famesa2005@gmail.com", role: "admin", name: "Administrador FAMESA" };
  }
  return null;
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
  | "login_failed"
  | "logout"
  | "export";

export async function logAudit(
  entity: string,
  entityId: string,
  action: AuditAction,
  details: string,
  userEmail = "famesa2005@gmail.com",
): Promise<void> {
  try {
    const db = getDb();
    const dbAction =
      action === "login_failed" || action === "logout" ? "login" : action;
    await db.execute({
      sql: "INSERT INTO audit_log (user_email, entity, entity_id, action, details) VALUES (?, ?, ?, ?, ?)",
      args: [userEmail, entity, entityId, dbAction, details],
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
  return num(result.rows[0]?.value, 880.12);
}

/** Parsea JSON seguro desde columnas `notes` sin fallar si hay texto plano. */
export function parseMeta(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "string") return {};
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return { _text: trimmed };
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return { _text: trimmed };
  }
}

export function serializeMeta(meta: Record<string, unknown>): string {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v !== undefined && k !== "_text") clean[k] = v;
  }
  return JSON.stringify(clean);
}

