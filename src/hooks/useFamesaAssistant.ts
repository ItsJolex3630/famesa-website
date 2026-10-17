// =============================================================================
// FAMESA · Hook de estado del Asistente Virtual Industrial.
//
// Store singleton (compartido por el lanzador y el widget mediante
// `useSyncExternalStore`) con:
//   - Persistencia del hilo en `sessionStorage` (`famesa_assistant_history`).
//   - Marca de bienvenida descartada (`famesa_assistant_greeted`).
//   - Escucha del CustomEvent `famesa:open-assistant` para abrir el chat con
//     un rubro o prompt pre-seleccionado desde cualquier botón del sitio.
//   - Degradación elegante: si `/api/assistant/chat` no responde (p. ej.
//     `next dev`), resuelve en el cliente con `answerLocally`.
// =============================================================================
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { WELCOME_GREETINGS, answerLocally } from "@/config/famesa-assistant-kb";
import type {
  AssistantHistoryItem,
  AssistantMessage,
  AssistantOpenDetail,
  MascotMood,
  RfqPrefillData,
} from "@/types/assistant";

const HISTORY_KEY = "famesa_assistant_history";
const GREETED_KEY = "famesa_assistant_greeted";
const MAX_STORED_MESSAGES = 40;
const MAX_HISTORY_SENT = 8;
const WELCOME_DELAY_MS = 1500;

export interface AssistantState {
  isOpen: boolean;
  isThinking: boolean;
  mood: MascotMood;
  messages: AssistantMessage[];
  balloonVisible: boolean;
  unread: number;
  greeting: string;
}

function pickGreeting(): string {
  return WELCOME_GREETINGS[Math.floor(Math.random() * WELCOME_GREETINGS.length)];
}

function welcomeMessage(): AssistantMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "¡Hola! Soy el Ing. Asistente de FAMESA. Cuéntame qué pieza, equipo o servicio industrial necesitas y te oriento de inmediato.",
    timestamp: Date.now(),
    action: "view_catalog",
  };
}

const initialState: AssistantState = {
  isOpen: false,
  isThinking: false,
  mood: "idle",
  messages: [welcomeMessage()],
  balloonVisible: false,
  unread: 0,
  greeting: WELCOME_GREETINGS[0],
};

let state: AssistantState = initialState;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<AssistantState>): void {
  state = { ...state, ...patch };
  emit();
}

let hydrated = false;
let eventsAttached = false;
let welcomeScheduled = false;
let welcomeTimer: ReturnType<typeof setTimeout> | null = null;
let moodTimer: ReturnType<typeof setTimeout> | null = null;

function pulseMood(mood: MascotMood, duration = 2200): void {
  if (moodTimer) clearTimeout(moodTimer);
  setState({ mood });
  moodTimer = setTimeout(() => setState({ mood: "idle" }), duration);
}

function persistHistory(messages: AssistantMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.filter((m) => m.role !== "system").slice(-MAX_STORED_MESSAGES);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    /* sessionStorage no disponible: continuamos en memoria */
  }
}

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AssistantMessage[];
      if (Array.isArray(parsed) && parsed.length) {
        setState({ messages: parsed.slice(-MAX_STORED_MESSAGES) });
      }
    }
  } catch {
    /* historial corrupto: se ignora y se parte del saludo */
  }
}

function scheduleWelcome(): void {
  if (welcomeScheduled || typeof window === "undefined") return;
  welcomeScheduled = true;
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(GREETED_KEY) === "dismissed";
  } catch {
    dismissed = false;
  }
  if (dismissed) return;
  welcomeTimer = setTimeout(() => {
    if (!state.isOpen && !state.balloonVisible) {
      setState({ balloonVisible: true, mood: "greeting", greeting: pickGreeting() });
    }
  }, WELCOME_DELAY_MS);
}

function buildHistory(messages: AssistantMessage[]): AssistantHistoryItem[] {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.id !== "welcome")
    .slice(-MAX_HISTORY_SENT)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

function appendMessage(message: AssistantMessage): void {
  const next = [...state.messages, message];
  setState({ messages: next, unread: state.isOpen ? 0 : state.unread });
  persistHistory(next);
}

