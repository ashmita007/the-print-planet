import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-print-planet.onrender.com";

export const viewport: Viewport = {
  themeColor: "#17365D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Print Planet | Wholesale ID Card Solutions & Lanyards",
    template: "%s | The Print Planet",
  },
  description:
    "Leading Indian B2B wholesale manufacturer of premium satin lanyard rolls, vertical/horizontal PVC ID card holders, dog hooks, RFID access cards, and card manufacturing machinery.",
  keywords: [
    "wholesale id card lanyard roll",
    "color id card lanyard roll india",
    "semi transparent pvc id card holder",
    "crystal clear pvc id card holder",
    "id card lanyard hooks wholesale",
    "id card cutting machine",
    "fusing machine",
    "rfid smart cards b2b",
    "custom satin lanyards manufacturer",
  ],
  authors: [{ name: "The Print Planet" }],
  creator: "The Print Planet",
  publisher: "The Print Planet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "The Print Planet",
    title: "The Print Planet | Wholesale ID Card Solutions & Lanyards",
    description:
      "Wholesale supplier of industrial satin lanyard rolls, rigid PVC ID card holders, clips, smart cards, and machinery. Fast dispatch across India.",
    images: [
      {
        url: `${SITE_URL}/media/products/LAN-ROY-20M.png`,
        width: 1200,
        height: 630,
        alt: "The Print Planet Wholesale Industrial ID Catalogue",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Print Planet | Wholesale ID Card Solutions & Lanyards",
    description:
      "Wholesale manufacturer of satin lanyards, ID card holders, RFID cards, and machinery with nationwide dispatch.",
    images: [`${SITE_URL}/media/products/LAN-ROY-20M.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Print Planet",
      url: SITE_URL,
      logo: `${SITE_URL}/media/products/LAN-ROY-20M.png`,
      description:
        "India's leading B2B wholesale manufacturer and supplier of satin lanyard rolls, ID holders, RFID cards, and card punching machines.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Print Planet",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-[#263445] antialiased selection:bg-[#E87832] selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
