// =============================================================================
// FAMESA SUITE · Middleware Global de Seguridad (Edge Runtime).
//
// Protege TODAS las rutas /admin/* (páginas) y /api/admin/* (datos):
//   - Autoriza el acceso programático con la cabecera `x-api-key` comparada en
//     TIEMPO CONSTANTE (SHA-256 + XOR) contra ADMIN_API_KEY.
//   - Autoriza la sesión de navegador mediante cookie JWT HttpOnly o Bearer.
//   - Responde 401 de inmediato a toda llamada no autorizada a /api/admin/*.
//   - FAIL-CLOSED: en producción, sin ADMIN_JWT_SECRET fuerte, ninguna sesión
//     es válida (jamás se acepta el secreto por defecto ni claves vacías).
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();
const SESSION_COOKIE = "famesa_admin_session";
const INSECURE_JWT_FALLBACK = "famesa-suite-bootstrap-secret-change-me";
const MIN_SECRET_LENGTH = 16;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Clave API maestra; null si falta o es insegura (nunca vacía por defecto). */
function getAdminApiKey(): string | null {
  const key = process.env.ADMIN_API_KEY?.trim();
  if (!key || key.length < MIN_SECRET_LENGTH) return null;
  return key;
}

/** Secreto de firma JWT; null en producción si es débil (fail-closed). */
function getJwtSecret(): Uint8Array | null {
  const raw = process.env.ADMIN_JWT_SECRET?.trim();
  if (raw && raw.length >= MIN_SECRET_LENGTH && raw !== INSECURE_JWT_FALLBACK) {
    return encoder.encode(raw);
  }
  // Paridad con el fallback de desarrollo de server.ts; en producción se deniega.
  return isProduction() ? null : encoder.encode(INSECURE_JWT_FALLBACK);
}

/** Comparación en tiempo constante de dos cadenas (digest SHA-256 + XOR). */
async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const [bufA, bufB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(bufA);
  const viewB = new Uint8Array(bufB);
  let mismatch = 0;
  for (let i = 0; i < viewA.length; i += 1) {
    mismatch |= viewA[i] ^ viewB[i];
  }
  return mismatch === 0;
}

/** Valida la cookie de sesión o el token Bearer. */
async function hasValidSession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const token = cookie || bearer;
  if (!token) return false;

  const secret = getJwtSecret();
  if (!secret) return false; // fail-closed
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin");
  if (!isAdminApi && !isAdminPage) return NextResponse.next();

  // 1. Acceso programático con x-api-key (tiempo constante).
  let authorized = false;
  const providedKey = request.headers.get("x-api-key")?.trim() || "";
  const expectedKey = getAdminApiKey();
  if (providedKey && expectedKey) {
    authorized = await timingSafeEqualStrings(providedKey, expectedKey);
  }

  // 2. Sesión JWT (cookie HttpOnly o Bearer).
  if (!authorized) {
    authorized = await hasValidSession(request);
  }

  // 3. API no autorizada -> 401 inmediato, sin exponer datos.
  if (isAdminApi && !authorized) {
    return NextResponse.json(
      { ok: false, error: "Acceso no autorizado: se requiere sesión válida o cabecera x-api-key" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // 4. Páginas: se permite renderizar el bloqueo (sin datos), marcando el estado.
  const response = NextResponse.next();
  response.headers.set("x-famesa-admin-auth", authorized ? "authorized" : "required");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
