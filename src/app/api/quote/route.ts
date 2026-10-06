import { NextRequest, NextResponse } from "next/server";
import { RFQFormSchema } from "@/lib/zod-schemas";
import { checkRateLimit, getRetryAfterSeconds } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000;

/** Extrae la IP real del cliente detras del proxy de Vercel. */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }
  return request.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

function jsonError(
  message: string,
  status: number,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json({ success: false, error: message }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

/** Verifica el token de Cloudflare Turnstile contra la API oficial. */
async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
          token,
        )}&remoteip=${encodeURIComponent(ip)}`,
        cache: "no-store",
      },
    );

    const outcome = (await response.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    // Falla cerrada: si no se puede validar la captcha no se acepta el envio.
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limiting por IP: 5 cotizaciones por minuto.
    const { success } = checkRateLimit(ip, MAX_REQUESTS, WINDOW_MS);
    if (!success) {
      return jsonError(
        "Ha superado el límite de solicitudes. Espere un minuto antes de reintentar.",
        429,
        { "Retry-After": String(getRetryAfterSeconds(ip) || 60) },
      );
    }

    // 2. Limite de tamano del cuerpo para evitar payloads abusivos.
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 16_384) {
      return jsonError("El tamaño de la solicitud excede el límite permitido.", 413);
    }

    // 3. Parsear el cuerpo (solo objeto JSON).
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Cuerpo de la solicitud inválido.", 400);
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return jsonError("Datos de formulario inválidos.", 400);
    }

    // 4. Validar y sanitizar con Zod en el servidor (nunca confiar en el cliente).
    const validation = RFQFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de formulario inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const validData = validation.data;

    // 5. Verificacion de Cloudflare Turnstile cuando hay secreto configurado.
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!validData.turnstileToken) {
        return jsonError(
          "Fallo de validación de seguridad (Turnstile). Recargue la página e intente nuevamente.",
          403,
        );
      }

      const isHuman = await verifyTurnstile(
        validData.turnstileToken,
        ip,
        turnstileSecret,
      );
      if (!isHuman) {
        return jsonError(
          "Fallo de validación de seguridad (Turnstile). Intente nuevamente.",
          403,
        );
      }
    }

    // 6. Codigo unico de seguimiento RFQ (no incluye datos personales).
    const rfqCode = `RFQ-${Date.now().toString(36).toUpperCase()}`;

    // 7. Punto de integracion: registrar la solicitud en el CRM / enviar correo.
    //    Ningun secreto se expone al cliente; toda llamada saliente ocurre aqui.
    console.info(
      `[RFQ ${rfqCode}] ${validData.serviceType} · ${validData.urgency} · ${validData.companyName}`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Solicitud de cotización recibida con éxito",
        rfqCode,
        data: {
          fullName: validData.fullName,
          companyName: validData.companyName,
          serviceType: validData.serviceType,
          urgency: validData.urgency,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error en /api/quote:", error);
    return jsonError(
      "Error interno del servidor al procesar la cotización",
      500,
    );
  }
}

/** Metodos no permitidos en el endpoint de recepcion de cotizaciones. */
export async function GET() {
  return jsonError("Método no permitido.", 405, { Allow: "POST" });
}
