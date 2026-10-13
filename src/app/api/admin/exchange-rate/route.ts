// PUT /api/admin/exchange-rate · Actualiza la tasa Bs./USD del día.
export const runtime = "edge";

import { getDb, num, readBody, json, errorResponse, assertMethod, requireUser, logAudit, HttpError } from "@/lib/admin/server";

export async function PUT(request: Request) {
  try {
    assertMethod(request, "PUT");
    const user = await requireUser(request);
    const body = await readBody<{ rate_usd_ves?: number }>(request);
    const rate = num(body.rate_usd_ves);
    if (!(rate > 0)) throw new HttpError(400, "La tasa debe ser mayor que cero");

    const db = getDb();
    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('rate_usd_ves', ?, datetime('now'))",
      args: [String(rate)],
    });
    await db.execute({
      sql: "INSERT INTO exchange_rates (date, rate_usd_ves, source) VALUES (date('now'), ?, 'Panel FAMESA SUITE')",
      args: [rate],
    });
    await logAudit("settings", "rate_usd_ves", "update", `Tasa actualizada a ${rate} Bs./USD`, user.email);
    return json({ ok: true, rate });
  } catch (error) {
    return errorResponse(error);
  }
}
