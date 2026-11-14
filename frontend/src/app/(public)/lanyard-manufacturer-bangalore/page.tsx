import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  MessageCircle,
  FileText,
  MapPin,
  Layers,
  Sparkles,
  Building2,
  Tag,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Lanyard Manufacturer in Bangalore | Wholesale Satin Lanyard Rolls",
  description:
    "Direct manufacturer of virgin polyester satin lanyard rolls (12mm–25mm), sublimation printed lanyards, and ID attachments in Bangalore. Sunkadakatte factory dispatch with 100% GST invoice.",
  alternates: {
    canonical: `${SITE_URL}/lanyard-manufacturer-bangalore`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Lanyard Manufacturer in Bangalore | The Print Planet",
    description:
      "Factory-direct wholesale supplier of satin lanyard rolls, custom corporate lanyards, and metal clips in Sunkadakatte, Bengaluru.",
    url: `${SITE_URL}/lanyard-manufacturer-bangalore`,
    siteName: "The Print Planet",
    type: "website",
  },
};

const BANGALORE_AREAS = [
  "Electronic City",
  "Whitefield Tech Corridor",
  "Peenya Industrial Area",
  "Manyata Tech Park",
  "Koramangala",
  "Rajajinagar",
  "Indiranagar",
  "Bellandur / Outer Ring Road",
  "Yeshwanthpur",
  "Bommasandra Industrial Area",
  "Sunkadakatte Hub",
];

const LANYARD_SPECS = [
  {
    parameter: "Available Ribbon Widths",
    specification: "12 mm, 16 mm, 20 mm, and 25 mm continuous spools",
  },
  {
    parameter: "Material Composition",
    specification: "100% Virgin Continuous-Filament Polyester Satin with calendar-pressed smooth finish",
  },
  {
    parameter: "Thermal Heat Resistance",
    specification: "Withstands 200°C–220°C heat press exposure with zero melting or shrinkage",
  },
  {
    parameter: "Edge Finish",
    specification: "Ultrasonically sealed, burr-free edges that resist fraying during automated cutting",
  },
  {
    parameter: "Color Reproduction",
    specification: "Calibrated 99.2% CIE whiteness index for accurate Pantone Hexachrome color fidelity",
  },
  {
    parameter: "Standard Spool Yield",
    specification: "100-meter continuous spool yields approximately 105 to 110 completed adult lanyards (90 cm length)",
  },
];

const LOCAL_FAQS: FaqItem[] = [
  {
    question: "Do you manufacture custom printed lanyards with corporate logos in Bangalore?",
    answer:
      "Yes. We operate high-speed digital heat-transfer sublimation and rotary screen printing lines in Bangalore, producing multi-color custom lanyards in 12mm, 16mm, 20mm, and 25mm widths with corporate logos, employee names, and safety breakaway fittings.",
  },
  {
    question: "Can I buy plain white satin lanyard rolls in bulk for sublimation printing?",
    answer:
      "Yes. We supply raw continuous-filament polyester white satin rolls (100-meter spools) in 12mm, 16mm, 20mm, and 25mm widths directly to commercial printing studios, sublimation shops, and ID bureaus across Bangalore at factory-direct rates.",
  },
  {
    question: "What is the turnaround time for bulk custom lanyard orders?",
    answer:
      "Digital proofs are issued within 2 to 4 hours. Pilot physical samples are completed in 24 hours. Production runs of 1,000 to 10,000 lanyards are completed in 2 to 4 working days, followed by express courier dispatch or local warehouse pickup in Sunkadakatte.",
  },
  {
    question: "Do you supply matching clips, hooks, and ID card holders?",
    answer:
      "Yes. We maintain complete factory stock of dog hooks, oval fish hooks, crocodile clips, metal crimp clamps, safety breakaways, and rigid PVC card holders so you can source entire employee ID kits from a single source.",
  },
];

