// GET /api/admin/bootstrap · Hidrata el panel con el estado real de Turso.
export const runtime = "edge";

import { getDb, num, json, errorResponse, currentUser, isDbConfigured } from "@/lib/admin/server";

export async function GET(request: Request) {
  try {
    // Modo degradado (preview): si Turso no está configurado no se expone ningún
    // dato real; el endpoint autenticado responde 200 para poder verificar el
    // control de acceso (401 sin credenciales / 200 autorizado) en local.
    if (!isDbConfigured()) {
      return json({ ok: true, preview: true, rate: 54.8, userEmail: "famesa2005@gmail.com" });
    }

    const db = getDb();
    const rows = async (sql: string) => (await db.execute(sql)).rows;

    const rateResult = await db.execute("SELECT value FROM settings WHERE key = 'rate_usd_ves'");
    const rate = num(rateResult.rows[0]?.value, 54.8);
    const user = await currentUser(request);
    const userEmail = user?.email || "famesa2005@gmail.com";

    const clientRows = await rows(
      "SELECT id, name, tax_id, sector, contact_name, phone, address, status, credit_limit_usd, credit_days, is_key_account FROM clients WHERE deleted_at IS NULL ORDER BY id",
    );
    const clientName = new Map<number, string>();
    const clientes = clientRows.map((r) => {
      const id = num(r.id);
      clientName.set(id, String(r.name));
      return {
        id: `CLI-${String(id).padStart(3, "0")}`,
        name: String(r.name),
        status: String(r.status),
        rif: String(r.tax_id ?? ""),
        sector: String(r.sector ?? ""),
        credit: num(r.credit_limit_usd),
        days: num(r.credit_days, 30),
        segment: num(r.is_key_account) === 1 ? "Cuenta clave" : "Industrial",
        address: String(r.address ?? ""),
        contact: String(r.contact_name ?? ""),
        phone: String(r.phone ?? ""),
      };
    });

    const leadRows = await rows(
      "SELECT rfq_code, company_name, specifications, status, urgency, created_at, consent_accepted_at FROM leads ORDER BY created_at DESC",
    );
    const leads = leadRows.map((r) => ({
      id: String(r.rfq_code),
      client: String(r.company_name),
      description: String(r.specifications),
      status: String(r.status),
      priority: String(r.urgency),
      date: String(r.created_at ?? "").slice(0, 10),
      consent: `${String(r.consent_accepted_at ?? "").slice(0, 16)} · Ley 17.1-2023`,
    }));

    const materialRows = await rows(
      "SELECT code, name, stock_quantity, min_stock, unit, avg_cost_usd, location FROM materials WHERE deleted_at IS NULL ORDER BY code",
    );
    const inventario = materialRows.map((r) => {
      const stock = num(r.stock_quantity);
      const min = num(r.min_stock);
      return {
        id: String(r.code),
        name: String(r.name),
        stock,
        min,
        unit: String(r.unit ?? ""),
        cost: num(r.avg_cost_usd),
        location: String(r.location ?? ""),
        status: stock < min ? "crítico" : "disponible",
      };
    });

    const quoteRows = await rows(
      "SELECT code, client_id, notes, status, subtotal_usd, cost_estimated_usd, exchange_rate, subtotal_ves, created_at FROM quotes WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const cotizaciones = quoteRows.map((r) => ({
      id: String(r.code),
      client: clientName.get(num(r.client_id)) ?? "Cliente",
      description: String(r.notes ?? ""),
      status: String(r.status),
      amount: num(r.subtotal_usd),
      cost: num(r.cost_estimated_usd),
      exchange_rate: num(r.exchange_rate, rate),
      amount_ves: num(r.subtotal_ves),
      date: String(r.created_at ?? "").slice(0, 10),
    }));

    const orderRows = await rows(
      "SELECT code, client_id, title, status, priority, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd, due_date FROM orders WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const ordenes = orderRows.map((r) => ({
      id: String(r.code),
      client: clientName.get(num(r.client_id)) ?? "Cliente",
      description: String(r.title),
      status: String(r.status),
      priority: String(r.priority),
      amount: num(r.estimated_revenue_usd),
      estimated: num(r.estimated_cost_usd),
      cost: num(r.actual_cost_usd),
      due: String(r.due_date ?? ""),
    }));

    const machineRows = await rows(
      "SELECT code, name, status, hours_used, capacity, hourly_rate_usd FROM machines ORDER BY code",
    );
    const taller = machineRows.map((r) => ({
      id: String(r.code),
      name: String(r.name),
      status: String(r.status),
      hours: num(r.hours_used),
      capacity: 176,
      cost: num(r.hourly_rate_usd),
      standard: String(r.capacity ?? ""),
    }));

    const invoiceRows = await rows(
      "SELECT code, buyer_name, buyer_tax_id, buyer_address, control_number, status, subtotal_usd, tax_usd, igtf_usd, total_usd, paid_amount_usd, exchange_rate, total_ves, date, due_date FROM invoices WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const facturacion = invoiceRows.map((r) => ({
      id: String(r.code),
      client: String(r.buyer_name),
      rif: String(r.buyer_tax_id),
      address: String(r.buyer_address),
      control: String(r.control_number),
      status: String(r.status),
      base: num(r.subtotal_usd),
      iva: num(r.tax_usd),
      igtf: num(r.igtf_usd),
      amount: num(r.total_usd),
      paid: num(r.paid_amount_usd),
      exchange_rate: num(r.exchange_rate, rate),
      amount_ves: num(r.total_ves),
      date: String(r.date ?? ""),
      due: String(r.due_date ?? ""),
    }));

    const supplierRows = await rows("SELECT id, name FROM suppliers");
    const supplierName = new Map<number, string>();
    supplierRows.forEach((r) => supplierName.set(num(r.id), String(r.name)));
    const purchaseRows = await rows(
      "SELECT code, supplier_id, status, budgeted_usd, total_usd, date FROM purchases WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const compras = purchaseRows.map((r) => ({
      id: String(r.code),
      name: supplierName.get(num(r.supplier_id)) ?? "Proveedor",
      status: String(r.status),
      amount: num(r.budgeted_usd),
      cost: num(r.total_usd),
      date: String(r.date ?? ""),
    }));

    const expenseRows = await rows(
      "SELECT code, category, description, amount_usd, budgeted_usd, recurring, document_ref, date FROM expenses WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const gastos = expenseRows.map((r) => ({
      id: String(r.code),
      name: String(r.category),
      description: String(r.description),
      status: "registrado",
      amount: num(r.amount_usd),
      budget: num(r.budgeted_usd),
      recurring: num(r.recurring) === 1,
      voucher: String(r.document_ref ?? ""),
      date: String(r.date ?? ""),
    }));

    const operatorRows = await rows(
      "SELECT code, name, role, hourly_cost_usd, specialty FROM operators ORDER BY code",
    );
    const personal = operatorRows.map((r) => ({
      id: String(r.code),
      name: String(r.name),
      description: String(r.role),
      status: "activo",
      cost: num(r.hourly_cost_usd),
      hours: 0,
      certification: String(r.specialty ?? ""),
    }));

    const paymentRows = await rows(
      "SELECT code, client_id, amount_usd, igtf_applied_usd, exchange_rate, amount_ves, method, reference, paid_at FROM payments WHERE deleted_at IS NULL ORDER BY id DESC",
    );
    const cobros = paymentRows.map((r) => ({
      id: String(r.code),
      client: clientName.get(num(r.client_id)) ?? "Cliente",
      amount: num(r.amount_usd),
      igtf: num(r.igtf_applied_usd),
      method: String(r.method),
      status: "conciliado",
      exchange_rate: num(r.exchange_rate, rate),
      amount_ves: num(r.amount_ves),
      reference: String(r.reference ?? ""),
      date: String(r.paid_at ?? "").slice(0, 10),
    }));

    return json({
      ok: true,
      rate,
      userEmail,
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
        ajustes: [],
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