function attachEvents(): void {
  if (eventsAttached || typeof window === "undefined") return;
  eventsAttached = true;
  window.addEventListener("famesa:open-assistant", ((event: Event) => {
    const detail = (event as CustomEvent<AssistantOpenDetail>).detail ?? {};
    openAssistant(detail);
  }) as EventListener);
}

function markGreeted(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GREETED_KEY, "dismissed");
  } catch {
    /* ignorar */
  }
}

export function openAssistant(detail: AssistantOpenDetail = {}): void {
  markGreeted();
  if (welcomeTimer) clearTimeout(welcomeTimer);
  setState({ isOpen: true, unread: 0, balloonVisible: false, mood: "speaking" });
  pulseMood("speaking");
  if (detail.prompt) {
    void sendMessage(detail.prompt);
  } else if (detail.serviceType) {
    void sendMessage(`Quiero información sobre ${detail.serviceType}.`);
  }
}

export function closeAssistant(): void {
  setState({ isOpen: false, mood: "idle" });
}

export function toggleAssistant(): void {
  if (state.isOpen) closeAssistant();
  else openAssistant();
}

export function dismissBalloon(): void {
  markGreeted();
  if (welcomeTimer) clearTimeout(welcomeTimer);
  if (state.balloonVisible) setState({ balloonVisible: false, mood: "idle" });
}

export function clearHistory(): void {
  setState({ messages: [welcomeMessage()], mood: "greeting", unread: 0 });
  persistHistory([welcomeMessage()]);
}

function localReply(prompt: string, history: AssistantMessage[]): AssistantMessage {
  return answerLocally(prompt, buildHistory(history));
}

async function requestAssistant(prompt: string): Promise<AssistantMessage> {
  const page = typeof window !== "undefined" ? window.location.pathname : "/";
  const response = await fetch("/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt, history: buildHistory(state.messages), page }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as { ok?: boolean; reply?: AssistantMessage };
  if (!payload?.ok || !payload.reply) throw new Error("Respuesta inválida del asistente");
  return payload.reply;
}

export async function sendMessage(rawText: string): Promise<void> {
  const text = rawText.slice(0, 500).trim();
  if (!text || state.isThinking) return;
  attachEvents();

  appendMessage({
    id: `user-${Date.now().toString(36)}`,
    role: "user",
    content: text,
    timestamp: Date.now(),
  });
  setState({ isThinking: true, mood: "thinking" });

  let reply: AssistantMessage;
  try {
    reply = await requestAssistant(text);
  } catch {
    reply = localReply(text, state.messages);
  }

  appendMessage(reply);
  setState({ isThinking: false });
  pulseMood(reply.action === "open_rfq" ? "quoting" : "speaking");
}

/** Genera un turno de cotización dentro del chat con el formulario embebido. */
export function requestQuote(prefill: RfqPrefillData, userText?: string): void {
  attachEvents();
  const messages = [...state.messages];
  if (userText) {
    messages.push({
      id: `user-${Date.now().toString(36)}`,
      role: "user",
      content: userText,
      timestamp: Date.now(),
    });
  }
  messages.push({
    id: `rfq-${Date.now().toString(36)}`,
    role: "assistant",
    content:
      "Perfecto. Completa estos datos y generamos tu código de seguimiento RFQ para que el equipo técnico te contacte.",
    timestamp: Date.now(),
    action: "open_rfq",
    rfqPrefill: prefill,
  });
  setState({ messages, isOpen: true, unread: 0 });
  persistHistory(messages);
  pulseMood("quoting");
}

/** Empuja un mensaje local del asistente (sin llamada al backend). */
export function pushAssistantMessage(
  content: string,
  extra: Partial<AssistantMessage> = {},
): void {
  appendMessage({
    id: `note-${Date.now().toString(36)}`,
    role: "assistant",
    content,
    timestamp: Date.now(),
    ...extra,
  });
}

function getSnapshot(): AssistantState {
  return state;
}

function getServerSnapshot(): AssistantState {
  return initialState;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFamesaAssistant() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrate();
    attachEvents();
    scheduleWelcome();
    return () => {
      if (moodTimer) clearTimeout(moodTimer);
    };
  }, []);

  return {
    ...snapshot,
    open: openAssistant,
    close: closeAssistant,
    toggle: toggleAssistant,
    send: sendMessage,
    requestQuote,
    clear: clearHistory,
    dismissBalloon,
    pushMessage: pushAssistantMessage,
    setMood: pulseMood,
  };
}
