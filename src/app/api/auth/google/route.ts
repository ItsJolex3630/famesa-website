// =============================================================================
// POST /api/auth/google · Autenticación Google OAuth 2.0 (Google Identity Services)
// Valida el token con Google tokeninfo, verifica roles y entrega acceso administrativo.
// =============================================================================
export const runtime = "edge";

import {
  assertMethod,
  clientIp,
  errorResponse,
  getDb,
  isDbConfigured,
  json,
  logAudit,
  readBody,
  sha256Hex,
  signSession,
  str,
} from "@/lib/admin/server";

const ADMIN_EMAILS = [
  "famesa2005@gmail.com",
  "jolex3630@gmail.com",
];

const SESSION_COOKIE = "famesa_admin_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 3600; // 30 días persistente

function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");

    const body = await readBody<{ credential?: string }>(request);
    const credential = str(body.credential, 4096);

    if (!credential) {
      return json({ ok: false, error: "Token de Google no proporcionado" }, 400);
    }

    const ip = clientIp(request);
    const ipHash = (await sha256Hex(ip)).slice(0, 16);

    // 1. Validar el token directamente con Google
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const googleRes = await fetch(verifyUrl, { cache: "no-store" });
    if (!googleRes.ok) {
      await logAudit("auth", ipHash, "login_failed", "Token de Google inválido o expirado");
      return json({ ok: false, error: "Token de Google inválido o expirado" }, 401);
    }

    const payload = (await googleRes.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      sub?: string;
      picture?: string;
    };

    // 2. Validar Client ID si está configurado en el servidor
    const configuredClientId =
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud !== configuredClientId) {
      await logAudit("auth", ipHash, "login_failed", "Audience de Google no coincide con Client ID");
      return json({ ok: false, error: "Token no autorizado para esta aplicación" }, 403);
    }

    // 3. Validar email verificado
    const emailVerified =
      payload.email_verified === "true" || payload.email_verified === true;
    if (!emailVerified) {
      return json({ ok: false, error: "El correo de Google no está verificado" }, 403);
    }

    const email = (payload.email || "").toLowerCase().trim();
    if (!email) {
      return json({ ok: false, error: "Correo no provisto por Google" }, 400);
    }

    const name = payload.name || "Usuario FAMESA";
    const googleId = payload.sub || "";
    const picture = payload.picture || "";

    const isAdminEmail = ADMIN_EMAILS.includes(email);
    let userRole = isAdminEmail ? "admin" : "cliente";

    // 4. Si la base de datos está activa, sincronizar en la tabla users
    if (isDbConfigured()) {
      try {
        const db = getDb();
        const existing = await db.execute({
          sql: "SELECT id, email, name, role FROM users WHERE email = ?",
          args: [email],
        });

        if (existing.rows.length === 0) {
          // Registrar nuevo usuario
          await db.execute({
            sql: "INSERT INTO users (email, name, role, active, created_at, updated_at) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))",
            args: [email, name, userRole],
          });
        } else {
          const row = existing.rows[0];
          const currentRole = String(row.role);
          if (isAdminEmail && currentRole !== "admin") {
            await db.execute({
              sql: "UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?",
              args: [row.id],
            });
            userRole = "admin";
          } else {
            userRole = currentRole;
          }

          await db.execute({
            sql: "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
            args: [row.id],
          });
        }
      } catch (dbErr) {
        console.warn("[google-oauth] Error sincronizando con Turso:", dbErr);
      }
    }

    const isAdmin = userRole === "admin" || isAdminEmail;
    const adminKey = isAdmin ? (process.env.ADMIN_API_KEY || "") : null;

    let token = "";
    if (isAdmin) {
      token = await signSession({ email, role: "admin", name });
      await logAudit("auth", email, "login", "Inicio de sesión Google OAuth (Admin)", email);
    }

    return json(
      {
        ok: true,
        token,
        user: {
          email,
          name,
          role: isAdmin ? "admin" : userRole,
          picture,
          isAdmin,
          adminKey,
        },
      },
      200,
      token
        ? {
            "Set-Cookie": buildSessionCookie(token),
            "Cache-Control": "no-store",
          }
        : { "Cache-Control": "no-store" },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
