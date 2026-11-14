import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CreditCard,
  Factory,
  Glasses,
  GraduationCap,
  Hospital,
  Landmark,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "ID Cards & Lanyards by Industry | Corporate, School & Hospital Badges",
  description:
    "Factory-direct ID card systems, custom satin lanyards, RFID access cards, and badge holders tailored for IT parks, schools, universities, hospitals, and industrial manufacturing plants in Bangalore and across India.",
  alternates: { canonical: `${SITE_URL}/industries` },
  openGraph: {
    title: "ID Cards & Lanyards by Industry | The Print Planet Bangalore",
    description:
      "Sector-specific ID badge solutions, RFID turnstile integrations, safety breakaways, and wholesale lanyard supplies with 100% GST invoicing.",
    url: `${SITE_URL}/industries`,
    siteName: "The Print Planet",
  },
};

interface IndustrySector {
  icon: React.ElementType;
  title: string;
  tagline: string;
  specs: string[];
  recommendedProducts: { label: string; href: string }[];
  moq: string;
  leadTime: string;
}

const SECTORS: IndustrySector[] = [
  {
    icon: Building2,
    title: "Corporate IT Parks & Tech Enterprises",
    tagline: "High-security smart access cards, branded 20mm satin lanyards, and retractable reels.",
    specs: [
      "Mifare 1K (13.56 MHz) or DESFire dual-frequency smart cards",
      "20mm premium continuous-filament satin ribbon with Pantone logo matching",
      "Retractable heavy-duty chrome badge reels with 30-inch reinforced cord",
      "Dual-pocket clear polycarbonate card holders for ID + RFID pass",
    ],
    recommendedProducts: [
      { label: "Satin Lanyard Rolls", href: "/categories/indian-satin-digital-lanyard-roll" },
      { label: "RFID Smart Cards", href: "/categories/rfid-consumables" },
      { label: "ID Card Holders", href: "/categories/id-card-holder" },
    ],
    moq: "100 Units",
    leadTime: "2–4 Days",
  },
  {
    icon: GraduationCap,
    title: "Schools, Colleges & Universities",
    tagline: "Colour-coded student identity cards, safety breakaway lanyards, and library cards.",
    specs: [
      "ISO CR-80 0.76mm multi-layer fused waterproof PVC cards with student QR/barcode",
      "16mm/20mm dyed polyester lanyards colour-coded by grade, house, or department",
      "Mandatory child-safety quick-release breakaway buckles preventing choking accidents",
      "Soft transparent PVC vinyl pouches with reinforced hanging eyelets",
    ],
    recommendedProducts: [
      { label: "PVC Cards & Dragon Sheets", href: "/categories/pvc-id-card-consumable" },
      { label: "Lanyard Hooks & Clips", href: "/categories/id-card-lanyard-hooks" },
      { label: "PVC Cards Bangalore", href: "/pvc-card-manufacturer-bangalore" },
    ],
    moq: "250 Units",
    leadTime: "3–5 Days",
  },
  {
    icon: Hospital,
    title: "Hospitals, Clinics & Healthcare Facilities",
    tagline: "Hygienic staff identity badges, department colour coding, and visitor protocols.",
    specs: [
      "Scratch-resistant and hospital-disinfectant wipeable laminated PVC ID badges",
      "Safety breakaway neck lanyards conforming to emergency triage hospital safety norms",
      "Distinct department colour coding: Emergency (Red), Nursing (Blue), Admin (Green)",
      "High-clarity frosted rigid card holders with easy-slide thumb notches",
    ],
    recommendedProducts: [
      { label: "Lanyards Bangalore", href: "/lanyard-manufacturer-bangalore" },
      { label: "Frosted Card Holders", href: "/categories/id-card-holder" },
      { label: "Wholesale Tariff", href: "/pricing" },
    ],
    moq: "100 Units",
    leadTime: "2–3 Days",
  },
  {
    icon: Factory,
    title: "Industrial Manufacturing & Warehouses",
    tagline: "Ruggedized ID badge holders, steel crocodile clips, and high-visibility safety lanyards.",
    specs: [
      "Armored heavy-gauge polycarbonate holders resistant to machine oils and impacts",
      "Alligator clips with heavy-duty metal rivets and reinforced vinyl straps",
      "High-visibility reflective fluorescent polyester lanyards for shop-floor compliance",
      "125 kHz EM-Marin proximity cards for perimeter gate turnstiles and time-clocks",
    ],
    recommendedProducts: [
      { label: "Metal Fittings & Hooks", href: "/categories/id-card-lanyard-hooks" },
      { label: "Proximity Cards", href: "/categories/rfid-consumables" },
      { label: "Card Machinery", href: "/categories/machines" },
    ],
    moq: "200 Units",
    leadTime: "2–4 Days",
  },
  {
    icon: Landmark,
    title: "Government, PSUs & Defense Establishments",
    tagline: "Tamper-evident holographic security, sequential laser numbering, and non-clonable cards.",
    specs: [
      "Hot-stamped metallic rainbow optical holographic overlays preventing card duplication",
      "Sequential alphanumeric laser engraving and micro-text borders",
      "Fusing dragon sheets tested for 5+ year environmental delamination resistance",
      "Full compliance with GeM portal billing specifications and GST e-invoicing",
    ],
    recommendedProducts: [
      { label: "PVC Core Fusing Sheets", href: "/categories/pvc-id-card-consumable" },
      { label: "ID Card Fusing Machines", href: "/categories/machines" },
      { label: "Corporate Bulk Enquiry", href: "/corporate" },
    ],
    moq: "500 Units",
    leadTime: "4–7 Days",
  },
  {
    icon: CalendarCheck2,
    title: "Events, Summits & Trade Exhibitions",
    tagline: "Oversized badge pouches, double-ended no-twist lanyards, and delegate kits.",
    specs: [
      "25mm extra-wide digital sublimation lanyards featuring full sponsor branding",
      "Double dog-hook attachment configuration preventing the delegate badge from flipping",
      "Oversized transparent vinyl event pouches (100 × 150 mm) for conference schedules",
      "Rapid turnaround production capacity of 10,000+ lanyards per week",
    ],
    recommendedProducts: [
      { label: "Sublimation Lanyard Rolls", href: "/categories/indian-satin-digital-lanyard-roll" },
      { label: "Double Hooks & Fittings", href: "/categories/id-card-lanyard-hooks" },
      { label: "Custom Quotation", href: "/quote" },
    ],
    moq: "200 Units",
    leadTime: "24–48 Hours",
  },
  {
    icon: Glasses,
    title: "Optical Boutiques & Eyewear Brands",
    tagline: "Custom rigid spectacle boxes, lens packaging trays, and microfiber cleaning cloths.",
    specs: [
      "Rigid cardboard spectacle cases lined with velvet and magnetic clasp closures",
      "Die-cut EVA foam trays customized for ophthalmic lens lab storage",
      "200 GSM high-density microfiber cleaning cloths with heat-embossed brand logos",
      "PVC warranty and lens authentication cards with foil-stamped authenticity seals",
    ],
    recommendedProducts: [
      { label: "Custom Packaging", href: "/corporate" },
      { label: "PVC Warranty Cards", href: "/categories/pvc-id-card-consumable" },
      { label: "Direct Wholesale Inquiry", href: "/contact" },
    ],
    moq: "500 Units",
    leadTime: "5–8 Days",
  },
  {
    icon: CreditCard,
    title: "Banks, Microfinance & Telecom",
    tagline: "Magnetic stripe cards, scratch-off authentication panels, and smart chip carriers.",
    specs: [
      "High-Coercivity (Hi-Co 2750 Oe) or Low-Coercivity (Lo-Co 300 Oe) magnetic stripe overlays",
      "Opaque silver scratch-off security foil ribbons protecting PIN codes and voucher numbers",
      "Standard ISO 7816 contact chip card milling and smart inlay encapsulation",
      "100% batch testing for magnetic track write reliability and swipe durability",
    ],
    recommendedProducts: [
      { label: "Magnetic Overlays & Sheets", href: "/categories/pvc-id-card-consumable" },
      { label: "Card Cutters & Punches", href: "/categories/machines" },
      { label: "Wholesale Pricing Tariff", href: "/pricing" },
    ],
    moq: "1,000 Units",
    leadTime: "4–6 Days",
  },
];

