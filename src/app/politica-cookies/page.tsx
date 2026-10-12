import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT } from "@/lib/contact-data";

export const metadata: Metadata = {
  title: "Política de Cookies | Famesa C.A.",
  description:
    "Información sobre las cookies y tecnologías similares utilizadas en el sitio web de Famesa C.A. y cómo gestionarlas.",
  alternates: { canonical: "/politica-cookies" },
  robots: { index: true, follow: true },
};

export default function PoliticaCookiesPage() {
  return (
    <LegalShell
      title="Política de Cookies"
      subtitle="Qué son las cookies, cuáles utiliza este sitio y cómo puede gestionarlas."
    >
      <LegalSection title="1. Qué son las cookies">
        <p>
          Una cookie es un pequeño archivo que se almacena en su dispositivo al
          visitar un sitio web y que permite recordar información sobre su visita.
          También pueden emplearse tecnologías similares, como el almacenamiento
          local del navegador.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué cookies utiliza este sitio">
        <p>
          Este sitio es de carácter informativo y <strong>no utiliza cookies de
          publicidad, de análisis ni de perfilado de terceros</strong>. Únicamente
          empleamos cookies y mecanismos técnicamente necesarios para el
          funcionamiento y la seguridad del sitio:
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#c8d2e0] text-[#0a1a3a]">
                <th className="py-2 pr-4 font-bold">Tipo</th>
                <th className="py-2 pr-4 font-bold">Finalidad</th>
                <th className="py-2 font-bold">Duración</th>
              </tr>
            </thead>
            <tbody className="text-[#33405c]">
              <tr className="border-b border-[#e8edf4]">
                <td className="py-3 pr-4">Seguridad / anti-bots</td>
                <td className="py-3 pr-4">
                  Verificar que el envío del formulario lo realiza una persona y
                  protegerlo frente a usos automatizados.
                </td>
                <td className="py-3">Sesión / corta</td>
              </tr>
              <tr className="border-b border-[#e8edf4]">
                <td className="py-3 pr-4">Preferencias de sesión</td>
                <td className="py-3 pr-4">
                  Mantener el correcto funcionamiento de la interfaz durante su
                  visita.
                </td>
                <td className="py-3">Sesión</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Estas cookies están exentas del deber de consentimiento previo por ser
          estrictamente necesarias para prestar el servicio solicitado y no se
          utilizan para identificarle con fines comerciales.
        </p>
      </LegalSection>

      <LegalSection title="3. Servicios de terceros">
        <p>
          Para proteger el formulario utilizamos un servicio de verificación
          anti-bots que puede establecer cookies o mecanismos técnicos propios
          durante el proceso de validación. Asimismo, si usted decide contactarnos
          mediante WhatsApp, los datos de esa comunicación se gestionan en la
          plataforma de dicho proveedor, ajena a {CONTACT.company}.
        </p>
      </LegalSection>

      <LegalSection title="4. Cómo gestionar o desactivar las cookies">
        <p>
          Puede configurar su navegador para bloquear o eliminar las cookies y el
          almacenamiento local. Tenga en cuenta que la desactivación de las cookies
          estrictamente necesarias puede afectar al funcionamiento del formulario.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Chrome: Configuración › Privacidad y seguridad › Cookies.</li>
          <li>Firefox: Preferencias › Privacidad y seguridad.</li>
          <li>Safari: Preferencias › Privacidad.</li>
          <li>Edge: Configuración › Cookies y permisos del sitio.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Actualizaciones">
        <p>
          Podemos actualizar esta política si incorporamos nuevas funcionalidades que
          requieran el uso de cookies. Publicaremos cualquier cambio en esta misma
          página.
        </p>
      </LegalSection>

      <LegalSection title="6. Documentos relacionados">
        <p>
          Consulte también la{" "}
          <Link className="text-[#1d4fb8] underline" href="/politica-privacidad">
            Política de Privacidad
          </Link>
          , el{" "}
          <Link className="text-[#1d4fb8] underline" href="/aviso-legal">
            Aviso Legal
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
