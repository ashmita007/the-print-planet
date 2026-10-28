import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Layers, ArrowRight, Package, Box } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
      />

      <Breadcrumbs items={[{ label: "Product Categories" }]} />

      {/* Page header */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-2.5 anim-fade-up">
        <span className="text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
          Product taxonomy
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17365D]">
          Industrial product categories
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Browse our manufacturing and wholesale trade supply categories. High-density satin lanyard rolls, optically clear PVC card holders, RFID chips, and turnkey card machinery with pan-India dispatch.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {mainCategories.map((cat) => {
          const subcategories = allCategories.filter((sub) => sub.parent === cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white border border-[#DCE3EB] rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E87832] flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#17365D] group-hover:text-[#E87832] transition-colors">
                    {formatCategoryName(cat.name)}
                  </h2>
                  <p className="text-xs text-[#4E6178] mt-1 leading-relaxed line-clamp-2">
                    {cat.description || "Direct factory wholesale supply and trade distribution across India."}
                  </p>
                </div>

                {subcategories.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Subcategories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${sub.slug}`}
                          className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 hover:bg-orange-50 text-[#17365D] hover:text-[#E87832] px-2 py-0.5 rounded border border-slate-200 transition-colors"
                        >
                          {formatCategoryName(sub.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-xs font-bold text-[#E87832] hover:text-[#d66b28] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>View All Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="text-[11px] text-[#4E6178] hover:text-[#17365D] font-medium"
                >
                  Filter Products →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
