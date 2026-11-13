import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, CheckCircle2, Phone, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";

export const metadata: Metadata = {
  title: { absolute: "Wholesale Price List 2026 | The Print Planet" },
  description: "Factory-direct wholesale price list for satin lanyard rolls, PVC ID card holders, lanyard hardware, RFID cards and ID card machines from Bangalore.",
  keywords: [
    "lanyard wholesale price",
    "PVC card holder wholesale price bangalore",
    "satin ribbon rolls bulk price",
    "dog hook lanyard clips wholesale",
    "Mifare RFID card wholesale price india",
    "ID card die cutting machine price"
  ],
  alternates: {
    canonical: "https://theprintplanet.co.in/pricing",
  },
};

export default function PricingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "The Print Planet B2B Wholesale Tariff 2026",
    "description": "Wholesale pricing for satin lanyard rolls, PVC ID card holders, and card machinery.",
    "priceCurrency": "INR",
    "validFrom": "2026-01-01",
    "seller": {
      "@type": "LocalBusiness",
      "name": "The Print Planet",
      "telephone": "+91-97418-08034",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Sunkadakatte",
        "addressLocality": "Bangalore",
        "postalCode": "560091",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PageHero
        title="Factory-Direct Wholesale Pricing Tariff"
        lead="Official B2B volume breaks for satin lanyard rolls, rigid CR-80 card holders, metal fittings, RFID smart cards, and Wuhan Wenlin industrial card equipment with 24–48h pan-India dispatch from Sunkadakatte, Bangalore."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Wholesale Tariff" },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Machine-Readable Downloads & AI Badge */}
        <section className="bg-[#122338] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Machine-Readable Open Tariff Active
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Looking for Raw AI or Procurement Data?
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              We publish our complete inventory slabs and technical specifications in standardized Markdown and Plaintext formats for ERP integration, procurement bots, and LLM reasoning.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href="/pricing.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/10 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#FF8A3D]" />
              pricing.md (Markdown)
            </a>
            <a
              href="/pricing.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/10 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              pricing.txt (Plaintext)
            </a>
          </div>
        </section>

        {/* Section 1: Lanyard Rolls */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-[#FF8A3D]">Section 01</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Satin Lanyard Rolls (Sublimation & Screen Printing)
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Continuous virgin polyester woven rolls calibrated for heat transfer & silk screen printing. 100-meter standard spools.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Width</th>
                  <th className="py-3.5 px-4">Sample (1–9 Rolls)</th>
                  <th className="py-3.5 px-4">Tier 1 (10–49 Rolls)</th>
                  <th className="py-3.5 px-4">Tier 2 (50–199 Rolls)</th>
                  <th className="py-3.5 px-4 text-[#FF8A3D] font-extrabold">Bulk (200+ Rolls)</th>
                  <th className="py-3.5 px-4 text-right">MOQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">12 mm Digital White Roll</td>
                  <td className="py-4 px-4 font-mono">₹280</td>
                  <td className="py-4 px-4 font-mono">₹245</td>
                  <td className="py-4 px-4 font-mono">₹215</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹185</td>
                  <td className="py-4 px-4 text-right">1 Roll</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">16 mm Digital White Roll</td>
                  <td className="py-4 px-4 font-mono">₹340</td>
                  <td className="py-4 px-4 font-mono">₹295</td>
                  <td className="py-4 px-4 font-mono">₹260</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹225</td>
                  <td className="py-4 px-4 text-right">1 Roll</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">20 mm Digital White Roll (Top Seller)</td>
                  <td className="py-4 px-4 font-mono">₹390</td>
                  <td className="py-4 px-4 font-mono">₹340</td>
                  <td className="py-4 px-4 font-mono">₹295</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹255</td>
                  <td className="py-4 px-4 text-right">1 Roll</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">25 mm Digital White Roll</td>
                  <td className="py-4 px-4 font-mono">₹470</td>
                  <td className="py-4 px-4 font-mono">₹410</td>
                  <td className="py-4 px-4 font-mono">₹360</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹315</td>
                  <td className="py-4 px-4 text-right">1 Roll</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: PVC Card Holders */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-[#FF8A3D]">Section 02</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Rigid PVC ID Card Holders & Badge Cases
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Precision molded from virgin polymers. Standard ISO CR-80 card dimensions (85.6 mm × 54 mm).
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Product Model</th>
                  <th className="py-3.5 px-4">Fit / Orientation</th>
                  <th className="py-3.5 px-4">100–499 pcs</th>
                  <th className="py-3.5 px-4">500–1,999 pcs</th>
                  <th className="py-3.5 px-4">2,000–9,999 pcs</th>
                  <th className="py-3.5 px-4 text-[#FF8A3D] font-extrabold">10,000+ pcs</th>
                  <th className="py-3.5 px-4 text-right">MOQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">Crystal Clear Vertical Holder</td>
                  <td className="py-4 px-4 text-slate-600">CR-80 Portrait (54×86mm)</td>
                  <td className="py-4 px-4 font-mono">₹4.50</td>
                  <td className="py-4 px-4 font-mono">₹3.80</td>
                  <td className="py-4 px-4 font-mono">₹3.20</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹2.65</td>
                  <td className="py-4 px-4 text-right">100 pcs</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">Crystal Clear Horizontal Holder</td>
                  <td className="py-4 px-4 text-slate-600">CR-80 Landscape (86×54mm)</td>
                  <td className="py-4 px-4 font-mono">₹4.50</td>
                  <td className="py-4 px-4 font-mono">₹3.80</td>
                  <td className="py-4 px-4 font-mono">₹3.20</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹2.65</td>
                  <td className="py-4 px-4 text-right">100 pcs</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">Frosted Slider (Thumb-Notch)</td>
                  <td className="py-4 px-4 text-slate-600">Card Slider Notch</td>
                  <td className="py-4 px-4 font-mono">₹5.20</td>
                  <td className="py-4 px-4 font-mono">₹4.40</td>
                  <td className="py-4 px-4 font-mono">₹3.75</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹3.10</td>
                  <td className="py-4 px-4 text-right">100 pcs</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">Heavy-Duty Polycarbonate Case</td>
                  <td className="py-4 px-4 text-slate-600">Armored Security Case</td>
                  <td className="py-4 px-4 font-mono">₹9.50</td>
                  <td className="py-4 px-4 font-mono">₹8.20</td>
                  <td className="py-4 px-4 font-mono">₹7.10</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹5.90</td>
                  <td className="py-4 px-4 text-right">50 pcs</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-semibold">Dual-Slot RFID + Photo Holder</td>
                  <td className="py-4 px-4 text-slate-600">Holds 2 Cards</td>
                  <td className="py-4 px-4 font-mono">₹11.00</td>
                  <td className="py-4 px-4 font-mono">₹9.50</td>
                  <td className="py-4 px-4 font-mono">₹8.20</td>
                  <td className="py-4 px-4 font-mono text-[#FF8A3D] font-bold">₹6.95</td>
                  <td className="py-4 px-4 text-right">50 pcs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Hardware & RFID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Metal Clips & Hardware */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D]" />
              Metal Lanyard Fittings & Hardware
            </h3>
            <ul className="divide-y divide-slate-100 text-sm">
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Dog Hook (360° Swivel, Nickel)</span>
                <span className="font-mono font-bold text-slate-900">₹1.08 – ₹1.85 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Oval Fish Hook (Heavy Spring)</span>
                <span className="font-mono font-bold text-slate-900">₹1.28 – ₹2.20 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Alligator Clip with Vinyl Strap</span>
                <span className="font-mono font-bold text-slate-900">₹1.20 – ₹2.10 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Safety Breakaway Buckle (16/20mm)</span>
                <span className="font-mono font-bold text-slate-900">₹0.92 – ₹1.60 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Metal Crimp Clamps (Pack of 1,000)</span>
                <span className="font-mono font-bold text-slate-900">₹265 – ₹420 / pack</span>
              </li>
            </ul>
          </div>

          {/* RFID Smart Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              RFID Smart Cards & Consumables
            </h3>
            <ul className="divide-y divide-slate-100 text-sm">
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Mifare 1K Classic ISO (13.56 MHz)</span>
                <span className="font-mono font-bold text-slate-900">₹9.80 – ₹14.50 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">EM-Marin Thin Card (125 kHz)</span>
                <span className="font-mono font-bold text-slate-900">₹7.40 – ₹11.50 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">EM-Marin Clamshell (Pre-slotted)</span>
                <span className="font-mono font-bold text-slate-900">₹8.10 – ₹12.50 / pc</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Inkjet Printable PVC Sheet (50 Sets)</span>
                <span className="font-mono font-bold text-slate-900">₹680 – ₹950 / pack</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-800">Magnetic Stripe Hi-Co Overlay</span>
                <span className="font-mono font-bold text-slate-900">₹840 – ₹1,200 / pack</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Commercial Trust & Ordering Terms */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Commercial Invoicing & Dispatch Terms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% GST ITC Invoicing
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All dispatches are accompanied by formal HSN-coded GST tax invoices under GSTIN <span className="font-mono font-bold">29AAQFT3909B1ZZ</span> for full credit pass-through.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Sample Refund Policy
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sample kits and swatch packs dispatched express. All sample courier costs are 100% deductible from your first commercial order.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Phone className="w-4 h-4 text-emerald-600" />
                Live Video Dispatch Proof
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-volume orders and machine purchases can be verified via live WhatsApp video before carton strapping and logistics handover.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <PageCta
          title="Need a Custom Contract Slab or Institution Rate?"
          whatsappText="Hi The Print Planet, I am looking for custom contract wholesale pricing on bulk printing and lanyard supplies."
        />
      </main>
    </>
  );
}