const FAQS: FaqItem[] = [
  {
    question: "Can we request physical sample kits for institutional procurement approval?",
    answer:
      "Yes. We dispatch comprehensive physical sample kits containing sample satin lanyard ribbon widths (12mm, 16mm, 20mm, 25mm), printed PVC card thickness swatches, rigid polycarbonate holders, and metal clip fittings. The nominal sample courier fee is 100% credited against your first commercial order.",
  },
  {
    question: "Do you supply formal HSN-coded GST tax invoices for institutional audits?",
    answer:
      "Yes. 100% of consignments are accompanied by formal GST tax invoices issued under GSTIN 29AAQFT3909B1ZZ with appropriate HSN codes (e.g., 3926 for plastic ID card consumables and 5806 for woven satin ribbons). Your enterprise can claim full 18% Input Tax Credit.",
  },
  {
    question: "Can you handle emergency or large-volume rush orders for upcoming conferences?",
    answer:
      "Yes. With continuous weaving spools in stock and automated sublimation print lines running at our Bangalore facility, we can manufacture and dispatch event lanyards and badge pouches within 24 to 48 hours for urgent deliveries across South India.",
  },
  {
    question: "What formats do you need for corporate logos and ID card artwork?",
    answer:
      "We accept vector PDF, Adobe Illustrator (.AI), CorelDRAW (.CDR), or high-resolution PNG files (300 DPI minimum). Our prepress team prepares an accurate digital mock-up showing ribbon bleed, seam stitching, and clip alignment for your sign-off before mass production.",
  },
];

