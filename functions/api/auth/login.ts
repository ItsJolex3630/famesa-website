// =============================================================================
// POST /api/auth/login · Autenticación del panel FAMESA SUITE.
// Verifica el usuario en `users` y emite un JWT de sesión (12 h).
// =============================================================================
import { getDb, readBody, route, json, str, HttpError } from "../_shared/turso";
import { createSessionToken, sha256Hex } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

export const onRequest = route("POST", async (ctx) => {
  const body = await readBody<{ email?: string; password?: string }>(ctx.request);
  const email = str(body.email, 160).toLowerCase();
  const password = str(body.password, 120);

  if (!email || !password) {
    throw new HttpError(400, "Correo y contraseña son obligatorios");
  }

  const db = getDb(ctx.env);
  const result = await db.execute({
    sql: "SELECT id, email, name, role, password_hash, active FROM users WHERE email = ?",
    args: [email],
  });
  const row = result.rows[0];
  if (!row || Number(row.active) !== 1) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const storedHash = row.password_hash ? String(row.password_hash) : "";
  let valid: boolean;
  if (storedHash) {
    valid = storedHash === (await sha256Hex(password));
  } else {
    // Usuarios semilla sin hash: se admite la contraseña de arranque configurada.
    valid = password === (ctx.env.ADMIN_DEV_PASSWORD || "famesa2026");
  }
  if (!valid) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const user = { email: String(row.email), role: String(row.role), name: String(row.name) };
  const token = await createSessionToken(ctx.env, user);

  await db.execute({
    sql: "UPDATE users SET last_login_at = datetime('now') WHERE email = ?",
    args: [email],
  });
  await logAudit(ctx.env, "users", email, "login", `Inicio de sesión (${user.role})`, email);

  return json({ ok: true, token, user });
});
