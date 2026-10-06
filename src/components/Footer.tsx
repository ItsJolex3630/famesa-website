import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Capacidades & Tolerancias", href: "#materiales" },
  { label: "Calidad & Normas", href: "#calidad" },
  { label: "Taller & Galería", href: "#galeria" },
  { label: "Cotizar RFQ", href: "#cotizar" },
];

export default function Footer() {
  return (
    <footer className="bg-famesa-navy text-white">
      <div className="mx-auto max-w-shell px-5 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Identidad */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center bg-famesa-blue font-heading text-2xl font-bold leading-none text-white"
              >
                F
              </span>
              <span className="font-heading text-[26px] font-bold uppercase leading-none tracking-widest">
                {COMPANY.name}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-famesa-silverDark">
              Taller de metalmecánica pesada, soldadura especial y fabricación
              de plásticos de ingeniería con planta propia en la Zona Industrial
              Santa Rosa, Valencia, Estado Carabobo.
            </p>
            <a
              href={COMPANY.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-white/25 px-4 py-2 font-heading text-[14px] font-semibold uppercase tracking-wide transition-colors hover:border-famesa-orange hover:text-famesa-orange"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              @famesa.ca
            </a>
          </div>

          {/* Datos de planta */}
          <div className="lg:col-span-4">
            <h2 className="font-heading text-[18px] font-bold uppercase tracking-wide text-famesa-orange">
              Datos de planta
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-[13px] leading-relaxed text-famesa-silverDark">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-famesa-orange" aria-hidden="true" />
                <span>
                  {COMPANY.address.street}
                  <br />
                  {COMPANY.address.city}, {COMPANY.address.state}
                  <br />
                  C.P. {COMPANY.address.postalCode}, {COMPANY.address.country}
                </span>
              </li>
              <li className="flex items-start gap-3 text-[13px] leading-relaxed text-famesa-silverDark">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-famesa-orange" aria-hidden="true" />
                <span>
                  {COMPANY.schedule}
                  <br />
                  {COMPANY.emergency}
                </span>
              </li>
            </ul>
            <a
              href={COMPANY.mapsQuery}
              target="_blank"
              rel="noopener noreferrer"
              className="tech-stamp mt-4 inline-block border border-white/25 px-3 py-1.5 text-white transition-colors hover:border-famesa-orange hover:text-famesa-orange"
            >
              Ver ubicación en Google Maps
            </a>
          </div>

          {/* Contacto */}
          <div className="lg:col-span-4">
            <h2 className="font-heading text-[18px] font-bold uppercase tracking-wide text-famesa-orange">
              Contacto
            </h2>
            <ul className="mt-4 space-y-3">
              {COMPANY.phones.map((phone, index) => (
                <li key={phone}>
                  <a
                    href={`tel:${COMPANY.phonesRaw[index]}`}
                    className="flex items-center gap-3 text-[13px] text-famesa-silverDark transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-famesa-orange" aria-hidden="true" />
                    <span className="tech-stamp">{phone}</span>
                  </a>
                </li>
              ))}
              {COMPANY.emails.map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-[13px] text-famesa-silverDark transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-famesa-orange" aria-hidden="true" />
                    <span className="tech-stamp">{email}</span>
                  </a>
                </li>
              ))}
            </ul>

            <nav aria-label="Navegación del pie de página" className="mt-6">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[12px] uppercase tracking-wide text-famesa-silverDark transition-colors hover:text-famesa-orange"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Barra legal */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-shell flex-col gap-2 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <span className="tech-stamp text-famesa-silverDark">
            © {new Date().getFullYear()} {COMPANY.name} · Rif: {COMPANY.rif} · Todos los
            derechos reservados
          </span>
          <span className="tech-stamp text-famesa-silverDark">
            Valencia, Carabobo, Venezuela · WhatsApp {COMPANY.phones[0]}
          </span>
        </div>
      </div>
    </footer>
  );
}
