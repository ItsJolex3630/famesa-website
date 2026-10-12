// =============================================================================
// PUT /api/admin/exchange-rate · Actualiza la tasa Bs./USD del día.
// Nunca altera la tasa congelada de facturas ya emitidas.
// =============================================================================
import { getDb, num, readBody, route, json, HttpError } from "../_shared/turso";
import { requireUser } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

export const onRequest = route("PUT", async (ctx) => {
  const user = await requireUser(ctx);
  const body = await readBody<{ rate_usd_ves?: number }>(ctx.request);
  const rate = num(body.rate_usd_ves);
  if (!(rate > 0)) {
    throw new HttpError(400, "La tasa debe ser mayor que cero");
  }

  const db = getDb(ctx.env);
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('rate_usd_ves', ?, datetime('now'))",
    args: [String(rate)],
  });
  await db.execute({
    sql: "INSERT INTO exchange_rates (date, rate_usd_ves, source) VALUES (date('now'), ?, 'Panel FAMESA SUITE')",
    args: [rate],
  });
  await logAudit(ctx.env, "settings", "rate_usd_ves", "update", `Tasa actualizada a ${rate} Bs./USD`, user.email);

  return json({ ok: true, rate });
});
