// =============================================================================
// POST /api/admin/invoices · Emite la factura fiscal SENIAT de una OT:
// base imponible + IVA 16%, tasa congelada y N° de control correlativo.
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "contabilidad", "ventas"]);
  const body = await readBody<{ order_code?: string }>(ctx.request);
  const orderCode = str(body.order_code, 40);
  if (!orderCode) throw new HttpError(400, "Indica el código de la OT");

  const db = getDb(ctx.env);
  const orderResult = await db.execute({
    sql: "SELECT id, client_id, status, estimated_revenue_usd FROM orders WHERE code = ?",
    args: [orderCode],
  });
  const order = orderResult.rows[0];
  if (!order) throw new HttpError(404, "Orden no encontrada");
  if (String(order.status) === "facturada") throw new HttpError(409, "La OT ya fue facturada");

  const clientResult = await db.execute({
    sql: "SELECT name, tax_id, address FROM clients WHERE id = ?",
    args: [num(order.client_id)],
  });
  const client = clientResult.rows[0];

  const seqInv = await db.execute("SELECT value FROM settings WHERE key = 'seq_invoice'");
  const seqCtrl = await db.execute("SELECT value FROM settings WHERE key = 'seq_control'");
  const rateResult = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
  const seqInvoice = num(seqInv.rows[0]?.value, 415) + 1;
  const seqControl = num(seqCtrl.rows[0]?.value, 4150) + 1;
  const rate = num(rateResult.rows[0]?.value, 54.8);

  const code = `FAC-${String(seqInvoice).padStart(5, "0")}`;
  const control = `00-${String(seqControl).padStart(6, "0")}`;
  const base = num(order.estimated_revenue_usd);
  const tax = base * 0.16;
  const total = base + tax;
  const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  await db.execute({
    sql: `INSERT INTO invoices (code, control_number, order_id, client_id, buyer_tax_id, buyer_name, buyer_address,
            status, date, due_date, subtotal_usd, tax_rate, tax_usd, total_usd, paid_amount_usd,
            exchange_rate, subtotal_ves, tax_ves, total_ves)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', date('now'), ?, ?, 0.16, ?, ?, 0, ?, ?, ?, ?)`,
    args: [
      code,
      control,
      num(order.id),
      num(order.client_id),
      String(client?.tax_id ?? "V-00000000-0"),
      String(client?.name ?? "Consumidor"),
      String(client?.address ?? "Valencia, Edo. Carabobo"),
      dueDate,
      base,
      tax,
      total,
      rate,
      base * rate,
      tax * rate,
      total * rate,
    ],
  });
  await db.execute({
    sql: "UPDATE orders SET status = 'facturada', updated_at = datetime('now') WHERE id = ?",
    args: [num(order.id)],
  });
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('seq_invoice', ?, datetime('now'))",
    args: [String(seqInvoice)],
  });
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('seq_control', ?, datetime('now'))",
    args: [String(seqControl)],
  });
  await logAudit(ctx.env, "invoices", code, "create", `Factura de ${orderCode} · base ${base} + IVA 16% · tasa ${rate}`, user.email);

  return json({ ok: true, code, control_number: control, total_usd: total });
});
