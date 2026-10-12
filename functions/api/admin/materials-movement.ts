// =============================================================================
// POST /api/admin/materials-movement · Movimiento de Kardex (entrada, salida a
// OT, ajuste o merma) y actualización del stock del material.
// =============================================================================
import { getDb, num, readBody, route, json, str, HttpError } from "../_shared/turso";
import { requireRole } from "../_shared/auth";
import { logAudit } from "../_shared/audit";

type MovementType = "entrada" | "salida_ot" | "ajuste" | "merma" | "reserva";

function mapType(raw: string): { type: MovementType; sign: number } {
  const t = raw.toLowerCase();
  if (t.includes("entrada")) return { type: "entrada", sign: 1 };
  if (t.includes("salida")) return { type: "salida_ot", sign: -1 };
  if (t.includes("merma")) return { type: "merma", sign: -1 };
  if (t.includes("negativ")) return { type: "ajuste", sign: -1 };
  if (t.includes("ajuste")) return { type: "ajuste", sign: 1 };
  if (t.includes("reserva")) return { type: "reserva", sign: 0 };
  return { type: "ajuste", sign: 1 };
}

export const onRequest = route("POST", async (ctx) => {
  const user = await requireRole(ctx, ["admin", "gerente", "almacen", "taller"]);
  const body = await readBody<{
    material_code?: string;
    type?: string;
    quantity?: number;
    unit_cost_usd?: number;
    reference_id?: string;
    notes?: string;
  }>(ctx.request);

  const code = str(body.material_code, 40);
  const quantity = num(body.quantity);
  if (!code || quantity <= 0) throw new HttpError(400, "Indica el material y una cantidad positiva");

  const db = getDb(ctx.env);
  const material = await db.execute({ sql: "SELECT id, stock_quantity FROM materials WHERE code = ?", args: [code] });
  const row = material.rows[0];
  if (!row) throw new HttpError(404, "Material no encontrado");

  const { type, sign } = mapType(str(body.type, 40));
  const delta = sign * quantity;

  await db.execute({
    sql: `INSERT INTO material_movements (material_id, type, quantity, unit_cost_usd, reference_type, reference_id, notes)
          VALUES (?, ?, ?, ?, 'manual', ?, ?)`,
    args: [num(row.id), type, quantity, num(body.unit_cost_usd), str(body.reference_id, 80), str(body.notes, 200)],
  });
  await db.execute({
    sql: "UPDATE materials SET stock_quantity = MAX(0, stock_quantity + ?), updated_at = datetime('now') WHERE id = ?",
    args: [delta, num(row.id)],
  });
  await logAudit(ctx.env, "materials", code, "update", `Movimiento ${type}: ${delta > 0 ? "+" : ""}${delta}`, user.email);

  return json({ ok: true, type, delta });
});
