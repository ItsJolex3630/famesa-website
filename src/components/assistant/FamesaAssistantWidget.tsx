"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Eraser, Minus, Send, MessageCircle } from "lucide-react";
import { MascotAvatar } from "./MascotAvatar";
import { ServiceCatalogCard } from "./ServiceCatalogCard";
import { InlineRfqForm } from "./InlineRfqForm";
import { QUICK_CHIPS } from "@/config/famesa-assistant-kb";
import { CONTACT } from "@/lib/contact-data";
import { cn } from "@/lib/utils";
import { useFamesaAssistant } from "@/hooks/useFamesaAssistant";
import type { AssistantMessage } from "@/types/assistant";

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in duration-200">
      <MascotAvatar mood="thinking" size={28} />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-700/60 bg-slate-800/95 px-4 py-3 shadow-md">
        <span className="whatsapp-dot" style={{ animationDelay: "0ms" }} />
        <span className="whatsapp-dot" style={{ animationDelay: "180ms" }} />
        <span className="whatsapp-dot" style={{ animationDelay: "360ms" }} />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: AssistantMessage;
  onQuote: (prefill: NonNullable<AssistantMessage["rfqPrefill"]>, userText?: string) => void;
  onSuccess: (code: string) => void;
}

function MessageBubble({ message, onQuote, onSuccess }: MessageBubbleProps) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-3 py-2 text-sm text-slate-950">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <MascotAvatar mood="idle" size={28} />
      <div className="min-w-0 max-w-[88%] space-y-2">
        {message.content ? (
          <p className="whitespace-pre-line rounded-2xl rounded-bl-sm bg-slate-800 px-3 py-2 text-sm text-slate-100">
            {message.content}
          </p>
        ) : null}

        {message.cards?.map((card) => (
          <ServiceCatalogCard key={card.id} card={card} onQuote={onQuote} />
        ))}

        {message.action === "open_rfq" && message.rfqPrefill ? (
          <InlineRfqForm prefill={message.rfqPrefill} onSuccess={onSuccess} />
        ) : null}

        {message.action === "contact_whatsapp" ? (
          <a
            href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Hola Famesa, necesito asesoría técnica.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Escribir por WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Ventana conversacional del asistente, anclada a la esquina inferior izquierda. */
export function FamesaAssistantWidget() {
  const pathname = usePathname();
  const {
    isOpen,
    isThinking,
    mood,
    messages,
    close,
    send,
    clear,
    requestQuote,
    pushMessage,
    setMood,
  } = useFamesaAssistant();

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [isOpen, messages, isThinking]);

  if (pathname?.startsWith("/admin") || !isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  const handleQuote = (prefill: NonNullable<AssistantMessage["rfqPrefill"]>, userText?: string) => {
    requestQuote(prefill, userText);
  };

  const handleSuccess = (code: string) => {
    setMood("success", 4000);
    pushMessage(
      `¡Listo! Tu solicitud quedó registrada con el código ${code}. El equipo técnico de FAMESA te contactará a la brevedad. ¿Necesitas algo más?`,
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Asistente Virtual FAMESA"
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md print:hidden",
        "inset-x-3 bottom-3 top-16 rounded-2xl",
        "sm:inset-x-auto sm:bottom-20 sm:left-5 sm:top-auto sm:h-auto sm:max-h-[620px] sm:w-[380px] md:w-[420px] sm:rounded-2xl",
      )}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-700/80 bg-slate-950/60 px-3 py-3">
        <MascotAvatar mood={mood} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold leading-tight text-white">
            Ing. Asistente FAMESA
          </p>
          <p className="flex items-center gap-1.5 text-[11px] transition-colors">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isThinking ? "animate-pulse bg-emerald-400" : "bg-emerald-500",
              )}
              aria-hidden="true"
            />
            {isThinking ? (
              <span className="font-medium text-emerald-400">
                Escribiendo
                <span className="whatsapp-dots" aria-hidden="true" />
              </span>
            ) : (
              <span className="text-slate-400">Asesor técnico en línea</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          title="Limpiar conversación"
          aria-label="Limpiar conversación"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Eraser className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={close}
          title="Minimizar asistente"
          aria-label="Minimizar asistente"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Chips de acceso rápido */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 bg-slate-950/40 px-3 py-2">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => void send(chip.prompt)}
            className="rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-orange-400 hover:text-orange-300"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Hilo de mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
        aria-live="polite"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onQuote={handleQuote}
            onSuccess={handleSuccess}
          />
        ))}
        {isThinking ? <TypingBubble /> : null}
      </div>

      {/* Entrada */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-700/80 bg-slate-950/60 px-3 py-3"
      >
        <label htmlFor="famesa-assistant-input" className="sr-only">
          Escribe tu consulta
        </label>
        <input
          id="famesa-assistant-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 500))}
          placeholder="Escribe tu consulta técnica…"
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isThinking}
          aria-label="Enviar consulta"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-slate-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
