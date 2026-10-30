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
import GoogleReviews from "@/components/GoogleReviews";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: {
    absolute: "Print Planet™ Bangalore | Specialist in PVC Cards, ID Materials & Machinery — Official Website",
  },
  description:
    "The Print Planet (theprintplanet.co.in) is India's premier specialist in PVC cards, ID card raw materials, inkjet & digital fusing sheets, card die cutters, and satin lanyard rolls. Factory-direct wholesale dispatch from Sunkadakatte, Bangalore.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Print Planet™ Bangalore | Specialist in PVC Cards, ID Materials & Machinery",
    description:
      "India's leading specialist in PVC cards, CR-80 fusing sheets, rigid ID card holders, and card manufacturing machinery. Direct B2B wholesale rates from Sunkadakatte, Bangalore.",
    url: SITE_URL,
    siteName: "Print Planet",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 600,
        alt: "The Print Planet Bangalore — Specialist in PVC Cards",
      },
      {
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "Print Planet Official Logo",
      },
    ],
  },
};

export const revalidate = 120;

export default async function HomePage() {
  const [categories, productsData, featuredProducts, machineryData, settings] = await Promise.all([
    getCategories(),
    getProducts({ page: 1, page_size: 24, ordering: "featured" }),
    getFeaturedProducts(),
    getProducts({ category: "id-card-manufacturing-machines", page_size: 8 }),
    getSiteSettings(),
  ]);

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const businessName = settings?.business_name || "THE PRINT PLANET";

  const productsList = productsData?.results || [];
  const machineryList = (machineryData?.results && machineryData.results.length > 0)
    ? machineryData.results
    : productsList.filter(
        (p) =>
          p.category?.slug === "machines" ||
          p.category?.slug === "id-card-manufacturing-machines" ||
          p.category?.slug?.includes("machine") ||
          (p as any).category?.parent_slug === "machines"
      );

  // Curate a diverse selection of flagship products across all distinct categories
  const diverseFlagships: typeof productsList = [];
  const seenCatIds = new Set<number>();

  // 1. First add any featured products
  for (const p of featuredProducts || []) {
    if (p.category && !seenCatIds.has(p.category.id)) {
      seenCatIds.add(p.category.id);
      diverseFlagships.push(p);
    }
  }

  // 2. Pick top products across all remaining categories to guarantee full category diversity
  for (const p of productsList) {
    if (p.category && !seenCatIds.has(p.category.id)) {
      seenCatIds.add(p.category.id);
      diverseFlagships.push(p);
    }
  }

  // 3. Fill up to 24 diverse products from productsList
  for (const p of productsList) {
    if (diverseFlagships.length >= 24) break;
    if (!diverseFlagships.some((d) => d.id === p.id)) {
      diverseFlagships.push(p);
    }
  }

  const safeFeatured = diverseFlagships.length > 0 ? diverseFlagships : productsList.slice(0, 18);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Product-First Industrial Hero Showcase */}
      <ProductHeroShowcase
        flagshipProducts={safeFeatured}
        allProducts={productsList}
        totalProductsCount={productsData?.count || productsList.length}
        settings={settings}
      />

      {/* 2. Direct Industrial Products Showcase with Live Category Tabs & Search */}
      <DirectProductShowcase
        initialProducts={productsList.slice(0, 16)}
        initialTotalCount={productsData?.count || productsList.length}
        categories={categories || []}
      />

      {/* 3. Industrial Operations & Trade Hub (Human-Crafted Bento Architecture) */}
      <section className="bg-[#FAFBFC] py-14 sm:py-16 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C25E1F] mb-2">
                Shop floor &amp; trade operations
              </p>
              <h2 className="text-2xl sm:text-4xl font-black text-[#17365D] tracking-tight">
                Built for high-output print studios
              </h2>
              <p className="text-xs sm:text-sm text-[#687586] mt-1.5 max-w-2xl leading-relaxed">
                Direct trade terms, physical machinery verification, and rapid consumable replenishment from our Sunkadakatte, Bengaluru facility.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Open Mon–Sat, 9:30 am – 7:30 pm</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bento Block 1 (8 Cols): Live Video Demonstration & Factory Machinery Floor */}
            <div className="lg:col-span-8 bg-[#102742] text-white rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#F0A46B]">
                    Machine verification
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sunkadakatte, Bengaluru
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Never Buy Industrial Equipment Blindly. <br />
                  <span className="text-[#F0A46B]">Inspect your machine on live WhatsApp video.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
                  Before we crate your hydraulic fusing laminator, motorized card die cutter, or lanyard heat press, our factory engineers run test cards with your exact materials on live video call. We verify cutting burr, heat uniformity, and cycle speed before you pay.
                </p>

                {/* Machine Spec Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3">
                    <div className="text-[10px] text-slate-400">Cutting speed</div>
                    <div className="text-base font-black text-white tabular-nums mt-0.5">3,500+ /hr</div>
                    <div className="text-[9px] text-slate-400">CR-80 ISO Precision</div>
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3">
                    <div className="text-[10px] text-slate-400">Die warranty</div>
                    <div className="text-base font-black text-white tabular-nums mt-0.5">1-Year Live</div>
                    <div className="text-[9px] text-slate-400">Tungsten Steel Core</div>
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3">
                    <div className="text-[10px] text-slate-400">Power input</div>
                    <div className="text-base font-black text-white tabular-nums mt-0.5">230V / 415V</div>
                    <div className="text-[9px] text-slate-400">Single or 3-Phase</div>
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3">
                    <div className="text-[10px] text-slate-400">Spares ready</div>
                    <div className="text-base font-black text-white tabular-nums mt-0.5">Same-Day</div>
                    <div className="text-[9px] text-slate-400">Dies, Relays &amp; Elements</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  Ready stock available for physical inspection in Bengaluru.
                </div>
                <a
                  href="https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20would%20like%20to%20schedule%20a%20live%20video%20demonstration%20of%20your%20ID%20card%20machinery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Book WhatsApp Live Machine Demo</span>
                </a>
              </div>
            </div>

            {/* Bento Block 2 (4 Cols): Physical Material Swatch & Sample Proofing Desk */}
            <div className="lg:col-span-4 surface-card surface-hover p-6">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-700">
                  Trade proofing desk
                </span>
                <h3 className="text-lg font-bold text-[#17365D] mt-3">
                  Physical Sample Kit for Registered Print Studios
                </h3>
                <p className="text-xs text-[#687586] mt-2 leading-relaxed">
                  Verify the satin weave density, clip spring resistance, and RFID chip read range on your own readers before placing bulk carton orders.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#263445]">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>12mm, 16mm, 20mm &amp; 25mm Satin Ribbon Cuts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Executive, Crystal &amp; Rigid PVC Card Holders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Zinc Alloy Dog Hooks &amp; Twist Wire Fittings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>125kHz &amp; 13.56MHz RFID Smart Card Samples</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Request Factory Sample Swatches</span>
                </Link>
              </div>
            </div>

            {/* Bento Block 3 (4 Cols): Local Bengaluru Pickup & Pan-India Freight */}
            <div className="lg:col-span-4 surface-card surface-hover p-6 sm:p-7">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#17365D]">
                  Same-Day Bengaluru Counter Pickup
                </h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Have an urgent ID bureau deadline today? Place your consumable order by 2:00 PM for same-day local Porter, Dunzo, or direct auto pickup at our Sunkadakatte warehouse counter.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pan-India Air &amp; Surface via VRL &amp; DTDC</span>
              </div>
            </div>

            {/* Bento Block 4 (4 Cols): Official Bill-of-Materials (BOM) Quotations */}
            <div className="lg:col-span-4 surface-card surface-hover p-6 sm:p-7">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#17365D]">
                  1-Hour Institution Quotation Desk
                </h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Bidding on a university, school, or corporate campus identity tender? WhatsApp or email your complete bill of materials for verified GST-inclusive slab quotations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Direct Sales Desk: +91 97418 08034</span>
              </div>
            </div>

            {/* Bento Block 5 (4 Cols): GST & Input Tax Credit Guarantee */}
            <div className="lg:col-span-4 surface-card surface-hover p-6 sm:p-7">
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#17365D]">
                  100% Tax Compliant (GST: 29AAQFT3909B1ZZ)
                </h3>
                <p className="text-xs text-[#687586] mt-1.5 leading-relaxed">
                  Every consignment ships with a formal GST tax invoice and valid e-Way bill on official company letterhead, ensuring complete Input Tax Credit (ITC) pass-through.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <span>Verified Business • Bengaluru Urban 560091</span>
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
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C25E1F] block mb-2">
                Machinery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
                Card cutting, fusing, punching &amp; heat press
              </h2>
              <p className="text-xs sm:text-sm text-[#687586] mt-1.5 leading-relaxed">
                Heavy-duty machines engineered for commercial print shops and industrial ID manufacturers.
                Full warranty, spare dies, and video support.
              </p>
            </div>
            <Link
              href="/categories/machines"
              className="text-xs font-medium text-slate-500 hover:text-[#17365D] flex items-center gap-1 shrink-0"
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

      {/* 5. India's Specialist in PVC Cards & Raw Materials */}
      <section className="bg-white py-14 sm:py-16 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C25E1F] mb-2">
              Manufacturing
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-[#17365D] tracking-tight">
              Direct specialist in PVC cards &amp; ID materials
            </h2>
            <p className="text-xs sm:text-sm text-[#4E6178] mt-2 leading-relaxed">
              From CR-80 ISO inkjet fusing sheets to coated magnetic overlays, semi-transparent card cases, and hydraulic motorized die cutters, <strong>The Print Planet</strong> is Bangalore&apos;s trusted factory specialist for commercial ID bureau production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="surface-card surface-hover p-6 space-y-3">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                01
              </div>
              <h3 className="font-black text-lg text-[#17365D]">
                PVC Core Sheets &amp; Inkjet Fusing Media
              </h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Optical-white 0.15mm + 0.46mm + 0.15mm standard 3-layer sandwich sheets engineered for vibrant high-DPI inkjet and digital press fusing with zero card delamination.
              </p>
              <Link
                href="/products?search=fusing"
                className="text-xs font-medium text-[#C25E1F] hover:text-[#a94d15] inline-flex items-center gap-1 pt-1"
              >
                <span>Browse Fusing Media &rarr;</span>
              </Link>
            </div>

            <div className="surface-card surface-hover p-6 space-y-3">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                02
              </div>
              <h3 className="font-black text-lg text-[#17365D]">
                Coated Overlay &amp; Magnetic Stripe Films
              </h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Scratch-resistant coated overlay films formulated for thermal roll lamination with durable peel resistance, UV protection, and clean burr-free edge punching.
              </p>
              <Link
                href="/products?search=overlay"
                className="text-xs font-medium text-[#C25E1F] hover:text-[#a94d15] inline-flex items-center gap-1 pt-1"
              >
                <span>Explore Coated Overlays &rarr;</span>
              </Link>
            </div>

            <div className="surface-card surface-hover p-6 space-y-3">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                03
              </div>
              <h3 className="font-black text-lg text-[#17365D]">
                Rigid Holders, Reels &amp; RFID Smart Badges
              </h3>
              <p className="text-xs text-[#687586] leading-relaxed">
                Vertical and horizontal crystal-clear PVC card cases, heavy-duty badge reels, and 125kHz / 13.56MHz RFID cards calibrated for enterprise access security.
              </p>
              <Link
                href="/products?search=holder"
                className="text-xs font-medium text-[#C25E1F] hover:text-[#a94d15] inline-flex items-center gap-1 pt-1"
              >
                <span>View Card Accessories &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Custom Requirements & Bulk Order Callout */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-[#102742] rounded-2xl text-white p-6 sm:p-10 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#F0A46B]">
                Custom production &amp; contract manufacturing
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
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 sm:py-3 rounded-lg font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Custom Quotation</span>
                </Link>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/15 px-5 py-2.5 sm:py-3 rounded-lg font-medium text-xs transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Sales Support: {phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/[0.04] p-5 sm:p-6 rounded-xl border border-white/10 text-xs space-y-2.5 sm:space-y-3">
              <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">
                Wholesale Assurance
              </h3>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Verified raw materials & high tensile strength</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Uniform roll winding & precision cutting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Heavy-duty export corrugated & crated packing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Pan-India and international logistics network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5. Verified Google Customer Reviews with Indian B2B Bureaus */}
      <GoogleReviews />

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
                  "name": "Why is The Print Planet recognized as Bangalore's specialist in PVC cards?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Print Planet is India's verified manufacturing specialist in PVC cards, supplying the complete production chain: printable PVC core fusing sheets, coated overlay films, ISO CR-80 card die cutting machinery, rigid PVC holders, and RFID access badges with direct wholesale rates and same-day dispatch from Sunkadakatte, Bangalore."
                  }
                },
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

        <div className="surface-card rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C25E1F]">
              Buyer questions
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#17365D]">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[#4E6178]">
              Everything you need to know about purchasing wholesale ID card supplies from The Print Planet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-5 rounded-xl border border-[#EEF2F7] space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                Why is The Print Planet India&apos;s specialist in PVC cards?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                We are a direct factory manufacturer supplying the entire PVC card supply chain: CR-80 inkjet fusing sheets, coated magnetic overlay rolls, motorized card die cutters, crystal-clear badge holders, and RFID proximity cards.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEF2F7] space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                What products does The Print Planet manufacture?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                We manufacture and supply satin lanyard rolls, vertical/horizontal PVC ID card holders, lanyard metal hooks, RFID cards, and industrial ID card cutting and fusing machines.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEF2F7] space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                How do I order or get bulk wholesale rates?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                Simply click &quot;Request Quote&quot; on any product page, use our online quotation portal, or contact our sales desk directly at +91 97418 08034 for fast 1-hour pricing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEF2F7] space-y-2">
              <h3 className="font-bold text-sm text-[#17365D]">
                Does The Print Planet deliver across India?
              </h3>
              <p className="text-xs text-[#4E6178] leading-relaxed">
                Yes, we provide nationwide door delivery across all Indian cities and industrial hubs via DTDC, Blue Dart, VRL Logistics, and TCI with real-time dispatch tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEF2F7] space-y-2">
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
