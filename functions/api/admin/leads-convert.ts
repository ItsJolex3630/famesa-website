// =============================================================================
// POST /api/admin/leads-convert · Convierte un prospecto web en
// cliente (si no existe) + cotización correlativa. Flujo de 1 clic del panel.
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "ventas"]);
  const body = await readBody<{ rfq_code?: string }>(ctx.request);
  const rfqCode = str(body.rfq_code, 40);
  if (!rfqCode) throw new HttpError(400, "Indica el código RFQ a convertir");

  const db = getDb(ctx.env);
  const leadResult = await db.execute({
    sql: "SELECT id, company_name, tax_id, email, phone, specifications, status FROM leads WHERE rfq_code = ?",
    args: [rfqCode],
  });
  const lead = leadResult.rows[0];
  if (!lead) throw new HttpError(404, "Prospecto no encontrado");
  if (String(lead.status) === "cotizado" || String(lead.status) === "ganado") {
    throw new HttpError(409, "El prospecto ya fue convertido");
  }

  // Cliente: reutiliza por nombre o lo crea.
  const companyName = String(lead.company_name);
  let clientResult = await db.execute({
    sql: "SELECT id FROM clients WHERE name = ? LIMIT 1",
    args: [companyName],
  });
  let clientId = num(clientResult.rows[0]?.id, 0);
  if (!clientId) {
    const taxId = String(lead.tax_id ?? "") || `V-${Date.now().toString().slice(-8)}`;
    const insertClient = await db.execute({
      sql: "INSERT INTO clients (name, tax_id, sector, contact_name, email, phone, status) VALUES (?, ?, 'Industrial', 'Por completar', ?, ?, 'prospecto')",
      args: [companyName, taxId, String(lead.email ?? ""), String(lead.phone ?? "")],
    });
    clientId = num(insertClient.lastInsertRowid, 0);
  }

  // Correlativo de cotización desde settings.seq_quote.
  const seqResult = await db.execute("SELECT value FROM settings WHERE key = 'seq_quote'");
  const seq = num(seqResult.rows[0]?.value, 109) + 1;
  const quoteCode = `COT-${String(seq).padStart(4, "0")}`;
  const rateResult = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
  const rate = num(rateResult.rows[0]?.value, 54.8);

  const insertQuote = await db.execute({
    sql: `INSERT INTO quotes (code, client_id, lead_id, status, subtotal_usd, tax_rate, tax_usd, total_usd,
            cost_estimated_usd, margin_usd, margin_pct, subtotal_ves, total_ves, exchange_rate, valid_until, notes)
          VALUES (?, ?, ?, 'borrador', 0, 0.16, 0, 0, 0, 0, 0, 0, 0, ?, date('now','+15 day'), ?)`,
    args: [quoteCode, clientId, num(lead.id), rate, `Origen RFQ ${rfqCode}: ${String(lead.specifications).slice(0, 400)}`],
  });
  const quoteId = num(insertQuote.lastInsertRowid, 0);

  await db.execute({
    sql: "UPDATE leads SET status = 'cotizado', client_id = ?, quote_id = ?, updated_at = datetime('now') WHERE rfq_code = ?",
    args: [clientId, quoteId, rfqCode],
  });
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('seq_quote', ?, datetime('now'))",
    args: [String(seq)],
  });
  await logAudit(ctx.env, "leads", rfqCode, "status_change", `Convertido a cliente #${clientId} y cotización ${quoteCode}`, user.email);

  return json({ ok: true, quote_code: quoteCode, client_id: clientId });
});
