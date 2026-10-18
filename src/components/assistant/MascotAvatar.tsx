"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MascotMood } from "@/types/assistant";

interface MascotAvatarProps {
  mood?: MascotMood;
  /** Diámetro en píxeles del contenedor circular. */
  size?: number;
  /** `bust` usa el recorte 400x400; `full` la figura completa sin fondo. */
  variant?: "bust" | "full";
  className?: string;
  priority?: boolean;
  alt?: string;
}

const RING_BY_MOOD: Record<MascotMood, string> = {
  idle: "ring-emerald-400/40",
  greeting: "ring-orange-400/60",
  thinking: "ring-amber-400/70",
  speaking: "ring-blue-400/70",
  quoting: "ring-orange-400/70",
  success: "ring-emerald-400/70",
};

const DOT_BY_MOOD: Record<MascotMood, string> = {
  idle: "bg-emerald-400",
  greeting: "bg-emerald-400",
  thinking: "bg-amber-400 animate-pulse",
  speaking: "bg-blue-400",
  quoting: "bg-amber-400 animate-pulse",
  success: "bg-emerald-400",
};

const LABEL_BY_MOOD: Record<MascotMood, string> = {
  idle: "En línea",
  greeting: "Saludando",
  thinking: "Analizando tu consulta",
  speaking: "Respondiendo",
  quoting: "Preparando cotización",
  success: "Solicitud registrada",
};

/**
 * Avatar del ingeniero asesor de FAMESA (PNG con fondo transparente).
 * Aro metálico industrial + badge de estado según el `mood`.
 */
export function MascotAvatar({
  mood = "idle",
  size = 60,
  variant = "bust",
  className,
  priority = false,
  alt = "Ing. Asistente FAMESA",
}: MascotAvatarProps) {
  const src =
    variant === "full"
      ? "/images/assistant/mascota-famesa.png"
      : "/images/assistant/mascota-famesa-avatar.png";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-b from-slate-700 to-slate-900 ring-2 shadow-lg",
        "drop-shadow-md",
        RING_BY_MOOD[mood],
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={LABEL_BY_MOOD[mood]}
      role="img"
    >
      <span
        className="absolute inset-[3px] overflow-hidden rounded-full bg-slate-800/40"
        style={{ width: size - 6, height: size - 6 }}
      >
        <Image
          src={src}
          alt={alt}
          width={variant === "full" ? 571 : 400}
          height={variant === "full" ? 1024 : 400}
          priority={priority}
          className="h-full w-full object-cover object-center"
          sizes={`${size}px`}
        />
      </span>
      <span
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900",
          DOT_BY_MOOD[mood],
        )}
        aria-hidden="true"
      />
    </span>
  );
}
