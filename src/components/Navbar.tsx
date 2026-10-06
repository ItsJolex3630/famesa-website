"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { COMPANY, WHATSAPP_NUMBER, buildWhatsAppUrl, cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Capacidades & Tolerancias", href: "#materiales" },
  { label: "Calidad & Normas", href: "#calidad" },
  { label: "Taller & Galería", href: "#galeria" },
  { label: "Cotizar RFQ", href: "#cotizar" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Barra de estado operativo del sistema industrial */}
      <div className="w-full bg-famesa-navy text-white">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-5 py-1.5 md:px-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-2 w-2 shrink-0 animate-pulse-dot bg-emerald-500" />
            <span>Estado: planta operativa · vigilancia NDT activa</span>
          </div>
          <a
            href={`tel:${COMPANY.phonesRaw[0]}`}
            className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-famesa-silverDark transition-colors hover:text-white sm:flex"
          >
            <Phone className="h-3.5 w-3.5 text-famesa-orange" aria-hidden="true" />
            Central taller: {COMPANY.phones[0]}
          </a>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-famesa-silver bg-white",
          scrolled && "border-famesa-ink",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-shell items-center justify-between gap-4 px-5 md:px-8">
          {/* Identidad corporativa */}
          <Link href="#inicio" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center bg-famesa-blue font-heading text-2xl font-bold leading-none text-white"
            >
              F
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-[26px] font-bold uppercase leading-none tracking-widest text-famesa-ink">
                {COMPANY.name}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widecaps text-famesa-muted">
                {COMPANY.tagline}
              </span>
            </span>
          </Link>

          {/* Navegación ancla de escritorio */}
          <nav aria-label="Navegación principal" className="hidden h-full items-center xl:flex">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-full items-center px-4 font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-ink transition-colors hover:text-famesa-electric",
                  index === 0 &&
                    "border-b-2 border-famesa-electric text-famesa-electric",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Acceso rápido de contacto */}
          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppUrl(
                "Hola Famesa C.A., necesito información técnica de su taller en Valencia, Carabobo.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 border border-famesa-silver px-4 py-2.5 font-heading text-[14px] font-semibold uppercase tracking-wide text-famesa-ink transition-colors hover:border-famesa-blue hover:bg-famesa-surface lg:flex"
            >
              <Phone className="h-4 w-4 text-famesa-blue" aria-hidden="true" />
              {WHATSAPP_NUMBER.slice(-10)}
            </a>
            <a
              href="#cotizar"
              className="btn-industrial-primary hidden sm:inline-flex"
            >
              Solicitar cotización
            </a>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="flex h-10 w-10 items-center justify-center border border-famesa-silver text-famesa-ink transition-colors hover:border-famesa-blue xl:hidden"
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Panel de navegación móvil */}
      {open ? (
        <div
          id="menu-movil"
          className="fixed inset-x-0 bottom-0 top-[104px] z-40 overflow-y-auto border-t border-famesa-silver bg-white xl:hidden"
        >
          <nav aria-label="Navegación móvil" className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-famesa-silver px-6 py-5 font-heading text-xl font-semibold uppercase tracking-wide text-famesa-ink transition-colors hover:bg-famesa-surface"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cotizar"
              onClick={() => setOpen(false)}
              className="bg-famesa-blue px-6 py-5 text-center font-heading text-xl font-semibold uppercase tracking-wide text-white"
            >
              Solicitar cotización
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
