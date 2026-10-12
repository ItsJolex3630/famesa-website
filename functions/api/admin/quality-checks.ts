// =============================================================================
// POST /api/admin/quality-checks · Firma el control dimensional de una OT.
// Un resultado aprobado marca la orden como terminada.
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

const RESULTS = ["aprobado", "observacion", "rechazado_reproceso"];

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "taller", "contabilidad"]);
  const body = await readBody<{
    order_code?: string;
    result?: string;
    measured_value?: string;
    tolerance_spec?: string;
    inspector_name?: string;
    notes?: string;
  }>(ctx.request);

  const orderCode = str(body.order_code, 40);
  const result = str(body.result, 30).toLowerCase();
  if (!orderCode || !RESULTS.includes(result)) {
    throw new HttpError(400, "OT o resultado inválido");
  }

  const db = getDb(ctx.env);
  const order = await db.execute({ sql: "SELECT id FROM orders WHERE code = ?", args: [orderCode] });
  const orderId = num(order.rows[0]?.id, 0);
  if (!orderId) throw new HttpError(404, "Orden no encontrada");

  await db.execute({
    sql: `INSERT INTO quality_checks (order_id, inspector_name, tolerance_spec, measured_value, result, notes)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      orderId,
      str(body.inspector_name, 120) || user.name || "Control de Calidad",
      str(body.tolerance_spec, 80) || "±0.01 mm DIN/ISO",
      str(body.measured_value, 120),
      result,
      str(body.notes, 300),
    ],
  });
  if (result === "aprobado") {
    await db.execute({
      sql: "UPDATE orders SET status = 'terminada', finished_at = COALESCE(finished_at, datetime('now')), updated_at = datetime('now') WHERE id = ?",
      args: [orderId],
    });
  }
  await logAudit(ctx.env, "quality_checks", orderCode, "create", `Control dimensional: ${result}`, user.email);

  return json({ ok: true, result });
});
