"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { MascotAvatar } from "./MascotAvatar";
import { useFamesaAssistant } from "@/hooks/useFamesaAssistant";

/**
 * Lanzador flotante del asistente, anclado a la ESQUINA INFERIOR IZQUIERDA
 * (`fixed bottom-5 left-5`) para no colisionar con el botón de WhatsApp ni el
 * botón "volver arriba" (que viven a la derecha). Incluye el globo de
 * bienvenida proactivo que aparece a los 1.5 s.
 */
export function AssistantLauncher() {
  const pathname = usePathname();
  const {
    isOpen,
    mood,
    balloonVisible,
    greeting,
    open,
    dismissBalloon,
  } = useFamesaAssistant();

  // Exclusión del panel administrativo de Turso.
  if (pathname?.startsWith("/admin")) return null;
  // Con el widget abierto, el lanzador se oculta (el widget trae su propio colapso).
  if (isOpen) return null;

  const handleOpen = () => open({ prompt: undefined });

  return (
    <div className="fixed bottom-5 left-5 z-50 print:hidden">
      {balloonVisible ? (
        <div
          className="absolute bottom-full left-0 mb-3 w-[min(78vw,300px)] sm:bottom-0 sm:left-full sm:ml-3 sm:mb-0 sm:w-[280px]"
          role="status"
          aria-live="polite"
        >
          <div className="relative">
            <button
              type="button"
              onClick={handleOpen}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-8 text-left text-sm text-famesa-ink shadow-xl transition-transform hover:-translate-y-0.5"
            >
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-famesa-orange">
                Ing. Asistente FAMESA
              </span>
              {greeting}
            </button>
            <button
              type="button"
              onClick={dismissBalloon}
              aria-label="Cerrar mensaje de bienvenida"
              className="absolute right-1.5 top-1.5 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir el Asistente Virtual de FAMESA"
        className="group flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-105 focus-visible:scale-105"
      >
        <MascotAvatar mood={mood} size={64} priority />
        <span className="hidden max-w-0 overflow-hidden rounded-full bg-famesa-navy py-2 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:max-w-[180px] group-hover:px-3 group-hover:opacity-100 sm:flex">
          ¿Te asesoro?
        </span>
      </button>
    </div>
  );
}
