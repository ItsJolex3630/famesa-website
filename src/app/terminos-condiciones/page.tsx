import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT, CONTACT_ADDRESS_LINE } from "@/lib/contact-data";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Famesa C.A.",
  description:
    "Términos y condiciones de uso del sitio web de Famesa C.A. y de las solicitudes de cotización realizadas a través de él.",
  alternates: { canonical: "/terminos-condiciones" },
  robots: { index: true, follow: true },
};

export default function TerminosCondicionesPage() {
  return (
    <LegalShell
      title="Términos y Condiciones"
      subtitle="Reglas aplicables al uso del sitio y a las solicitudes realizadas a través de él."
      sections={[
        "1. Aceptación",
        "2. Identificación",
        "3. Carácter de la información",
        "4. Solicitudes de cotización",
        "5. Propiedad intelectual",
        "6. Uso correcto del sitio",
        "7. Limitación de responsabilidad",
        "8. Fuerza mayor",
        "9. Modificaciones",
        "10. Legislación y jurisdicción",
        "11. Documentos relacionados",
      ]}
    >
      <LegalSection title="1. Aceptación">
        <p>
          El acceso y uso de este sitio atribuye la condición de usuario e implica
          la aceptación plena de estos Términos y Condiciones. Si no está de acuerdo,
          le rogamos abstenerse de utilizarlo.
        </p>
      </LegalSection>

      <LegalSection title="2. Identificación">
        <p>
          Este sitio es operado por <strong>{CONTACT.legalName}</strong>, RIF{" "}
          {CONTACT.rif}, con domicilio en {CONTACT_ADDRESS_LINE}. Contacto:{" "}
          {CONTACT.email} · {CONTACT.phones.landline}.
        </p>
      </LegalSection>

      <LegalSection title="3. Carácter de la información">
        <p>
          Los contenidos del sitio (servicios, capacidades, materiales, tolerancias
          y ejemplos de piezas) tienen carácter informativo y orientativo. No
          constituyen una oferta vinculante ni garantizan la disponibilidad,
          plazos o precios finales.
        </p>
      </LegalSection>

      <LegalSection title="4. Solicitudes de cotización">
        <p>
          El envío del formulario «Cotiza» supone una solicitud de información y no
          genera por sí mismo obligación contractual alguna. Toda operación se
          perfecciona únicamente mediante la propuesta técnica y comercial emitida
          por {CONTACT.company} y su posterior aceptación por el cliente, en los
          términos que allí se indiquen.
        </p>
        <p>
          El usuario se compromete a facilitar información veraz, exacta y completa,
          y a no introducir contenidos ilícitos, ofensivos o que vulneren derechos
          de terceros.
        </p>
      </LegalSection>

      <LegalSection title="5. Propiedad intelectual">
        <p>
          Los derechos de propiedad intelectual e industrial sobre los contenidos de
          este sitio pertenecen a {CONTACT.company} o a sus legítimos titulares.
          Se prohíbe su reproducción o uso no autorizado conforme a lo previsto en
          el{" "}
          <Link className="text-[#1d4fb8] underline" href="/aviso-legal">
            Aviso Legal
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Uso correcto del sitio">
        <p>
          El usuario se obliga a no realizar acciones que puedan dañar, inutilizar,
          sobrecargar o deteriorar el sitio, ni a intentar acceder sin autorización
          a sistemas, datos o áreas restringidas. {CONTACT.company} podrá limitar el
          acceso ante usos indebidos o abusivos.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>
          {CONTACT.company} no será responsable de los daños indirectos, lucro
          cesante o pérdidas derivadas del uso o de la imposibilidad de uso del
          sitio, ni de las decisiones adoptadas a partir de la información en él
          publicada sin la debida verificación técnica.
        </p>
      </LegalSection>

      <LegalSection title="8. Fuerza mayor">
        <p>
          {CONTACT.company} no será responsable del incumplimiento o retraso en sus
          obligaciones cuando obedezca a causas de fuerza mayor o caso fortuito
          ajenas a su control razonable.
        </p>
      </LegalSection>

      <LegalSection title="9. Modificaciones">
        <p>
          {CONTACT.company} se reserva el derecho de modificar estos términos. La
          versión vigente y su fecha de actualización serán las publicadas en este
          sitio.
        </p>
      </LegalSection>

      <LegalSection title="10. Legislación y jurisdicción">
        <p>
          Estos términos se rigen por la legislación de la República Bolivariana de
          Venezuela. Las controversias se someterán a los tribunales competentes de
          la ciudad de Valencia, Estado Carabobo.
        </p>
      </LegalSection>

      <LegalSection title="11. Documentos relacionados">
        <p>
          Consulte también el{" "}
          <Link className="text-[#1d4fb8] underline" href="/aviso-legal">
            Aviso Legal
          </Link>
          , la{" "}
          <Link className="text-[#1d4fb8] underline" href="/politica-privacidad">
            Política de Privacidad
          </Link>{" "}
          y la{" "}
          <Link className="text-[#1d4fb8] underline" href="/politica-cookies">
            Política de Cookies
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
