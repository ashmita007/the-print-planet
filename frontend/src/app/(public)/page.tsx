import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  CheckCircle,
  Package,
  Clock,
  Phone,
  FileText,
  CheckCircle2,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductHeroShowcase from "@/components/ProductHeroShowcase";
import DirectProductShowcase from "@/components/DirectProductShowcase";
import MarqueeTicker from "@/components/animations/MarqueeTicker";
import HowItWorks from "@/components/HowItWorks";
import CorporateAndWhyChooseUs from "@/components/CorporateAndWhyChooseUs";
import GoogleReviews from "@/components/GoogleReviews";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
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

// One source for the visible accordion and the FAQPage schema, which must match.
const FAQS: FaqItem[] = [
  {
    question: "Why is The Print Planet recognized as Bangalore's specialist in PVC cards?",
    answer:
      "The Print Planet is India's verified manufacturing specialist in PVC cards, supplying the complete production chain: printable PVC core fusing sheets, coated overlay films, ISO CR-80 card die cutting machinery, rigid PVC holders, and RFID access badges with direct wholesale rates and same-day dispatch from Sunkadakatte, Bangalore.",
  },
  {
    question: "What products does The Print Planet manufacture and supply wholesale?",
    answer:
      "The Print Planet (theprintplanet.co.in) is India's leading B2B wholesale manufacturer of premium satin lanyard rolls, rigid PVC ID card holders, dog hooks, alligator clips, RFID smart access cards, and card manufacturing machinery including ID card die cutters and fusing machines.",
  },
  {
    question: "How can I purchase or request a quotation from The Print Planet?",
    answer:
      "You can select any product from our online catalogue at theprintplanet.co.in, click 'Request Quotation', or directly connect with our sales engineers via WhatsApp or phone at +91 97418 08034 for immediate price quotes within 1 working hour.",
  },
  {
    question: "Does The Print Planet deliver wholesale orders across India?",
    answer:
      "Yes, The Print Planet ships pan-India to all states and union territories using reliable logistics partners like DTDC, Blue Dart, VRL, and TCI with moisture-proof export packaging and live tracking.",
  },
  {
    question: "Do you provide formal GST invoices for businesses?",
    answer:
      "Yes, 100% of wholesale transactions are accompanied by official GST tax invoices for input tax credit (ITC) and full corporate tax compliance.",
  },
  {
    question: "Can I get custom-printed lanyards with company branding?",
    answer:
      "Yes, we specialize in custom satin sublimation printing, screen printing, and heat transfer ribbons in 12mm, 16mm, 20mm, and 25mm with exact Pantone color matching.",
  },
];

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
    <div className="pb-16">
      {/* 1. Hero Section */}
      <ProductHeroShowcase
        flagshipProducts={safeFeatured}
        allProducts={productsList}
        totalProductsCount={productsData?.count || productsList.length}
        settings={settings}
      />

      {/* Kinetic Infinite Capabilities Marquee */}
      <MarqueeTicker />

      {/* 2. Direct Catalogue & Best Sellers with Category Tabs */}
      <DirectProductShowcase
        initialProducts={productsList.slice(0, 16)}
        initialTotalCount={productsData?.count || productsList.length}
        categories={categories || []}
      />

      {/* 4. Why Choose Us & Corporate Solutions */}
      <CorporateAndWhyChooseUs />

      {/* 5. How It Works (5-Step Production Pipeline) */}
      <HowItWorks />

      {/* 3. Industrial Operations & Trade Hub (Human-Crafted Bento Architecture) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
                Built for high-output print studios
              </h2>
              <p className="text-xs sm:text-sm text-[#566373] mt-1.5 max-w-2xl leading-relaxed">
                Direct trade terms, physical machinery verification, and rapid consumable replenishment from our Sunkadakatte, Bengaluru facility.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#566373]">
              <span>Open Mon–Sat, 9:30 am – 7:30 pm</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bento Block 1 (8 Cols): Live Video Demonstration & Factory Machinery Floor */}
            <div className="lg:col-span-8 bg-[#0E2238] text-white rounded-lg p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Never Buy Industrial Equipment Blindly. <br />
                  <span className="text-[#F4A36B]">Inspect your machine on live WhatsApp video.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
                  Before we crate your hydraulic fusing laminator, motorized card die cutter, or lanyard heat press, our factory engineers run test cards with your exact materials on live video call. We verify cutting burr, heat uniformity, and cycle speed before you pay.
                </p>

                {/* Machine Spec Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="border-t border-white/15 pt-2.5">
                    <div className="text-[10px] text-slate-400">Cutting speed</div>
                    <div data-count className="text-base font-extrabold text-white tabular-nums mt-0.5">3,500+ /hr</div>
                    <div className="text-[9px] text-slate-400">CR-80 ISO Precision</div>
                  </div>
                  <div className="border-t border-white/15 pt-2.5">
                    <div className="text-[10px] text-slate-400">Die warranty</div>
                    <div className="text-base font-extrabold text-white tabular-nums mt-0.5">1-Year Live</div>
                    <div className="text-[9px] text-slate-400">Tungsten Steel Core</div>
                  </div>
                  <div className="border-t border-white/15 pt-2.5">
                    <div className="text-[10px] text-slate-400">Power input</div>
                    <div className="text-base font-extrabold text-white tabular-nums mt-0.5">230V / 415V</div>
                    <div className="text-[9px] text-slate-400">Single or 3-Phase</div>
                  </div>
                  <div className="border-t border-white/15 pt-2.5">
                    <div className="text-[10px] text-slate-400">Spares ready</div>
                    <div className="text-base font-extrabold text-white tabular-nums mt-0.5">Same-Day</div>
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
                  className="bg-[#D9601A] hover:bg-[#B94E12] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Book WhatsApp Live Machine Demo</span>
                </a>
              </div>
            </div>

            {/* Bento Block 2 (4 Cols): Physical Material Swatch & Sample Proofing Desk */}
            <div className="lg:col-span-4 surface-card surface-hover p-6">
              <div>
                <h3 className="text-lg font-bold text-[#16324F]">
                  Physical Sample Kit for Registered Print Studios
                </h3>
                <p className="text-xs text-[#566373] mt-2 leading-relaxed">
                  Verify the satin weave density, clip spring resistance, and RFID chip read range on your own readers before placing bulk carton orders.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#1C2733]">
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
                  className="w-full bg-[#D9601A] hover:bg-[#B94E12] text-white py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Request Factory Sample Swatches</span>
                </Link>
              </div>
            </div>

            {/* Bento Block 3 (4 Cols): Local Bengaluru Pickup & Pan-India Freight */}
            <div className="lg:col-span-4 surface-card surface-hover p-6 sm:p-7">
              <div>
                <h3 className="font-bold text-base text-[#16324F]">
                  Same-Day Bengaluru Counter Pickup
                </h3>
                <p className="text-xs text-[#566373] mt-1.5 leading-relaxed">
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
                <h3 className="font-bold text-base text-[#16324F]">
                  1-Hour Institution Quotation Desk
                </h3>
                <p className="text-xs text-[#566373] mt-1.5 leading-relaxed">
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
                <h3 className="font-bold text-base text-[#16324F]">
                  100% Tax Compliant (GST: 29AAQFT3909B1ZZ)
                </h3>
                <p className="text-xs text-[#566373] mt-1.5 leading-relaxed">
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
                Card cutting, fusing, punching &amp; heat press
              </h2>
              <p className="text-xs sm:text-sm text-[#566373] mt-1.5 leading-relaxed">
                Heavy-duty machines engineered for commercial print shops and industrial ID manufacturers.
                Full warranty, spare dies, and video support.
              </p>
            </div>
            <Link
              href="/categories/machines"
              className="text-xs font-medium text-slate-500 hover:text-[#16324F] flex items-center gap-1 shrink-0"
            >
              <span>Explore All Machinery ({machineryData?.count || machineryList.length}) &rarr;</span>
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
      <section className="bg-white py-14 sm:py-16 border-t border-[#D8DEE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
              Direct specialist in PVC cards &amp; ID materials
            </h2>
            <p className="text-xs sm:text-sm text-[#475565] mt-2 leading-relaxed">
              From CR-80 ISO inkjet fusing sheets to coated magnetic overlays, semi-transparent card cases, and hydraulic motorized die cutters, <strong>The Print Planet</strong> is Bangalore&apos;s trusted factory specialist for commercial ID bureau production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t-2 border-[#16324F] pt-4 space-y-2">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                01
              </div>
              <h3 className="font-extrabold text-lg text-[#16324F]">
                PVC Core Sheets &amp; Inkjet Fusing Media
              </h3>
              <p className="text-xs text-[#566373] leading-relaxed">
                Optical-white 0.15mm + 0.46mm + 0.15mm standard 3-layer sandwich sheets engineered for vibrant high-DPI inkjet and digital press fusing with zero card delamination.
              </p>
              <Link
                href="/products?search=fusing"
                className="text-xs font-medium text-[#B94E12] hover:text-[#A84510] inline-flex items-center gap-1 pt-1"
              >
                <span>Browse Fusing Media &rarr;</span>
              </Link>
            </div>

            <div className="border-t-2 border-[#16324F] pt-4 space-y-2">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                02
              </div>
              <h3 className="font-extrabold text-lg text-[#16324F]">
                Coated Overlay &amp; Magnetic Stripe Films
              </h3>
              <p className="text-xs text-[#566373] leading-relaxed">
                Scratch-resistant coated overlay films formulated for thermal roll lamination with durable peel resistance, UV protection, and clean burr-free edge punching.
              </p>
              <Link
                href="/products?search=overlay"
                className="text-xs font-medium text-[#B94E12] hover:text-[#A84510] inline-flex items-center gap-1 pt-1"
              >
                <span>Explore Coated Overlays &rarr;</span>
              </Link>
            </div>

            <div className="border-t-2 border-[#16324F] pt-4 space-y-2">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
                03
              </div>
              <h3 className="font-extrabold text-lg text-[#16324F]">
                Rigid Holders, Reels &amp; RFID Smart Badges
              </h3>
              <p className="text-xs text-[#566373] leading-relaxed">
                Vertical and horizontal crystal-clear PVC card cases, heavy-duty badge reels, and 125kHz / 13.56MHz RFID cards calibrated for enterprise access security.
              </p>
              <Link
                href="/products?search=holder"
                className="text-xs font-medium text-[#B94E12] hover:text-[#A84510] inline-flex items-center gap-1 pt-1"
              >
                <span>View Card Accessories &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Custom Requirements & Bulk Order Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div data-reveal className="relative overflow-hidden bg-[#0E2238] rounded-lg text-white p-6 sm:p-10 border border-white/10">
                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
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
                  className="bg-[#D9601A] hover:bg-[#B94E12] text-white px-5 py-2.5 sm:py-3 rounded-lg font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
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

            <div className="lg:col-span-4 bg-white/[0.04] p-5 sm:p-6 rounded-md border border-white/10 text-xs space-y-2.5 sm:space-y-3">
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
              "mainEntity": FAQS.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
              })),
            }),
          }}
        />

        <div className="space-y-8">
          <div className="max-w-3xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#16324F]">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[#475565]">
              Everything you need to know about purchasing wholesale ID card supplies from The Print Planet.
            </p>
          </div>

          <FaqAccordion items={FAQS} />
        </div>
      </section>
    </div>
  );
}
