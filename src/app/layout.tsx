import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CONTACT } from "@/lib/contact-data";
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
  metadataBase: new URL(CONTACT.siteUrl),
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
  "@id": `${CONTACT.siteUrl}/#organization`,
  name: CONTACT.company,
  legalName: CONTACT.legalName,
  description:
    "Taller de metalmecánica, soldadura especial y mecanizado de plásticos de ingeniería con planta en Valencia, Carabobo, Venezuela.",
  url: CONTACT.siteUrl,
  logo: `${CONTACT.siteUrl}/images/logo.png`,
  image: `${CONTACT.siteUrl}/images/hero-bg.jpg`,
  telephone: [
    CONTACT.phones.landline.replace(/\s/g, ""),
    CONTACT.phones.mobile1.replace(/\s/g, ""),
    CONTACT.phones.mobile2.replace(/\s/g, ""),
  ],
  email: CONTACT.email,
  vatID: `VE-${CONTACT.rif}`,
  taxID: CONTACT.rif,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.address.street,
    addressLocality: CONTACT.address.city,
    addressRegion: CONTACT.address.state,
    postalCode: CONTACT.address.postalCode,
    addressCountry: "VE",
  },
  areaServed: "VE",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "07:30",
      closes: "17:00",
    },
  ],
  sameAs: [CONTACT.social.instagram],
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
