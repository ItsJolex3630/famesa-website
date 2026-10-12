// =============================================================================
// POST /api/admin/work-logs · Registra horas reales de máquina y operario en
// una OT, acumulando el costo real de producción.
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "taller"]);
  const body = await readBody<{
    order_code?: string;
    machine_code?: string;
    operator_code?: string;
    hours?: number;
    description?: string;
    cost_usd?: number;
  }>(ctx.request);

  const orderCode = str(body.order_code, 40);
  const hours = num(body.hours);
  if (!orderCode || hours <= 0) throw new HttpError(400, "Indica la OT y horas válidas");

  const db = getDb(ctx.env);
  const order = await db.execute({ sql: "SELECT id FROM orders WHERE code = ?", args: [orderCode] });
  const orderId = num(order.rows[0]?.id, 0);
  if (!orderId) throw new HttpError(404, "Orden no encontrada");

  const machine = await db.execute({ sql: "SELECT id FROM machines WHERE code = ?", args: [str(body.machine_code, 40)] });
  const operator = await db.execute({ sql: "SELECT id FROM operators WHERE code = ?", args: [str(body.operator_code, 40)] });
  const machineId = num(machine.rows[0]?.id, 0);
  const operatorId = num(operator.rows[0]?.id, 0);
  if (!machineId || !operatorId) throw new HttpError(400, "Máquina u operario no encontrados");

  const cost = num(body.cost_usd);
  await db.execute({
    sql: `INSERT INTO work_logs (order_id, machine_id, operator_id, started_at, ended_at, hours, cost_usd, description)
          VALUES (?, ?, ?, datetime('now', '-' || ? || ' hours'), datetime('now'), ?, ?, ?)`,
    args: [orderId, machineId, operatorId, hours, hours, cost, str(body.description, 300) || `Registro de ${hours} h`],
  });
  await db.execute({
    sql: "UPDATE orders SET actual_cost_usd = actual_cost_usd + ?, status = CASE WHEN status = 'pendiente' THEN 'en_proceso' ELSE status END, updated_at = datetime('now') WHERE id = ?",
    args: [cost, orderId],
  });
  await db.execute({
    sql: "UPDATE machines SET hours_used = hours_used + ?, updated_at = datetime('now') WHERE id = ?",
    args: [hours, machineId],
  });
  await logAudit(ctx.env, "work_logs", orderCode, "create", `${hours} h · costo ${cost} USD`, user.email);

  return json({ ok: true, hours, cost_usd: cost });
});
