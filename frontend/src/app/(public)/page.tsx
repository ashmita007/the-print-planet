import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import ProductHeroShowcase from "@/components/ProductHeroShowcase";
import PrintRegisterSection from "@/components/planet/PrintRegisterSection";
import ProductLines from "@/components/ProductLines";
import BuyingFacts from "@/components/BuyingFacts";
import DirectProductShowcase from "@/components/DirectProductShowcase";
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
    absolute: "The Print Planet Bangalore | PVC Cards, Lanyards & ID Machines",
  },
  description:
    "The Print Planet, Bengaluru: PVC cards, ID card holders, satin lanyard rolls, RFID cards and ID card machines. Factory-direct wholesale across India.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "The Print Planet Bangalore | PVC Cards, Lanyards & ID Machines",
    description:
      "India's leading specialist in PVC cards, CR-80 fusing sheets, rigid ID card holders, and card manufacturing machinery. Direct B2B wholesale rates from Sunkadakatte, Bangalore.",
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
    question: "What does The Print Planet supply?",
    answer:
      "PVC cards, fusing sheets, satin lanyard rolls, ID card holders, hooks and clips, RFID cards, and card manufacturing machines.",
  },
  {
    question: "How do I get a price?",
    answer: "Use Get a quote on any product, or message us on WhatsApp at +91 97418 08034.",
  },
  {
    question: "Do you deliver across India?",
    answer: "Yes. We ship to every state and union territory from Bengaluru by courier and cargo.",
  },
  {
    question: "Do you give GST invoices?",
    answer: "Yes. Every wholesale order comes with a GST invoice for input tax credit.",
  },
  {
    question: "Can you print lanyards with my logo?",
    answer: "Yes. Sublimation and screen printing in 12, 16, 20 and 25 mm with Pantone colour matching.",
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

      {/* Product families, led by real photos */}
      <ProductLines />

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
          <h2 id="machines-heading" className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
            Card and lanyard machines
          </h2>
          <Link
            href="/categories/machines"
            className="shrink-0 text-sm font-semibold text-[#B94E12] hover:underline underline-offset-4"
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
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#16324F]">
              Common questions
            </h2>
          </div>

          <FaqAccordion items={FAQS} />
        </div>
      </section>
    </div>
  );
}
