import { z } from "zod";

/**
 * Caracteres de control (C0/C1) y delimitadores peligrosos eliminados de todo
 * texto libre antes de validarlo, persistirlo o interpolarlo en un mensaje.
 */
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
const DANGEROUS_DELIMITERS = /[<>"'`]/g;
const DANGEROUS_SCHEMES = /(javascript|data|vbscript)\s*:/gi;
const HTML_ENTITY = /&(#\d+|#x[0-9a-f]+|[a-z]+);/gi;

/**
 * Sanitizacion profunda contra XSS, inyeccion de payloads y esquemas de URL
 * peligrosos. Se ejecuta como `transform` de Zod, por lo que el cliente y el
 * servidor aplican exactamente la misma reglas.
 */
export function sanitizeInput(value: string): string {
  return value
    .normalize("NFKC")
    .replace(CONTROL_CHARS, " ")
    .replace(DANGEROUS_SCHEMES, "")
    .replace(DANGEROUS_DELIMITERS, "")
    .replace(HTML_ENTITY, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitizacion para identificadores y referencias (codigos RFQ, nombres cortos).
 * Conserva unicamente caracteres alfanumericos y los separadores propios del
 * formato tecnico, lo que neutraliza cualquier intento de breakout.
 */
export function sanitizeCode(value: string): string {
  return value.normalize("NFKC").replace(/[^A-Za-z0-9-]/g, "").slice(0, 32);
}

const phoneSchema = z
  .string({ required_error: "El teléfono es obligatorio" })
  .trim()
  .transform((value) => value.replace(/[^0-9+\-\s()]/g, ""))
  .refine(
    (value) => /^\+?[0-9\s\-()]{8,20}$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 8,
    "Formato telefónico inválido. Ejemplo: +58 414 1234567",
  );

export const RFQFormSchema = z.object({
  fullName: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(3, "El nombre debe contener al menos 3 caracteres")
    .max(80, "El nombre no puede exceder 80 caracteres")
    .transform(sanitizeInput),

  companyName: z
    .string({ required_error: "La empresa o razón social es obligatoria" })
    .min(2, "Indique el nombre de la empresa")
    .max(100, "Nombre de empresa demasiado largo")
    .transform(sanitizeInput),

  email: z
    .string({ required_error: "El correo es obligatorio" })
    .trim()
    .toLowerCase()
    .max(120, "Correo demasiado extenso")
    .email("Ingrese una dirección de correo válida")
    .refine(
      (value) => !DANGEROUS_SCHEMES.test(value),
      "Correo con caracteres no permitidos",
    ),

  phone: phoneSchema,

  serviceType: z.enum(
    [
      "mecanizado_cnc",
      "torneria_convencional",
      "soldadura_especial",
      "plasticos_ingenieria",
      "reparacion_reductores",
      "fabricacion_engranajes",
      "otro",
    ],
    {
      errorMap: () => ({ message: "Seleccione un tipo de servicio válido" }),
    },
  ),

  urgency: z.enum(["estandar", "prioridad", "emergencia_parada"], {
    errorMap: () => ({ message: "Seleccione el nivel de urgencia del requerimiento" }),
  }),

  specifications: z
    .string({ required_error: "Indique las especificaciones del requerimiento" })
    .min(10, "Por favor proporcione más detalles de la pieza o servicio (mínimo 10 caracteres)")
    .max(2500, "La descripción no puede exceder 2500 caracteres")
    .transform(sanitizeInput),

  // Token emitido por el widget de Cloudflare Turnstile
  turnstileToken: z
    .string()
    .max(2048, "Token de seguridad inválido")
    .transform((value) => value.trim())
    .optional(),
});

export type RFQFormData = z.infer<typeof RFQFormSchema>;

export const SERVICE_TYPES = [
  { value: "mecanizado_cnc", label: "Mecanizado CNC de precisión" },
  { value: "torneria_convencional", label: "Tornería y fresa pesada" },
  { value: "soldadura_especial", label: "Soldadura especial ASME / AWS" },
  { value: "plasticos_ingenieria", label: "Plásticos de ingeniería" },
  { value: "reparacion_reductores", label: "Reparación de reductores" },
  { value: "fabricacion_engranajes", label: "Rodillos y engranajes" },
  { value: "otro", label: "Otro requerimiento técnico" },
] as const;

export const URGENCY_LEVELS = [
  {
    value: "estandar",
    label: "Estándar",
    detail: "Planificado · entrega según programa de taller",
  },
  {
    value: "prioridad",
    label: "Prioritario",
    detail: "5 a 7 días hábiles · pieza prioritaria al resto de la cola",
  },
  {
    value: "emergencia_parada",
    label: "Parada de emergencia",
    detail: "24 a 48 horas · línea de planta detenida",
  },
] as const;
