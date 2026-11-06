import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Sora gives crisp geometric voice; Plus Jakarta Sans sets punchy, authoritative hero headlines;
// DM Sans keeps body copy clear; JetBrains Mono sets order numbers and SKUs.
const heroFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hero",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const heading = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";
import MotionBridge from "@/components/animations/MotionBridge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const viewport: Viewport = {
  themeColor: "#121418",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Print Planet Bangalore | PVC Cards, Lanyards & ID Machines",
    template: "%s | The Print Planet",
  },
  description:
    "The Print Planet, Bengaluru: PVC cards, ID card holders, satin lanyard rolls, RFID cards and ID card machines. Factory-direct wholesale across India.",
  authors: [{ name: "The Print Planet" }],
  creator: "The Print Planet",
  publisher: "The Print Planet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
    siteName: "The Print Planet",
    title: "The Print Planet Bangalore | PVC Cards, Lanyards & ID Machines",
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
    title: "The Print Planet Bangalore | PVC Cards, Lanyards & ID Machines",
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
      name: "The Print Planet",
      legalName: "The Print Planet",
      alternateName: ["Print Planet", "ThePrintPlanet", "Print Planet Bangalore", "The Print Planet Bengaluru"],
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
        "B2B factory manufacturer and specialist in PVC cards, ID card raw materials, inkjet & digital fusing sheets, thermal lamination machines, digital cutting plotters, badge reels, and card punching machinery.",
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
        "https://www.instagram.com/theprintplanet",
        "https://www.linkedin.com/company/the-print-planet"
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
          opens: "10:00",
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
      alternateName: ["Print Planet", "ThePrintPlanet"],
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
        className={`${body.variable} ${heading.variable} ${heroFont.variable} ${mono.variable} font-sans min-h-screen bg-[#FAFBFD] text-[#121418] antialiased selection:bg-[#F26B1D] selection:text-[#121418]`}
      >
        <CartProvider>
          {children}
          <CartDrawer />
          <MotionBridge />
        </CartProvider>
      </body>
    </html>
  );
}
