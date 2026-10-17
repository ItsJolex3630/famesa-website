"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { CONTACT } from "@/lib/contact-data";
import type { RfqPrefillData } from "@/types/assistant";

const URGENCY_OPTIONS: NonNullable<RfqPrefillData["urgency"]>[] = [
  "Normal",
  "Prioritario",
  "Urgente - Parada de Planta",
];

interface InlineRfqFormProps {
  prefill?: RfqPrefillData;
  onSuccess?: (rfqCode: string) => void;
}

interface FormState {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  urgency: NonNullable<RfqPrefillData["urgency"]>;
  specifications: string;
  consentPrivacy: boolean;
}

/** Formulario de cotización embebido en el hilo; publica en POST /api/rfq. */
export function InlineRfqForm({ prefill, onSuccess }: InlineRfqFormProps) {
  const idPrefix = useId();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    urgency: prefill?.urgency ?? "Normal",
    specifications: prefill?.specifications ?? "",
    consentPrivacy: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rfqCode, setRfqCode] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): string => {
    if (form.fullName.trim().length < 3) return "Indica tu nombre y apellido.";
    if (form.companyName.trim().length < 2) return "Indica la empresa o razón social.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Ingresa un correo electrónico válido.";
    if ((form.phone.match(/\d/g)?.length ?? 0) < 8)
      return "Ingresa un teléfono con al menos 8 dígitos.";
    if (form.specifications.trim().length < 10)
      return "Describe la pieza o servicio (mínimo 10 caracteres).";
    if (!form.consentPrivacy) return "Debes aceptar la Política de Privacidad.";
    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          serviceType: prefill?.serviceType ?? "otro",
          urgency: form.urgency,
          specifications: form.specifications.trim(),
          consentPrivacy: true,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; rfq_code?: string; error?: string }
        | null;
      if (!response.ok || !payload?.ok || !payload.rfq_code) {
        throw new Error(payload?.error || "No pudimos registrar la solicitud.");
      }
      setRfqCode(payload.rfq_code);
      onSuccess?.(payload.rfq_code);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "No pudimos conectar con el servidor. Puedes escribirnos por WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (rfqCode) {
    return (
      <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <p className="font-heading text-base font-bold">¡Solicitud registrada!</p>
        </div>
        <p className="mt-2 text-xs text-slate-200">
          Tu código de seguimiento es{" "}
          <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-sm font-bold text-orange-400">
            {rfqCode}
          </span>
        </p>
        <p className="mt-2 text-xs text-slate-300">
          El equipo técnico de FAMESA te contactará a{" "}
          <span className="font-semibold text-white">{form.email}</span> o al teléfono indicado.
          Atención 24/7 para paradas de planta.
        </p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-slate-600 bg-slate-900/80 px-2.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400";
  const labelClass = "mb-1 block text-[11px] font-semibold text-slate-300";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3"
      noValidate
    >
      <p className="font-heading text-sm font-bold text-white">Cotización técnica (RFQ)</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-name`}>
            Nombre y apellido *
          </label>
          <input
            id={`${idPrefix}-name`}
            className={fieldClass}
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            maxLength={80}
            autoComplete="name"
            placeholder="Ej: José Pérez"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-company`}>
            Empresa *
          </label>
          <input
            id={`${idPrefix}-company`}
            className={fieldClass}
            value={form.companyName}
            onChange={(event) => update("companyName", event.target.value)}
            maxLength={100}
            autoComplete="organization"
            placeholder="Ej: Cervecería regional"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-email`}>
            Correo *
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            maxLength={120}
            autoComplete="email"
            placeholder="tu@empresa.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-phone`}>
            Teléfono *
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            maxLength={40}
            autoComplete="tel"
            placeholder="+58 414 1234567"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-urgency`}>
          Urgencia
        </label>
        <select
          id={`${idPrefix}-urgency`}
          className={fieldClass}
          value={form.urgency}
          onChange={(event) =>
            update("urgency", event.target.value as FormState["urgency"])
          }
        >
          {URGENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-specs`}>
          Especificaciones de la pieza o servicio *
        </label>
        <textarea
          id={`${idPrefix}-specs`}
          className={`${fieldClass} min-h-[72px] resize-y`}
          value={form.specifications}
          onChange={(event) => update("specifications", event.target.value)}
          maxLength={2500}
          placeholder="Medidas, material, cantidad, equipo y falla observada…"
        />
      </div>

      <label className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-orange-500 focus:ring-orange-400"
          checked={form.consentPrivacy}
          onChange={(event) => update("consentPrivacy", event.target.checked)}
        />
        <span>
          Acepto la{" "}
          <a
            href="/politica-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-400 underline"
          >
            Política de Privacidad
          </a>{" "}
          y el tratamiento de mis datos (Ley 17.1-2023). *
        </span>
      </label>

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-2.5 py-2 text-[11px] text-red-300">
          {error}{" "}
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Escribir por WhatsApp
          </a>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A1F] px-4 py-2.5 text-sm font-bold text-[#0A1A3A] shadow-md transition-all hover:bg-[#e67a17] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#0A1A3A]" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4 text-[#0A1A3A]" aria-hidden="true" />
        )}
        {submitting ? "Enviando solicitud…" : "Enviar solicitud de cotización"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        Datos protegidos y usados solo para tu cotización.
      </p>
    </form>
  );
}
