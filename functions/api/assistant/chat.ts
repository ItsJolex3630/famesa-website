// =============================================================================
// POST /api/assistant/chat · Asistente Virtual Industrial de FAMESA.
//
// Motor HÍBRIDO:
//   A. Gemini Flash (si ctx.env.GEMINI_API_KEY existe) con salida JSON
//      estructurada y System Prompt de "Ingeniero Asesor Industrial".
//   B. Motor determinista local (fallback ante ausencia de clave, timeout,
//      error de red o respuesta no válida) basado en la KB de FAMESA.
// =============================================================================
import { HttpError, json, readBody, route, str, type Ctx } from "../_shared/turso";
import {
  ASSISTANT_SYSTEM_PROMPT,
  FAMESA_ASSISTANT_KB,
  answerLocally,
} from "../../../src/config/famesa-assistant-kb";
import type {
  AssistantActionType,
  AssistantHistoryItem,
  AssistantMessage,
  CatalogItemCard,
} from "../../../src/types/assistant";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 8;
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_TIMEOUT_MS = 9000;

const ALLOWED_ACTIONS: AssistantActionType[] = [
  "none",
  "view_catalog",
  "open_rfq",
  "contact_whatsapp",
];

/** Patrones de intento de manipulación del prompt / jailbreak. */
const INJECTION_PATTERNS = [
  /ignora (todas )?(las )?(tus |las )?instrucciones/i,
  /ignore (all )?(previous|prior) instructions/i,
  /system ?prompt/i,
  /reve[lá]a? (tus |las )?instrucciones/i,
  /act[uú]a como/i,
  /jailbreak|dan mode|developer mode/i,
];

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
const DANGEROUS_DELIMITERS = /[<>"'`]/g;

/** Limpia y acota el texto libre recibido del navegador. */
function sanitizeMessage(raw: string): string {
  let text = raw.replace(CONTROL_CHARS, " ").replace(DANGEROUS_DELIMITERS, "");
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, "");
  }
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH);
}

/** Normaliza el historial: solo turnos válidos, acotado y sin mensajes iniciales del bot. */
function sanitizeHistory(raw: unknown): AssistantHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: AssistantHistoryItem[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : null;
    const content = typeof record.content === "string" ? sanitizeMessage(record.content) : "";
    if (role && content) cleaned.push({ role, content });
  }
  // Gemini exige que el primer turno sea `user`.
  while (cleaned.length && cleaned[0].role === "assistant") cleaned.shift();
  return cleaned;
}

const KB_CONTEXT = FAMESA_ASSISTANT_KB.map(
  (entry) =>
    `- id="${entry.id}" | ${entry.card.title} | serviceType="${entry.serviceType}" | palabras clave: ${entry.keywords
      .slice(0, 12)
      .join(", ")}`,
).join("\n");

const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    cardIds: { type: "array", items: { type: "string" } },
    action: { type: "string", enum: ALLOWED_ACTIONS },
    serviceType: {
      type: "string",
      enum: [
        "mecanizado_cnc",
        "torneria_convencional",
        "soldadura_especial",
        "plasticos_ingenieria",
        "reparacion_reductores",
        "fabricacion_engranajes",
        "otro",
      ],
    },
    urgency: {
      type: "string",
      enum: ["Normal", "Prioritario", "Urgente - Parada de Planta"],
    },
  },
  required: ["reply"],
} as const;

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
}

interface GeminiReply {
  reply?: string;
  cardIds?: string[];
  action?: string;
  serviceType?: string;
  urgency?: string;
}

function cardsFromIds(ids: string[] | undefined): CatalogItemCard[] | undefined {
  if (!ids?.length) return undefined;
  const wanted = new Set(ids);
  const cards = FAMESA_ASSISTANT_KB.filter((e) => wanted.has(e.id)).map((e) => e.card);
  return cards.length ? cards.slice(0, 3) : undefined;
}

/** Construye el mensaje del asistente a partir de la salida estructurada de Gemini. */
function messageFromGemini(parsed: GeminiReply, fallbackPrompt: string): AssistantMessage {
  const cards = cardsFromIds(parsed.cardIds);
  const action = ALLOWED_ACTIONS.includes(parsed.action as AssistantActionType)
    ? (parsed.action as AssistantActionType)
    : "none";
  const entry = parsed.serviceType
    ? FAMESA_ASSISTANT_KB.find((e) => e.serviceType === parsed.serviceType)
    : undefined;
  const urgency =
    parsed.urgency === "Normal" ||
    parsed.urgency === "Prioritario" ||
    parsed.urgency === "Urgente - Parada de Planta"
      ? parsed.urgency
      : entry?.rfqUrgency;

  return {
    id: `gem-${Date.now().toString(36)}`,
    role: "assistant",
    content: str(parsed.reply, 1200),
    timestamp: Date.now(),
    cards,
    action,
    rfqPrefill:
      action === "open_rfq" || parsed.serviceType || urgency
        ? {
            serviceType: parsed.serviceType || entry?.serviceType,
            specifications: fallbackPrompt.slice(0, 2500),
            urgency,
          }
        : undefined,
  };
}

/** Llama a Gemini Flash con salida JSON y devuelve el texto estructurado o null. */
async function queryGemini(
  apiKey: string,
  message: string,
  history: AssistantHistoryItem[],
): Promise<GeminiReply | null> {
  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${ASSISTANT_SYSTEM_PROMPT}\n\nRubros disponibles (usa el id en cardIds y su serviceType):\n${KB_CONTEXT}\n\nDevuelve SIEMPRE el objeto JSON solicitado. En "action" usa "open_rfq" cuando el visitante quiera cotizar, "view_catalog" para mostrar uno o más rubros, "contact_whatsapp" para datos de contacto y "none" en el resto.`,
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
            responseSchema: GEMINI_RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!response.ok) {
      console.warn(`[assistant] Gemini HTTP ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as { candidates?: GeminiCandidate[] };
    const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) return null;
    const parsed = JSON.parse(text) as GeminiReply;
    return typeof parsed.reply === "string" && parsed.reply.trim() ? parsed : null;
  } catch (error) {
    console.warn("[assistant] Gemini falló, se usa motor local:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const onRequest = route("POST", async (ctx: Ctx) => {
  const body = await readBody<{ message?: string; history?: unknown; page?: string }>(ctx.request);

  const rawMessage = str(body.message, 2000);
  if (!rawMessage || rawMessage.length < 1) {
    throw new HttpError(400, "El mensaje no puede estar vacío");
  }
  const message = sanitizeMessage(rawMessage);
  if (!message) {
    throw new HttpError(400, "El mensaje contiene caracteres no permitidos");
  }
  const history = sanitizeHistory(body.history);

  const apiKey = ctx.env.GEMINI_API_KEY;
  if (apiKey) {
    const parsed = await queryGemini(apiKey, message, history);
    if (parsed) {
      return json({ ok: true, reply: messageFromGemini(parsed, message), source: "gemini" });
    }
  }

  return json({ ok: true, reply: answerLocally(message, history), source: "local" });
});
