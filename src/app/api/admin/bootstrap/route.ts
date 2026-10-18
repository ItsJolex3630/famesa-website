// GET /api/admin/bootstrap · Hidrata el panel con el estado real de Turso.
export const runtime = "edge";

import {
  getDb,
  num,
  json,
  errorResponse,
  currentUser,
  isDbConfigured,
  parseMeta,
} from "@/lib/admin/server";

function formatPriorityFromDb(raw: unknown): string {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("emergencia") || s.includes("urgente")) return "Emergencia 24-48h";
  if (s.includes("prioritari")) return "Prioritaria";
  return "Estándar";
}

export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) {
      return json({ ok: true, preview: true, rate: 880.12, userEmail: "famesa2005@gmail.com" });
    }

    const db = getDb();
    const rows = async (sql: string) => (await db.execute(sql)).rows;

    const rateResult = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
    const rate = num(rateResult.rows[0]?.value, 880.12);
    const user = await currentUser(request);
    const userEmail = user?.email || "famesa2005@gmail.com";

    // --- CRM Clientes ---
    const clientRows = await rows(
      "SELECT id, name, tax_id, sector, contact_name, phone, address, status, credit_limit_usd, credit_days, is_key_account, notes FROM clients WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const clientName = new Map<number, string>();
    const clientes = clientRows.map((r) => {
      const id = num(r.id);
      const meta = parseMeta(r.notes);
      const name = String(r.name);
      clientName.set(id, name);
      const rawRif = String(r.tax_id ?? "");
      const rif = rawRif.startsWith("S/R-") ? "Por completar" : rawRif;
      return {
        id: String(meta.code || `CLI-${String(id).padStart(5, "0")}`),
        name,
        status: String(r.status || "activo"),
        rif,
        sector: String(r.sector ?? ""),
        credit: num(r.credit_limit_usd),
        days: num(r.credit_days, 30),
        segment:
          meta.segment !== undefined
            ? String(meta.segment)
            : num(r.is_key_account) === 1
              ? "Cuenta clave"
              : "Industrial",
        address: String(r.address ?? "Por completar"),
        contact: String(r.contact_name ?? "Por completar"),
        phone: String(r.phone ?? ""),
        interaction: String(meta.interaction ?? meta._text ?? ""),
      };
    });

    // --- Mapas auxiliares de cotizaciones, órdenes y facturas ---
    const quoteRows = await rows(
      "SELECT id, code, client_id, notes, status, subtotal_usd, cost_estimated_usd, exchange_rate, subtotal_ves, created_at FROM quotes WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const quoteById = new Map<number, string>();
    quoteRows.forEach((r) => quoteById.set(num(r.id), String(r.code)));

    const orderRows = await rows(
      "SELECT id, code, quote_id, client_id, title, status, priority, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd, due_date, notes FROM orders WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const orderByQuoteId = new Map<number, string>();
    const orderCodeById = new Map<number, string>();
    orderRows.forEach((r) => {
      orderCodeById.set(num(r.id), String(r.code));
      if (r.quote_id) orderByQuoteId.set(num(r.quote_id), String(r.code));
    });

    const invoiceRows = await rows(
      "SELECT id, code, order_id, buyer_name, buyer_tax_id, buyer_address, control_number, status, subtotal_usd, tax_usd, igtf_usd, total_usd, paid_amount_usd, exchange_rate, total_ves, date, due_date, notes FROM invoices WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const invoiceByOrderId = new Map<number, string>();
    const invoiceCodeById = new Map<number, string>();
    invoiceRows.forEach((r) => {
      invoiceCodeById.set(num(r.id), String(r.code));
      if (r.order_id) invoiceByOrderId.set(num(r.order_id), String(r.code));
    });

    // --- Leads web ---
    const leadRows = await rows(
      "SELECT rfq_code, name, company_name, tax_id, phone, specifications, status, urgency, quote_id, created_at, consent_accepted_at FROM leads ORDER BY created_at DESC",
    );
    const leads = leadRows.map((r) => ({
      id: String(r.rfq_code),
      name: String(r.name ?? r.company_name),
      client: String(r.company_name),
      rif: String(r.tax_id ?? ""),
      phone: String(r.phone ?? ""),
      description: String(r.specifications),
      status: String(r.status),
      priority: formatPriorityFromDb(r.urgency),
      date: String(r.created_at ?? "").slice(0, 10),
      consent: `${String(r.consent_accepted_at ?? "").slice(0, 16)} · Ley 17.1-2023`,
      quote: r.quote_id ? quoteById.get(num(r.quote_id)) : undefined,
    }));

    // --- Inventario ---
    const materialRows = await rows(
      "SELECT code, name, stock_quantity, min_stock, unit, avg_cost_usd, location, notes FROM materials WHERE deleted_at IS NULL ORDER BY code",
    );
    const inventario = materialRows.map((r) => {
      const stock = num(r.stock_quantity);
      const min = num(r.min_stock);
      return {
        id: String(r.code),
        name: String(r.name),
        stock,
        min,
        unit: String(r.unit ?? "kg"),
        cost: num(r.avg_cost_usd),
        location: String(r.location ?? ""),
        status: stock < min ? "crítico" : "disponible",
        kardex: String(r.notes || `Inventario activo · ${stock} ${String(r.unit ?? "kg")}`),
      };
    });
    const defaultMaterialCode = inventario[0]?.id ?? "MAT-1045-50";

    // --- Cotizaciones ---
    const cotizaciones = quoteRows.map((r) => {
      const meta = parseMeta(r.notes);
      const rawStatus = String(r.status);
      const linkedOt = meta.ot ? String(meta.ot) : orderByQuoteId.get(num(r.id));
      return {
        id: String(r.code),
        client: clientName.get(num(r.client_id)) ?? String(meta.client ?? "Cliente"),
        description: String(meta.description ?? meta._text ?? ""),
        status: rawStatus === "convertida" ? "aprobada" : rawStatus,
        amount: num(r.subtotal_usd),
        cost: num(r.cost_estimated_usd),
        exchange_rate: num(r.exchange_rate, rate),
        amount_ves: num(r.subtotal_ves),
        date: String(r.created_at ?? "").slice(0, 10),
        material: String(meta.material ?? defaultMaterialCode),
        quantity: num(meta.quantity, 1),
        machineHours: num(meta.machineHours, 12),
        laborHours: num(meta.laborHours, 14),
        machine: String(meta.machine ?? "CNC-01"),
        operator: String(meta.operator ?? "T.S.U. Carlos Méndez"),
        ot: linkedOt,
      };
    });

    // --- Órdenes de trabajo ---
    const ordenes = orderRows.map((r) => {
      const meta = parseMeta(r.notes);
      const status = String(r.status);
      const defaultProgress =
        status === "terminada" || status === "facturada"
          ? 100
          : status === "control_calidad"
            ? 90
            : status === "en_proceso"
              ? 50
              : 0;
      return {
        id: String(r.code),
        client: clientName.get(num(r.client_id)) ?? String(meta.client ?? "Cliente"),
        description: String(r.title),
        status,
        priority: formatPriorityFromDb(meta.priority ?? r.priority),
        amount: num(r.estimated_revenue_usd),
        estimated: num(r.estimated_cost_usd),
        cost: num(r.actual_cost_usd),
        due: String(r.due_date ?? ""),
        progress: num(meta.progress, defaultProgress),
        machine: String(meta.machine ?? "CNC-01"),
        operator: String(meta.operator ?? "T.S.U. Carlos Méndez"),
        hours: num(meta.hours, 0),
        material: String(meta.material ?? defaultMaterialCode),
        materialQty: num(meta.materialQty, 1),
        reserved: Boolean(meta.reserved),
        quality: String(meta.quality ?? ""),
        work_logs: String(meta.work_logs ?? ""),
        quote: meta.quote ? String(meta.quote) : r.quote_id ? quoteById.get(num(r.quote_id)) : undefined,
        invoice: meta.invoice ? String(meta.invoice) : invoiceByOrderId.get(num(r.id)),
      };
    });

    // --- Taller / máquinas ---
    const machineRows = await rows(
      "SELECT code, name, status, hours_used, capacity, hourly_rate_usd, notes FROM machines ORDER BY code",
    );
    const taller = machineRows.map((r) => {
      const meta = parseMeta(r.notes);
      return {
        id: String(r.code),
        name: String(r.name),
        status: String(r.status),
        hours: num(r.hours_used),
        capacity: num(meta.capacityHours, 176),
        ot: String(meta.ot ?? "—"),
        maintenance: String(meta.maintenance ?? "2026-11-30"),
        maintenance_type: String(meta.maintenance_type ?? "Preventivo"),
        cost: num(r.hourly_rate_usd),
        standard: String(r.capacity ?? ""),
      };
    });

    // --- Facturación ---
    const facturacion = invoiceRows.map((r) => {
      const meta = parseMeta(r.notes);
      return {
        id: String(r.code),
        client: String(r.buyer_name),
        rif: String(r.buyer_tax_id),
        address: String(r.buyer_address),
        control: String(r.control_number),
        status: String(r.status),
        base: num(r.subtotal_usd),
        iva: num(r.tax_usd),
        igtf: num(r.igtf_usd),
        igtf_collected: num(meta.igtf_collected, num(r.igtf_usd)),
        amount: num(r.total_usd),
        paid: num(r.paid_amount_usd),
        exchange_rate: num(r.exchange_rate, rate),
        amount_ves: num(r.total_ves),
        date: String(r.date ?? ""),
        due: String(r.due_date ?? ""),
        ot: meta.ot ? String(meta.ot) : r.order_id ? orderCodeById.get(num(r.order_id)) : undefined,
        description: String(meta.description ?? "Servicios industriales de mecanizado y soldadura"),
        quantity: num(meta.quantity, 1),
        credit_note: meta.credit_note ? String(meta.credit_note) : undefined,
        credit_amount: meta.credit_amount !== undefined ? num(meta.credit_amount) : undefined,
      };
    });

    // --- Compras y proveedores ---
    const supplierRows = await rows("SELECT id, name FROM suppliers");
    const supplierName = new Map<number, string>();
    supplierRows.forEach((r) => supplierName.set(num(r.id), String(r.name)));
    const purchaseRows = await rows(
      "SELECT code, supplier_id, status, budgeted_usd, total_usd, date, notes FROM purchases WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const compras = purchaseRows.map((r) => {
      const meta = parseMeta(r.notes);
      return {
        id: String(r.code),
        name: supplierName.get(num(r.supplier_id)) ?? String(meta.supplier ?? "Proveedor"),
        description: String(meta.description ?? meta._text ?? ""),
        material: String(meta.material ?? defaultMaterialCode),
        quantity: num(meta.quantity, 1),
        received: num(meta.received, 0),
        status: String(r.status),
        amount: num(r.budgeted_usd),
        cost: num(r.total_usd),
        date: String(r.date ?? ""),
      };
    });

    // --- Gastos ---
    const expenseRows = await rows(
      "SELECT code, category, description, amount_usd, budgeted_usd, recurring, document_ref, date, notes FROM expenses WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const gastos = expenseRows.map((r) => {
      const meta = parseMeta(r.notes);
      return {
        id: String(r.code),
        name: String(meta.categoryLabel || r.category),
        description: String(r.description),
        status: "registrado",
        amount: num(r.amount_usd),
        budget: num(r.budgeted_usd),
        recurring: num(r.recurring) === 1,
        voucher: String(r.document_ref ?? ""),
        date: String(r.date ?? ""),
      };
    });

    // --- Personal ---
    const operatorRows = await rows(
      "SELECT id, code, name, role, hourly_cost_usd, specialty, phone FROM operators WHERE active = 1 ORDER BY code",
    );
    const workLogHoursRows = await rows(
      "SELECT operator_id, COALESCE(SUM(hours), 0) AS total_hours FROM work_logs GROUP BY operator_id",
    );
    const operatorHours = new Map<number, number>();
    workLogHoursRows.forEach((r) => operatorHours.set(num(r.operator_id), num(r.total_hours)));

    const personal = operatorRows.map((r) => {
      const meta = parseMeta(r.phone);
      return {
        id: String(r.code),
        name: String(r.name),
        description: String(r.role),
        status: "activo",
        cost: num(r.hourly_cost_usd),
        hours: num(meta.hours, operatorHours.get(num(r.id)) ?? 0),
        certification: String(meta.certification || r.specialty || "Especialista técnico"),
      };
    });

    // --- Cobros ---
    const paymentRows = await rows(
      "SELECT code, invoice_id, client_id, amount_usd, igtf_applied_usd, exchange_rate, amount_ves, method, reference, paid_at FROM payments WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const cobros = paymentRows.map((r) => ({
      id: String(r.code),
      client: clientName.get(num(r.client_id)) ?? "Cliente",
      invoice: invoiceCodeById.get(num(r.invoice_id)) ?? "",
      amount: num(r.amount_usd),
      igtf: num(r.igtf_applied_usd),
      method: String(r.method),
      status: "conciliado",
      exchange_rate: num(r.exchange_rate, rate),
      amount_ves: num(r.amount_ves),
      reference: String(r.reference ?? ""),
      date: String(r.paid_at ?? "").slice(0, 10),
    }));

    // --- Ajustes (Datos fiscales de planta) ---
    const companyRows = await rows("SELECT name, tax_id, registry, address, phone, email FROM companies LIMIT 1");
    const comp = companyRows[0];
    const ajustes = [
      {
        id: "SET-001",
        name: String(comp?.name ?? "FAMESA C.A."),
        rif: String(comp?.tax_id ?? "J-31352388-7"),
        address: String(
          comp?.address ?? "Santa Rosa, Valencia, Carabobo, Venezuela",
        ),
        description: String(
          comp?.registry ?? "Primero N° 71, Tomo 44-A",
        ),
        status: "activo",
      },
    ];

    // --- Bitácora de auditoría reciente ---
    const auditRows = await rows(
      "SELECT entity, entity_id, action, details, created_at FROM audit_log ORDER BY id DESC LIMIT 30",
    );
    const audits = auditRows.map((r) => ({
      time: String(r.created_at ?? ""),
      action: `${String(r.details || `${String(r.action)} ${String(r.entity_id)}`)}`,
      role: "admin",
    }));

    return json({
      ok: true,
      rate,
      userEmail,
      audits,
      data: {
        leads,
        cotizaciones,
        ordenes,
        taller,
        clientes,
        inventario,
        compras,
        facturacion,
        cobros,
        gastos,
        reportes: [],
        personal,
        ajustes,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
