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
  PackageCheck,
  Sparkles,
  Plane,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import { DEFAULT_OG_IMAGES } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "PVC Cards Wholesale India | B2B Manufacturer & Raw Material Supplier",
  description:
    "Direct factory wholesale supplier of PVC cards, CR-80 blank cards, A4 dragon sheets, RFID prelams, and ID card fusing machines across India. 24–48h dispatch to Mumbai, Delhi, Chennai, Hyderabad, and Kolkata with 100% IGST invoice.",
  alternates: {
    canonical: `${SITE_URL}/pvc-cards-wholesale-india`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "PVC Cards Wholesale India | B2B Raw Material Manufacturer",
    description:
      "Factory-direct wholesale supplier of PVC cards, dragon sheets, satin lanyard rolls, and ID card machinery across India with 24–48h express dispatch and 18% GST Input Tax Credit.",
    url: `${SITE_URL}/pvc-cards-wholesale-india`,
    siteName: "The Print Planet",
    type: "website",
  },
};

const LOGISTICS_HUBS = [
  {
    region: "South India Hubs",
    states: "Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Kerala",
    majorCities: "Bengaluru, Chennai, Hyderabad, Coimbatore, Kochi, Vijayawada",
    transitTime: "24 – 36 Hours",
    partners: "DTDC Express, VRL Logistics, Professional Couriers",
  },
  {
    region: "Western Commercial Hubs",
    states: "Maharashtra, Gujarat, Goa, Madhya Pradesh",
    majorCities: "Mumbai, Pune, Ahmedabad, Surat, Nagpur, Indore",
    transitTime: "36 – 48 Hours",
    partners: "Blue Dart Apex, TCI Express, DTDC Air Cargo",
  },
  {
    region: "North & NCR Hubs",
    states: "Delhi NCR, Uttar Pradesh, Haryana, Punjab, Rajasthan",
    majorCities: "New Delhi, Noida, Gurugram, Jaipur, Chandigarh, Lucknow",
    transitTime: "48 – 72 Hours",
    partners: "Blue Dart Air, TCI Freight, Safexpress",
  },
  {
    region: "Eastern & Central Corridors",
    states: "West Bengal, Odisha, Bihar, Jharkhand, Chhattisgarh, Assam",
    majorCities: "Kolkata, Bhubaneswar, Patna, Ranchi, Raipur, Guwahati",
    transitTime: "48 – 72 Hours",
    partners: "DTDC Air, Blue Dart, TCI Express",
  },
];

const WHOLESALE_SLABS = [
  {
    category: "CR-80 Blank PVC Cards",
    specs: "ISO/IEC 7810 (85.60 × 53.98 mm, 0.76 mm 30 Mil, Super-White)",
    moq: "100 Cards",
    slabRate: "₹3.80 – ₹4.80 / card (Bulk slabs from ₹2.90 in 10,000+ cartons)",
    link: "/categories/pvc-id-card-consumable",
  },
  {
    category: "A4 Inkjet Dragon Sheets",
    specs: "Microporous Silica Core + Overlays (50 Sets/Box = 500 Cards)",
    moq: "1 Box (50 Sets)",
    slabRate: "₹680 – ₹850 / box (~₹1.50 per finished card)",
    link: "/categories/pvc-id-card-inkjet-fusing-sheets",
  },
  {
    category: "White Sublimation Lanyard Rolls",
    specs: "100m Spools (12mm, 16mm, 20mm, 25mm) 220°C Heat Resistant",
    moq: "1 Spool (100m)",
    slabRate: "₹185 – ₹255 / spool (Tier-1 bulk container rates)",
    link: "/categories/digital-lanyard-white-roll",
  },
  {
    category: "Mifare 1K Classic RFID Cards",
    specs: "13.56 MHz ISO 14443A Contactless 1KB EEPROM Smart Cards",
    moq: "100 Cards",
    slabRate: "₹9.80 – ₹14.50 / card (Factory direct pre-encoded)",
    link: "/categories/rfid-consumables",
  },
  {
    category: "Motorized PVC Card Die Cutters",
    specs: "Heavy-Duty 1,200 – 4,500 Cards/Hour ISO CR-80 Punch",
    moq: "1 Machine",
    slabRate: "Factory direct with 1-Year Warranty & WhatsApp Video Demo",
    link: "/categories/motorized-pvc-id-card-cutting-machine-for-id-card",
  },
  {
    category: "A4 Dual-Plate Fusing Laminators",
    specs: "PID Digital Temp (up to 200°C) with Water-Cooling Platens",
    moq: "1 Machine",
    slabRate: "Commercial bureau grade from ₹48,000 + GST",
    link: "/categories/machines",
  },
];

