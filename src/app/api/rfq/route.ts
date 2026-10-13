// POST /api/rfq · Recibe una solicitud de cotización y la inserta en `leads`.
export const runtime = "edge";

import { getDb, num, readBody, json, str, bool, errorResponse, assertMethod, logAudit, HttpError } from "@/lib/admin/server";

function mapUrgency(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("emergencia") || t.includes("parada")) return "Urgente - Parada de Planta";
  if (t.includes("prior")) return "Prioritario";
  if (t.includes("estandar") || t.includes("estándar")) return "Estándar";
  return "Planificado";
}

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");
    const body = await readBody<{
      fullName?: string;
      companyName?: string;
      email?: string;
      phone?: string;
      serviceType?: string;
      urgency?: string;
      specifications?: string;
      consentPrivacy?: boolean;
    }>(request);

    const fullName = str(body.fullName, 120);
    const companyName = str(body.companyName, 160);
    const email = str(body.email, 160).toLowerCase();
    const phone = str(body.phone, 40);
    const serviceType = str(body.serviceType, 80) || "otro";
    const specifications = str(body.specifications, 2500);

    if (!fullName || !companyName || !email || !phone || specifications.length < 10) {
      throw new HttpError(400, "Datos de la solicitud incompletos");
    }
    if (!bool(body.consentPrivacy)) throw new HttpError(400, "Debe aceptar la Política de Privacidad");

    const db = getDb();
    const countResult = await db.execute("SELECT COUNT(*) AS n FROM leads");
    const seq = num(countResult.rows[0]?.n, 0) + 1;
    const rfqCode = `RFQ-${new Date().getFullYear()}-${String(seq).padStart(3, "0")}`;

    await db.execute({
      sql: `INSERT INTO leads (rfq_code, name, company_name, email, phone, service_type, urgency, specifications, consent_accepted, source, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'web_rfq', 'nuevo')`,
      args: [rfqCode, fullName, companyName, email, phone, serviceType, mapUrgency(str(body.urgency, 40)), specifications],
    });
    await logAudit("leads", rfqCode, "create", `RFQ web de ${companyName} (${serviceType})`, email);
    return json({ ok: true, rfq_code: rfqCode });
  } catch (error) {
    return errorResponse(error);
  }
}
