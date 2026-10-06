import { BadgeCheck, FileCheck2, Ruler, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QUALITY_PILLARS } from "@/lib/site-data";

const PILLAR_ICONS: LucideIcon[] = [Ruler, FileCheck2, ShieldCheck, BadgeCheck];

export default function QualityAssurance() {
  return (
    <section id="calidad" className="relative overflow-hidden bg-famesa-navy text-white">
      <div className="absolute inset-0 technical-grid-dark" aria-hidden="true" />

      <div className="relative mx-auto max-w-shell px-5 py-16 md:px-8 md:py-20">
        {/* Encabezado */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/20 pb-6 md:flex-row md:items-end">
          <div>
            <span className="tech-label text-famesa-orange">
              Dossier de control de calidad y metrología
            </span>
            <h2 className="mt-1 max-w-2xl font-heading text-[34px] font-bold uppercase leading-none tracking-tight sm:text-[42px]">
              Lo que medimos antes de entregar
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[12px] uppercase tracking-wider text-famesa-silverDark">
            <span>Sistema de gestión:</span>
            <span className="tech-stamp bg-white px-2 py-1 text-famesa-navy">
              QA-REG-9001 / ASME IX
            </span>
          </div>
        </div>

        {/* Pilares de control */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {QUALITY_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? ShieldCheck;
            return (
              <article
                key={pillar.code}
                className="border border-white/20 bg-white/[0.04] p-6 transition-colors hover:border-famesa-orange"
              >
                <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                  <div>
                    <span className="tech-stamp text-famesa-orange">{pillar.code}</span>
                    <h3 className="mt-1 font-heading text-[26px] font-bold uppercase leading-tight">
                      {pillar.title}
                    </h3>
                  </div>
                  <Icon
                    className="h-7 w-7 shrink-0 text-famesa-orange"
                    aria-hidden="true"
                  />
                </div>

                <p className="mb-4 text-[14px] leading-relaxed text-famesa-silverDark">
                  {pillar.description}
                </p>

                <ul className="space-y-2">
                  {pillar.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2.5 text-[13px] text-white/90">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-famesa-orange"
                        aria-hidden="true"
                      />
                      {check}
                    </li>
                  ))}
                </ul>

                <p className="tech-stamp mt-5 border-t border-white/15 pt-3 text-famesa-silverDark">
                  Norma aplicable: {pillar.norm}
                </p>
              </article>
            );
          })}
        </div>

        {/* Franja de compromisos */}
        <div className="mt-8 grid grid-cols-1 divide-y divide-white/20 border border-white/20 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {[
            { k: "100%", v: "Inspección dimensional de cada orden de trabajo" },
            { k: "ISO 9001", v: "Trazabilidad documental de material y proceso" },
            { k: "PT / MT", v: "Ensayos no destructivos de uso en servicio crítico" },
          ].map((item) => (
            <div key={item.k} className="p-6">
              <span className="block font-heading text-[30px] font-bold uppercase leading-none text-famesa-orange">
                {item.k}
              </span>
              <span className="mt-2 block text-[13px] leading-relaxed text-famesa-silverDark">
                {item.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
