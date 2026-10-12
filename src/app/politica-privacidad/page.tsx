import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT, CONTACT_ADDRESS_LINE } from "@/lib/contact-data";

export const metadata: Metadata = {
  title: "Política de Privacidad | Famesa C.A.",
  description:
    "Cómo Famesa C.A. recolecta, usa, conserva y protege los datos personales facilitados a través de su sitio web, conforme a la Ley Orgánica de Protección de Datos Personales.",
  alternates: { canonical: "/politica-privacidad" },
  robots: { index: true, follow: true },
};

export default function PoliticaPrivacidadPage() {
  return (
    <LegalShell
      title="Política de Privacidad"
      subtitle="Tratamiento de datos personales conforme a la Ley Orgánica de Protección de Datos Personales de Venezuela."
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos personales recolectados a
          través de este sitio es <strong>{CONTACT.legalName}</strong>, RIF{" "}
          <strong>{CONTACT.rif}</strong>, con domicilio en {CONTACT_ADDRESS_LINE}.
        </p>
        <p>
          Para cualquier consulta o solicitud relacionada con sus datos puede
          contactarnos por correo electrónico{" "}
          <a className="text-[#1d4fb8] underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>{" "}
          o por teléfono {CONTACT.phones.landline}.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos personales que tratamos">
        <p>
          Recolectamos únicamente los datos necesarios para atender solicitudes de
          cotización de carácter empresarial (B2B). A través del formulario
          «Cotiza» podemos tratar:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Datos identificativos y de contacto: nombre y apellido, empresa o razón social, correo electrónico y teléfono.</li>
          <li>Datos del requerimiento: descripción técnica de la pieza, material, medidas, urgencia y demás especificaciones que usted nos facilite.</li>
          <li>Datos técnicos de conexión: dirección IP y sellos de seguridad, tratados con la finalidad de prevenir usos abusivos y ataques automatizados.</li>
        </ul>
        <p>
          No solicitamos datos sensibles, financieros ni de categorías especiales.
          Le pedimos abstenerse de incluirlos en el campo de descripción técnica.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidad y base legal">
        <p>Tratamos sus datos con las siguientes finalidades y bases:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Atender y gestionar su solicitud de cotización</strong>, ponernos
            en contacto con usted y elaborar la propuesta técnica y comercial. Base:
            aplicación de medidas precontractuales a solicitud del titular y su
            consentimiento.
          </li>
          <li>
            <strong>Gestionar la relación comercial</strong> derivada, incluida la
            facturación y el cumplimiento de obligaciones mercantiles y tributarias.
            Base: ejecución de contrato y cumplimiento de obligaciones legales.
          </li>
          <li>
            <strong>Garantizar la seguridad del sitio</strong> y prevenir el uso
            fraudulento del formulario. Base: interés legítimo del responsable.
          </li>
        </ul>
        <p>
          No utilizamos sus datos para enviar publicidad no solicitada ni para
          elaborar perfiles con fines de mercadotecnia.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservación de los datos">
        <p>
          Conservamos los datos durante el tiempo necesario para atender su
          solicitud y, una vez iniciada la relación comercial, durante los plazos
          exigidos por la legislación mercantil, contable y fiscal aplicable en
          Venezuela (con carácter general, hasta cinco (5) años). Transcurridos
          esos plazos, los datos se eliminan o se anonimizan de forma segura.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatarios y encargados">
        <p>
          Los datos no se ceden a terceros ajenos salvo obligación legal. Podrán
          acceder a ellos, como encargados del tratamiento y con las debidas
          garantías, los proveedores que prestan servicios necesarios para el
          funcionamiento del sitio, tales como:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>El proveedor de alojamiento y despliegue del sitio web (infraestructura en la nube).</li>
          <li>El servicio de verificación anti-bots empleado para proteger el formulario.</li>
          <li>Los servicios de mensajería utilizados para canalizar su consulta cuando usted elige contactarnos por WhatsApp.</li>
        </ul>
        <p>
          Si usted decide continuar la conversación a través de WhatsApp, el
          tratamiento de esa comunicación se rige también por las condiciones y
          políticas de dicho servicio de mensajería.
        </p>
      </LegalSection>

      <LegalSection title="6. Transferencias internacionales">
        <p>
          Algunos de nuestros proveedores de infraestructura pueden estar ubicados
          fuera de Venezuela. En tales casos, procuramos que ofrezcan niveles de
          protección adecuados y que el tratamiento se limite a las finalidades
          descritas en esta política.
        </p>
      </LegalSection>

      <LegalSection title="7. Derechos del titular">
        <p>
          Como titular de los datos puede ejercer, entre otros, los derechos de:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Acceso:</strong> conocer si tratamos sus datos y obtener una copia.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación/supresión:</strong> pedir la eliminación cuando ya no sean necesarios.</li>
          <li><strong>Oposición:</strong> oponerse a determinados tratamientos.</li>
          <li><strong>Portabilidad</strong> y retiro del consentimiento en cualquier momento.</li>
        </ul>
        <p>
          Puede ejercerlos escribiendo a{" "}
          <a className="text-[#1d4fb8] underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          , indicando su identidad y el derecho que desea ejercer. Responderemos en
          un plazo razonable y, cuando corresponda, le informaremos sobre su derecho
          a presentar una reclamación ante la autoridad competente en materia de
          protección de datos personales.
        </p>
      </LegalSection>

      <LegalSection title="8. Medidas de seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger la
          información, entre ellas: cifrado del tráfico mediante HTTPS,
          cabeceras de seguridad, validación y depuración de las entradas del
          formulario, limitación de la tasa de envíos y verificación anti-bots.
          Ningún sistema es infalible, por lo que le recomendamos no enviar
          información confidencial que no sea estrictamente necesaria para su
          cotización.
        </p>
      </LegalSection>

      <LegalSection title="9. Menores de edad">
        <p>
          Este sitio está dirigido a profesionales y empresas. No está previsto para
          menores de edad y no recolectamos conscientemente sus datos. Si detectamos
          un registro de este tipo, procederemos a su eliminación.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios en esta política">
        <p>
          Podemos actualizar esta política para adaptarla a cambios normativos o
          operativos. La versión vigente, con su fecha de actualización, estará
          siempre publicada en este sitio.
        </p>
      </LegalSection>

      <LegalSection title="11. Documentos relacionados">
        <p>
          Consulte también el{" "}
          <Link className="text-[#1d4fb8] underline" href="/aviso-legal">
            Aviso Legal
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
