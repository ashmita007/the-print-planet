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
    default: "The Print Planet™ Bangalore | Official Website — ID Card Materials, Lanyards & Machinery",
    template: "%s | The Print Planet",
  },
  description:
    "Official website of The Print Planet, Bangalore (theprintplanet.co.in). Leading B2B manufacturer and wholesale supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, industrial thermal lamination machines, digital cutting plotters, badge reels, and sublimation supplies with pan-India dispatch from Sunkadakatte, Bangalore.",
  keywords: [
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
    "buy lanyard rolls wholesale",
    "wholesale id card lanyard roll",
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
    title: "The Print Planet™ Bangalore | Official Website — ID Card Materials, Lanyards & Machinery",
    description:
      "Official website of The Print Planet, Bangalore (theprintplanet.co.in). Leading wholesale manufacturer and supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, and industrial card machinery.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 600,
        alt: "The Print Planet Bangalore B2B Printing & ID Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Print Planet™ Bangalore | Official Website — ID Card Materials, Lanyards & Machinery",
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
      alternateName: [
        "Print Planet",
        "The Print Planet",
        "The Print Planet Bangalore",
        "Print Planet Bangalore",
        "The Print Planet Sunkadakatte",
        "The Print Planet Bengaluru",
        "Print Planet Bengaluru",
        "Print Planet ID Card Materials",
        "theprintplanet.co.in",
        "print planet co in",
        "ThePrintPlanet"
      ],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/logo.png`,
      description:
        "India's premier B2B factory manufacturer and wholesale supplier of PVC ID card raw materials, multicolour heat-transfer lanyards, thermal lamination machines, digital cutting plotters, badge reels, and card punching machinery.",
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
        "PVC ID Cards and Raw Materials",
        "Multicolour Heat-Transfer Lanyards",
        "Industrial Thermal Lamination Machines",
        "Digital Cutting Plotters",
        "Badge Reels",
        "Die Cutters",
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
        <meta name="google-site-verification" content="OnOlyPW4sLJfwVBxaGRnqOJE3vM8eLf5Gw58d-_nWmg" />
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
