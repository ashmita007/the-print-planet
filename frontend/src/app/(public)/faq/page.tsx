import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import { MessageCircle, Phone, ArrowRight, ShieldCheck, Truck, FileText } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: {
    absolute: "ID Card & Lanyard FAQ — Technical Knowledge Base | The Print Planet",
  },
  description:
    "Frequently asked questions about PVC cards, CR-80 dimensions, fusing laminators, motorized die cutters, satin lanyard rolls, RFID smart cards, and wholesale pricing from The Print Planet Bangalore.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "ID Card & Lanyard FAQ — Technical Knowledge Base | The Print Planet",
    description:
      "Comprehensive answers to top Google questions regarding PVC ID card making, machine temperatures, sublimation ribbon widths, Mifare vs proximity cards, and wholesale procurement.",
    url: `${SITE_URL}/faq`,
    siteName: "The Print Planet",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 600,
        alt: "The Print Planet Technical Knowledge Base",
      },
    ],
  },
};

interface QuestionGroup {
  category: string;
  items: FaqItem[];
}

const FAQ_GROUPS: QuestionGroup[] = [
  {
    category: "CR-80 PVC Cards & Consumables",
    items: [
      {
        question: "What is a standard CR-80 PVC ID card size in mm and inches?",
        answer:
          "A standard ISO CR-80 ID card measures exactly 85.60 mm × 53.98 mm (3.375 × 2.125 inches) with a 30 mil (0.76 mm) thickness and 3.18 mm rounded corners—identical to a standard bank ATM card or driver's license. The Print Planet manufactures fusing sheets, pre-cut PVC cards, and die cutters strictly conforming to this ISO/IEC 7810 standard.",
      },
      {
        question: "What is the exact pixel resolution for a CR-80 card at 300 DPI?",
        answer:
          "At standard 300 DPI printing resolution, a CR-80 card design should be created at 1012 × 638 pixels (or 1050 × 675 pixels including a 2mm bleed margin for edge-to-edge printing). For 600 DPI re-transfer printers, the canvas size is 2024 × 1276 pixels.",
      },
      {
        question: "What is the layer structure of a standard 30 mil (0.76mm) PVC card?",
        answer:
          "A standard CR-80 card is typically built as a 3-layer or 5-layer composite sandwich: a central printed PVC core sheet (0.32mm to 0.46mm thick) sandwiched between two clear protective coated overlay films (0.06mm to 0.10mm thick each). When heat-fused in a laminator, the layers melt together into a solid 0.76mm (30 mil) credit-card thickness.",
      },
      {
        question: "What is the difference between inkjet PVC sheets and digital fusing sheets?",
        answer:
          "Inkjet PVC sheets have a micro-porous silica coating that absorbs liquid water-based dye or pigment inks from desktop printers (such as Epson L8050 or Canon). Digital PVC fusing sheets have heat-resistant surface treatments calibrated for digital toner presses (Konica Minolta, Xerox, Ricoh) and will not blister during high-temperature fusion.",
      },
      {
        question: "Why does my printed PVC ID card look distorted or the wrong size?",
        answer:
          "Card size distortion occurs when the printer driver has 'Fit to Page' or 'Scale to Fit' enabled. Always set scaling to '100%' or 'Actual Size' in your print dialog and ensure your layout software document dimensions match 85.6 mm × 54 mm exactly.",
      },
    ],
  },
  {
    category: "ID Card Manufacturing Machinery",
    items: [
      {
        question: "What machines are needed to start a commercial PVC ID card printing business?",
        answer:
          "To manufacture laminated PVC ID cards commercially, you need two core machines: an automatic heated PVC fusing laminator (to bond printed core sheets with front and back overlay films under 135°C–155°C heat and hydraulic pressure) and a motorized PVC card die cutter (to punch out finished CR-80 cards at up to 1,200 cards/hour). Both machines are ready in stock at our Bangalore facility with 1-year warranty and WhatsApp live video testing.",
      },
      {
        question: "What is an ID card fusing machine and what temperature should be used?",
        answer:
          "An ID card fusing machine bonds multi-layer PVC sandwich sheets (printed core plus front and back magnetic or clear overlay films) into a solid 0.76mm (30 mil) composite card. The optimal fusing temperature is between 135°C and 155°C maintained for 12–15 minutes under 6–8 MPa pressure, followed by a water-cooled plate cycle to prevent card distortion.",
      },
      {
        question: "How many cards can an A4 PVC fusing machine produce per cycle?",
        answer:
          "An industrial A4 fusing laminator accommodates multiple steel lamination trays simultaneously (typically 5 to 10 openings). Each A4 sheet yields 10 standard CR-80 cards. A standard 10-layer machine therefore produces up to 100 finished ID cards per 25–30 minute heating and cooling cycle.",
      },
      {
        question: "What is the difference between a manual hand cutter and a motorized PVC card die cutter?",
        answer:
          "A manual desktop punch uses a hand lever to cut one card at a time (suitable for 50–200 cards/day). A motorized electric die cutter uses a hardened alloy punch powered by an electric motor with foot pedal operation, punching up to 1,200 cards per hour with consistent ISO-standard burr-free edge quality and zero operator fatigue.",
      },
      {
        question: "Can I inspect the machine working on live video before dispatch?",
        answer:
          "Yes. The Print Planet conducts live WhatsApp video machine testing (+91 97418 08034) with every buyer prior to packaging, demonstrating operational heating, smooth hydraulic pressure, and sample card punch accuracy before timber crating.",
      },
    ],
  },
  {
    category: "Satin Lanyards & Sublimation Printing",
    items: [
      {
        question: "What is the standard ribbon width for corporate and student lanyards?",
        answer:
          "The industry standard widths are: 12 mm and 16 mm (ideal for lightweight visitor badges and school neckbands), 20 mm (the most popular corporate standard for multi-color company logos), and 25 mm (wide format for premium executive lanyards and conference branding).",
      },
      {
        question: "How many finished neck lanyards can be produced from a 100-meter spool?",
        answer:
          "A standard adult lanyard measures 90 cm (36 inches) in finished ribbon length. Allowing for heat-cutting, stitching, and hardware fold margins (approx. 92–94 cm per lanyard), a single 100-meter continuous spool yields approximately 105 to 110 completed lanyards.",
      },
      {
        question: "Which satin ribbon roll is best for sublimation lanyard heat-transfer printing?",
        answer:
          "White Digital Sublimation Lanyard Rolls woven from 100% continuous-filament virgin polyester with a calendar-pressed smooth surface. They withstand 200°C–215°C heat press exposure without melting or shrinking, delivering deep ink absorption, photographic resolution, and Pantone hexachrome color fidelity in 12mm, 16mm, 20mm, and 25mm widths.",
      },
      {
        question: "Can you match specific Pantone Hexachrome brand colours?",
        answer:
          "Yes. Our digital sublimation grade ribbon has a 99.2% CIE whiteness index, calibrated specifically for accurate Pantone color matching when paired with quality sublimation transfer inks.",
      },
      {
        question: "What equipment is required to start a custom lanyard printing business?",
        answer:
          "To print and assemble custom lanyards, you need: 1) a dye-sublimation printer with transfer paper, 2) a flatbed or rotary roll-to-roll lanyard heat press machine (running at 200°C for 25–35 seconds), 3) blank white satin lanyard rolls, 4) swivel dog hooks or fish hooks, and 5) an electric hot-knife ribbon cutter or ultrasonic sewing unit.",
      },
    ],
  },
  {
    category: "RFID Smart Cards & Access Control",
    items: [
      {
        question: "What is the difference between a Mifare 1K card and an EM-Marin proximity card?",
        answer:
          "Mifare 1K operates at 13.56 MHz high frequency with 1KB EEPROM read/write memory organized into 16 secure sectors with dual encryption keys, making it suitable for multi-application campus IDs, cashless payments, and secure access. EM-Marin operates at 125 kHz low frequency with a 64-bit factory pre-programmed read-only ID, primarily used for basic building entry turnstiles.",
      },
      {
        question: "Can I print directly on RFID smart cards using desktop ID card printers?",
        answer:
          "Yes. Our Mifare 1K and EM-Marin proximity cards are manufactured with flawless, mirror-smooth laminated PVC surfaces specifically engineered for thermal dye-sublimation and reverse-transfer card printers like Zebra ZC300, Fargo HDP5000, and Evolis Primacy without printhead damage.",
      },
      {
        question: "What is the typical read range of contactless RFID cards?",
        answer:
          "For 13.56 MHz Mifare 1K ISO cards, the typical read range is 2.5 cm to 10 cm. For 125 kHz EM-Marin proximity cards, standard read range is 5 cm to 12 cm depending on the reader antenna power and environment.",
      },
      {
        question: "What is an RFID inlay prelam sheet and how is it used by card factories?",
        answer:
          "An RFID prelam (pre-laminated) sheet contains multiple RFID microchips and wire antennas embedded into a PVC core layer in multi-up grid formats (e.g. 2×5 or 3×8 cards per sheet). Card manufacturers place printed artwork sheets above and below the prelam and fuse them in a heated press to create custom-branded smart cards.",
      },
    ],
  },
  {
    category: "ID Card Holders, Clips & Hardware",
    items: [
      {
        question: "What is the standard size for rigid PVC ID card holders?",
        answer:
          "Standard ID card holders are calibrated for ISO CR-80 cards measuring 85.6 mm × 54 mm (3.375 × 2.125 inches) with a 0.76 mm (30 mil) card thickness. Both Vertical (Portrait: 54 × 86 mm) and Horizontal (Landscape: 86 × 54 mm) configurations are stocked.",
      },
      {
        question: "What is the difference between crystal clear and semi-transparent frosted holders?",
        answer:
          "Crystal clear holders are made from high-transparency polycarbonate to ensure full visibility of employee barcodes, holographic seals, and photos. Semi-transparent frosted holders feature an anti-glare matte finish with a curved thumb-notch cutout, allowing convenient one-handed card extraction for turnstiles and swipe readers.",
      },
      {
        question: "What is the difference between a dog hook and an oval fish hook?",
        answer:
          "A swivel dog hook features a spring-loaded snap lever and a 360-degree rotating base ring, allowing smooth card rotation without twisting the neck ribbon. An oval fish hook has a push-gate closure with a sleeker oval silhouette, widely preferred for minimalist corporate identity badges.",
      },
      {
        question: "Why are safety breakaway buckles required on school and factory lanyards?",
        answer:
          "Safety breakaway buckles decouple automatically when pulled with 3.5–5 kg of force, preventing serious neck injury or strangulation if the lanyard is caught in machinery, elevator doors, or during playground sports. Once separated, the buckle easily snaps back together for continuous reuse.",
      },
    ],
  },
  {
    category: "Wholesale Ordering, GST & Pan-India Dispatch",
    items: [
      {
        question: "Where is The Print Planet located and can I visit the factory?",
        answer:
          "Our central manufacturing and warehousing facility is located at No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka. Commercial buyers can visit in person Monday to Saturday (10 AM to 7 PM) or request a live video inspection.",
      },
      {
        question: "What is the minimum order quantity (MOQ) and pricing for wholesale orders?",
        answer:
          "Consumables start with flexible minimums: 1 roll (100m spool) for satin lanyards and 100 pieces for PVC card holders. Bulk factory slabs start from ₹185/roll for lanyards and ₹2.65/piece for holders. Detailed quantity breaks are published in our open machine-readable tariff at /pricing.md.",
      },
      {
        question: "How fast do you deliver across India, and which logistics partners do you use?",
        answer:
          "Orders are dispatched within 24 to 48 hours directly from our Bengaluru central hub via DTDC, Blue Dart, VRL Logistics, and TCI Express. Shipments reach tier-1 metros within 24–48 hours with real-time consignment tracking.",
      },
      {
        question: "Do you provide official GST tax invoices for Input Tax Credit (ITC)?",
        answer:
          "Yes. 100% of commercial consignments include formal HSN-coded GST tax invoices issued under GSTIN 29AAQFT3909B1ZZ, allowing verified businesses to claim complete 18% Input Tax Credit.",
      },
    ],
  },
];

