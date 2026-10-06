import Image from "next/image";
import { GALLERY } from "@/lib/site-data";

export default function Gallery() {
  return (
    <section id="galeria" className="border-b border-famesa-silver bg-white">
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8 md:py-20">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-famesa-silver pb-6 md:flex-row md:items-end">
          <div>
            <span className="tech-label text-famesa-blue">
              Registro fotográfico de planta
            </span>
            <h2 className="mt-1 font-heading text-[34px] font-bold uppercase leading-none tracking-tight text-famesa-ink sm:text-[42px]">
              Taller y galería real
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-famesa-muted">
            Piezas y procesos ejecutados en la planta de Santa Rosa. Las fichas
            se entregan con la orden de trabajo y su certificado de inspección.
          </p>
        </div>

        {/* Mosaico con marcos técnicos */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GALLERY.map((item) => (
            <figure
              key={item.src}
              className={`${item.span} border border-famesa-silver bg-white p-2 transition-colors hover:border-famesa-blue`}
            >
              <div className="relative h-56 w-full overflow-hidden bg-famesa-surface sm:h-64">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="tech-stamp absolute left-0 top-0 bg-famesa-navy px-2 py-1 text-white">
                  {item.stamp}
                </span>
              </div>
              <figcaption className="px-1 pt-3 text-[12px] leading-relaxed text-famesa-muted">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