const PAN_INDIA_FAQS: FaqItem[] = [
  {
    question: "Do you supply PVC card raw materials and machines across all states in India?",
    answer:
      "Yes. The Print Planet dispatches daily to all 28 states and 8 union territories across India from our central manufacturing and fulfillment hub in Bengaluru. We partner with Tier-1 logistics providers (Blue Dart Apex, DTDC Air Cargo, VRL Logistics, and TCI Express) with real-time consignment tracking.",
  },
  {
    question: "How do interstate buyers claim GST Input Tax Credit (ITC)?",
    answer:
      "100% of our commercial shipments are accompanied by formal HSN-coded GST tax invoices under GSTIN 29AAQFT3909B1ZZ. For buyers outside Karnataka (e.g. Maharashtra, Tamil Nadu, Delhi, Gujarat), invoices are billed with 18% Integrated GST (IGST), which is 100% claimable as Input Tax Credit against your output tax liabilities.",
  },
  {
    question: "How are heavy machines (fusing laminators and die-cutters) packed for long-distance transport?",
    answer:
      "Every machine undergoes rigorous live WhatsApp video inspection with the buyer (+91 97418 08034) to verify operational heating, hydraulic pressure, and card punch tolerances. Machines are then wrapped in high-barrier moisture-resistant film, padded with high-density EVA foam, and bolted into reinforced industrial plywood export crates to eliminate transit shock.",
  },
  {
    question: "Can print studios outside Bangalore receive physical sample kits before ordering bulk cartons?",
    answer:
      "Yes. We dispatch comprehensive B2B sample kits via express air courier containing sample blank PVC cards, printed dragon sheet cutouts, satin lanyard ribbon widths (12mm, 16mm, 20mm, 25mm), and card holders. The nominal courier fee is 100% credited against your first commercial order.",
  },
  {
    question: "What are the minimum order quantities (MOQ) for wholesale pan-India freight?",
    answer:
      "We accommodate both growing print studios and mega bureaus: A4 dragon sheets start from 1 box (50 sets = 500 cards), satin lanyards from 1 spool (100m), blank cards from 100 pieces, and machinery from single units. Volume freight discounts apply on carton and pallet consignments.",
  },
];

