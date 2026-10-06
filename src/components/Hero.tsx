import Image from "next/image";
import { ArrowRight, MessageSquare, Ruler, ScrollText, Timer } from "lucide-react";
import { COMPANY, buildWhatsAppUrl } from "@/lib/utils";

const METRICS = [
  {
    value: "±0.01 mm",
    label: "Tolerancia dimensional",
    detail: "Tolerancia micrométrica garantizada en mecanizado de precisión.",
    icon: Ruler,
  },
  {
    value: "1.500 mm",
    label: "Volteo máximo en torno",
    detail: "Diámetro de volteo sobre bancada y 4.000 mm entre puntos.",
    icon: ScrollText,
  },
  {
    value: "24 / 48 h",
    label: "Servicio de emergencia",
    detail: "Despacho prioritario para paradas de planta Industrial.",
    icon: Timer,
  },
  {
    value: "ASME / AWS",
    label: "Procedimientos calificados",
    detail: "Soldadores y WPS/PQR conformes a los códigos internacionales.",
    icon: ScrollText,
  },
];

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-famesa-silver">
      <div className="absolute inset-0 technical-grid opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-shell grid-cols-1 gap-10 px-5 py-12 md:px-8 md:py-20 lg:grid-cols-12">
        {/* Mensaje técnico principal */}
        <div className="flex flex-col justify-center lg:col-span-7">
          <div className="mb-6 inline-flex w-fit items-center gap-2 border border-famesa-silver bg-white px-3 py-1.5">
            <span className="h-2 w-2 bg-famesa-blue" aria-hidden="true" />
            <span className="tech-label text-famesa-ink">
              {COMPANY.division}
            </span>
          </div>

          <h1 className="mb-6 font-heading text-[42px] font-bold uppercase leading-[0.98] tracking-tight text-famesa-ink sm:text-[56px] lg:text-[68px]">
            Fabricamos y recuperamos las piezas que tu industria necesita
          </h1>

          <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-famesa-muted">
            Especialistas en torneado, fresado CNC, soldaduras de aleaciones
            especiales y mecanizado de polímeros de ingeniería. Servicio de
            respuesta para paradas de planta en toda la región central de
            Venezuela.
          </p>

          <div className="mb-10 flex flex-col items-stretch gap-4 sm:flex-row">
            <a href="#cotizar" className="btn-industrial-primary">
              Solicitar cotización técnica (RFQ)
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={buildWhatsAppUrl(
                "Hola Famesa C.A., quiero consultar por una pieza o servicio. Adjunto la siguiente información:",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-industrial-secondary"
            >
              <MessageSquare className="h-4 w-4 text-famesa-blue" aria-hidden="true" />
              Contacto directo WhatsApp
            </a>
          </div>

          {/* Barra de micro-especificaciones */}
          <div className="grid grid-cols-1 border-y border-famesa-silver sm:grid-cols-3">
            <div className="border-b border-famesa-silver py-3 sm:border-b-0 sm:border-r sm:pr-4">
              <span className="tech-label block text-famesa-muted">Calificación WPS</span>
              <span className="font-heading text-lg font-bold tracking-tight text-famesa-ink">
                ASME IX / AWS
              </span>
            </div>
            <div className="border-b border-famesa-silver py-3 sm:border-b-0 sm:border-x sm:px-4">
              <span className="tech-label block text-famesa-muted">Control de calidad</span>
              <span className="font-heading text-lg font-bold tracking-tight text-famesa-ink">
                100% NDT PT / MT
              </span>
            </div>
            <div className="py-3 sm:pl-4">
              <span className="tech-label block text-famesa-muted">Disponibilidad</span>
              <span className="font-heading text-lg font-bold tracking-tight text-famesa-blue">
                24/7 planta y campo
              </span>
            </div>
          </div>
        </div>

        {/* Archivo técnico de planta */}
        <div className="flex flex-col border border-famesa-silver bg-white lg:col-span-5">
          <div className="flex items-center justify-between border-b border-famesa-silver bg-famesa-surface px-4 py-2 text-[11px] uppercase tracking-wider text-famesa-muted">
            <span className="tech-stamp">Archivo técnico: REF-TOR-1500-V2</span>
            <span className="tech-stamp text-famesa-blue">Spec: DIN ISO 2768-f</span>
          </div>

          <div className="photo-blueprint relative h-72 w-full overflow-hidden bg-famesa-surface sm:h-80 lg:h-auto lg:flex-1">
            <Image
              src="/images/famesa-fachada.jpg"
              alt="Fachada e infraestructura de la planta de Famesa C.A. en la Zona Industrial Santa Rosa, Valencia, Carabobo"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-famesa-blue/10 mix-blend-multiply" aria-hidden="true" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-famesa-silverDark bg-black/85 px-3 py-1.5 text-[11px] text-white">
              <span className="h-1.5 w-1.5 bg-emerald-400" aria-hidden="true" />
              <span className="tech-stamp">
                Proceso: torneado CNC / 1045 / en ejecución
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-famesa-silver p-4 text-[11px] uppercase">
            <div className="text-famesa-muted">
              Tolerancia:{" "}
              <span className="font-semibold text-famesa-ink">± 0.01 mm</span>
            </div>
            <div className="text-famesa-muted">
              Superficie:{" "}
              <span className="font-semibold text-famesa-ink">Rectificada Ra 0.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tira de métricas de taller */}
      <div className="border-t border-famesa-silver bg-famesa-surface">
        <div className="mx-auto grid max-w-shell grid-cols-1 divide-y divide-famesa-silver sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-start gap-4 p-6 md:p-8">
                <Icon
                  className="mt-1 h-6 w-6 shrink-0 text-famesa-blue"
                  aria-hidden="true"
                />
                <div>
                  <span className="block font-heading text-[34px] font-bold uppercase leading-none text-famesa-blue">
                    {metric.value}
                  </span>
                  <span className="mt-1 block font-heading text-[15px] font-semibold uppercase tracking-tight text-famesa-ink">
                    {metric.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-famesa-muted">
                    {metric.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
