import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  CheckCircle,
  Truck,
  Award,
  Factory,
  Package,
  Clock,
  ShieldCheck,
  Sparkles,
  Phone,
  ArrowRight,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductHeroShowcase from "@/components/ProductHeroShowcase";
import DirectProductShowcase from "@/components/DirectProductShowcase";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: {
    absolute: "Print Planet — The Print Planet™ | Wholesale ID Card Solutions & Lanyards India",
  },
  description:
    "Official website of The Print Planet (theprintplanet.co.in). India's leading B2B factory manufacturer and wholesale supplier of satin lanyard rolls, PVC ID card holders, dog hooks, RFID smart cards, and card cutting machinery with pan-India dispatch.",
  alternates: {
    canonical: SITE_URL,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [categories, productsData, featuredProducts, settings] = await Promise.all([
    getCategories(),
    getProducts({ page_size: 200 }),
    getFeaturedProducts(),
    getSiteSettings(),
  ]);

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const businessName = settings?.business_name || "THE PRINT PLANET";

  const productsList = productsData?.results || [];
  const machineryList = productsList.filter(
    (p) =>
      p.category?.slug === "machines" ||
      p.category?.slug === "id-card-manufacturing-machines" ||
      p.category?.slug?.includes("machine") ||
      (p as any).category?.parent_slug === "machines"
  );
  const safeFeatured = featuredProducts?.length > 0 ? featuredProducts : productsList.slice(0, 6);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Product-First Industrial Hero Showcase */}
      <ProductHeroShowcase
        flagshipProducts={safeFeatured}
        totalProductsCount={productsData?.count || productsList.length}
      />

      {/* 2. Direct Industrial Products Showcase with Live Category Tabs & Search */}
      <DirectProductShowcase
        products={productsList}
        categories={categories || []}
      />

      {/* 3. How It Works: 5-Step B2B Procurement & Fulfillment Workflow */}
      <section className="bg-gradient-to-b from-white to-[#F8FAFC] py-16 border-y border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E87832] bg-[#E87832]/10 px-3 py-1 rounded-full">
              Fulfillment Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight mt-2.5">
              How B2B Ordering Works
            </h2>
            <p className="text-xs sm:text-sm text-[#687586] mt-2">
              From requirement enquiry to pan-India delivery in 5 simple steps. Most standard orders dispatched within 24–48 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCE3EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#17365D] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#17365D] font-black text-sm flex items-center justify-center mb-3 group-hover:bg-[#17365D] group-hover:text-white transition-colors">
                  01
                </div>
                <h3 className="font-bold text-[#17365D] text-sm">Pick Equipment or Material</h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Select fusing machines, cutters, lanyard printers, PVC core sheets, coated overlay, clips, or RFID cards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-[#17365D]">
                <span>180+ Active SKUs</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCE3EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#17365D] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#17365D] font-black text-sm flex items-center justify-center mb-3 group-hover:bg-[#17365D] group-hover:text-white transition-colors">
                  02
                </div>
                <h3 className="font-bold text-[#17365D] text-sm">Request Factory Quote</h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Send SKU & quantity. Our sales desk replies within 1 working hour with GST-inclusive wholesale rates.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-[#E87832]">
                <span>1-Hour Response Desk</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCE3EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#17365D] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#17365D] font-black text-sm flex items-center justify-center mb-3 group-hover:bg-[#17365D] group-hover:text-white transition-colors">
                  03
                </div>
                <h3 className="font-bold text-[#17365D] text-sm">Video Demo & Swatches</h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  For machinery: live video demonstration & speed verification. For materials: physical sample proofing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-[#217A4B]">
                <span>Zero Risk Verification</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCE3EB] shadow-2xs relative flex flex-col justify-between group hover:border-[#17365D] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#17365D] font-black text-sm flex items-center justify-center mb-3 group-hover:bg-[#17365D] group-hover:text-white transition-colors">
                  04
                </div>
                <h3 className="font-bold text-[#17365D] text-sm">Confirm & Pay via GST</h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Pay securely via NEFT / RTGS / UPI with formal proforma invoice on official company letterhead.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-[#17365D]">
                <span>100% Tax Compliant</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#17365D] text-white p-5 rounded-2xl border border-[#17365D] shadow-md relative flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white font-black text-sm flex items-center justify-center mb-3">
                  05
                </div>
                <h3 className="font-bold text-white text-sm">24–48h Dispatch</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Moisture-proof sealed or wooden crated. Shipped via DTDC, Blue Dart, VRL, TCI with live tracking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-[11px] font-semibold text-[#E87832]">
                <span>Pan-India Door Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Industrial Machinery & Equipment Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E87832] block mb-1">
                Industrial Card Machinery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
                ID Card Cutting, Fusing, Punching & Heat Press
              </h2>
              <p className="text-xs sm:text-sm text-[#687586] mt-1.5 leading-relaxed">
                Heavy-duty machines engineered for commercial print shops and industrial ID manufacturers.
                Full warranty, spare dies, and video support.
              </p>
            </div>
            <Link
              href="/categories/machines"
              className="text-xs font-bold text-[#17365D] hover:text-[#E87832] flex items-center gap-1 shrink-0"
            >
              <span>Explore All Machinery ({machineryList.length}) &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {machineryList.slice(0, 8).map((machine) => (
              <ProductCard key={machine.id} product={machine} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose The Print Planet: 6 Manufacturer Credentials */}
      <section className="bg-[#F5F7FA] py-16 border-y border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E87832] bg-[#E87832]/10 px-3 py-1 rounded-full">
              Trust & Credentials
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight mt-2.5">
              Why Partner with The Print Planet
            </h2>
            <p className="text-xs sm:text-sm text-[#687586] mt-2">
              Manufacturer credentials, comprehensive machinery range, in-house consumables, and pan-India express dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#17365D]/10 text-[#17365D] flex items-center justify-center font-bold">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">Direct Factory Pricing</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Direct wholesale rates with zero middleman markups. Every order backed by transparent bulk tier discounting.
              </p>
            </div>

            {/* 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#217A4B] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">GST & Tax Compliant</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                GSTIN verified business. Instant official GST proforma and tax invoices provided on company letterhead for all orders.
              </p>
            </div>

            {/* 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">Full Machinery Lineup</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                From manual desktop card punchers to ₹28 Lakh fully-automatic multi-daylight hydraulic card laminators for any production volume.
              </p>
            </div>

            {/* 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">Complete In-House Consumables</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                PVC sheets, coated overlay, frosted steel lamination plates, RFID/NFC cards, satin ribbon rolls, and hardware clips in one place.
              </p>
            </div>

            {/* 5 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">500+ Customers Pan-India</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Trusted by ID card bureaus, universities, government departments, RFID resellers, and export buyers across all Indian states.
              </p>
            </div>

            {/* 6 */}
            <div className="bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E87832] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17365D]">Fast 1-Hour Response Desk</h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Sales engineers reply to WhatsApp & portal quotation enquiries within 1 working hour with technical specifications and pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Custom Requirements & Bulk Order Callout */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-[#17365D] rounded-xl sm:rounded-2xl text-white p-5 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <span className="bg-[#E87832] text-white text-[10px] sm:text-[11px] font-bold uppercase px-2.5 py-1 rounded">
                Custom Production & Contract Manufacturing
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Require Custom Dimensions, Pantone Matching, or Machine Sourcing?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                We manufacture customized polyester ribbons in 12mm, 16mm, 20mm, and 25mm, custom PVC card thicknesses,
                RFID encoding, and supply complete industrial turn-key ID card factory setups.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 pt-2">
                <Link
                  href="/quote"
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm text-center flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Custom Quotation</span>
                </Link>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Sales Support: {phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#102742] p-4 sm:p-6 rounded-xl border border-white/10 text-xs space-y-2.5 sm:space-y-3">
              <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">
                Wholesale Assurance
              </h3>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Verified raw materials & high tensile strength</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Uniform roll winding & precision cutting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Heavy-duty export corrugated & crated packing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span>Pan-India and international logistics network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) Section - High Search Intent & Buyer Assurance */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What products does The Print Planet manufacture and supply wholesale?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Print Planet (theprintplanet.co.in) is India's leading B2B wholesale manufacturer of premium satin lanyard rolls, rigid PVC ID card holders, dog hooks, alligator clips, RFID smart access cards, and card manufacturing machinery including ID card die cutters and fusing machines."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I purchase or request a quotation from The Print Planet?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can select any product from our online catalogue at theprintplanet.co.in, click 'Request Quotation', or directly connect with our sales engineers via WhatsApp or phone at +91 97418 08034 for immediate price quotes within 1 working hour."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does The Print Planet deliver wholesale orders across India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, The Print Planet ships pan-India to all states and union territories using reliable logistics partners like DTDC, Blue Dart, VRL, and TCI with moisture-proof export packaging and live tracking."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you provide formal GST invoices for businesses?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, 100% of wholesale transactions are accompanied by official GST tax invoices for input tax credit (ITC) and full corporate tax compliance."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I get custom-printed lanyards with company branding?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we specialize in custom satin sublimation printing, screen printing, and heat transfer ribbons in 12mm, 16mm, 20mm, and 25mm with exact Pantone color matching."
                  }
                }
              ]
            }),
          }}
        />

        <div className="bg-[#F8FAFC] border border-[#DCE3EB] rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E87832] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Buyer Questions &amp; Support
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#17365D]">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-[#4E6178]">
              Everything you need to know about purchasing wholesale ID card supplies from The Print Planet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                What products does The Print Planet manufacture?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                We manufacture and supply satin lanyard rolls, vertical/horizontal PVC ID card holders, lanyard metal hooks, RFID cards, and industrial ID card cutting and fusing machines.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                How do I order or get bulk wholesale rates?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                Simply click &quot;Request Quote&quot; on any product page, use our online quotation portal, or contact our sales desk directly at +91 97418 08034 for fast 1-hour pricing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                Does The Print Planet deliver across India?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                Yes, we provide nationwide door delivery across all Indian cities and industrial hubs via DTDC, Blue Dart, VRL Logistics, and TCI with real-time dispatch tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                Are GST tax invoices provided?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                Yes, every wholesale consignment is billed with a 100% tax-compliant GST invoice on company letterhead so your business can claim full Input Tax Credit (ITC).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
