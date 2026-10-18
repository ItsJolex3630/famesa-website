import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
  title: "FAMESA SUITE · Panel de Administración Industrial | RIF J-31352388-7",
  description:
    "Sistema ERP industrial de FAMESA C.A. en Valencia, Carabobo: mecanizado CNC, soldadura ASME/AWS, plásticos de ingeniería, inventario, taller y facturación SENIAT.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={
        {
          // Reutiliza las fuentes ya cargadas por el layout raíz (Barlow
          // Condensed + Inter) y añade JetBrains Mono / monospace para datos monoespaciados.
          "--font-sans": "var(--font-inter)",
          "--font-display": "var(--font-barlow)",
          "--font-mono":
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        } as React.CSSProperties
      }
    >
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
