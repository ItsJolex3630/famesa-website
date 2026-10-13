// POST /api/admin/quality-checks · Firma el control dimensional de una OT.
export const runtime = "edge";

import { getDb, num, readBody, json, str, errorResponse, assertMethod, requireRole, logAudit, HttpError } from "@/lib/admin/server";

const RESULTS = ["aprobado", "observacion", "rechazado_reproceso"];

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");
    const user = await requireRole(request, ["admin", "gerente", "taller", "contabilidad"]);
    const body = await readBody<{
      order_code?: string;
      result?: string;
      measured_value?: string;
      tolerance_spec?: string;
      inspector_name?: string;
      notes?: string;
    }>(request);

    const orderCode = str(body.order_code, 40);
    const result = str(body.result, 30).toLowerCase();
    if (!orderCode || !RESULTS.includes(result)) throw new HttpError(400, "OT o resultado inválido");

    const db = getDb();
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
    await logAudit("quality_checks", orderCode, "create", `Control dimensional: ${result}`, user.email);
    return json({ ok: true, result });
  } catch (error) {
    return errorResponse(error);
  }
}