// Flatten all questions for JSON-LD FAQPage schema
const ALL_FAQS = FAQ_GROUPS.flatMap((group) => group.items);

export default function FaqPage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    name: "The Print Planet Technical FAQ & Knowledge Base",
    description:
      "Authoritative answers to common questions about PVC cards, CR-80 dimensions, fusing laminators, card die cutters, satin lanyard rolls, and RFID access credentials.",
    mainEntity: ALL_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="pb-16 space-y-10 sm:space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <PageHero
        title="Frequently Asked Questions & B2B Knowledge Hub"
        lead="Authoritative technical answers to Google's most searched questions regarding PVC cards, CR-80 standards, fusing machinery, lanyard printing ribbons, and RFID credentials."
        crumbs={[{ label: "Technical FAQ" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Quick Trust Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#DFE6EE] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#0E2238]/5 text-[#0E2238] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#FF8A3D]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#121418]">24–48h Dispatch</p>
              <p className="text-[11px] text-slate-500">Pan-India via DTDC, Blue Dart, VRL</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DFE6EE] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#0E2238]/5 text-[#0E2238] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#217A4B]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#121418]">Factory Direct & Tested</p>
              <p className="text-[11px] text-slate-500">Live WhatsApp video machine demo</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DFE6EE] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#0E2238]/5 text-[#0E2238] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#0E2238]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#121418]">100% GST ITC Invoicing</p>
              <p className="text-[11px] text-slate-500">GSTIN 29AAQFT3909B1ZZ</p>
            </div>
          </div>
        </div>

        {/* Categorized Question Sections */}
        <div className="space-y-12">
          {FAQ_GROUPS.map((group, idx) => (
            <section
              key={group.category}
              className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DFE6EE] shadow-xs space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-[#EDF1F6] pb-4">
                <span className="w-7 h-7 rounded-md bg-[#0E2238] text-white flex items-center justify-center font-mono text-xs font-bold">
                  0{idx + 1}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#121418] tracking-tight">
                  {group.category}
                </h2>
              </div>

              <FaqAccordion items={group.items} />
            </section>
          ))}
        </div>

        {/* Bottom Help Desk Card */}
        <div className="rounded-2xl bg-[#0E2238] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-bold font-hero">Have a question not listed here?</h3>
            <p className="text-sm text-slate-300">
              Our sales engineers in Sunkadakatte, Bangalore are ready to answer your questions on card thickness, machine setup, or bulk trade pricing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <a
              href="https://wa.me/919741808034"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-lg bg-[#217A4B] hover:bg-[#28925A] text-white font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              href="/quote"
              className="px-6 py-3.5 rounded-lg bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#0E2238] font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <span>Get a Bulk Quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
