import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import ProductHeroShowcase from "@/components/ProductHeroShowcase";
import PrintRegisterSection from "@/components/planet/PrintRegisterSection";
import BuyingFacts from "@/components/BuyingFacts";
import DirectProductShowcase from "@/components/DirectProductShowcase";
import GoogleReviews from "@/components/GoogleReviews";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import BulkInkBand from "@/components/home/BulkInkBand";
import Marquee from "@/components/home/Marquee";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import HowItWorks from "@/components/home/HowItWorks";
import StatsStrip from "@/components/home/StatsStrip";

const PRODUCT_WORDS = ["PVC cards", "Satin lanyards", "ID card holders", "RFID cards", "Badge reels", "Card machines"];
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: {
    absolute: "The Print Planet Bangalore | PVC Cards, Satin Lanyards & ID Card Machines Wholesale",
  },
  description:
    "The Print Planet, Bangalore: direct manufacturer of PVC cards, satin lanyard rolls, ID card holders, RFID cards and ID card machines. 24 to 48h pan-India dispatch.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "The Print Planet Bangalore | PVC Cards, Satin Lanyards & ID Card Machines Wholesale",
    description:
      "India's leading factory direct specialist in PVC cards, CR-80 fusing sheets, rigid ID card holders, and card manufacturing machinery. Direct B2B wholesale rates from Sunkadakatte, Bangalore.",
    url: SITE_URL,
    siteName: "The Print Planet",
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
    question: "What products and machinery does The Print Planet manufacture and supply?",
    answer:
      "The Print Planet is India's direct factory manufacturer of virgin polyester satin lanyard rolls (12mm–25mm), rigid PVC ID card holders, dog hooks and crocodile clips, RFID 13.56MHz Mifare and 125kHz EM-Marin smart cards, CR-80 PVC core fusing sheets, motorized electric card die cutters, and dual-plate heating laminators.",
  },
  {
    question: "What is a standard CR-80 PVC ID card size in mm and inches?",
    answer:
      "A standard ISO CR-80 ID card measures exactly 85.60 mm × 53.98 mm (3.375 × 2.125 inches) with a 30 mil (0.76 mm) thickness and 3.18 mm rounded corners—identical to a bank ATM card or driving license. The Print Planet manufactures fusing sheets, pre-cut PVC cards, and die cutters strictly conforming to this ISO/IEC 7810 standard.",
  },
  {
    question: "What machines are needed to start a commercial PVC ID card manufacturing business?",
    answer:
      "To manufacture laminated PVC ID cards commercially, you need two core machines: an automatic heated PVC fusing laminator (to bond printed core sheets with front and back overlay films under 135°C–155°C heat and hydraulic pressure) and a motorized PVC card die cutter (to punch out finished CR-80 cards at up to 1,200 cards/hour). Both machines are ready in stock at our Bangalore facility with 1-year warranty and WhatsApp live video testing.",
  },
  {
    question: "Which satin ribbon roll is best for sublimation lanyard heat-transfer printing?",
    answer:
      "White Digital Sublimation Lanyard Rolls woven from 100% continuous-filament virgin polyester with a calendar-pressed smooth surface. They withstand 200°C–215°C heat press exposure without melting or shrinking, delivering deep ink absorption, photographic resolution, and Pantone hexachrome color fidelity in 12mm, 16mm, 20mm, and 25mm widths.",
  },
  {
    question: "What is the difference between Mifare 1K smart cards and EM-Marin proximity cards?",
    answer:
      "Mifare 1K operates at 13.56 MHz high frequency with 1KB EEPROM read/write memory organized into 16 secure sectors with dual encryption keys, making it suitable for multi-application campus IDs, cashless payments, and secure access. EM-Marin operates at 125 kHz low frequency with a 64-bit factory pre-programmed read-only ID, primarily used for basic building entry turnstiles.",
  },
  {
    question: "Where is The Print Planet located and can I inspect machinery before purchase?",
    answer:
      "Our central manufacturing and warehousing facility is located at No. 33, 34, Srigandhadakaval, Sunkadakatte, Bangalore - 560091, Karnataka. Commercial buyers can visit in person or request a live WhatsApp video inspection (+91 97418 08034) to test motorized die-cutters and fusing machines live before crating and dispatch.",
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
  {
    question: "Can you print custom multicolour lanyards with corporate logos?",
    answer:
      "Yes. We operate industrial heat-transfer sublimation and rotary screen printing lines in 12mm, 16mm, 20mm, and 25mm widths with accurate Pantone hexachrome color reproduction and safety breakaway fittings.",
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

      {/* Live numbers and service badges, overlapping the hero edge */}
      <StatsStrip productCount={productsData?.count || productsList.length} />

      {/* Product words run with the scroll */}
      <Marquee items={PRODUCT_WORDS} label="What we make" className="text-[#121418] mt-6" />

      {/* Product families: one print ink each, circle-wipe between them */}
      <CategoryShowcase />

      {/* 2. Direct Catalogue & Best Sellers with Category Tabs */}
      <DirectProductShowcase
        initialProducts={productsList.slice(0, 16)}
        initialTotalCount={productsData?.count || productsList.length}
        categories={categories || []}
      />

      {/* Three.js: CMYK plates pull into register as you scroll */}
      <PrintRegisterSection />

      {/* Machines */}
      <section aria-labelledby="machines-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 id="machines-heading" className="text-3xl sm:text-4xl font-extrabold text-[#121418] tracking-tight">
            Card and lanyard machines
          </h2>
          <Link
            href="/categories/machines"
            className="shrink-0 text-sm font-semibold text-[#2B323B] hover:underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
          {machineryList.slice(0, 4).map((machine) => (
            <ProductCard key={machine.id} product={machine} />
          ))}
        </div>
      </section>

      {/* Quote, proof, print, dispatch */}
      <HowItWorks />

      {/* Bulk orders: ink band that opens with a circle wipe */}
      <BulkInkBand whatsapp={settings?.whatsapp} />

      {/* Why buy here, in four facts */}
      <BuyingFacts />

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
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121418]">
              Common questions
            </h2>
          </div>

          <FaqAccordion items={FAQS} />
        </div>
      </section>
    </div>
  );
}
