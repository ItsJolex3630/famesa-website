// =============================================================================
// FAMESA SUITE · Autenticación JWT (jose) para Cloudflare Pages Functions.
// =============================================================================
import { SignJWT, jwtVerify } from "jose";
import { HttpError, type Ctx, type Env } from "./turso";

const encoder = new TextEncoder();

export interface SessionUser {
  email: string;
  role: string;
  name: string;
}

function secretKey(env: Env): Uint8Array {
  return encoder.encode(env.ADMIN_JWT_SECRET || "famesa-suite-bootstrap-secret-change-me");
}

export async function createSessionToken(env: Env, user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey(env));
}

export async function verifySessionToken(env: Env, token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(env));
    return {
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "ventas"),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export function getBearer(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match && match[1] ? match[1].trim() : null;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function currentUser(ctx: Ctx): Promise<SessionUser | null> {
  const token = getBearer(ctx.request);
  if (!token) return null;
  return verifySessionToken(ctx.env, token);
}

export async function requireUser(ctx: Ctx): Promise<SessionUser> {
  const user = await currentUser(ctx);
  if (!user) throw new HttpError(401, "Sesión requerida");
  return user;
}

/** Verifica que el usuario autenticado tenga uno de los roles permitidos. */
export async function requireRole(ctx: Ctx, roles: string[]): Promise<SessionUser> {
  const user = await requireUser(ctx);
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "Tu rol no permite esta operación");
  }
  return user;
}
