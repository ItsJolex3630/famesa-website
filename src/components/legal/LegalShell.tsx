import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_LINE, LEGAL_LAST_UPDATE } from "@/lib/contact-data";

export type LegalTocItem = { id: string; title: string };

/** Convierte el título de una sección en un identificador estable para el índice. */
export function legalSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Marco visual compartido por todas las páginas legales del sitio.
 * Encabezado tipo banda técnica + índice lateral fijo en escritorio.
 */
export function LegalShell({
  title,
  subtitle,
  sections,
  children,
}: {
  title: string;
  subtitle?: string;
  sections: string[];
  children: React.ReactNode;
}) {
  const toc: LegalTocItem[] = sections.map((s) => ({ id: legalSlug(s), title: s }));
  return (
    <div className="min-h-screen bg-white text-[#12203a]">
      <nav className="sticky top-0 z-30 border-b border-[#c8d2e0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center gap-4 px-5">
          <Link href="/" aria-label="Volver al inicio de Famesa C.A.">
            <Image
              src="/images/logo.jpg"
              alt="FAMESA C.A."
              width={130}
              height={76}
              className="h-[44px] w-auto"
            />
          </Link>
          <span className="ml-auto hidden text-xs font-bold uppercase tracking-[0.16em] text-[#5b6a85] sm:block">
            Centro legal
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b6a85] transition-colors hover:text-[#1d4fb8]"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[#0a1a3a] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-[1120px] px-5 py-14">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff8a1f]">
            Documento legal
          </span>
          <h1 className="mt-3 max-w-[20ch] font-heading text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-[62ch] text-[#c3cee6]">{subtitle}</p>
          ) : null}
          <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8fa0c2]">
            <Clock size={13} />
            Última actualización: {LEGAL_LAST_UPDATE}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-[92px]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5b6a85]">
                Contenido
              </p>
              <ol className="mt-4 border-l border-[#c8d2e0]">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-[#5b6a85] transition-colors hover:border-[#1d4fb8] hover:text-[#1d4fb8]"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <article className="legal-body space-y-10">{children}</article>
        </div>
      </main>

      <footer className="border-t border-[#c8d2e0] bg-[#06112a] px-5 py-10 text-[13px] text-[#8fa0c2]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-base font-bold uppercase tracking-wide text-white">
              {CONTACT.company}
            </p>
            <p>
              RIF {CONTACT.rif} · {CONTACT_ADDRESS_LINE}
            </p>
          </div>
          <nav aria-label="Documentos legales" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/aviso-legal" className="transition-colors hover:text-white">
              Aviso legal
            </Link>
            <Link href="/politica-privacidad" className="transition-colors hover:text-white">
              Privacidad
            </Link>
            <Link href="/politica-cookies" className="transition-colors hover:text-white">
              Cookies
            </Link>
            <Link href="/terminos-condiciones" className="transition-colors hover:text-white">
              Términos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Bloque con encabezado numerado, usado dentro de las páginas legales. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id ?? legalSlug(title)} className="scroll-mt-24">
      <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#0a1a3a] sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-2 h-[3px] w-16 bg-[#ff8a1f]" />
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#33405c]">
        {children}
      </div>
    </div>
  );
}
