import { DEFAULT_OG_IMAGES } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getCategories } from "@/lib/api";
import { formatCategoryName } from "@/lib/formatters";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "ID Card Product Categories",
  description:
    "Browse ID card holders, lanyard rolls, PVC sheets, RFID cards and card machines by category. Wholesale supply from The Print Planet, Bengaluru.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "ID Card Product Categories | The Print Planet",
    description:
      "Explore all product categories from The Print Planet. Wholesale satin lanyard rolls, PVC ID card holders, RFID cards, and machinery.",
    url: `${SITE_URL}/categories`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default async function CategoriesIndexPage() {
  const allCategories = await getCategories();
  const validCategories = allCategories.filter((c) => (c.products_count ?? 0) > 0);

  const mainCategories = (
    validCategories.filter((c) => !c.parent).length > 0
      ? validCategories.filter((c) => !c.parent)
      : validCategories
  ).sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));

  const categoriesJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/categories#collection`,
        name: "Product Categories - The Print Planet",
        description: "Complete B2B wholesale product category directory of The Print Planet.",
        url: `${SITE_URL}/categories`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: validCategories.map((c, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE_URL}/categories/${c.slug}`,
            name: c.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/categories#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Categories",
            item: `${SITE_URL}/categories`,
          },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
      />
      <PageHero title="ID card product categories" crumbs={[{ label: "Categories" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#DFE6EE] border border-[#DFE6EE] rounded-lg overflow-hidden">
          {mainCategories.map((cat) => {
            const subcategories = validCategories
              .filter((sub) => sub.parent === cat.id)
              .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));
            return (
              <li key={cat.id} className="bg-[#FFFFFF] p-5 sm:p-6">
                <Link href={`/categories/${cat.slug}`} className="group flex items-center justify-between gap-4">
                  <span className="min-w-0">
                    <span className="block text-xl font-bold tracking-tight text-[#121418] group-hover:text-[#2B323B] transition-colors">
                      {formatCategoryName(cat.name)}
                    </span>
                    <span className="block text-sm text-[#353C45] mt-0.5">{cat.products_count} products</span>
                  </span>
                  <ArrowRight className="w-5 h-5 shrink-0 text-[#2B323B] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                {subcategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="text-xs font-medium text-[#121418] bg-[#EDF1F6] hover:bg-slate-200 hover:text-[#2B323B] px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{formatCategoryName(sub.name)}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({sub.products_count})</span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
