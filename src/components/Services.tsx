import {
  ArrowRight,
  CircleDashed,
  Cog,
  Flame,
  Settings,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import { SERVICES } from "@/lib/site-data";

const ICONS: Record<string, LucideIcon> = {
  lathe: Cog,
  flame: Flame,
  shapes: Shapes,
  settings: Settings,
  "circle-dashed": CircleDashed,
  cog: Cog,
};

export default function Services() {
  return (
    <section id="servicios" className="border-b border-famesa-silver bg-white">
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8 md:py-20">
        {/* Encabezado de sección */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-famesa-silver pb-6 md:flex-row md:items-end">
          <div>
            <span className="tech-label text-famesa-blue">División operativa especializada</span>
            <h2 className="mt-1 font-heading text-[34px] font-bold uppercase leading-none tracking-tight text-famesa-ink sm:text-[42px]">
              Catálogo de servicios metalmecánicos
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-famesa-muted">
            Operamos con inspección técnica in-house y en campo, garantizando
            integridad estructural en ambientes corrosivos y de alta exigencia
            mecánica.
          </p>
        </div>

        {/* Rejilla técnica de 6 bloques */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon] ?? Cog;
            return (
              <article
                key={service.code}
                className="flex flex-col border border-famesa-silver bg-white transition-colors hover:border-famesa-blue"
              >
                {/* Cabecera de ficha */}
                <div className="flex items-start justify-between gap-3 border-b border-famesa-silver bg-famesa-surface p-5">
                  <div>
                    <span className="tech-stamp inline-block bg-famesa-navy px-2 py-0.5 text-white">
                      {service.code}
                    </span>
                    <h3 className="mt-2 font-heading text-[24px] font-bold uppercase leading-tight text-famesa-ink">
                      {service.title}
                    </h3>
                  </div>
                  <Icon
                    className="h-7 w-7 shrink-0 text-famesa-blue"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-5 p-5">
                  {/* Capacidad */}
                  <div>
                    <span className="block font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-ink">
                      {service.capabilityLabel}
                    </span>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-famesa-muted">
                      {service.capability}
                    </p>
                  </div>

                  {/* Procesos */}
                  <div>
                    <span className="mb-2 block font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-ink">
                      Especificaciones técnicas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.processes.map((process) => (
                        <span
                          key={process}
                          className="tech-label border border-famesa-silver bg-white px-2 py-1 text-famesa-ink"
                        >
                          {process}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Aplicaciones */}
                  <div className="border-t border-famesa-silver pt-4">
                    <span className="mb-2 block font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-ink">
                      Aplicaciones en planta
                    </span>
                    <ul className="space-y-1.5">
                      {service.applications.map((application) => (
                        <li
                          key={application}
                          className="flex items-start gap-2 text-[13px] leading-relaxed text-famesa-muted"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-famesa-blue"
                            aria-hidden="true"
                          />
                          {application}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pie de ficha */}
                <div className="flex items-center justify-between gap-3 border-t border-famesa-silver bg-famesa-surface px-5 py-3">
                  <span className="tech-stamp text-famesa-muted">{service.footerNote}</span>
                  <a
                    href="#cotizar"
                    className="inline-flex items-center gap-1 font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-blue transition-colors hover:text-famesa-electric"
                  >
                    Cotizar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
