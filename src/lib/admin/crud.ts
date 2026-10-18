// =============================================================================
// FAMESA SUITE · Motor CRUD universal para Turso (libSQL / SQLite).
// Garantiza que todas las creaciones, ediciones y eliminaciones de todos los
// módulos del panel persistan en la base de datos respetando las restricciones
// CHECK, UNIQUE y FOREIGN KEY de db/01_schema.sql.
// =============================================================================
import type { Client } from "@libsql/client/web";
import {
  HttpError,
  bool,
  getDb,
  getRate,
  logAudit,
  num,
  parseMeta,
  serializeMeta,
  str,
} from "./server";

export function normalizeClientStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["activo", "inactivo", "bloqueado", "prospecto"].includes(s)) return s;
  return "activo";
}

export function normalizeLeadStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["nuevo", "contactado", "cotizado", "ganado", "perdido"].includes(s)) return s;
  return "nuevo";
}

export function normalizeLeadUrgency(raw: unknown): string {
  const s = str(raw, 60).toLowerCase();
  if (s.includes("emergencia") || s.includes("urgente") || s.includes("parada")) {
    return "Urgente - Parada de Planta";
  }
  if (s.includes("prioritari")) return "Prioritario";
  if (s.includes("planificad")) return "Planificado";
  return "Estándar";
}

export function normalizeQuoteStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["borrador", "enviada", "aprobada", "convertida", "rechazada", "expirada"].includes(s)) {
    return s;
  }
  return "borrador";
}

export function normalizeOrderStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (
    [
      "pendiente",
      "en_proceso",
      "control_calidad",
      "terminada",
      "entregada",
      "facturada",
      "cancelada",
    ].includes(s)
  ) {
    return s;
  }
  return "pendiente";
}

export function normalizeOrderPriority(raw: unknown): string {
  const s = str(raw, 60).toLowerCase();
  if (s.includes("emergencia") || s.includes("urgente") || s.includes("24")) {
    return "emergencia_24_48h";
  }
  if (s.includes("prioritari")) return "prioritaria";
  return "estandar";
}

export function normalizeMaterialCategory(raw: unknown): string {
  const s = str(raw, 120).toLowerCase();
  const valid = [
    "acero_carbono",
    "acero_aleado",
    "acero_inoxidable",
    "bronce_laton",
    "aluminio",
    "polimero_ingenieria",
    "fundicion",
    "herramienta_inserto",
    "soldadura_gases",
    "consumible",
  ];
  if (valid.includes(s)) return s;
  if (s.includes("bronce") || s.includes("laton") || s.includes("latón") || s.includes("sae 6")) {
    return "bronce_laton";
  }
  if (s.includes("inox") || s.includes("304") || s.includes("316")) return "acero_inoxidable";
  if (s.includes("alumin") || s.includes("6061")) return "aluminio";
  if (
    s.includes("teflon") ||
    s.includes("teflón") ||
    s.includes("ptfe") ||
    s.includes("nylon") ||
    s.includes("pom") ||
    s.includes("acetal") ||
    s.includes("delrin") ||
    s.includes("uhmw") ||
    s.includes("poliuretano") ||
    s.includes("celeron") ||
    s.includes("celerón") ||
    s.includes("polimer")
  ) {
    return "polimero_ingenieria";
  }
  if (s.includes("4140") || s.includes("bonificado") || s.includes("aleado")) {
    return "acero_aleado";
  }
  if (s.includes("inserto") || s.includes("herramienta") || s.includes("cnmg")) {
    return "herramienta_inserto";
  }
  if (s.includes("argon") || s.includes("argón") || s.includes("soldadura") || s.includes("gas")) {
    return "soldadura_gases";
  }
  if (s.includes("fundicion") || s.includes("fundición")) return "fundicion";
  return "acero_carbono";
}

export function normalizeMaterialUnit(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["kg", "m", "barra", "placa", "pz", "litro", "cilindro", "caja"].includes(s)) return s;
  if (s.includes("plancha") || s.includes("lamina") || s.includes("lámina")) return "placa";
  if (s.includes("unid") || s.includes("pieza")) return "pz";
  if (s.includes("kilo")) return "kg";
  if (s.includes("metro")) return "m";
  return "kg";
}

export function normalizeMachineType(raw: unknown): string {
  const s = str(raw, 120).toLowerCase();
  const valid = [
    "torno_cnc",
    "torno_paralelo",
    "fresa_bancada",
    "fresa_puente",
    "rectificadora",
    "soldadora_tig_mig",
    "prensa_hidraulica",
  ];
  if (valid.includes(s)) return s;
  if (s.includes("fresa") && s.includes("puente")) return "fresa_puente";
  if (s.includes("fresa")) return "fresa_bancada";
  if (s.includes("rectific")) return "rectificadora";
  if (s.includes("soldad") || s.includes("tig") || s.includes("mig")) return "soldadora_tig_mig";
  if (s.includes("prensa") || s.includes("hidraul")) return "prensa_hidraulica";
  if (s.includes("paralelo") || s.includes("convencional")) return "torno_paralelo";
  return "torno_cnc";
}

export function normalizeMachineStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["operativa", "ocupada", "mantenimiento", "parada"].includes(s)) return s;
  return "operativa";
}

export function normalizeOperatorSpecialty(raw: unknown): string {
  const s = str(raw, 120).toLowerCase();
  const valid = [
    "tornero_cnc",
    "tornero_convencional",
    "fresador",
    "rectificador",
    "soldador_asme",
    "armador_hidraulico",
    "inspector_calidad",
  ];
  if (valid.includes(s)) return s;
  if (s.includes("soldad") || s.includes("asme") || s.includes("aws")) return "soldador_asme";
  if (s.includes("fresad")) return "fresador";
  if (s.includes("rectific") || s.includes("metrolog")) return "rectificador";
  if (s.includes("hidraul") || s.includes("armador")) return "armador_hidraulico";
  if (s.includes("calidad") || s.includes("inspector")) return "inspector_calidad";
  if (s.includes("convencional") || s.includes("paralelo")) return "tornero_convencional";
  return "tornero_cnc";
}

export function normalizePurchaseStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["borrador", "emitida", "parcial", "recibida", "cancelada"].includes(s)) return s;
  return "emitida";
}

export function normalizeInvoiceStatus(raw: unknown): string {
  const s = str(raw, 30).toLowerCase();
  if (["borrador", "pendiente", "parcial", "pagada", "vencida", "anulada"].includes(s)) return s;
  return "pendiente";
}

export function normalizePaymentMethod(raw: unknown): { method: string; foreign: boolean } {
  const t = str(raw, 60).toLowerCase();
  if (t.includes("zelle")) return { method: "zelle_usd", foreign: true };
  if (t.includes("efectivo")) return { method: "efectivo_usd", foreign: true };
  if (t.includes("móvil") || t.includes("movil")) return { method: "pago_movil", foreign: false };
  if (t.includes("usd")) return { method: "transferencia_usd", foreign: false };
  return { method: "transferencia_ves", foreign: false };
}

