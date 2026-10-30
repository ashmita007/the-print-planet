import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
    default: "Print Planet™ Bangalore | Specialist in PVC Cards, ID Materials & Machinery — Official Website",
    template: "%s | Print Planet™ — Specialist in PVC Cards",
  },
  description:
    "Official website of Print Planet (The Print Planet, Bangalore — theprintplanet.co.in). India's leading specialist in PVC cards, ID card raw materials, inkjet & digital fusing sheets, thermal lamination machines, and multicolour heat-transfer lanyards with pan-India dispatch from Sunkadakatte, Bangalore.",
  keywords: [
    "specialist in pvc cards",
    "specialist in pvc cards bangalore",
    "pvc card specialist",
    "pvc cards manufacturer bangalore",
    "print planet",
    "the print planet",
    "the print planet bangalore",
    "print planet bangalore",
    "the print planet sunkadakatte",
    "print planet id card materials",
    "id card raw materials supplier bangalore",
    "thermal lamination machines supplier india",
    "lanyard and pvc id card supplies",
    "the print planet co in",
    "theprintplanet.co.in",
    "pvc id card fusing sheets wholesale",
    "coated overlay sheets for pvc id card",
    "semi transparent pvc id card holder",
    "crystal clear pvc id card holder",
    "id card cutting machine price",
    "fusing machine wholesale",
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
    canonical: SITE_URL,
  },
  verification: {
    google: "OnOlyPW4sLJfwVBxaGRnqOJE3vM8eLf5Gw58d-_nWmg",
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Print Planet",
    title: "Print Planet™ (The Print Planet) Bangalore | Official Website — ID Card Materials & Machinery",
    description:
      "Official website of Print Planet (The Print Planet, Bangalore — theprintplanet.co.in). Leading wholesale manufacturer and supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, and industrial card machinery.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 600,
        alt: "Print Planet Bangalore B2B Printing & ID Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Planet™ (The Print Planet) Bangalore | Official Website — ID Card Materials & Machinery",
    description:
      "Direct manufacturer of satin lanyards, ID card materials, and card machines in Bangalore with nationwide dispatch.",
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
      name: "Print Planet",
      legalName: "The Print Planet",
      alternateName: [
        "The Print Planet",
        "Print Planet Bangalore",
        "The Print Planet Bangalore",
        "The Print Planet Sunkadakatte",
        "Print Planet Sunkadakatte",
        "The Print Planet Bengaluru",
        "Print Planet Bengaluru",
        "Print Planet ID Card Materials",
        "theprintplanet.co.in",
        "print planet co in",
        "ThePrintPlanet"
      ],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        caption: "Print Planet Official Brand Logo",
      },
      image: [
        `${SITE_URL}/icon-512.png`,
        `${SITE_URL}/logo.png`,
        `${SITE_URL}/icon.png`,
      ],
      description:
        "India's premier B2B factory manufacturer and specialist in PVC cards, ID card raw materials, inkjet & digital fusing sheets, thermal lamination machines, digital cutting plotters, badge reels, and card punching machinery.",
      telephone: "+919741808034",
      email: "theprintplanet01@gmail.com",
      taxID: "29AAQFT3909B1ZZ",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, NEFT, RTGS, UPI, Bank Transfer",
      sameAs: [
        "https://www.indiamart.com/theprintplanet/",
        "https://www.justdial.com/Bangalore/The-Print-Planet",
        "https://www.tradeindia.com/Seller-16599025-THE-PRINT-PLANET/",
        "https://theprintplanet.co.in"
      ],
      knowsAbout: [
        "Specialist in PVC Cards and ID Systems",
        "PVC ID Card Manufacturing & Raw Materials",
        "PVC Core Fusing Sheets & Coated Overlays",
        "Multicolour Heat-Transfer Lanyards",
        "Industrial Thermal Lamination Machines",
        "Digital Cutting Plotters & Die Cutters",
        "Badge Reels & Lanyard Fittings",
        "Sublimation Inks and Raw Materials",
        "Satin Lanyard Rolls",
        "PVC ID Card Holders",
        "Dog Hooks and Alligator Clips",
        "RFID Smart Cards"
      ],
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "City", name: "Bangalore" },
        { "@type": "City", name: "Bengaluru" },
        { "@type": "City", name: "Mumbai" },
        { "@type": "City", name: "Delhi" },
        { "@type": "City", name: "Hyderabad" },
        { "@type": "City", name: "Chennai" },
        { "@type": "City", name: "Pune" },
        { "@type": "City", name: "Ahmedabad" },
        { "@type": "City", name: "Kolkata" }
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte",
        addressLocality: "Bangalore",
        addressRegion: "Karnataka",
        postalCode: "560091",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 12.9863,
        longitude: 77.5020,
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
      name: "Print Planet",
      alternateName: [
        "The Print Planet",
        "Print Planet Bangalore",
        "The Print Planet Bangalore",
        "Print Planet Sunkadakatte",
        "theprintplanet.co.in",
        "print planet co in"
      ],
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
        <meta name="google-site-verification" content="OnOlyPW4sLJfwVBxaGRnqOJE3vM8eLf5Gw58d-_nWmg" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link
          rel="preload"
          href="https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-white text-[#263445] antialiased selection:bg-[#E87832] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
