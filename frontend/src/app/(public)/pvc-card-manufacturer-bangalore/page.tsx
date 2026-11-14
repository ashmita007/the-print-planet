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
  Cpu,
  Scissors,
  Building2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import PrintShopCalculator from "@/components/PrintShopCalculator";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "PVC Card Manufacturer in Bangalore | Wholesale ID Cards & Materials",
  description:
    "Direct factory manufacturer and wholesale distributor of PVC ID cards, CR-80 blank cards, RFID cards, dragon sheets, and fusing machinery in Sunkadakatte, Bangalore. Pan-India dispatch with GST invoice.",
  alternates: {
    canonical: `${SITE_URL}/pvc-card-manufacturer-bangalore`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "PVC Card Manufacturer in Bangalore | The Print Planet",
    description:
      "Factory-direct wholesale supplier of PVC ID cards, RFID smart cards, printable core sheets, and card machinery in Sunkadakatte, Bengaluru.",
    url: `${SITE_URL}/pvc-card-manufacturer-bangalore`,
    siteName: "The Print Planet",
    type: "website",
  },
};

const BANGALORE_AREAS = [
  "Peenya Industrial Area",
  "Electronic City",
  "Whitefield",
  "Rajajinagar",
  "Yeshwanthpur",
  "Bommasandra",
  "Koramangala",
  "Hebbal",
  "Jayanagar",
  "Indiranagar",
  "Sunkadakatte Industrial Cluster",
  "Bidadi Industrial Hub",
];

const CARD_SPECS = [
  {
    parameter: "Standard Form Factor",
    specification: "CR-80 ISO/IEC 7810 (85.60 mm × 53.98 mm / 3.375\" × 2.125\")",
  },
  {
    parameter: "Standard Thickness",
    specification: "30 Mil (0.76 mm) solid fused composite / 20–32 Mil custom",
  },
  {
    parameter: "Corner Radius",
    specification: "3.18 mm rounded burr-free die-cut corners",
  },
  {
    parameter: "Core Material Options",
    specification: "100% Virgin High-Impact PVC Core Sheets (White / Silver / Gold)",
  },
  {
    parameter: "Print Compatibility",
    specification: "Desktop Inkjet (Dragon Sheets), Digital Toner Presses, Thermal Transfer (Fargo, Zebra, Evolis)",
  },
  {
    parameter: "RFID Options Available",
    specification: "13.56 MHz Mifare 1K Classic (ISO 14443A) & 125 kHz EM-Marin 4100",
  },
];

const LOCAL_FAQS: FaqItem[] = [
  {
    question: "Where is The Print Planet located in Bangalore and can I visit your facility?",
    answer:
      "Our central manufacturing and warehousing facility is located at No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091. Commercial buyers, print studios, and institutions can visit in person Monday through Saturday (10:00 AM – 7:00 PM) or request a live WhatsApp video inspection (+91 97418 08034).",
  },
  {
    question: "What is the minimum order quantity (MOQ) for wholesale PVC cards?",
    answer:
      "We provide flexible wholesale slabs for print bureaus: blank PVC cards start from packs of 100 pieces, printable A4 PVC fusing dragon sheets start from 50-sheet boxes (yielding 500 CR-80 cards), and satin lanyards start from 1 single 100m spool.",
  },
  {
    question: "How fast do you deliver across Bangalore and Karnataka?",
    answer:
      "Orders placed before 2:00 PM are dispatched same-day directly from our Sunkadakatte facility. Delivery across Bangalore industrial zones (Peenya, Rajajinagar, Electronic City, Whitefield) takes 4 to 24 hours via local courier or express porter.",
  },
  {
    question: "Do you supply PVC card manufacturing machines with local warranty in Bangalore?",
    answer:
      "Yes. We stock motorized card die-cutters, dual-plate heating/water-cooling fusing laminators, and lanyard heat press machines with 1-year mechanical warranty, replacement parts, and technician support in Bangalore.",
  },
  {
    question: "Do you issue official GST invoices for Input Tax Credit (ITC)?",
    answer:
      "Yes, 100% of commercial orders include formal HSN-coded GST tax invoices under GSTIN 29AAQFT3909B1ZZ, allowing verified businesses to claim complete 18% Input Tax Credit.",
  },
];

