/**
 * Fuente única de verdad para los datos legales y de contacto de FAMESA C.A.
 *
 * IMPORTANTE: los teléfonos y el correo provienen de la página "Información
 * General" del dossier corporativo. El dossier presenta una discrepancia en su
 * contraportada (0412-1435069 / 0414-4313987), por lo que los valores de aquí
 * deben ser confirmados por el cliente antes de facturación formal.
 * // PENDIENTE CLIENTE: validar móviles y correo definitivos.
 */
export const CONTACT = {
  company: "FAMESA C.A.",
  legalName: "FAMESA C.A.",
  rif: "J-31352388-7",
  registry: "Registro Mercantil Nº 71, Tomo 44A",
  capital: "250.000.000,00 Bs. (suscrito y pagado)",
  tagline: "Fabricaciones Metalmecánica, Soldaduras y Afines",

  address: {
    street: "Carmen Norte, Av. 98 Boyacá, Galpón 80-29",
    sector: "Santa Rosa",
    city: "Valencia",
    state: "Carabobo",
    country: "Venezuela",
    postalCode: "2001",
  },

  phones: {
    landline: "+58 241 897 83 02",
    mobile1: "+58 414 341 01 87",
    mobile2: "+58 412 143 50 69",
  },

  email: "famesa2005@gmail.com",

  /** Número en formato internacional sin signos, requerido por wa.me */
  whatsapp: "584143410187",

  social: {
    instagram: "https://www.instagram.com/famesa.ca",
  },

  /** URL pública del sitio (actualizar al dominio definitivo si aplica). */
  // PENDIENTE CLIENTE: confirmar dominio de producción.
  siteUrl: "https://famesa-website.vercel.app",
} as const;

/** Dirección formateada en una sola línea. */
export const CONTACT_ADDRESS_LINE = `${CONTACT.address.street}, ${CONTACT.address.sector}, ${CONTACT.address.city}, ${CONTACT.address.state}, ${CONTACT.address.country}`;

/** Horario declarado de atención (usado en JSON-LD y páginas legales). */
export const OPENING_HOURS = [
  {
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "07:30",
    closes: "17:00",
  },
] as const;

/** Fecha de última actualización de los documentos legales. */
export const LEGAL_LAST_UPDATE = "Octubre de 2026";
