// =============================================================================
// POST /api/auth/google · Autenticación Google OAuth para Cloudflare Pages Functions
// =============================================================================
import { getDb, readBody, route, json, str, HttpError, type Ctx } from "../_shared/turso";
import { createSessionToken } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

const ADMIN_EMAILS = [
  "famesa2005@gmail.com",
  "jolex3630@gmail.com",
];

const SESSION_COOKIE = "famesa_admin_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 3600;

function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export const onRequest = route("POST", async (ctx: Ctx) => {
  const body = await readBody<{ credential?: string }>(ctx.request);
  const credential = str(body.credential, 4096);

  if (!credential) {
    throw new HttpError(400, "Token de Google no proporcionado");
  }

  // 1. Validar el token directamente con Google
  const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const googleRes = await fetch(verifyUrl);
  if (!googleRes.ok) {
    throw new HttpError(401, "Token de Google inválido o expirado");
  }

  const payload = (await googleRes.json()) as {
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    sub?: string;
    picture?: string;
  };

  // 2. Verificar Audience si GOOGLE_CLIENT_ID está configurado o usar Client ID por defecto
  const DEFAULT_GOOGLE_CLIENT_ID =
    "368451259646-lvkp7q372m712rsj2adbidam4d72g4m0.apps.googleusercontent.com";
  const configuredClientId = ctx.env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  if (configuredClientId && payload.aud !== configuredClientId) {
    throw new HttpError(403, "Token no autorizado para esta aplicación");
  }

  // 3. Email verificado
  const emailVerified =
    payload.email_verified === "true" || payload.email_verified === true;
  if (!emailVerified) {
    throw new HttpError(403, "El correo de Google no está verificado");
  }

  const email = (payload.email || "").toLowerCase().trim();
  if (!email) {
    throw new HttpError(400, "Correo no provisto por Google");
  }

  const name = payload.name || "Usuario FAMESA";
  const picture = payload.picture || "";
  const isAdminEmail = ADMIN_EMAILS.includes(email);
  let userRole = isAdminEmail ? "admin" : "cliente";

  try {
    const db = getDb(ctx.env);
    const existing = await db.execute({
      sql: "SELECT id, email, name, role FROM users WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length === 0) {
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
  } catch (err) {
    console.warn("[functions/api/auth/google] Error en DB:", err);
  }

  const isAdmin = userRole === "admin" || isAdminEmail;
  // @ts-expect-error env property ADMIN_API_KEY
  const adminKey = isAdmin ? (ctx.env.ADMIN_API_KEY || "") : null;

  let token = "";
  if (isAdmin) {
    token = await createSessionToken(ctx.env, { email, role: "admin", name });
    await logAudit(ctx.env, "users", email, "login", "Google OAuth (Admin)", email);
  }

  const responseHeaders = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (token) {
    responseHeaders.set("Set-Cookie", buildSessionCookie(token));
  }

  return new Response(
    JSON.stringify({
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
    }),
    {
      status: 200,
      headers: responseHeaders,
    },
  );
});
