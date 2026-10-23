import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const viewport: Viewport = {
  themeColor: "#17365D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Print Planet | Wholesale ID Card Solutions, Lanyard Rolls & Machinery India",
    template: "%s | The Print Planet",
  },
  description:
    "Official website of The Print Planet (theprintplanet.co.in). India's leading B2B factory manufacturer & wholesale supplier of satin lanyard rolls, PVC ID card holders, dog hooks, RFID smart cards, and card cutting machinery with pan-India dispatch.",
  keywords: [
    "the print planet",
    "print planet",
    "print planet india",
    "the print planet co in",
    "theprintplanet.co.in",
    "buy lanyard rolls wholesale",
    "wholesale id card lanyard roll",
    "color id card lanyard roll india",
    "semi transparent pvc id card holder",
    "crystal clear pvc id card holder",
    "id card lanyard hooks wholesale",
    "id card cutting machine price",
    "fusing machine wholesale",
    "rfid smart cards b2b",
    "custom satin lanyards manufacturer",
    "wholesale id card accessories india",
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
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "The Print Planet",
    title: "The Print Planet | Wholesale ID Card Solutions, Lanyard Rolls & Machinery India",
    description:
      "Official website of The Print Planet. India's leading wholesale manufacturer of industrial satin lanyard rolls, rigid PVC ID card holders, clips, smart cards, and machinery. Fast dispatch across India.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 600,
        alt: "The Print Planet B2B Printing & ID Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Print Planet | Wholesale ID Card Solutions, Lanyard Rolls & Machinery India",
    description:
      "Wholesale manufacturer of satin lanyards, ID card holders, RFID cards, and machinery with nationwide dispatch.",
    images: [`${SITE_URL}/logo.png`],
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
      "@type": ["Organization", "LocalBusiness", "WholesaleStore"],
      "@id": `${SITE_URL}/#organization`,
      name: "The Print Planet",
      alternateName: [
        "Print Planet",
        "The Print Planet India",
        "The Print Planet Bengaluru",
        "Print Planet Bengaluru",
        "print planet co in",
        "theprintplanet.co.in",
        "ThePrintPlanet"
      ],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/logo.png`,
      description:
        "India's premier B2B wholesale manufacturer and supplier of satin lanyard rolls, PVC ID card holders, dog hooks, RFID smart cards, and card punching machinery.",
      telephone: "+919741808034",
      email: "theprintplanet01@gmail.com",
      taxID: "29AAQFT3909B1ZZ",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, NEFT, RTGS, UPI, Bank Transfer",
      address: {
        "@type": "PostalAddress",
        streetAddress: "No.17, Ground Floor, 7th Main, 13th Cross Rd, Agrahara Dasarahalli, Rajajinagar Industrial Town",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560079",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 12.9880,
        longitude: 77.5385,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:30",
          closes: "19:00",
        },
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: "+919741808034",
        email: "theprintplanet01@gmail.com",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Kannada"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Print Planet",
      alternateName: ["Print Planet", "The Print Planet India", "theprintplanet.co.in"],
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