export default function PvcCardsWholesaleIndiaPage() {
  const wholesaleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WholesaleStore",
        "@id": `${SITE_URL}/pvc-cards-wholesale-india#store`,
        name: "The Print Planet — PVC Cards & Printing Consumables Wholesale India",
        image: `${SITE_URL}/logo.png`,
        telephone: "+91 97418 08034",
        email: "theprintplanet01@gmail.com",
        url: `${SITE_URL}/pvc-cards-wholesale-india`,
        taxID: "29AAQFT3909B1ZZ",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Bank Transfer, RTGS, NEFT, UPI, Credit Card",
        address: {
          "@type": "PostalAddress",
          streetAddress: "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Sunkadakatte",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          postalCode: "560091",
          addressCountry: "IN",
        },
        areaServed: [
          { "@type": "Country", name: "India" },
          { "@type": "State", name: "Maharashtra" },
          { "@type": "State", name: "Delhi" },
          { "@type": "State", name: "Tamil Nadu" },
          { "@type": "State", name: "Telangana" },
          { "@type": "State", name: "Gujarat" },
          { "@type": "State", name: "Karnataka" },
          { "@type": "State", name: "West Bengal" },
          { "@type": "State", name: "Uttar Pradesh" },
          { "@type": "State", name: "Kerala" },
          { "@type": "State", name: "Andhra Pradesh" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/pvc-cards-wholesale-india#faq`,
        mainEntity: PAN_INDIA_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-12 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(wholesaleJsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-[#0E2238] text-white py-12 sm:py-16 border-b border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Wholesale Tariff", href: "/pricing" },
              { label: "PVC Cards Wholesale India" },
            ]}
          />

          <div className="max-w-3xl space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Pan-India B2B Direct Dispatch | 100% IGST Input Tax Credit</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-hero font-extrabold tracking-tight text-white leading-tight">
              PVC Cards &amp; ID Card Raw Materials Wholesale India
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Direct factory supply of ISO CR-80 blank PVC cards, A4 dragon sheets, RFID prelams, satin lanyard rolls, and commercial card fusing machinery. 24–48h express delivery across Mumbai, Delhi, Chennai, Hyderabad, Kolkata, and all major Indian commercial hubs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold px-5 py-3 rounded-md text-sm transition-all shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4 text-[#121418]" />
                <span>View Pan-India Wholesale Tariff</span>
              </Link>
              <a
                href="https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20am%20looking%20for%20wholesale%20PVC%20card%20raw%20materials%20and%20pan-India%20dispatch%20rates."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-md text-sm border border-white/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Pan-India Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-[#DFE6EE] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Factory-Direct Supply</strong>
                <span className="text-slate-500">Zero middleman broker markup</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Air &amp; Surface Cargo</strong>
                <span className="text-slate-500">Tier-1 logistics across 28 states</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">100% IGST Invoicing</strong>
                <span className="text-slate-500">Full 18% Input Tax Credit</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#121418] shrink-0" />
              <div>
                <strong className="block text-[#121418] font-bold">Live Video Testing</strong>
                <span className="text-slate-500">Pre-dispatch machine trials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Core Wholesale Slabs Table */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Pan-India Wholesale Product Slabs &amp; Pricing
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Factory slabs available for commercial printing presses, educational ID card contractors, and regional distributors across India.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#DFE6EE] bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#EDF1F6] border-b border-[#DFE6EE] text-[#121418] font-bold">
                <tr>
                  <th className="py-3 px-4">Material / Machine Category</th>
                  <th className="py-3 px-4">Standard Technical Specification</th>
                  <th className="py-3 px-4">Minimum Order</th>
                  <th className="py-3 px-4">Wholesale Rate Slab</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-[#FFFFFF]">
                {WHOLESALE_SLABS.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#121418]">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{item.specs}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#121418]">{item.moq}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{item.slabRate}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 font-bold text-[#F26B1D] hover:underline text-xs"
                      >
                        Order &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pan-India Transit Times & State Logistics */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF1F6] text-xs font-bold text-[#121418]">
              <Truck className="w-3.5 h-3.5 text-[#F26B1D]" />
              <span>Nationwide Logistics Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight mt-2">
              Pan-India Delivery Timelines by Region
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Orders placed before 2:00 PM IST dispatch same-day directly from our central warehouse facility in Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LOGISTICS_HUBS.map((hub) => (
              <div
                key={hub.region}
                className="bg-white border border-[#DFE6EE] rounded-2xl p-6 shadow-xs hover:border-[#121418] transition-all space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#121418]">{hub.region}</h3>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                    {hub.transitTime}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Coverage States:</span>
                    <span className="text-slate-800 font-medium">{hub.states}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Primary Cargo Hubs:</span>
                    <span className="text-slate-800 font-medium">{hub.majorCities}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 font-semibold block">Logistics Carriers:</span>
                    <span className="text-slate-800 font-mono">{hub.partners}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pan-India FAQs */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Frequently Asked Questions (Pan-India Wholesale)
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Answers regarding interstate GST billing, timber crating for machines, sample kits, and freight insurance.
            </p>
          </div>

          <FaqAccordion items={PAN_INDIA_FAQS} />
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-[#0E2238] to-[#1A365D] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Order Pan-India Wholesale Consumables?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect directly with our Bengaluru sales desk on WhatsApp (+91 97418 08034) for container slabs, custom sample packs, or freight-inclusive proforma invoices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] text-sm font-bold transition-all shadow-md active:scale-95"
            >
              Wholesale Tariff
            </Link>
            <a
              href="https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20need%20a%20pan-India%20wholesale%20quote%20for%20PVC%20card%20materials."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all"
            >
              WhatsApp Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
