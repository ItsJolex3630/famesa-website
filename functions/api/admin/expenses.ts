// =============================================================================
// POST /api/admin/expenses · Registra un gasto operativo con su categoría,
// presupuesto y comprobante.
// =============================================================================
import { getDb, num, readBody, route, json, str, bool, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

const CATEGORIES = [
  "materia_prima",
  "nomina",
  "servicios",
  "alquiler",
  "herramientas",
  "mantenimiento",
  "fletes",
  "impuestos",
  "seguros",
  "marketing",
  "otros",
];

function mapCategory(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("materia") || t.includes("prima")) return "materia_prima";
  if (t.includes("nomina") || t.includes("nómina")) return "nomina";
  if (t.includes("servicio") || t.includes("electric")) return "servicios";
  if (t.includes("alquiler") || t.includes("galpon") || t.includes("galpón")) return "alquiler";
  if (t.includes("herramienta") || t.includes("inserto")) return "herramientas";
  if (t.includes("mantenimiento")) return "mantenimiento";
  if (t.includes("flete") || t.includes("transporte")) return "fletes";
  if (t.includes("impuesto")) return "impuestos";
  if (t.includes("seguro") || t.includes("poliza") || t.includes("póliza")) return "seguros";
  if (t.includes("marketing") || t.includes("comercial")) return "marketing";
  return CATEGORIES.includes(t) ? t : "otros";
}

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "contabilidad"]);
  const body = await readBody<{
    category?: string;
    description?: string;
    amount_usd?: number;
    budgeted_usd?: number;
    recurring?: boolean;
    document_ref?: string;
    date?: string;
  }>(ctx.request);

  const amount = num(body.amount_usd);
  if (amount < 0) throw new HttpError(400, "El monto no puede ser negativo");

  const db = getDb(ctx.env);
  const rateResult = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
  const rate = num(rateResult.rows[0]?.value, 54.8);
  const countResult = await db.execute("SELECT COUNT(*) AS n FROM expenses");
  const seq = num(countResult.rows[0]?.n, 0) + 1;
  const code = `GAS-${String(seq).padStart(4, "0")}`;

  await db.execute({
    sql: `INSERT INTO expenses (code, date, category, description, budgeted_usd, amount_usd, amount_ves, exchange_rate, document_ref, recurring)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      code,
      str(body.date, 20) || new Date().toISOString().slice(0, 10),
      mapCategory(str(body.category, 60)),
      str(body.description, 300) || "Gasto operativo",
      num(body.budgeted_usd),
      amount,
      amount * rate,
      rate,
      str(body.document_ref, 120),
      bool(body.recurring) ? 1 : 0,
    ],
  });
  await logAudit(ctx.env, "expenses", code, "create", `Gasto ${amount} USD`, user.email);

  return json({ ok: true, code });
});
