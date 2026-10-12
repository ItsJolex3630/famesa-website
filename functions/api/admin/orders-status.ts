// =============================================================================
// PUT /api/admin/orders-status · Cambia el estado de una orden de trabajo.
// =============================================================================
import { getDb, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

const ALLOWED = ["pendiente", "en_proceso", "control_calidad", "terminada", "entregada", "facturada", "cancelada"];

export const onRequest = route("PUT", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "ventas", "taller"]);
  const body = await readBody<{ order_code?: string; status?: string }>(ctx.request);
  const code = str(body.order_code, 40);
  const status = str(body.status, 30);
  if (!code || !ALLOWED.includes(status)) {
    throw new HttpError(400, "Código o estado inválido");
  }

  const db = getDb(ctx.env);
  const stamp =
    status === "en_proceso"
      ? ", started_at = COALESCE(started_at, datetime('now'))"
      : status === "terminada" || status === "entregada"
        ? ", finished_at = COALESCE(finished_at, datetime('now'))"
        : "";
  await db.execute({
    sql: `UPDATE orders SET status = ?, updated_at = datetime('now')${stamp} WHERE code = ?`,
    args: [status, code],
  });
  await logAudit(ctx.env, "orders", code, "status_change", `Estado → ${status}`, user.email);

  return json({ ok: true, status });
});
