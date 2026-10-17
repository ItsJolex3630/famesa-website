// =============================================================================
// FAMESA · Asistente Virtual Industrial — Contratos TypeScript.
// Compartido entre el widget cliente, el hook de estado y el endpoint
// serverless (Cloudflare Pages Functions) del asistente.
// =============================================================================

/** Estado anímico del avatar; controla el aro, el badge y las micro-animaciones. */
export type MascotMood =
  | "idle"
  | "greeting"
  | "thinking"
  | "speaking"
  | "quoting"
  | "success";

/** Acción sugerida por una respuesta del asistente. */
export type AssistantActionType =
  | "none"
  | "view_catalog"
  | "open_rfq"
  | "contact_whatsapp";

/** Tarjeta técnica de un rubro de FAMESA, renderizada dentro del chat. */
export interface CatalogItemCard {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  gallery?: string[];
  specs?: string[];
}

/** Datos que pre-llenan el formulario de cotización (RFQ) embebido. */
export interface RfqPrefillData {
  serviceType?: string;
  specifications?: string;
  urgency?: "Normal" | "Prioritario" | "Urgente - Parada de Planta";
}

/** Mensaje del hilo conversacional. */
export interface AssistantMessage {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  timestamp: number;
  cards?: CatalogItemCard[];
  action?: AssistantActionType;
  rfqPrefill?: RfqPrefillData;
}

/** Turno ligero de historial enviado al backend (sin tarjetas ni acciones). */
export interface AssistantHistoryItem {
  role: "user" | "assistant";
  content: string;
}

/** Cuerpo aceptado por POST /api/assistant/chat. */
export interface AssistantApiRequest {
  message: string;
  history?: AssistantHistoryItem[];
  /** Ruta actual del visitante; permite contextualizar la respuesta. */
  page?: string;
}

/** Respuesta de POST /api/assistant/chat. */
export interface AssistantApiResponse {
  ok: boolean;
  reply: AssistantMessage;
  /** Motor que resolvió la respuesta: Gemini o el determinista local. */
  source: "gemini" | "local";
  error?: string;
}

/** Detalle del CustomEvent `famesa:open-assistant` para abrir el widget. */
export interface AssistantOpenDetail {
  /** Rubro o prompt inicial con el que abrir la conversación. */
  prompt?: string;
  serviceType?: string;
}