export default function IndustriesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "B2B Industry ID Card & Lanyard Solutions",
    "description": "Sector-specific identity and security badge solutions by The Print Planet Bangalore.",
    "itemListElement": SECTORS.map((s, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": s.title,
      "description": s.tagline,
    })),
  };

  return (
    <div className="pb-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        title="ID Cards & Lanyards for Every Industry"
        lead="Factory-direct identification systems engineered for corporate IT corridors, educational universities, healthcare centers, and industrial shop floors with 100% GST ITC compliance."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Industries" },
        ]}
      />

      {/* Main Grid */}
      <section aria-label="Industry Solutions" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const quoteUrl = `/quote?industry=${encodeURIComponent(sector.title)}`;
            return (
              <article
                key={sector.title}
                className="bg-white border border-[#DFE6EE] rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0E2238] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Icon className="w-6 h-6 text-[#FF8A3D]" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#353C45]">
                      <span className="px-2.5 py-1 rounded-md bg-[#EDF1F6] border border-[#DFE6EE] font-bold">
                        MOQ: {sector.moq}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#EDF1F6] border border-[#DFE6EE] font-bold text-emerald-700">
                        Dispatch: {sector.leadTime}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#121418] tracking-tight">
                      {sector.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#2B323B] leading-relaxed">
                      {sector.tagline}
                    </p>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2 pt-2 border-t border-[#DFE6EE]">
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#353C45]">
                      Technical Specifications & Compliance:
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#2B323B]">
                      {sector.specs.map((spec) => (
                        <li key={spec} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#DFE6EE] space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-[#353C45]">Recommended:</span>
                    {sector.recommendedProducts.map((p) => (
                      <Link
                        key={p.label}
                        href={p.href}
                        className="text-[11px] font-semibold text-[#121418] hover:text-[#F26B1D] underline decoration-[#DFE6EE] hover:decoration-[#F26B1D] transition-colors"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={quoteUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E2238] hover:bg-[#1A365D] text-white text-xs font-bold transition-colors group"
                  >
                    <span>Request Institutional Quote for {sector.title.split(" ")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF8A3D] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Institutional FAQ Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF1F6] text-xs font-bold text-[#121418]">
              <ShieldCheck className="w-4 h-4 text-[#F26B1D]" />
              <span>Procurement Assurance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
              Institutional & Tender Procurement FAQs
            </h2>
            <p className="text-sm text-[#2B323B] max-w-xl mx-auto">
              Answers for purchase managers, school administrators, and corporate facility directors.
            </p>
          </div>

          <FaqAccordion items={FAQS} />
        </div>
      </section>

      {/* Page CTA */}
      <PageCta
        title="Buying for an Institution or Enterprise? Speak with our B2B procurement team."
        whatsappText="Hi The Print Planet, I would like to discuss bulk institutional supply for our organization."
      />
    </div>
  );
}
