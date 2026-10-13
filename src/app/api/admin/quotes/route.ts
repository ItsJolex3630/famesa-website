// /api/admin/quotes · POST crea cotización con líneas y márgenes; PUT estado.
export const runtime = "edge";

import { getDb, num, readBody, json, str, errorResponse, requireRole, logAudit, nextSeq, getRate, HttpError } from "@/lib/admin/server";

interface QuoteItemInput {
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price_usd?: number;
  cost_total_usd?: number;
  material_code?: string;
}

interface QuoteInput {
  client_id?: number;
  client?: string;
  notes?: string;
  valid_until?: string;
  delivery_days?: number;
  payment_terms?: string;
  status?: string;
  items?: QuoteItemInput[];
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(request, ["admin", "gerente", "ventas"]);
    const db = getDb();
    const body = await readBody<QuoteInput>(request);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) throw new HttpError(400, "La cotización requiere al menos una línea");

    let clientId = num(body.client_id, 0);
    if (!clientId) {
      const clientName = str(body.client, 160);
      const found = await db.execute({ sql: "SELECT id FROM clients WHERE name = ? LIMIT 1", args: [clientName] });
      clientId = num(found.rows[0]?.id, 0);
      if (!clientId) {
        const created = await db.execute({
          sql: "INSERT INTO clients (name, tax_id, sector, contact_name, status) VALUES (?, ?, 'Industrial', 'Por completar', 'prospecto')",
          args: [clientName || "Cliente industrial", `V-${Date.now().toString().slice(-8)}`],
        });
        clientId = num(created.lastInsertRowid, 0);
      }
    }

    let subtotal = 0;
    let costTotal = 0;
    for (const item of items) {
      subtotal += num(item.quantity, 1) * num(item.unit_price_usd);
      costTotal += num(item.cost_total_usd);
    }
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    const margin = total - costTotal;
    const marginPct = total > 0 ? (margin / total) * 100 : 0;
    const rate = await getRate();

    const seq = await nextSeq("seq_quote", 109);
    const code = `COT-${String(seq).padStart(4, "0")}`;
    const validUntil = str(body.valid_until, 20) || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    const quoteResult = await db.execute({
      sql: `INSERT INTO quotes (code, client_id, status, subtotal_usd, tax_rate, tax_usd, total_usd,
              cost_estimated_usd, margin_usd, margin_pct, subtotal_ves, total_ves, exchange_rate,
              valid_until, payment_terms, delivery_days, notes)
            VALUES (?, ?, ?, ?, 0.16, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        code, clientId, str(body.status, 20) || "borrador", subtotal, tax, total, costTotal, margin, marginPct,
        subtotal * rate, total * rate, rate, validUntil,
        str(body.payment_terms, 120) || "50% anticipo, 50% contra entrega", num(body.delivery_days, 7), str(body.notes, 500),
      ],
    });
    const quoteId = num(quoteResult.lastInsertRowid, 0);

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i] as QuoteItemInput;
      let materialId: number | null = null;
      if (item.material_code) {
        const mat = await db.execute({ sql: "SELECT id FROM materials WHERE code = ? LIMIT 1", args: [str(item.material_code, 40)] });
        materialId = mat.rows[0] ? num(mat.rows[0].id) : null;
      }
      await db.execute({
        sql: `INSERT INTO quote_items (quote_id, description, material_id, quantity, unit, unit_price_usd, cost_total_usd, line_total_usd, sort)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          quoteId, str(item.description, 300) || "Servicio industrial", materialId,
          num(item.quantity, 1), str(item.unit, 20) || "pz", num(item.unit_price_usd),
          num(item.cost_total_usd), num(item.quantity, 1) * num(item.unit_price_usd), i + 1,
        ],
      });
    }

    await logAudit("quotes", code, "create", `Cotización creada (${items.length} líneas) · margen ${marginPct.toFixed(1)}%`, user.email);
    return json({ ok: true, code, total_usd: total, margin_pct: marginPct });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole(request, ["admin", "gerente", "ventas"]);
    const db = getDb();
    const body = await readBody<{ code?: string; status?: string }>(request);
    const code = str(body.code, 40);
    const status = str(body.status, 30);
    if (!code || !status) throw new HttpError(400, "Código y estado son obligatorios");
    await db.execute({
      sql: "UPDATE quotes SET status = ?, updated_at = datetime('now') WHERE code = ?",
      args: [status, code],
    });
    await logAudit("quotes", code, "status_change", `Estado → ${status}`, user.email);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
