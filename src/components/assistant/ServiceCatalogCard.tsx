"use client";

import Image from "next/image";
import { ArrowUpRight, FileText, Wrench } from "lucide-react";
import { FAMESA_ASSISTANT_KB } from "@/config/famesa-assistant-kb";
import type { CatalogItemCard, RfqPrefillData } from "@/types/assistant";

interface ServiceCatalogCardProps {
  card: CatalogItemCard;
  onQuote?: (prefill: RfqPrefillData, userText?: string) => void;
}

/** Tarjeta técnica de un rubro, renderizada dentro del hilo del chat. */
export function ServiceCatalogCard({ card, onQuote }: ServiceCatalogCardProps) {
  const entry = FAMESA_ASSISTANT_KB.find((item) => item.id === card.id);

  const handleQuote = () => {
    onQuote?.(
      {
        serviceType: entry?.serviceType,
        specifications: `${card.title}: ${card.description}`,
        urgency: entry?.rfqUrgency,
      },
      `Quiero cotizar ${card.title}.`,
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/70">
      <div className="flex gap-3 p-3">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-900">
          <Image
            src={card.image}
            alt={card.title}
            width={160}
            height={160}
            className="h-full w-full object-cover"
            sizes="64px"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A1F]">
            {card.category}
          </p>
          <h4 className="font-heading text-base font-bold leading-tight text-white">
            {card.title}
          </h4>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-300">
            {card.description}
          </p>
        </div>
      </div>

      {card.specs?.length ? (
        <ul className="space-y-1 border-t border-slate-700/70 px-3 py-2">
          {card.specs.slice(0, 3).map((spec) => (
            <li key={spec} className="flex items-start gap-1.5 text-[11px] text-slate-300">
              <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-[#FF8A1F]" aria-hidden="true" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-700/70 bg-slate-900/50 p-3">
        <a
          href="/#catalogo"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          Ver detalle en web
        </a>
        <button
          type="button"
          onClick={handleQuote}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF8A1F] px-3 py-1.5 text-[11px] font-bold text-[#0A1A3A] shadow-sm transition-all hover:bg-[#e67a17] active:scale-95"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Cotizar esta línea
        </button>
      </div>
    </div>
  );
}
