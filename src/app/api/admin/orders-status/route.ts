// PUT /api/admin/orders-status · Cambia el estado de una orden de trabajo.
export const runtime = "edge";

import { getDb, readBody, json, str, errorResponse, assertMethod, requireRole, logAudit, HttpError } from "@/lib/admin/server";

const ALLOWED = ["pendiente", "en_proceso", "control_calidad", "terminada", "entregada", "facturada", "cancelada"];

export async function PUT(request: Request) {
  try {
    assertMethod(request, "PUT");
    const user = await requireRole(request, ["admin", "gerente", "ventas", "taller"]);
    const body = await readBody<{ order_code?: string; status?: string }>(request);
    const code = str(body.order_code, 40);
    const status = str(body.status, 30);
    if (!code || !ALLOWED.includes(status)) throw new HttpError(400, "Código o estado inválido");

    const db = getDb();
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
    await logAudit("orders", code, "status_change", `Estado → ${status}`, user.email);
    return json({ ok: true, status });
  } catch (error) {
    return errorResponse(error);
  }
}
