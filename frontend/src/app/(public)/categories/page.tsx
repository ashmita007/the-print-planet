import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getCategories } from "@/lib/api";
import { formatCategoryName } from "@/lib/formatters";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Product Categories & Wholesale Industrial Supplies | The Print Planet India",
  description:
    "Explore all product categories from The Print Planet (theprintplanet.co.in). Wholesale satin lanyard rolls, rigid PVC ID card holders, RFID smart cards, clips, and industrial card manufacturing machinery with nationwide dispatch.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: "Product Categories & Wholesale Industrial Supplies | The Print Planet India",
    description:
      "Explore all product categories from The Print Planet. Wholesale satin lanyard rolls, PVC ID card holders, RFID cards, and machinery.",
    url: `${SITE_URL}/categories`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default async function CategoriesIndexPage() {
  const allCategories = await getCategories();

  const mainCategories = allCategories.filter((c) => !c.parent);

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
          itemListElement: allCategories.map((c, idx) => ({
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
      <PageHero title="Categories" crumbs={[{ label: "Categories" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8DEE5] border border-[#D8DEE5] rounded-lg overflow-hidden">
          {mainCategories.map((cat) => {
            const subcategories = allCategories.filter((sub) => sub.parent === cat.id);
            return (
              <li key={cat.id} className="bg-white p-5 sm:p-6">
                <Link href={`/categories/${cat.slug}`} className="group flex items-center justify-between gap-4">
                  <span className="min-w-0">
                    <span className="block text-xl font-bold tracking-tight text-[#16324F] group-hover:text-[#B94E12] transition-colors">
                      {formatCategoryName(cat.name)}
                    </span>
                    {cat.products_count > 0 && (
                      <span className="block text-sm text-[#566373] mt-0.5">{cat.products_count} products</span>
                    )}
                  </span>
                  <ArrowRight className="w-5 h-5 shrink-0 text-[#B94E12] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                {subcategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="text-xs font-medium text-[#16324F] bg-[#F3F5F7] hover:bg-[#FBF0E8] hover:text-[#B94E12] px-2.5 py-1.5 rounded transition-colors"
                      >
                        {formatCategoryName(sub.name)}
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