export function normalizeExpenseCategory(raw: unknown): string {
  const t = str(raw, 80).toLowerCase();
  const valid = [
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
  if (valid.includes(t)) return t;
  if (t.includes("materia") || t.includes("prima")) return "materia_prima";
  if (t.includes("nomina") || t.includes("nómina")) return "nomina";
  if (t.includes("servicio") || t.includes("electric")) return "servicios";
  if (t.includes("alquiler") || t.includes("galpon") || t.includes("galpón")) return "alquiler";
  if (t.includes("herramienta") || t.includes("inserto")) return "herramientas";
  if (t.includes("mantenimiento")) return "mantenimiento";
  if (t.includes("flete") || t.includes("transporte")) return "fletes";
  if (t.includes("impuesto") || t.includes("tasa")) return "impuestos";
  if (t.includes("seguro") || t.includes("poliza") || t.includes("póliza")) return "seguros";
  if (t.includes("marketing") || t.includes("comercial")) return "marketing";
  return "otros";
}

/** Localiza un cliente por código (CLI-00001) o ID numérico. */
export async function findClientRow(
  db: Client,
  idOrCode: string,
): Promise<Record<string, unknown> | null> {
  const all = await db.execute(
    "SELECT id, name, tax_id, sector, contact_name, phone, address, status, credit_limit_usd, credit_days, is_key_account, notes FROM clients WHERE deleted_at IS NULL ORDER BY id DESC",
  );
  const numericId = Number(idOrCode.replace(/\D/g, ""));
  for (const r of all.rows) {
    const meta = parseMeta(r.notes);
    if (String(meta.code ?? "") === idOrCode) return r as Record<string, unknown>;
    if (numericId > 0 && num(r.id) === numericId) return r as Record<string, unknown>;
  }
  return null;
}

/** Obtiene o crea un client_id a partir del nombre del cliente. */
export async function ensureClientId(
  db: Client,
  clientNameRaw: unknown,
  rifRaw?: unknown,
  addressRaw?: unknown,
): Promise<number> {
  const name = str(clientNameRaw, 160) || "Cliente Industrial";
  const found = await db.execute({
    sql: "SELECT id FROM clients WHERE name = ? AND deleted_at IS NULL LIMIT 1",
    args: [name],
  });
  if (found.rows[0]) return num(found.rows[0].id);

  const uniqueTax =
    str(rifRaw, 40) && str(rifRaw, 40) !== "Por completar"
      ? str(rifRaw, 40)
      : `S/R-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Evitar colisión UNIQUE en tax_id
  const taxCheck = await db.execute({
    sql: "SELECT id, deleted_at FROM clients WHERE tax_id = ? LIMIT 1",
    args: [uniqueTax],
  });
  const finalTax = taxCheck.rows[0]
    ? `${uniqueTax}-${Date.now().toString().slice(-4)}`
    : uniqueTax;

  const created = await db.execute({
    sql: `INSERT INTO clients (name, tax_id, sector, contact_name, address, status, notes)
          VALUES (?, ?, 'Industrial', 'Por completar', ?, 'activo', ?)`,
    args: [
      name,
      finalTax,
      str(addressRaw, 240) || "Valencia, Edo. Carabobo",
      serializeMeta({ segment: "Industrial" }),
    ],
  });
  return num(created.lastInsertRowid);
}

/** Obtiene o crea un supplier_id a partir del nombre del proveedor. */
export async function ensureSupplierId(db: Client, supplierNameRaw: unknown): Promise<number> {
  const name = str(supplierNameRaw, 160) || "Sumindu C.A. (Suministros Industriales)";
  const found = await db.execute({
    sql: "SELECT id FROM suppliers WHERE name = ? OR name LIKE ? LIMIT 1",
    args: [name, `${name}%`],
  });
  if (found.rows[0]) return num(found.rows[0].id);

  const taxId = `J-${Date.now().toString().slice(-8)}-0`;
  const created = await db.execute({
    sql: `INSERT INTO suppliers (name, tax_id, contact_name, category, status)
          VALUES (?, ?, 'Departamento Comercial', 'Aceros y Metales', 'activo')`,
    args: [name, taxId],
  });
  return num(created.lastInsertRowid);
}

/** libera códigos/tax_id de registros soft-deleted para evitar colisiones UNIQUE */
async function freeSoftDeletedCode(
  db: Client,
  table: string,
  column: string,
  value: string,
): Promise<void> {
  if (!value) return;
  const suffix = `#del-${Date.now()}`;
  await db.execute({
    sql: `UPDATE ${table} SET ${column} = ${column} || ? WHERE ${column} = ? AND deleted_at IS NOT NULL`,
    args: [suffix, value],
  });
}

export async function createModuleRecord(
  module: string,
  body: Record<string, unknown>,
  userEmail: string,
): Promise<Record<string, unknown>> {
  const db = getDb();
  const rate = await getRate();

  switch (module) {
    case "clientes": {
      const name = str(body.name, 160);
      if (!name) throw new HttpError(400, "El nombre o razón social del cliente es obligatorio");
      const rawRif = str(body.rif, 40);
      const cleanRif =
        rawRif && rawRif !== "Por completar"
          ? rawRif
          : `S/R-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await freeSoftDeletedCode(db, "clients", "tax_id", cleanRif);
      const dup = await db.execute({
        sql: "SELECT id FROM clients WHERE tax_id = ? AND deleted_at IS NULL LIMIT 1",
        args: [cleanRif],
      });
      const finalRif = dup.rows[0]
        ? `${cleanRif}-${Date.now().toString().slice(-4)}`
        : cleanRif;

      const segment = str(body.segment, 40) || "Industrial";
      const isKey = segment.toLowerCase().includes("clave") ? 1 : 0;
      const code = str(body.id, 40);
      const notes = serializeMeta({
        code: code || undefined,
        segment,
        interaction: str(body.interaction, 2000),
      });

      const res = await db.execute({
        sql: `INSERT INTO clients (name, tax_id, sector, contact_name, phone, address, status, credit_limit_usd, credit_days, is_key_account, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          name,
          finalRif,
          str(body.sector || body.description, 120) || "Industrial",
          str(body.contact, 120) || "Por completar",
          str(body.phone, 40),
          str(body.address, 240) || "Por completar",
          normalizeClientStatus(body.status),
          num(body.credit ?? body.amount, 0),
          num(body.days, 30),
          isKey,
          notes,
        ],
      });
      const insertedId = num(res.lastInsertRowid);
      const finalCode = code || `CLI-${String(insertedId).padStart(5, "0")}`;
      if (!code) {
        await db.execute({
          sql: "UPDATE clients SET notes = ? WHERE id = ?",
          args: [
            serializeMeta({
              code: finalCode,
              segment,
              interaction: str(body.interaction, 2000),
            }),
            insertedId,
          ],
        });
      }
      await logAudit("clients", finalCode, "create", `Cliente registrado: ${name}`, userEmail);
      return { ok: true, id: finalCode };
    }

    case "inventario": {
      const code = str(body.id, 40) || `MAT-${Date.now().toString().slice(-4)}`;
      const name = str(body.name, 200);
      if (!name) throw new HttpError(400, "El nombre del material es obligatorio");
      await freeSoftDeletedCode(db, "materials", "code", code);

      const existing = await db.execute({
        sql: "SELECT id FROM materials WHERE code = ? LIMIT 1",
        args: [code],
      });
      const stock = num(body.stock ?? body.quantity, 0);
      const min = num(body.min, 10);
      const unit = normalizeMaterialUnit(body.unit);
      const cost = num(body.cost ?? body.amount, 0);
      const location = str(body.location, 120) || "Almacén Principal";
      const kardex =
        str(body.kardex, 2000) ||
        `Inventario inicial: ${stock} ${unit} registrado el ${new Date().toLocaleDateString("es-VE")}`;
      const category = normalizeMaterialCategory(body.category || name);

      if (existing.rows[0]) {
        await db.execute({
          sql: `UPDATE materials SET name = ?, category = ?, unit = ?, stock_quantity = ?, min_stock = ?, location = ?, last_cost_usd = ?, avg_cost_usd = ?, notes = ?, deleted_at = NULL, updated_at = datetime('now') WHERE code = ?`,
          args: [name, category, unit, stock, min, location, cost, cost, kardex, code],
        });
      } else {
        const res = await db.execute({
          sql: `INSERT INTO materials (code, name, category, unit, stock_quantity, min_stock, location, last_cost_usd, avg_cost_usd, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [code, name, category, unit, stock, min, location, cost, cost, kardex],
        });
        const matId = num(res.lastInsertRowid);
        if (stock > 0 && matId > 0) {
          await db.execute({
            sql: `INSERT INTO material_movements (material_id, type, quantity, unit_cost_usd, reference_type, reference_id, notes)
                  VALUES (?, 'entrada', ?, ?, 'initial', ?, 'Inventario inicial')`,
            args: [matId, stock, cost, code],
          });
        }
      }
      await logAudit("materials", code, "create", `Material registrado: ${name} (${stock} ${unit})`, userEmail);
      return { ok: true, id: code };
    }

    case "taller": {
      const code = str(body.id, 40) || `MCH-${Date.now().toString().slice(-3)}`;
      const name = str(body.name, 200);
      if (!name) throw new HttpError(400, "El nombre de la máquina es obligatorio");
      const type = normalizeMachineType(body.type || body.standard || name);
      const standard = str(body.standard, 200) || "Mecanizado industrial";
      const cost = num(body.cost ?? body.amount, 28);
      const status = normalizeMachineStatus(body.status);
      const hours = num(body.hours, 0);
      const notes = serializeMeta({
        capacityHours: num(body.capacity, 176),
        ot: str(body.ot, 40) || "—",
        maintenance: str(body.maintenance, 30) || new Date().toISOString().slice(0, 10),
        maintenance_type: str(body.maintenance_type, 40) || "Preventivo",
      });

      const existing = await db.execute({
        sql: "SELECT id FROM machines WHERE code = ? LIMIT 1",
        args: [code],
      });
      if (existing.rows[0]) {
        await db.execute({
          sql: `UPDATE machines SET name = ?, type = ?, capacity = ?, hourly_rate_usd = ?, status = ?, hours_used = ?, notes = ?, updated_at = datetime('now') WHERE code = ?`,
          args: [name, type, standard, cost, status, hours, notes, code],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO machines (code, name, type, capacity, hourly_rate_usd, status, hours_used, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [code, name, type, standard, cost, status, hours, notes],
        });
      }
      await logAudit("machines", code, "create", `Máquina registrada: ${name}`, userEmail);
      return { ok: true, id: code };
    }

    case "personal": {
      const code = str(body.id, 40) || `PER-${Date.now().toString().slice(-4)}`;
      const name = str(body.name, 160);
      if (!name) throw new HttpError(400, "El nombre del operario es obligatorio");
      const role = str(body.description || body.role, 120) || "Operario Especialista";
      const certification = str(body.certification, 120) || role;
      const specialty = normalizeOperatorSpecialty(certification || role);
      const cost = num(body.cost ?? body.amount, 12);
      const hours = num(body.hours, 0);
      const metaPhone = serializeMeta({
        certification,
        hours,
        phone: str(body.phone, 40),
      });

      const existing = await db.execute({
        sql: "SELECT id FROM operators WHERE code = ? LIMIT 1",
        args: [code],
      });
      if (existing.rows[0]) {
        await db.execute({
          sql: `UPDATE operators SET name = ?, role = ?, specialty = ?, hourly_cost_usd = ?, phone = ?, active = 1, updated_at = datetime('now') WHERE code = ?`,
          args: [name, role, specialty, cost, metaPhone, code],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO operators (code, name, role, specialty, hourly_cost_usd, phone, active)
                VALUES (?, ?, ?, ?, ?, ?, 1)`,
          args: [code, name, role, specialty, cost, metaPhone],
        });
      }
      await logAudit("operators", code, "create", `Personal registrado: ${name}`, userEmail);
      return { ok: true, id: code };
    }

    case "leads": {
      const code = str(body.id, 40) || `RFQ-${Date.now().toString().slice(-5)}`;
      const company = str(body.client || body.name, 160) || "Prospecto Industrial";
      const contact = str(body.name || body.client, 160) || company;
      const specs = str(body.description, 1000) || "Solicitud técnica industrial";
      const urgency = normalizeLeadUrgency(body.priority);
      const status = normalizeLeadStatus(body.status);

      const existing = await db.execute({
        sql: "SELECT id FROM leads WHERE rfq_code = ? LIMIT 1",
        args: [code],
      });
      if (existing.rows[0]) {
        await db.execute({
          sql: `UPDATE leads SET name = ?, company_name = ?, specifications = ?, urgency = ?, status = ?, updated_at = datetime('now') WHERE rfq_code = ?`,
          args: [contact, company, specs, urgency, status, code],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO leads (rfq_code, name, company_name, tax_id, email, phone, service_type, urgency, specifications, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Mecanizado CNC', ?, ?, ?)`,
          args: [
            code,
            contact,
            company,
            str(body.rif, 40),
            str(body.email, 120) || "contacto@cliente.com",
            str(body.phone, 40) || "Por completar",
            urgency,
            specs,
            status,
          ],
        });
      }
      await logAudit("leads", code, "create", `Prospecto registrado: ${company}`, userEmail);
      return { ok: true, id: code };
    }

    case "cotizaciones": {
      const code = str(body.id, 40) || `COT-${Date.now().toString().slice(-5)}`;
      await freeSoftDeletedCode(db, "quotes", "code", code);
      const clientId = await ensureClientId(db, body.client);
      const subtotal = num(body.amount, 0);
      const cost = num(body.cost, 0);
      const tax = subtotal * 0.16;
      const total = subtotal + tax;
      const margin = subtotal - cost;
      const marginPct = subtotal > 0 ? (margin / subtotal) * 100 : 0;
      const exRate = num(body.exchange_rate, rate);
      const subtotalVes = num(body.amount_ves, subtotal * exRate);
      const status = normalizeQuoteStatus(body.status);
      const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
      const notes = serializeMeta({
        client: str(body.client, 160),
        description: str(body.description, 1000),
        material: str(body.material, 40) || "MAT-1045-50",
        quantity: num(body.quantity, 1),
        machineHours: num(body.machineHours, 12),
        laborHours: num(body.laborHours, 14),
        machine: str(body.machine, 40) || "CNC-01",
        operator: str(body.operator, 120) || "T.S.U. Carlos Méndez",
        ot: body.ot ? str(body.ot, 40) : undefined,
      });

      const res = await db.execute({
        sql: `INSERT INTO quotes (code, client_id, status, subtotal_usd, tax_rate, tax_usd, total_usd, cost_estimated_usd, margin_usd, margin_pct, subtotal_ves, total_ves, exchange_rate, valid_until, notes)
              VALUES (?, ?, ?, ?, 0.16, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          clientId,
          status,
          subtotal,
          tax,
          total,
          cost,
          margin,
          marginPct,
          subtotalVes,
          total * exRate,
          exRate,
          validUntil,
          notes,
        ],
      });
      const quoteId = num(res.lastInsertRowid);
      if (quoteId > 0) {
        const qty = Math.max(1, num(body.quantity, 1));
        await db.execute({
          sql: `INSERT INTO quote_items (quote_id, description, quantity, unit, unit_price_usd, cost_total_usd, line_total_usd, sort)
                VALUES (?, ?, ?, 'pz', ?, ?, ?, 1)`,
          args: [
            quoteId,
            str(body.description, 300) || "Servicio industrial",
            qty,
            subtotal / qty,
            cost,
            subtotal,
          ],
        });
      }
      await logAudit("quotes", code, "create", `Cotización creada: ${code} (${subtotal} USD)`, userEmail);
      return { ok: true, id: code };
    }

    case "ordenes": {
      const code = str(body.id, 40) || `OT-${Date.now().toString().slice(-5)}`;
      await freeSoftDeletedCode(db, "orders", "code", code);
      const clientId = await ensureClientId(db, body.client);
      let quoteId: number | null = null;
      if (body.quote) {
        const q = await db.execute({
          sql: "SELECT id FROM quotes WHERE code = ? LIMIT 1",
          args: [str(body.quote, 40)],
        });
        if (q.rows[0]) quoteId = num(q.rows[0].id);
      }
      const status = normalizeOrderStatus(body.status);
      const priority = normalizeOrderPriority(body.priority);
      const dueDate =
        str(body.due, 20) || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      const revenue = num(body.amount, 0);
      const estimated = num(body.estimated, revenue * 0.6);
      const actualCost = num(body.cost, 0);
      const notes = serializeMeta({
        client: str(body.client, 160),
        priority: str(body.priority, 40) || "Estándar",
        progress: num(body.progress, 0),
        machine: str(body.machine, 40) || "CNC-01",
        operator: str(body.operator, 120) || "T.S.U. Carlos Méndez",
        hours: num(body.hours, 0),
        material: str(body.material, 40) || "MAT-1045-50",
        materialQty: num(body.materialQty ?? body.quantity, 1),
        reserved: bool(body.reserved),
        quality: str(body.quality, 500),
        work_logs: str(body.work_logs, 2000),
        quote: body.quote ? str(body.quote, 40) : undefined,
        invoice: body.invoice ? str(body.invoice, 40) : undefined,
      });

      await db.execute({
        sql: `INSERT INTO orders (code, quote_id, client_id, title, status, priority, due_date, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          quoteId,
          clientId,
          str(body.description, 300) || "Orden de producción industrial",
          status,
          priority,
          dueDate,
          revenue,
          estimated,
          actualCost,
          notes,
        ],
      });
      await logAudit("orders", code, "create", `Orden de trabajo creada: ${code}`, userEmail);
      return { ok: true, id: code };
    }

    case "facturacion": {
      const code = str(body.id, 40) || `FAC-${Date.now().toString().slice(-5)}`;
      const control = str(body.control, 40) || `00-${Date.now().toString().slice(-6)}`;
      await freeSoftDeletedCode(db, "invoices", "code", code);
      await freeSoftDeletedCode(db, "invoices", "control_number", control);

      const clientName = str(body.client, 160) || "Cliente Industrial";
      const clientId = await ensureClientId(db, clientName, body.rif, body.address);
      let orderId: number | null = null;
      if (body.ot) {
        const o = await db.execute({
          sql: "SELECT id FROM orders WHERE code = ? LIMIT 1",
          args: [str(body.ot, 40)],
        });
        if (o.rows[0]) orderId = num(o.rows[0].id);
      }

      const exRate = num(body.exchange_rate ?? body.rate, rate);
      const base = num(body.base ?? body.subUsd, num(body.amount ?? body.totalUsd, 0) / 1.16);
      const iva = num(body.iva ?? body.ivaUsd, base * 0.16);
      const igtf = num(body.igtf ?? body.igtfUsd, 0);
      const total = num(body.amount ?? body.totalUsd, base + iva + igtf);
      const paid = num(body.paid ?? body.paidUsd, 0);
      const date = str(body.date, 20) || new Date().toISOString().slice(0, 10);
      const due =
        str(body.due, 20) || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      const notes = serializeMeta({
        ot: body.ot ? str(body.ot, 40) : undefined,
        description: str(body.description, 500) || "Servicios industriales de mecanizado y soldadura",
        quantity: num(body.quantity, 1),
        igtf_collected: num(body.igtf_collected, 0),
      });

      const dupCtrl = await db.execute({
        sql: "SELECT id FROM invoices WHERE control_number = ? LIMIT 1",
        args: [control],
      });
      const finalControl = dupCtrl.rows[0]
        ? `${control}-${Date.now().toString().slice(-3)}`
        : control;

      await db.execute({
        sql: `INSERT INTO invoices (code, control_number, order_id, client_id, buyer_tax_id, buyer_name, buyer_address, status, date, due_date, subtotal_usd, tax_rate, tax_usd, igtf_usd, total_usd, paid_amount_usd, exchange_rate, subtotal_ves, tax_ves, igtf_ves, total_ves, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.16, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          finalControl,
          orderId,
          clientId,
          str(body.rif, 40) || "J-00000000-0",
          clientName,
          str(body.address, 240) || "Valencia, Edo. Carabobo",
          normalizeInvoiceStatus(body.status),
          date,
          due,
          base,
          iva,
          igtf,
          total,
          paid,
          exRate,
          base * exRate,
          iva * exRate,
          igtf * exRate,
          total * exRate,
          notes,
        ],
      });
      await logAudit("invoices", code, "create", `Factura emitida: ${code} (${total.toFixed(2)} USD)`, userEmail);
      return { ok: true, id: code };
    }

    case "cobros": {
      const code = str(body.id, 40) || `PAG-${Date.now().toString().slice(-4)}`;
      await freeSoftDeletedCode(db, "payments", "code", code);
      const invoiceCode = str(body.invoice || body.invoiceId, 40);
      const invRes = await db.execute({
        sql: "SELECT id, client_id, total_usd, paid_amount_usd, exchange_rate, notes FROM invoices WHERE code = ? LIMIT 1",
        args: [invoiceCode],
      });
      const inv = invRes.rows[0];
      if (!inv) throw new HttpError(404, "Factura asociada no encontrada");

      const amount = num(body.amount ?? body.amountUsd, 0);
      if (amount <= 0) throw new HttpError(400, "El monto del cobro debe ser mayor que cero");
      const { method, foreign } = normalizePaymentMethod(body.method);
      const igtf = num(body.igtf, foreign ? amount * 0.03 : 0);
      const exRate = num(body.exchange_rate, num(inv.exchange_rate, rate));
      const amountVes = num(body.amount_ves, amount * exRate);

      await db.execute({
        sql: `INSERT INTO payments (code, invoice_id, client_id, amount_usd, igtf_applied_usd, amount_ves, exchange_rate, method, reference)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          num(inv.id),
          num(inv.client_id),
          amount,
          igtf,
          amountVes,
          exRate,
          method,
          str(body.reference, 120) || code,
        ],
      });

      const newPaid = num(inv.paid_amount_usd) + amount;
      const total = num(inv.total_usd);
      const newStatus = newPaid >= total ? "pagada" : "parcial";
      const invMeta = parseMeta(inv.notes);
      invMeta.igtf_collected = num(invMeta.igtf_collected, 0) + igtf;

      await db.execute({
        sql: `UPDATE invoices SET paid_amount_usd = ?, status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [newPaid, newStatus, serializeMeta(invMeta), num(inv.id)],
      });
      await logAudit("payments", code, "create", `Cobro registrado: ${amount} USD (${invoiceCode})`, userEmail);
      return { ok: true, id: code };
    }

    case "compras": {
      const code = str(body.id, 40) || `COM-${Date.now().toString().slice(-5)}`;
      await freeSoftDeletedCode(db, "purchases", "code", code);
      const supplierName = str(body.name || body.supplier, 160) || "Sumindu C.A. (Suministros Industriales)";
      const supplierId = await ensureSupplierId(db, supplierName);
      const status = normalizePurchaseStatus(body.status);
      const date = str(body.date, 20) || new Date().toISOString().slice(0, 10);
      const budgeted = num(body.amount ?? body.totalUsd, 0);
      const cost = num(body.cost, budgeted);
      const notes = serializeMeta({
        supplier: supplierName,
        description: str(body.description, 500),
        material: str(body.material, 40) || "MAT-1045-50",
        quantity: num(body.quantity, 1),
        received: num(body.received, 0),
      });

      await db.execute({
        sql: `INSERT INTO purchases (code, supplier_id, status, date, budgeted_usd, subtotal_usd, total_usd, exchange_rate, subtotal_ves, total_ves, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          supplierId,
          status,
          date,
          budgeted,
          cost,
          cost,
          rate,
          cost * rate,
          cost * rate,
          notes,
        ],
      });
      await logAudit("purchases", code, "create", `Orden de compra registrada: ${code}`, userEmail);
      return { ok: true, id: code };
    }

    case "gastos": {
      const code = str(body.id, 40) || `GAS-${Date.now().toString().slice(-5)}`;
      await freeSoftDeletedCode(db, "expenses", "code", code);
      const categoryLabel = str(body.name || body.category, 80) || "Servicios";
      const category = normalizeExpenseCategory(categoryLabel);
      const description = str(body.description, 300) || "Gasto operativo";
      const amount = Math.max(0, num(body.amount ?? body.amountUsd, 0));
      const budget = num(body.budget, amount || 1000);
      const exRate = num(body.exchange_rate, rate);
      const date = str(body.date, 20) || new Date().toISOString().slice(0, 10);
      const voucher = str(body.voucher || body.reference, 120);
      const recurring = bool(body.recurring) ? 1 : 0;
      const notes = serializeMeta({ categoryLabel });

      await db.execute({
        sql: `INSERT INTO expenses (code, date, category, description, budgeted_usd, amount_usd, amount_ves, exchange_rate, document_ref, recurring, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          code,
          date,
          category,
          description,
          budget,
          amount,
          amount * exRate,
          exRate,
          voucher,
          recurring,
          notes,
        ],
      });
      await logAudit("expenses", code, "create", `Gasto registrado: ${code} (${amount} USD)`, userEmail);
      return { ok: true, id: code };
    }

    case "ajustes": {
      const name = str(body.name, 160) || "FAMESA C.A.";
      const rif = str(body.rif, 40) || "J-31352388-7";
      const address = str(body.address || body.description, 240) || "Santa Rosa, Valencia, Carabobo, Venezuela";
      const registry = str(body.registry, 200) || "Primero N° 71, Tomo 44-A";
      await db.execute({
        sql: `UPDATE companies SET name = ?, tax_id = ?, address = ?, registry = ?, updated_at = datetime('now') WHERE id = (SELECT id FROM companies LIMIT 1)`,
        args: [name, rif, address, registry],
      });
      await logAudit("companies", "SET-001", "update", `Datos fiscales actualizados: ${name}`, userEmail);
      return { ok: true, id: "SET-001" };
    }

    default:
      throw new HttpError(400, `Módulo desconocido: ${module}`);
  }
}

export async function updateModuleRecord(
  module: string,
  id: string,
  patch: Record<string, unknown>,
  userEmail: string,
): Promise<Record<string, unknown>> {
  const db = getDb();
  const rate = await getRate();

  switch (module) {
    case "clientes": {
      const current = await findClientRow(db, id);
      if (!current) throw new HttpError(404, "Cliente no encontrado");
      const dbId = num(current.id);
      const meta = parseMeta(current.notes);

      const name = patch.name !== undefined ? str(patch.name, 160) : String(current.name);
      const rawRif = patch.rif !== undefined ? str(patch.rif, 40) : String(current.tax_id);
      let finalRif = String(current.tax_id);
      if (patch.rif !== undefined && rawRif && rawRif !== "Por completar" && rawRif !== finalRif) {
        await freeSoftDeletedCode(db, "clients", "tax_id", rawRif);
        const dup = await db.execute({
          sql: "SELECT id FROM clients WHERE tax_id = ? AND id != ? AND deleted_at IS NULL LIMIT 1",
          args: [rawRif, dbId],
        });
        finalRif = dup.rows[0] ? `${rawRif}-${dbId}` : rawRif;
      }

      const sector =
        patch.sector !== undefined || patch.description !== undefined
          ? str(patch.sector ?? patch.description, 120)
          : String(current.sector ?? "Industrial");
      const contact =
        patch.contact !== undefined ? str(patch.contact, 120) : String(current.contact_name ?? "Por completar");
      const phone = patch.phone !== undefined ? str(patch.phone, 40) : String(current.phone ?? "");
      const address =
        patch.address !== undefined ? str(patch.address, 240) : String(current.address ?? "Por completar");
      const status =
        patch.status !== undefined ? normalizeClientStatus(patch.status) : String(current.status ?? "activo");
      const credit =
        patch.credit !== undefined || patch.amount !== undefined
          ? num(patch.credit ?? patch.amount)
          : num(current.credit_limit_usd);
      const days = patch.days !== undefined ? num(patch.days, 30) : num(current.credit_days, 30);
      const segment =
        patch.segment !== undefined ? str(patch.segment, 40) : String(meta.segment ?? "Industrial");
      const isKey = segment.toLowerCase().includes("clave") ? 1 : 0;

      if (patch.interaction !== undefined) {
        meta.interaction = str(patch.interaction, 4000);
        await db.execute({
          sql: `INSERT INTO client_interactions (client_id, type, subject, notes)
                VALUES (?, 'visita', 'Seguimiento comercial CRM', ?)`,
          args: [dbId, str(patch.interaction, 1000)],
        });
      }
      meta.code = String(meta.code || id);
      meta.segment = segment;

      await db.execute({
        sql: `UPDATE clients SET name = ?, tax_id = ?, sector = ?, contact_name = ?, phone = ?, address = ?, status = ?, credit_limit_usd = ?, credit_days = ?, is_key_account = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [
          name,
          finalRif,
          sector,
          contact,
          phone,
          address,
          status,
          credit,
          days,
          isKey,
          serializeMeta(meta),
          dbId,
        ],
      });
      await logAudit("clients", id, "update", `Cliente actualizado: ${name}`, userEmail);
      return { ok: true, id };
    }

    case "inventario": {
      const res = await db.execute({
        sql: "SELECT id, name, category, unit, stock_quantity, min_stock, location, avg_cost_usd, notes FROM materials WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Material no encontrado");

      const name = patch.name !== undefined ? str(patch.name, 200) : String(current.name);
      const unit = patch.unit !== undefined ? normalizeMaterialUnit(patch.unit) : String(current.unit);
      const stock =
        patch.stock !== undefined
          ? num(patch.stock)
          : patch.quantity !== undefined
            ? num(patch.quantity)
            : num(current.stock_quantity);
      const min = patch.min !== undefined ? num(patch.min) : num(current.min_stock);
      const cost =
        patch.cost !== undefined
          ? num(patch.cost)
          : patch.amount !== undefined
            ? num(patch.amount)
            : num(current.avg_cost_usd);
      const location =
        patch.location !== undefined ? str(patch.location, 120) : String(current.location ?? "");
      const kardex =
        patch.kardex !== undefined ? str(patch.kardex, 4000) : String(current.notes ?? "");

      const delta = stock - num(current.stock_quantity);
      await db.execute({
        sql: `UPDATE materials SET name = ?, unit = ?, stock_quantity = ?, min_stock = ?, avg_cost_usd = ?, last_cost_usd = ?, location = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [name, unit, stock, min, cost, cost, location, kardex, num(current.id)],
      });

      if (Math.abs(delta) > 0.0001) {
        await db.execute({
          sql: `INSERT INTO material_movements (material_id, type, quantity, unit_cost_usd, reference_type, reference_id, notes)
                VALUES (?, ?, ?, ?, 'manual', ?, ?)`,
          args: [
            num(current.id),
            delta > 0 ? "entrada" : "salida_ot",
            Math.abs(delta),
            cost,
            id,
            str(patch.kardex, 200) || "Actualización de inventario",
          ],
        });
      }
      await logAudit("materials", id, "update", `Material actualizado: ${name} (stock ${stock} ${unit})`, userEmail);
      return { ok: true, id };
    }

    case "taller": {
      const res = await db.execute({
        sql: "SELECT id, name, type, capacity, hourly_rate_usd, status, hours_used, notes FROM machines WHERE code = ? LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Máquina no encontrada");

      const meta = parseMeta(current.notes);
      if (patch.capacity !== undefined) meta.capacityHours = num(patch.capacity, 176);
      if (patch.ot !== undefined) meta.ot = str(patch.ot, 40);
      if (patch.maintenance !== undefined) meta.maintenance = str(patch.maintenance, 30);
      if (patch.maintenance_type !== undefined) meta.maintenance_type = str(patch.maintenance_type, 40);

      const name = patch.name !== undefined ? str(patch.name, 200) : String(current.name);
      const standard =
        patch.standard !== undefined ? str(patch.standard, 200) : String(current.capacity ?? "");
      const cost =
        patch.cost !== undefined
          ? num(patch.cost)
          : patch.amount !== undefined
            ? num(patch.amount)
            : num(current.hourly_rate_usd);
      const status =
        patch.status !== undefined ? normalizeMachineStatus(patch.status) : String(current.status);
      const hours = patch.hours !== undefined ? num(patch.hours) : num(current.hours_used);

      await db.execute({
        sql: `UPDATE machines SET name = ?, capacity = ?, hourly_rate_usd = ?, status = ?, hours_used = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [name, standard, cost, status, hours, serializeMeta(meta), num(current.id)],
      });
      await logAudit("machines", id, "update", `Máquina actualizada: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "personal": {
      const res = await db.execute({
        sql: "SELECT id, name, role, specialty, hourly_cost_usd, phone FROM operators WHERE code = ? LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Operario no encontrado");

      const meta = parseMeta(current.phone);
      if (patch.certification !== undefined) meta.certification = str(patch.certification, 120);
      if (patch.hours !== undefined) meta.hours = num(patch.hours, 0);
      if (patch.phone !== undefined) meta.phone = str(patch.phone, 40);

      const name = patch.name !== undefined ? str(patch.name, 160) : String(current.name);
      const role =
        patch.description !== undefined ? str(patch.description, 120) : String(current.role);
      const cost =
        patch.cost !== undefined
          ? num(patch.cost)
          : patch.amount !== undefined
            ? num(patch.amount)
            : num(current.hourly_cost_usd);
      const specialty =
        patch.certification !== undefined
          ? normalizeOperatorSpecialty(patch.certification)
          : String(current.specialty);

      await db.execute({
        sql: `UPDATE operators SET name = ?, role = ?, specialty = ?, hourly_cost_usd = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [name, role, specialty, cost, serializeMeta(meta), num(current.id)],
      });
      await logAudit("operators", id, "update", `Operario actualizado: ${name}`, userEmail);
      return { ok: true, id };
    }

    case "leads": {
      const res = await db.execute({
        sql: "SELECT id, name, company_name, specifications, urgency, status, quote_id FROM leads WHERE rfq_code = ? LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Prospecto no encontrado");

      const company =
        patch.client !== undefined || patch.name !== undefined
          ? str(patch.client ?? patch.name, 160)
          : String(current.company_name);
      const specs =
        patch.description !== undefined
          ? str(patch.description, 1000)
          : String(current.specifications);
      const urgency =
        patch.priority !== undefined
          ? normalizeLeadUrgency(patch.priority)
          : String(current.urgency);
      const status =
        patch.status !== undefined ? normalizeLeadStatus(patch.status) : String(current.status);

      let quoteId = current.quote_id ? num(current.quote_id) : null;
      if (patch.quote) {
        const q = await db.execute({
          sql: "SELECT id FROM quotes WHERE code = ? LIMIT 1",
          args: [str(patch.quote, 40)],
        });
        if (q.rows[0]) quoteId = num(q.rows[0].id);
      }

      await db.execute({
        sql: `UPDATE leads SET company_name = ?, specifications = ?, urgency = ?, status = ?, quote_id = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [company, specs, urgency, status, quoteId, num(current.id)],
      });
      await logAudit("leads", id, "update", `Prospecto actualizado: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "cotizaciones": {
      const res = await db.execute({
        sql: "SELECT id, client_id, status, subtotal_usd, cost_estimated_usd, exchange_rate, notes FROM quotes WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Cotización no encontrada");

      const meta = parseMeta(current.notes);
      for (const k of [
        "client",
        "description",
        "material",
        "quantity",
        "machineHours",
        "laborHours",
        "machine",
        "operator",
        "ot",
      ]) {
        if (patch[k] !== undefined) meta[k] = patch[k];
      }

      const clientId =
        patch.client !== undefined
          ? await ensureClientId(db, patch.client)
          : num(current.client_id);
      const subtotal =
        patch.amount !== undefined ? num(patch.amount) : num(current.subtotal_usd);
      const cost =
        patch.cost !== undefined ? num(patch.cost) : num(current.cost_estimated_usd);
      const tax = subtotal * 0.16;
      const total = subtotal + tax;
      const margin = subtotal - cost;
      const marginPct = subtotal > 0 ? (margin / subtotal) * 100 : 0;
      const exRate =
        patch.exchange_rate !== undefined ? num(patch.exchange_rate) : num(current.exchange_rate, rate);
      const status =
        patch.status !== undefined ? normalizeQuoteStatus(patch.status) : String(current.status);

      await db.execute({
        sql: `UPDATE quotes SET client_id = ?, status = ?, subtotal_usd = ?, tax_usd = ?, total_usd = ?, cost_estimated_usd = ?, margin_usd = ?, margin_pct = ?, subtotal_ves = ?, total_ves = ?, exchange_rate = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [
          clientId,
          status,
          subtotal,
          tax,
          total,
          cost,
          margin,
          marginPct,
          subtotal * exRate,
          total * exRate,
          exRate,
          serializeMeta(meta),
          num(current.id),
        ],
      });
      await logAudit("quotes", id, "update", `Cotización actualizada: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "ordenes": {
      const res = await db.execute({
        sql: "SELECT id, client_id, title, status, priority, due_date, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd, notes FROM orders WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Orden de trabajo no encontrada");

      const meta = parseMeta(current.notes);
      const prevHours = num(meta.hours, 0);
      for (const k of [
        "client",
        "priority",
        "progress",
        "machine",
        "operator",
        "hours",
        "material",
        "materialQty",
        "reserved",
        "quality",
        "work_logs",
        "quote",
        "invoice",
      ]) {
        if (patch[k] !== undefined) meta[k] = patch[k];
      }

      const clientId =
        patch.client !== undefined
          ? await ensureClientId(db, patch.client)
          : num(current.client_id);
      const title =
        patch.description !== undefined ? str(patch.description, 300) : String(current.title);
      const status =
        patch.status !== undefined ? normalizeOrderStatus(patch.status) : String(current.status);
      const priority =
        patch.priority !== undefined
          ? normalizeOrderPriority(patch.priority)
          : String(current.priority);
      const dueDate =
        patch.due !== undefined ? str(patch.due, 20) : String(current.due_date ?? "");
      const revenue =
        patch.amount !== undefined ? num(patch.amount) : num(current.estimated_revenue_usd);
      const estimated =
        patch.estimated !== undefined ? num(patch.estimated) : num(current.estimated_cost_usd);
      const actualCost =
        patch.cost !== undefined ? num(patch.cost) : num(current.actual_cost_usd);

      await db.execute({
        sql: `UPDATE orders SET client_id = ?, title = ?, status = ?, priority = ?, due_date = ?, estimated_revenue_usd = ?, estimated_cost_usd = ?, actual_cost_usd = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [
          clientId,
          title,
          status,
          priority,
          dueDate,
          revenue,
          estimated,
          actualCost,
          serializeMeta(meta),
          num(current.id),
        ],
      });

      // Si se registraron horas adicionales, actualizar también la máquina en `machines`
      const newHours = num(meta.hours, 0);
      if (newHours > prevHours && meta.machine) {
        const deltaHours = newHours - prevHours;
        await db.execute({
          sql: "UPDATE machines SET hours_used = hours_used + ?, updated_at = datetime('now') WHERE code = ?",
          args: [deltaHours, String(meta.machine)],
        });
      }

      // Si se firmó control de calidad, insertar registro en `quality_checks`
      if (patch.quality) {
        await db.execute({
          sql: `INSERT INTO quality_checks (order_id, inspector_name, measured_value, result, notes)
                VALUES (?, ?, ?, 'aprobado', ?)`,
          args: [
            num(current.id),
            String(meta.operator ?? "Control de Calidad"),
            str(patch.quality, 120),
            str(patch.quality, 300),
          ],
        });
      }

      await logAudit("orders", id, "update", `Orden actualizada: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "facturacion": {
      const res = await db.execute({
        sql: "SELECT id, client_id, status, total_usd, paid_amount_usd, exchange_rate, total_ves, notes FROM invoices WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Factura no encontrada");

      const meta = parseMeta(current.notes);
      for (const k of [
        "ot",
        "description",
        "quantity",
        "igtf_collected",
        "credit_note",
        "credit_amount",
      ]) {
        if (patch[k] !== undefined) meta[k] = patch[k];
      }

      const status =
        patch.status !== undefined ? normalizeInvoiceStatus(patch.status) : String(current.status);
      const total =
        patch.amount !== undefined || patch.totalUsd !== undefined
          ? num(patch.amount ?? patch.totalUsd)
          : num(current.total_usd);
      const paid =
        patch.paid !== undefined || patch.paidUsd !== undefined
          ? num(patch.paid ?? patch.paidUsd)
          : num(current.paid_amount_usd);
      const exRate = num(current.exchange_rate, rate);
      const totalVes = patch.amount_ves !== undefined ? num(patch.amount_ves) : total * exRate;

      await db.execute({
        sql: `UPDATE invoices SET status = ?, total_usd = ?, paid_amount_usd = ?, total_ves = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [status, total, paid, totalVes, serializeMeta(meta), num(current.id)],
      });
      await logAudit("invoices", id, "update", `Factura actualizada: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "compras": {
      const res = await db.execute({
        sql: "SELECT id, supplier_id, status, budgeted_usd, total_usd, notes FROM purchases WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Orden de compra no encontrada");

      const meta = parseMeta(current.notes);
      for (const k of ["supplier", "description", "material", "quantity", "received"]) {
        if (patch[k] !== undefined) meta[k] = patch[k];
      }
      if (patch.name !== undefined) meta.supplier = str(patch.name, 160);

      const supplierId =
        patch.name !== undefined
          ? await ensureSupplierId(db, patch.name)
          : num(current.supplier_id);
      const status =
        patch.status !== undefined ? normalizePurchaseStatus(patch.status) : String(current.status);
      const budgeted =
        patch.amount !== undefined || patch.totalUsd !== undefined
          ? num(patch.amount ?? patch.totalUsd)
          : num(current.budgeted_usd);
      const cost = patch.cost !== undefined ? num(patch.cost) : num(current.total_usd);

      await db.execute({
        sql: `UPDATE purchases SET supplier_id = ?, status = ?, budgeted_usd = ?, total_usd = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [supplierId, status, budgeted, cost, serializeMeta(meta), num(current.id)],
      });
      await logAudit("purchases", id, "update", `Compra actualizada: ${id} (${status})`, userEmail);
      return { ok: true, id };
    }

    case "gastos": {
      const res = await db.execute({
        sql: "SELECT id, category, description, budgeted_usd, amount_usd, exchange_rate, document_ref, recurring, notes FROM expenses WHERE code = ? AND deleted_at IS NULL LIMIT 1",
        args: [id],
      });
      const current = res.rows[0];
      if (!current) throw new HttpError(404, "Gasto no encontrado");

      const meta = parseMeta(current.notes);
      if (patch.name !== undefined) meta.categoryLabel = str(patch.name, 80);

      const category =
        patch.name !== undefined ? normalizeExpenseCategory(patch.name) : String(current.category);
      const description =
        patch.description !== undefined ? str(patch.description, 300) : String(current.description);
      const amount =
        patch.amount !== undefined || patch.amountUsd !== undefined
          ? Math.max(0, num(patch.amount ?? patch.amountUsd))
          : num(current.amount_usd);
      const budget =
        patch.budget !== undefined ? num(patch.budget) : num(current.budgeted_usd);
      const exRate = num(current.exchange_rate, rate);
      const voucher =
        patch.voucher !== undefined ? str(patch.voucher, 120) : String(current.document_ref ?? "");
      const recurring =
        patch.recurring !== undefined ? (bool(patch.recurring) ? 1 : 0) : num(current.recurring);

      await db.execute({
        sql: `UPDATE expenses SET category = ?, description = ?, budgeted_usd = ?, amount_usd = ?, amount_ves = ?, document_ref = ?, recurring = ?, notes = ? WHERE id = ?`,
        args: [
          category,
          description,
          budget,
          amount,
          amount * exRate,
          voucher,
          recurring,
          serializeMeta(meta),
          num(current.id),
        ],
      });
      await logAudit("expenses", id, "update", `Gasto actualizado: ${id} (${amount} USD)`, userEmail);
      return { ok: true, id };
    }

    default:
      throw new HttpError(400, `Actualización no soportada para módulo: ${module}`);
  }
}

export async function deleteModuleRecord(
  module: string,
  id: string,
  userEmail: string,
): Promise<Record<string, unknown>> {
  const db = getDb();
  const suffix = `#del-${Date.now()}`;

  switch (module) {
    case "clientes": {
      const current = await findClientRow(db, id);
      if (!current) throw new HttpError(404, "Cliente no encontrado");
      await db.execute({
        sql: "UPDATE clients SET deleted_at = datetime('now'), tax_id = tax_id || ?, updated_at = datetime('now') WHERE id = ?",
        args: [suffix, num(current.id)],
      });
      await logAudit("clients", id, "delete", `Cliente eliminado: ${String(current.name)}`, userEmail);
      return { ok: true, id };
    }

    case "inventario": {
      await db.execute({
        sql: "UPDATE materials SET deleted_at = datetime('now'), code = code || ?, updated_at = datetime('now') WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("materials", id, "delete", `Material eliminado: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "taller": {
      await db.execute({
        sql: "DELETE FROM machines WHERE code = ?",
        args: [id],
      });
      await logAudit("machines", id, "delete", `Máquina eliminada: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "personal": {
      await db.execute({
        sql: "UPDATE operators SET active = 0, code = code || ?, updated_at = datetime('now') WHERE code = ?",
        args: [suffix, id],
      });
      await logAudit("operators", id, "delete", `Personal eliminado: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "leads": {
      await db.execute({
        sql: "DELETE FROM leads WHERE rfq_code = ?",
        args: [id],
      });
      await logAudit("leads", id, "delete", `Prospecto eliminado: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "cotizaciones": {
      await db.execute({
        sql: "UPDATE quotes SET deleted_at = datetime('now'), code = code || ?, updated_at = datetime('now') WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("quotes", id, "delete", `Cotización eliminada: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "ordenes": {
      await db.execute({
        sql: "UPDATE orders SET deleted_at = datetime('now'), code = code || ?, updated_at = datetime('now') WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("orders", id, "delete", `Orden eliminada: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "facturacion": {
      await db.execute({
        sql: "UPDATE invoices SET deleted_at = datetime('now'), code = code || ?, control_number = control_number || ?, updated_at = datetime('now') WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, suffix, id],
      });
      await logAudit("invoices", id, "delete", `Factura eliminada: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "cobros": {
      await db.execute({
        sql: "UPDATE payments SET deleted_at = datetime('now'), code = code || ? WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("payments", id, "delete", `Cobro eliminado: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "compras": {
      await db.execute({
        sql: "UPDATE purchases SET deleted_at = datetime('now'), code = code || ?, updated_at = datetime('now') WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("purchases", id, "delete", `Compra eliminada: ${id}`, userEmail);
      return { ok: true, id };
    }

    case "gastos": {
      await db.execute({
        sql: "UPDATE expenses SET deleted_at = datetime('now'), code = code || ? WHERE code = ? AND deleted_at IS NULL",
        args: [suffix, id],
      });
      await logAudit("expenses", id, "delete", `Gasto eliminado: ${id}`, userEmail);
      return { ok: true, id };
    }

    default:
      throw new HttpError(400, `Eliminación no soportada para módulo: ${module}`);
  }
}
