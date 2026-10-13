// POST /api/admin/quotes-to-order · Aprueba cotización → OT + reserva material.
export const runtime = "edge";

import { getDb, num, readBody, json, str, errorResponse, assertMethod, requireRole, logAudit, nextSeq, HttpError } from "@/lib/admin/server";

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");
    const user = await requireRole(request, ["admin", "gerente", "ventas"]);
    const body = await readBody<{ quote_code?: string; due_date?: string }>(request);
    const code = str(body.quote_code, 40);
    if (!code) throw new HttpError(400, "Indica el código de la cotización");

    const db = getDb();
    const quoteResult = await db.execute({
      sql: "SELECT id, client_id, status, notes, total_usd, cost_estimated_usd FROM quotes WHERE code = ?",
      args: [code],
    });
    const quote = quoteResult.rows[0];
    if (!quote) throw new HttpError(404, "Cotización no encontrada");
    if (String(quote.status) === "convertida") throw new HttpError(409, "La cotización ya tiene una OT");

    const seq = await nextSeq("seq_order", 92);
    const orderCode = `OT-${String(seq).padStart(4, "0")}`;
    const dueDate = str(body.due_date, 20) || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    const orderResult = await db.execute({
      sql: `INSERT INTO orders (code, quote_id, client_id, title, status, priority, due_date, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd)
            VALUES (?, ?, ?, ?, 'pendiente', 'estandar', ?, ?, ?, 0)`,
      args: [
        orderCode, num(quote.id), num(quote.client_id), str(quote.notes, 200) || "Orden de trabajo",
        dueDate, num(quote.total_usd), num(quote.cost_estimated_usd),
      ],
    });
    const orderId = num(orderResult.lastInsertRowid, 0);

    const items = await db.execute({
      sql: "SELECT description, material_id, quantity, unit, unit_price_usd, cost_total_usd FROM quote_items WHERE quote_id = ?",
      args: [num(quote.id)],
    });
    for (const item of items.rows) {
      await db.execute({
        sql: `INSERT INTO order_items (order_id, description, material_id, quantity, unit, unit_price_usd, cost_total_usd, material_reserved_qty)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId, String(item.description), item.material_id ?? null, num(item.quantity, 1),
          String(item.unit ?? "pz"), num(item.unit_price_usd), num(item.cost_total_usd), num(item.quantity, 1),
        ],
      });
      if (item.material_id) {
        await db.execute({
          sql: "UPDATE materials SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = datetime('now') WHERE id = ?",
          args: [num(item.quantity, 1), num(item.material_id)],
        });
        await db.execute({
          sql: "INSERT INTO material_movements (material_id, type, quantity, reference_type, reference_id, notes) VALUES (?, 'salida_ot', ?, 'order', ?, ?)",
          args: [num(item.material_id), num(item.quantity, 1), orderCode, `Reserva automática ${orderCode}`],
        });
      }
    }

    await db.execute({ sql: "UPDATE quotes SET status = 'convertida', updated_at = datetime('now') WHERE id = ?", args: [num(quote.id)] });
    await logAudit("orders", orderCode, "create", `OT generada desde ${code}; material reservado`, user.email);
    return json({ ok: true, order_code: orderCode });
  } catch (error) {
    return errorResponse(error);
  }
}
