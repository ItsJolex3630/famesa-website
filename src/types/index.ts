export type ServiceType =
  | "mecanizado_cnc"
  | "torneria_convencional"
  | "soldadura_especial"
  | "plasticos_ingenieria"
  | "reparacion_reductores"
  | "fabricacion_engranajes"
  | "otro";

export type UrgencyLevel = "estandar" | "prioridad" | "emergencia_parada";

export interface ServiceItem {
  code: string;
  title: string;
  icon: string;
  capabilityLabel: string;
  capability: string;
  processes: string[];
  applications: string[];
  footerNote: string;
}

export interface MaterialRow {
  material: string;
  standard: string;
  properties: string;
  tolerance: string;
  applications: string;
}

export interface QualityPillar {
  code: string;
  title: string;
  norm: string;
  description: string;
  checks: string[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  stamp: string;
  span: "sm:col-span-1" | "sm:col-span-2";
}

export interface ContactChannel {
  label: string;
  value: string;
  href?: string;
}

export interface QuoteRecord {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  specifications: string;
  turnstileToken?: string;
}

export interface QuoteApiSuccess {
  success: true;
  message: string;
  rfqCode: string;
  data: {
    fullName: string;
    companyName: string;
    serviceType: ServiceType;
    urgency: UrgencyLevel;
  };
}

export interface QuoteApiError {
  success: false;
  error: string;
  details?: Record<string, string[] | undefined>;
}
