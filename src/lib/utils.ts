import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusiona clases de Tailwind resolviendo conflictos (ultima gana).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") || "584143410187";

export const COMPANY = {
  name: "Famesa C.A.",
  tagline: "Ingeniería Metalmecánica & Soldadura",
  division: "División Metalmecánica Pesada & Mecanizado de Precisión",
  address: {
    street: "Zona Industrial Santa Rosa",
    city: "Valencia",
    state: "Estado Carabobo",
    postalCode: "2001",
    country: "Venezuela",
  },
  phones: ["+58 414 341 0187", "+58 412 143 5069"],
  phonesRaw: ["+584143410187", "+584121435069"],
  emails: ["ingenieria@famesa.com.ve", "procura@famesa.com.ve"],
  instagram: "https://www.instagram.com/famesa.ca",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=Famesa+C.A.+Santa+Rosa+Valencia+Carabobo",
  schedule: "Lunes a viernes: 7:30 AM – 5:00 PM",
  emergency: "Guardia activa para emergencias industriales 24/7",
  rif: "J-XXXXXXXX-X",
} as const;

/**
 * Construye el enlace de WhatsApp con la ficha tecnica sanitizada.
 */
export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Referencia corta de codigo RFQ para el cliente (mismo formato que el backend).
 */
export function buildLocalRfqCode(date: Date = new Date()): string {
  const stamp = date.toISOString().replace(/[-:TZ.]/g, "").slice(2, 14);
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `RFQ-FAMESA-${stamp}-${suffix}`;
}