export default function PvcCardManufacturerBangalorePage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/pvc-card-manufacturer-bangalore#business`,
        name: "The Print Planet - PVC Card Manufacturer Bangalore",
        image: `${SITE_URL}/logo.png`,
        telephone: "+91 97418 08034",
        email: "theprintplanet01@gmail.com",
        url: `${SITE_URL}/pvc-card-manufacturer-bangalore`,
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
        "@id": `${SITE_URL}/pvc-card-manufacturer-bangalore#breadcrumb`,
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
            name: "PVC Card Manufacturer Bangalore",
            item: `${SITE_URL}/pvc-card-manufacturer-bangalore`,
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
        <Breadcrumbs items={[{ label: "PVC Card Manufacturer Bangalore" }]} />
      </div>

      {/* Hero Section */}
      <section className="bg-radial from-[#1A2634] to-[#121418] text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>Bangalore Factory Hub • Sunkadakatte Facility</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              PVC Card Manufacturer &amp; Wholesale Supplier in Bangalore
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Factory-direct wholesale supplier of ISO CR-80 PVC cards, inkjet printable dragon sheets, RFID proximity smart cards, and commercial card fusing machinery. Sunkadakatte warehouse pickup or 24-hour delivery across Bengaluru.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold px-5 py-3 rounded-md text-sm transition-all shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4 text-[#121418]" />
                <span>Request Wholesale Price List</span>
              </Link>
              <a
                href="https://wa.me/919741808034?text=Hi%2C%20I%20am%20looking%20for%20wholesale%20PVC%20cards%20and%20raw%20materials%20in%20Bangalore."
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
                <strong className="block text-[#121418] font-bold">Factory-Direct Rates</strong>
                <span className="text-slate-500">Zero middleman markup</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">24-Hour Dispatch</strong>
                <span className="text-slate-500">Across Bengaluru &amp; South India</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">100% GST Compliant</strong>
                <span className="text-slate-500">Claim 18% ITC on GSTIN 29</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Live Video Testing</strong>
                <span className="text-slate-500">Inspect machines before crating</span>
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
              Wholesale PVC Card Materials Manufactured &amp; Supplied
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything required by commercial digital printing studios, access control installers, and corporate ID badge bureaus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Layers className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">Printable PVC Core &amp; Dragon Sheets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A4 inkjet printable PVC sheets (Dragon Sheets) with micro-porous silica coatings. Each sheet yields 10 standard CR-80 cards with vivid resolution and zero ink bleeding.
                </p>
              </div>
              <Link
                href="/categories/pvc-id-card-consumable"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>View PVC Sheets &rarr;</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Cpu className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">RFID &amp; Contactless Smart Cards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  13.56 MHz Mifare 1K Classic (ISO 14443A) cards and 125 kHz EM-Marin proximity cards with embedded copper antenna coils for corporate attendance and college gates.
                </p>
              </div>
              <Link
                href="/categories/rfid-consumables"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>View Smart Cards &rarr;</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 shadow-xs hover:border-[#121418] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EDF1F6] flex items-center justify-between p-2.5">
                  <Scissors className="w-5 h-5 text-[#121418]" />
                </div>
                <h3 className="text-lg font-bold text-[#121418]">Card Fusing &amp; Die Cutting Machinery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heavy-duty dual-plate heated laminators (135°C–155°C) and motorized electric CR-80 card die-cutters capable of punching up to 1,200 cards/hour with burr-free rounded edges.
                </p>
              </div>
              <Link
                href="/categories/machines"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#121418] hover:text-[#FF8A3D] transition-colors"
              >
                <span>View Machinery &rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Specification Matrix */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              ISO/IEC 7810 Standard Technical Specifications
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every PVC core sheet and pre-cut card supplied conforms strictly to commercial banking and identity card tolerances.
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
                {CARD_SPECS.map((spec, i) => (
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
            Direct Supply Across Bangalore Industrial Corridors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From our central facility in Sunkadakatte, we fulfill daily wholesale orders for print studios, IT corporate parks, universities, and government bureaus located across all major commercial zones:
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

        {/* Print Shop & Cyber Cafe Profit Calculator */}
        <PrintShopCalculator />

        {/* Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Frequently Asked Questions (Bangalore B2B Buyers)
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Common procurement questions regarding minimum orders, machinery testing, and GST compliance.
            </p>
          </div>
          <FaqAccordion items={LOCAL_FAQS} />
        </section>

        {/* Call to Action Banner */}
        <section className="bg-[#121418] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Need a Custom Bulk Quotation or Machine Demo?
            </h3>
            <p className="text-sm text-slate-300">
              Speak directly with our senior application engineers. We provide sample packs, wholesale price breakdowns, and live video crating inspections.
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
