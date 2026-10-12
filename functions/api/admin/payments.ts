// =============================================================================
// POST /api/admin/payments · Registra un cobro sobre una factura.
// Aplica IGTF 3% automáticamente en pagos en divisas (Zelle / efectivo USD).
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

function mapMethod(raw: string): { method: string; foreign: boolean } {
  const t = raw.toLowerCase();
  if (t.includes("zelle")) return { method: "zelle_usd", foreign: true };
  if (t.includes("efectivo")) return { method: "efectivo_usd", foreign: true };
  if (t.includes("móvil") || t.includes("movil")) return { method: "pago_movil", foreign: false };
  if (t.includes("usd")) return { method: "transferencia_usd", foreign: false };
  return { method: "transferencia_ves", foreign: false };
}

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "contabilidad", "ventas"]);
  const body = await readBody<{
    invoice_code?: string;
    amount_usd?: number;
    method?: string;
    reference?: string;
  }>(ctx.request);

  const invoiceCode = str(body.invoice_code, 40);
  const amount = num(body.amount_usd);
  if (!invoiceCode || amount <= 0) throw new HttpError(400, "Indica la factura y un monto positivo");

  const db = getDb(ctx.env);
  const invoiceResult = await db.execute({
    sql: "SELECT id, client_id, total_usd, paid_amount_usd, exchange_rate FROM invoices WHERE code = ?",
    args: [invoiceCode],
  });
  const invoice = invoiceResult.rows[0];
  if (!invoice) throw new HttpError(404, "Factura no encontrada");

  const total = num(invoice.total_usd);
  const paid = num(invoice.paid_amount_usd);
  if (amount > total - paid) throw new HttpError(400, "El pago excede el saldo pendiente");

  const { method, foreign } = mapMethod(str(body.method, 40));
  const igtf = foreign ? amount * 0.03 : 0;
  const rate = num(invoice.exchange_rate, 54.8);

  const countResult = await db.execute("SELECT COUNT(*) AS n FROM payments");
  const seq = num(countResult.rows[0]?.n, 0) + 1;
  const code = `PAG-${String(seq).padStart(4, "0")}`;

  await db.execute({
    sql: `INSERT INTO payments (code, invoice_id, client_id, amount_usd, igtf_applied_usd, amount_ves, exchange_rate, method, reference)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [code, num(invoice.id), num(invoice.client_id), amount, igtf, amount * rate, rate, method, str(body.reference, 120) || code],
  });

  const newPaid = paid + amount;
  await db.execute({
    sql: "UPDATE invoices SET paid_amount_usd = ?, status = CASE WHEN ? >= total_usd THEN 'pagada' ELSE 'parcial' END, updated_at = datetime('now') WHERE id = ?",
    args: [newPaid, newPaid, num(invoice.id)],
  });
  await logAudit(ctx.env, "payments", code, "create", `Cobro ${amount} USD (${method}); IGTF ${igtf.toFixed(2)}`, user.email);

  return json({ ok: true, code, igtf_usd: igtf, status: newPaid >= total ? "pagada" : "parcial" });
});
