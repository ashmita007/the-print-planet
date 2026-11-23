import React from "react";
import { Metadata } from "next";
import ProductHeroShowcase from "@/components/product/ProductHeroShowcase";
import PrintRegisterSection from "@/components/planet/PrintRegisterSection";
import BuyingFacts from "@/components/BuyingFacts";
import DirectProductShowcase from "@/components/DirectProductShowcase";
import GoogleReviews from "@/components/GoogleReviews";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import BulkInkBand from "@/components/home/BulkInkBand";
import Marquee from "@/components/home/Marquee";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import HowItWorks from "@/components/home/HowItWorks";
import WordHighlight from "@/components/animations/WordHighlight";
import StatsStrip from "@/components/home/StatsStrip";

const PRODUCT_WORDS = ["PVC cards", "Satin lanyards", "ID card holders", "RFID cards", "Badge reels"];
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSiteSettings,
} from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: {
    absolute: "PVC Cards Wholesale Supplier Bangalore | The Print Planet",
  },
  description:
    "Wholesale PVC cards, RFID cards, dragon sheets, satin lanyards and ID card holders from Bengaluru. GST invoice and pan-India dispatch.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "PVC Cards Wholesale Supplier Bangalore | The Print Planet",
    description:
      "India's leading factory direct specialist in PVC cards, CR-80 blank cards and rigid ID card holders. Direct B2B wholesale rates from Sunkadakatte, Bangalore.",
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
    question: "What products does The Print Planet manufacture and supply?",
    answer:
      "The Print Planet is a Bengaluru wholesale supplier of satin lanyards, rigid PVC ID card holders, RFID 13.56MHz Mifare and 125kHz EM-Marin smart cards, and CR-80 PVC cards.",
  },
  {
    question: "What is a standard CR-80 PVC ID card size in mm and inches?",
    answer:
      "A standard ISO CR-80 ID card measures exactly 85.60 mm × 53.98 mm (3.375 × 2.125 inches) with a 30 mil (0.76 mm) thickness and 3.18 mm rounded corners—identical to a bank ATM card or driving license. The Print Planet manufactures pre-cut PVC cards strictly conforming to this ISO/IEC 7810 standard.",
  },
  {
    question: "What is the difference between Mifare 1K smart cards and EM-Marin proximity cards?",
    answer:
      "Mifare 1K operates at 13.56 MHz high frequency with 1KB EEPROM read/write memory organized into 16 secure sectors with dual encryption keys, making it suitable for multi-application campus IDs, cashless payments, and secure access. EM-Marin operates at 125 kHz low frequency with a 64-bit factory pre-programmed read-only ID, primarily used for basic building entry turnstiles.",
  },
  {
    question: "Where is The Print Planet located and can I visit before purchase?",
    answer:
      "Our central manufacturing and warehousing facility is located at No. 33, 34, Srigandhadakaval, Sunkadakatte, Bangalore - 560091, Karnataka. Commercial buyers can visit in person or message us on WhatsApp (+91 97418 08034) to see products before dispatch.",
  },
  {
    question: "What is the minimum order quantity (MOQ) and pricing for wholesale orders?",
    answer:
      "Consumables start with flexible minimums: 100 pieces for PVC card holders. Bulk factory slabs start from ₹2.65/piece for holders. Detailed quantity breaks are published in our open machine-readable tariff at /pricing.md.",
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
      "Yes. We print custom lanyards with your logo and fit safety breakaway fittings.",
  },
];

export default async function HomePage() {
  const [categories, productsData, featuredProducts, settings] = await Promise.all([
    getCategories(),
    getProducts({ page: 1, page_size: 24, ordering: "featured" }),
    getFeaturedProducts(),
    getSiteSettings(),
  ]);

  const productsList = productsData?.results || [];
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

      {/* Product words */}
      <Marquee items={PRODUCT_WORDS} label="What we make" className="text-[#121418] mt-6" />

      {/* Product families */}
      <CategoryShowcase />

      {/* 2. Direct Catalogue & Best Sellers with Category Tabs */}
      <DirectProductShowcase
        initialProducts={productsList.slice(0, 16)}
        initialTotalCount={productsData?.count || productsList.length}
        categories={categories || []}
      />

      {/* Three.js: the four ink plates, shown in register */}
      <PrintRegisterSection />

      {/* Quote, proof, print, dispatch */}
      <HowItWorks />

      {/* The page's one scroll moment: this statement lights up word by word as it crosses the screen */}
      <section data-moment="word-highlight" aria-labelledby="statement-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 id="statement-heading" className="eyebrow text-[#C2410C] mb-5">What you get</h2>
        <WordHighlight
          text="We make and supply PVC cards, satin lanyards and ID card holders from our own unit in Bengaluru. Every order ships with a GST invoice, custom work gets a free digital proof first, and dispatch leaves within 24 to 48 hours."
          accent={["Bengaluru", "GST", "free"]}
        />
      </section>

      {/* Bulk orders: ink band that opens with a circle wipe */}
      <BulkInkBand whatsapp={settings?.whatsapp} />

      {/* Why buy here, in four facts */}
      <BuyingFacts />

      {/* 6.5. Real Google reviews (hidden until connected in Settings → Reviews) */}
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
