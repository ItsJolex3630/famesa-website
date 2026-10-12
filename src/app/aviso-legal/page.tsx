import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT, CONTACT_ADDRESS_LINE } from "@/lib/contact-data";

export const metadata: Metadata = {
  title: "Aviso legal | Famesa C.A.",
  description:
    "Datos identificativos, condiciones de uso, propiedad intelectual y limitación de responsabilidad del sitio web de Famesa C.A.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: true, follow: true },
};

export default function AvisoLegalPage() {
  return (
    <LegalShell
      title="Aviso legal"
      subtitle="Información general sobre la titularidad y el uso de este sitio web."
      sections={[
        "1. Titular del sitio web",
        "2. Objeto",
        "3. Condiciones de uso",
        "4. Propiedad intelectual e industrial",
        "5. Exclusión de responsabilidad",
        "6. Enlaces",
        "7. Modificaciones",
        "8. Legislación aplicable y jurisdicción",
        "9. Documentos relacionados",
      ]}
    >
      <LegalSection title="1. Titular del sitio web">
        <p>
          El presente sitio web es titularidad de <strong>{CONTACT.legalName}</strong>,
          sociedad mercantil domiciliada en <strong>{CONTACT_ADDRESS_LINE}</strong>,
          inscrita en el {CONTACT.registry}, con Registro Único de Información Fiscal
          (RIF) <strong>{CONTACT.rif}</strong> y capital social de{" "}
          {CONTACT.capital}.
        </p>
        <p>
          <strong>Contacto:</strong> correo electrónico{" "}
          <a className="text-[#1d4fb8] underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>{" "}
          · teléfono {CONTACT.phones.landline}.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          El sitio tiene carácter informativo sobre las capacidades industriales de{" "}
          {CONTACT.company} (metalmecánica, soldaduras especiales, mecanizado,
          plásticos de ingeniería y mantenimiento industrial) y permite a los
          visitantes solicitar cotizaciones de bienes y servicios. La información
          publicada no constituye una oferta comercial vinculante.
        </p>
      </LegalSection>

      <LegalSection title="3. Condiciones de uso">
        <p>El usuario se compromete a:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Utilizar el sitio conforme a la ley y al orden público.</li>
          <li>
            No emplear mecanismos automatizados que puedan saturar, dañar o
            interferir con el funcionamiento del sitio.
          </li>
          <li>
            Aportar información veraz en los formularios y no suplantar la
            identidad de terceros.
          </li>
          <li>
            No introducir programas maliciosos ni intentar acceder a áreas
            restringidas o a datos de otros usuarios.
          </li>
        </ul>
        <p>
          El incumplimiento faculta a {CONTACT.company} a restringir el acceso y a
          ejercer las acciones legales que correspondan.
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <p>
          El nombre comercial, el logotipo, los textos, las fotografías, los planos,
          los diseños, la programación y, en general, todos los contenidos de este
          sitio son propiedad de {CONTACT.company} o se utilizan con autorización de
          sus titulares, y están protegidos por la legislación venezolana e
          internacional sobre derechos de autor y propiedad industrial.
        </p>
        <p>
          Queda prohibida su reproducción, distribución, transformación,
          comunicación pública o uso comercial sin autorización previa y por
          escrito. Se permite la visualización y la copia para uso estrictamente
          privado y no comercial, citando siempre la fuente.
        </p>
        <p>
          Las marcas y nombres de terceros mencionados en el apartado de clientes
          pertenecen a sus respectivos titulares y se citan únicamente con fines
          descriptivos de la experiencia comercial de {CONTACT.company}.
        </p>
      </LegalSection>

      <LegalSection title="5. Exclusión de responsabilidad">
        <p>
          {CONTACT.company} procura que la información del sitio sea exacta y esté
          actualizada, si bien no garantiza su ausencia de errores ni la
          disponibilidad ininterrumpida del servicio. No se responsabiliza de los
          daños derivados del uso indebido del sitio, de la interpretación de la
          información publicada sin la debida verificación técnica, ni de las
          decisiones tomadas a partir de ella.
        </p>
        <p>
          Las cotizaciones, plazos y capacidades indicados en el sitio son
          referenciales. Toda relación contractual se formaliza exclusivamente
          mediante la propuesta técnica y comercial emitida por {CONTACT.company}.
        </p>
      </LegalSection>

      <LegalSection title="6. Enlaces">
        <p>
          El sitio puede incluir enlaces a páginas de terceros. {CONTACT.company} no
          controla sus contenidos ni sus políticas, y no asume responsabilidad
          alguna por ellos.
        </p>
      </LegalSection>

      <LegalSection title="7. Modificaciones">
        <p>
          {CONTACT.company} podrá modificar este aviso legal en cualquier momento.
          La versión vigente es la publicada en este sitio y surte efectos desde su
          publicación.
        </p>
      </LegalSection>

      <LegalSection title="8. Legislación aplicable y jurisdicción">
        <p>
          Este aviso se rige por la legislación de la República Bolivariana de
          Venezuela. Cualquier controversia se someterá a los tribunales competentes
          de la ciudad de Valencia, Estado Carabobo, salvo norma imperativa en
          contrario.
        </p>
      </LegalSection>

      <LegalSection title="9. Documentos relacionados">
        <p>
          Complementan este aviso la{" "}
          <Link className="text-[#1d4fb8] underline" href="/politica-privacidad">
            Política de Privacidad
          </Link>
          , la{" "}
          <Link className="text-[#1d4fb8] underline" href="/politica-cookies">
            Política de Cookies
          </Link>{" "}
          y los{" "}
          <Link className="text-[#1d4fb8] underline" href="/terminos-condiciones">
            Términos y Condiciones
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
