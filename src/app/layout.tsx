import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://famesa-website.vercel.app"),
  title:
    "Famesa C.A. | Metalmecánica, Soldadura y Plásticos de Ingeniería en Valencia, Carabobo",
  description:
    "Fabricación y mecanizado de piezas, rodillos industriales, engranajes, torneado CNC, mecanizado en nylon y teflón, soldadura TIG/MIG y reparación de reductores. Zona Industrial Santa Rosa, Valencia, Carabobo, Venezuela.",
  applicationName: "Famesa C.A.",
  keywords: [
    "metalmecánica Valencia",
    "tornería Carabobo",
    "mecanizado CNC Valencia",
    "soldadura TIG MIG",
    "plásticos de ingeniería teflón nylon",
    "reparación de reductores",
    "rodillos industriales",
    "Famesa C.A.",
  ],
  authors: [{ name: "Famesa C.A." }],
  creator: "Famesa C.A.",
  publisher: "Famesa C.A.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Famesa C.A. — Ingeniería Metalmecánica y Soluciones Industriales",
    description:
      "Taller industrial especializado en mecanizado pesado, soldaduras especiales y polímeros técnicos en Valencia, Venezuela.",
    locale: "es_VE",
    type: "website",
    siteName: "Famesa C.A.",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Famesa C.A. — Ingeniería Metalmecánica y Soluciones Industriales",
    description:
      "Mecanizado CNC, tornería pesada, soldaduras especiales y polímeros de ingeniería en Valencia, Carabobo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  category: "industry",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Famesa C.A.",
  description:
    "Taller de metalmecanica, soldadura especial y mecanizado de plasticos de ingenieria con planta en Valencia, Carabobo, Venezuela.",
  telephone: ["+584143410187", "+584121435069"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Zona Industrial Santa Rosa",
    addressLocality: "Valencia",
    addressRegion: "Carabobo",
    postalCode: "2001",
    addressCountry: "VE",
  },
  areaServed: "VE",
  openingHours: ["Mo-Fr 07:30-17:00"],
  sameAs: ["https://www.instagram.com/famesa.ca"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white text-famesa-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
