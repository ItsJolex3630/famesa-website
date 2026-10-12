import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_LINE, LEGAL_LAST_UPDATE } from "@/lib/contact-data";

/**
 * Marco visual compartido por todas las páginas legales del sitio.
 * Mantiene la identidad de FAMESA y ofrece navegación de regreso al inicio.
 */
export function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#12203a]">
      <nav className="sticky top-0 z-20 border-b border-[#c8d2e0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center gap-4 px-5">
          <Link href="/" aria-label="Volver al inicio de Famesa C.A.">
            <Image
              src="/images/logo.jpg"
              alt="FAMESA C.A."
              width={130}
              height={76}
              className="h-[46px] w-auto"
            />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#5b6a85] transition-colors hover:text-[#1d4fb8]"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[820px] px-5 py-14">
        <header className="border-b border-[#c8d2e0] pb-8">
          <span className="font-[var(--font-barlow)] text-sm font-bold uppercase tracking-[0.16em] text-[#1d4fb8]">
            Documento legal
          </span>
          <h1 className="mt-2 font-[var(--font-barlow)] text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-[60ch] text-[#5b6a85]">{subtitle}</p>
          ) : null}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#5b6a85]">
            Última actualización: {LEGAL_LAST_UPDATE}
          </p>
        </header>

        <article className="legal-prose mt-10 space-y-8">{children}</article>
      </main>

      <footer className="border-t border-[#c8d2e0] bg-[#06112a] px-5 py-10 text-[13px] text-[#8fa0c2]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">{CONTACT.company}</p>
            <p>
              RIF {CONTACT.rif} · {CONTACT_ADDRESS_LINE}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/aviso-legal" className="hover:text-white">
              Aviso legal
            </Link>
            <Link href="/politica-privacidad" className="hover:text-white">
              Privacidad
            </Link>
            <Link href="/politica-cookies" className="hover:text-white">
              Cookies
            </Link>
            <Link href="/terminos-condiciones" className="hover:text-white">
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
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[var(--font-barlow)] text-2xl font-bold uppercase tracking-tight text-[#0a1a3a]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#33405c]">
        {children}
      </div>
    </section>
  );
}
