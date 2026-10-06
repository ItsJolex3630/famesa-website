"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  RFQFormSchema,
  SERVICE_TYPES,
  URGENCY_LEVELS,
  type RFQFormData,
} from "@/lib/zod-schemas";
import {
  WHATSAPP_NUMBER,
  buildLocalRfqCode,
  buildWhatsAppUrl,
} from "@/lib/utils";
import { SERVICE_TYPE_LABELS, URGENCY_LABELS } from "@/lib/site-data";
import type { QuoteApiError, QuoteApiSuccess } from "@/types";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full border border-famesa-silver bg-white px-4 py-3 text-[15px] text-famesa-ink placeholder:text-famesa-silverDark focus:border-famesa-electric focus:ring-0";

const labelBase =
  "mb-2 block font-heading text-[13px] font-semibold uppercase tracking-wide text-famesa-ink";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-famesa-alertRed">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function QuoteForm() {
  const [rfqCode, setRfqCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RFQFormData>({
    resolver: zodResolver(RFQFormSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      serviceType: "mecanizado_cnc",
      urgency: "estandar",
      specifications: "",
      turnstileToken: "",
    },
  });

  /**
   * Arma la ficha tecnica que se despacha por WhatsApp. Los valores ya
   * vienen sanitizados por el resolver de Zod.
   */
  const buildMessage = (data: RFQFormData, code: string): string =>
    [
      `*SOLICITUD DE COTIZACIÓN (RFQ) — ${code}*`,
      "",
      `*Solicitante:* ${data.fullName}`,
      `*Empresa:* ${data.companyName}`,
      `*Teléfono:* ${data.phone}`,
      `*Correo:* ${data.email}`,
      `*Servicio requerido:* ${SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType}`,
      `*Nivel de urgencia:* ${URGENCY_LABELS[data.urgency] ?? data.urgency}`,
      "",
      "*Especificaciones técnicas:*",
      data.specifications,
      "",
      "Enviado desde el formulario web de Famesa C.A. (Valencia, Carabobo).",
    ].join("\n");

  const onWhatsApp = handleSubmit((data) => {
    const code = buildLocalRfqCode();
    setRfqCode(code);
    window.open(buildWhatsAppUrl(buildMessage(data, code)), "_blank", "noopener,noreferrer");
    toast.success("Ficha técnica lista", {
      description: `Se abrió WhatsApp con el resumen ${code}.`,
    });
  });

  const onSubmitSystem = handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload: QuoteApiSuccess | QuoteApiError = await response.json();

      if (!response.ok || !payload.success) {
        const errorPayload = payload as QuoteApiError;
        throw new Error(errorPayload.error ?? "No fue posible registrar la solicitud.");
      }

      setRfqCode(payload.rfqCode);
      toast.success("Solicitud registrada", {
        description: `Código de seguimiento: ${payload.rfqCode}. Nuestro equipo responde en menos de 24 horas.`,
      });
    } catch (error) {
      toast.error("Error al enviar la solicitud", {
        description:
          error instanceof Error
            ? error.message
            : "Intente nuevamente o use el canal directo de WhatsApp.",
      });
    }
  });

  const previewService = getValues("serviceType");

  return (
    <section id="cotizar" className="relative overflow-hidden border-b border-famesa-silver bg-white">
      <div className="absolute inset-0 technical-grid-fine opacity-60" aria-hidden="true" />

      <div className="relative mx-auto max-w-shell px-5 py-16 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-famesa-silver pb-6 md:flex-row md:items-end">
          <div>
            <span className="tech-label text-famesa-blue">Formulario técnico B2B</span>
            <h2 className="mt-1 max-w-3xl font-heading text-[34px] font-bold uppercase leading-none tracking-tight text-famesa-ink sm:text-[42px]">
              Solicitar cotización y requerimiento técnico
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-famesa-muted">
              Complete los parámetros operativos de su proyecto. Nuestro
              departamento de ingeniería de costos responde con un dictamen
              preliminar en menos de 24 horas.
            </p>
          </div>
          <span className="tech-stamp flex w-fit items-center gap-2 border border-famesa-silver bg-white px-3 py-1.5 text-famesa-ink">
            <ShieldCheck className="h-4 w-4 text-famesa-blue" aria-hidden="true" />
            Protegido por Cloudflare Turnstile y validación de servidor
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Formulario */}
          <form
            noValidate
            onSubmit={onSubmitSystem}
            className="border border-famesa-silver bg-white p-6 lg:col-span-7 md:p-8"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className={labelBase}>
                  Nombre y apellido *
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. Ing. Carlos Méndez"
                  className={cn(inputBase, errors.fullName && "border-famesa-alertRed")}
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div>
                <label htmlFor="companyName" className={labelBase}>
                  Empresa / razón social *
                </label>
                <input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ej. Planta Metalúrgica del Centro"
                  className={cn(inputBase, errors.companyName && "border-famesa-alertRed")}
                  aria-invalid={Boolean(errors.companyName)}
                  {...register("companyName")}
                />
                <FieldError message={errors.companyName?.message} />
              </div>

              <div>
                <label htmlFor="phone" className={labelBase}>
                  Teléfono / WhatsApp *
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+58 414 1234567"
                  className={cn(inputBase, errors.phone && "border-famesa-alertRed")}
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
                <FieldError message={errors.phone?.message} />
              </div>

              <div>
                <label htmlFor="email" className={labelBase}>
                  Correo corporativo *
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="compras@empresa.com"
                  className={cn(inputBase, errors.email && "border-famesa-alertRed")}
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="serviceType" className={labelBase}>
                Tipo de servicio requerido *
              </label>
              <select
                id="serviceType"
                className={cn(inputBase, "appearance-none", errors.serviceType && "border-famesa-alertRed")}
                aria-invalid={Boolean(errors.serviceType)}
                {...register("serviceType")}
              >
                {SERVICE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.serviceType?.message} />
            </div>

            {/* Nivel de urgencia */}
            <fieldset className="mt-6">
              <legend className={labelBase}>Nivel de urgencia del requerimiento *</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {URGENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 border border-famesa-silver p-4 transition-colors hover:border-famesa-blue",
                      level.value === "emergencia_parada" && "border-l-4 border-l-famesa-orange",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={level.value}
                        className="h-4 w-4 border-famesa-silverDark text-famesa-blue focus:ring-0"
                        {...register("urgency")}
                      />
                      <span className="font-heading text-[15px] font-semibold uppercase tracking-wide text-famesa-ink">
                        {level.label}
                      </span>
                    </span>
                    <span className="text-[12px] leading-relaxed text-famesa-muted">
                      {level.detail}
                    </span>
                  </label>
                ))}
              </div>
              <FieldError message={errors.urgency?.message} />
            </fieldset>

            <div className="mt-6">
              <label htmlFor="specifications" className={labelBase}>
                Descripción de piezas / especificación técnica *
              </label>
              <textarea
                id="specifications"
                rows={6}
                placeholder="Indique material, medidas, cantidad, tolerancias requeridas y fecha estimada de entrega..."
                className={cn(inputBase, "resize-y", errors.specifications && "border-famesa-alertRed")}
                aria-invalid={Boolean(errors.specifications)}
                {...register("specifications")}
              />
              <FieldError message={errors.specifications?.message} />
            </div>

            {/* Token de Turnstile (se inyecta si el sitio tiene clave pública configurada) */}
            <input type="hidden" {...register("turnstileToken")} />

            {/* Acciones */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-industrial-primary flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Enviando al sistema
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Enviar solicitud formal (sistema)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onWhatsApp}
                className="btn-industrial-secondary flex-1"
              >
                <MessageSquare className="h-4 w-4 text-famesa-blue" aria-hidden="true" />
                Enviar por WhatsApp ahora
              </button>
            </div>

            <p className="tech-stamp mt-4 flex items-start gap-2 text-famesa-muted">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-famesa-blue" aria-hidden="true" />
              Datos cifrados en tránsito (TLS 1.3). Límite de 5 solicitudes por
              minuto por dirección IP para proteger la operación comercial.
            </p>

            {rfqCode ? (
              <p className="mt-4 flex items-center gap-2 border border-famesa-blue bg-famesa-surface px-4 py-3 text-[13px] font-medium text-famesa-ink">
                <CheckCircle2 className="h-4 w-4 text-famesa-blue" aria-hidden="true" />
                Código de seguimiento generado:{" "}
                <span className="tech-stamp text-famesa-blue">{rfqCode}</span>
              </p>
            ) : null}
          </form>

          {/* Panel lateral operativo */}
          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div className="border border-famesa-silver bg-famesa-surface p-6">
              <span className="tech-label text-famesa-blue">Respuesta rápida</span>
              <h3 className="mt-1 font-heading text-[26px] font-bold uppercase leading-tight text-famesa-ink">
                Evaluación preliminar sin costo
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Revisión de feasibilidad del material y del proceso.",
                  "Cotización formal con plazo de entrega comprometido.",
                  "Alternativas de material cuando el plazo es crítico.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 border-b border-famesa-silver pb-3 text-[13px] leading-relaxed text-famesa-muted last:border-b-0 last:pb-0"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-famesa-blue"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="tech-stamp mt-5 border-t border-famesa-silver pt-3 text-famesa-muted">
                Servicio seleccionado:{" "}
                <span className="text-famesa-blue">
                  {SERVICE_TYPE_LABELS[previewService] ?? previewService}
                </span>
              </p>
            </div>

            <div className="border border-famesa-navy bg-famesa-navy p-6 text-white">
              <span className="tech-label text-famesa-orange">Parada de planta detenida</span>
              <h3 className="mt-1 font-heading text-[26px] font-bold uppercase leading-tight">
                Guardia de emergencia 24/7
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-famesa-silverDark">
                Si su línea está parada, escriba directamente al WhatsApp del
                taller con la referencia del activo y la pieza que necesita.
                Atendemos emergencias de reductores y rodillos en toda la
                región central del país.
              </p>
              <a
                href={buildWhatsAppUrl(
                  `Hola Famesa C.A., reporto PARADA DE PLANTA. Activo afectado: `,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-industrial-orange mt-5 w-full"
              >
                Escribir a guardia ({WHATSAPP_NUMBER})
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
