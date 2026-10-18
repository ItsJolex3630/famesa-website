// =============================================================================
// POST /api/auth/verify-key · Desbloqueo del panel FAMESA SUITE.
//
// Valida la Clave API Maestra (ADMIN_API_KEY) en tiempo constante, aplica un
// rate-limit anti fuerza bruta (5 intentos / 15 min por IP) y, si es correcta,
// emite una cookie de sesión JWT HttpOnly + Secure + SameSite=Strict.
// FAIL-CLOSED: si ADMIN_API_KEY no está configurada, la validación falla siempre.
// =============================================================================
export const runtime = "edge";

import {
  HttpError,
  assertMethod,
  clientIp,
  errorResponse,
  json,
  logAudit,
  readBody,
  sha256Hex,
  signSession,
  str,
  verifyAdminApiKey,
} from "@/lib/admin/server";
import { checkRateLimit, resetRateLimit } from "@/lib/admin/rate-limiter";

const SESSION_COOKIE = "famesa_admin_session";
const SESSION_MAX_AGE_SECONDS = 28800; // 8 horas

function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");

    const body = await readBody<{ apiKey?: string }>(request);
    const apiKey = str(body.apiKey, 512);
    const ip = clientIp(request);
    const ipHash = (await sha256Hex(ip)).slice(0, 16);

    // 1. Anti fuerza bruta (antes de tocar la clave maestra).
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      await logAudit("auth", ipHash, "login_failed", "Bloqueo temporal por demasiados intentos (429)");
      return json(
        {
          ok: false,
          error: `Demasiados intentos fallidos. Bloqueado por ${limit.resetInSeconds} segundos.`,
          retryAfterSeconds: limit.resetInSeconds,
        },
        429,
        { "Retry-After": String(limit.resetInSeconds) },
      );
    }

    // 2. Validación criptográfica en tiempo constante (fail-closed).
    const valid = apiKey.length > 0 && (await verifyAdminApiKey(apiKey));
    if (!valid) {
      await logAudit("auth", ipHash, "login_failed", "Intento fallido de desbloqueo con clave API incorrecta");
      return json({ ok: false, error: "Clave API de Administrador incorrecta" }, 401);
    }

    // 3. Éxito: reinicia el contador y emite la sesión firmada.
    resetRateLimit(ip);
    const user = { email: "admin@famesa.com.ve", role: "admin", name: "Administrador FAMESA" };
    const token = await signSession(user);
    await logAudit("auth", "admin", "login", "Desbloqueo exitoso del panel (clave API)", user.email);

    return json({ ok: true, token, user }, 200, {
      "Set-Cookie": buildSessionCookie(token),
      "Cache-Control": "no-store",
    });
  } catch (error) {
    if (error instanceof HttpError && error.status === 500) {
      console.error("[verify-key] Configuración insegura:", error.message);
    }
    return errorResponse(error);
  }
}