export default function LanyardManufacturerBangalorePage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/lanyard-manufacturer-bangalore#business`,
        name: "The Print Planet - Lanyard Manufacturer Bangalore",
        image: `${SITE_URL}/logo.png`,
        telephone: "+91 97418 08034",
        email: "theprintplanet01@gmail.com",
        url: `${SITE_URL}/lanyard-manufacturer-bangalore`,
        taxID: "29AAQFT3909B1ZZ",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, Credit Card, Bank Transfer, UPI",
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
        areaServed: [
          { "@type": "City", name: "Bangalore" },
          { "@type": "State", name: "Karnataka" },
          { "@type": "Country", name: "India" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/lanyard-manufacturer-bangalore#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Lanyard Manufacturer Bangalore",
            item: `${SITE_URL}/lanyard-manufacturer-bangalore`,
          },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <Breadcrumbs items={[{ label: "Lanyard Manufacturer Bangalore" }]} />
      </div>

      {/* Hero Section */}
      <section className="bg-radial from-[#1A2634] to-[#121418] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>Bangalore Weaving &amp; Printing Hub • Sunkadakatte Facility</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Satin Lanyard Manufacturer &amp; Wholesale Supplier in Bangalore
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Wholesale manufacturer of 100% virgin polyester satin lanyard rolls, multicolour sublimation printed neck lanyards, and ID accessories. Factory pickup from Sunkadakatte or express delivery across Bengaluru.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold px-5 py-3 rounded-md text-sm transition-all shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4 text-[#121418]" />
                <span>Request Lanyard Price List</span>
              </Link>
              <a
                href="https://wa.me/919741808034?text=Hi%2C%20I%20am%20looking%20for%20wholesale%20satin%20lanyards%20and%20printing%20in%20Bangalore."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-md text-sm border border-white/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Live Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Trust Pillars */}
      <section className="bg-white border-b border-[#DFE6EE] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Factory-Direct Pricing</strong>
                <span className="text-slate-500">From ₹185/spool wholesale</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">24–48h Dispatch</strong>
                <span className="text-slate-500">Fast delivery across Bangalore</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">100% GST Invoicing</strong>
                <span className="text-slate-500">Full 18% ITC compliant</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Free Sample Kits</strong>
                <span className="text-slate-500">Pre-production sample verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Core Product Families */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Wholesale Lanyard Products &amp; Raw Consumables
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Supplying corporate offices, IT parks, universities, and commercial printing studios across Karnataka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Layers className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">White Sublimation Lanyard Rolls</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ultra-white virgin polyester rolls (12mm, 16mm, 20mm, 25mm) engineered specifically for digital heat-transfer printing. Resists heat up to 220°C with zero dye migration.
                </p>
              </div>
              <Link
                href="/categories/indian-satin-digital-lanyard-roll"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>View Lanyard Rolls &rarr;</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Sparkles className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">Custom Printed Corporate Lanyards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full-color corporate logo printing on premium double-face satin ribbons. Paired with sturdy zinc-alloy dog hooks, safety breakaways, and executive card holders.
                </p>
              </div>
              <Link
                href="/corporate"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>Explore Bulk Orders &rarr;</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Tag className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">Lanyard Fittings, Clips &amp; Hooks</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chrome-plated metal crimp clamps (12mm, 16mm, 20mm), oval fish hooks, plastic clips, and safety buckle releases ready in stock in bulk cartons.
                </p>
              </div>
              <Link
                href="/categories/id-card-lanyard-consumables"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>View Fittings &rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Specification Matrix */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Satin Ribbon Technical Specifications
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every ribbon spool is manufactured to exact dimensional tolerances for automatic heat-cutters and rotary printers.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#DFE6EE] rounded-lg shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#EDF1F6] border-b border-[#DFE6EE] text-[#121418] font-bold">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Standard Factory Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-[#FFFFFF]">
                {LANYARD_SPECS.map((spec, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#121418]">{spec.parameter}</td>
                    <td className="py-3 px-4 text-slate-600">{spec.specification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Industrial Service Areas in Bangalore */}
        <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#121418]">
            Lanyard Distribution Across Bangalore Tech Parks &amp; Industrial Zones
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From our Sunkadakatte manufacturing base, we fulfill continuous orders for IT firms, hospitals, educational institutions, and event organizers across Bengaluru:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {BANGALORE_AREAS.map((area, i) => (
              <span
                key={i}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-md shadow-2xs"
              >
                {area}
              </span>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Frequently Asked Questions (Lanyards &amp; Printing)
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Key details regarding ribbon width selection, spool yield, and delivery timelines.
            </p>
          </div>
          <FaqAccordion items={LOCAL_FAQS} />
        </section>

        {/* Call to Action Banner */}
        <section className="bg-[#121418] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Need a Custom Lanyard Sample Kit or Bulk Quote?
            </h3>
            <p className="text-sm text-slate-300">
              Speak directly with our lanyard printing specialists. We provide physical sample packs, Pantone color proofs, and wholesale bulk slabs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/quote"
              className="bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold px-6 py-3 rounded-md text-sm transition-all"
            >
              Get Custom Quote
            </Link>
            <a
              href="tel:+919741808034"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-md text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call +91 97418 08034</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
