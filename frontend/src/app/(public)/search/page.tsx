import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Search, Layers, Box } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PageHero from "@/components/PageHero";
import MobileFilterSortBar from "@/components/MobileFilterSortBar";
import { globalSearch, getCategories } from "@/lib/api";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const [results, allCategories] = await Promise.all([
    q ? globalSearch(q) : Promise.resolve({ products: [], categories: [] }),
    getCategories(),
  ]);

  const matchingCategories = results.categories
    .filter((c) => (c.products_count ?? 0) > 0)
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0));

  return (
    <div>
      <PageHero
        title={q ? `Results for "${q}"` : "Search"}
        lead={q ? `${results.products.length} products, ${matchingCategories.length} categories` : undefined}
        crumbs={[{ label: "Search" }]}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Matching Categories */}
      {matchingCategories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#121418]">
            Matching Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchingCategories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="bg-[#EDF1F6] border border-[#DFE6EE] hover:border-[#121418] p-3.5 rounded-md flex items-center justify-between text-xs font-bold text-[#121418] transition-colors"
              >
                <span className="truncate pr-2">{c.name}</span>
                <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 font-normal">
                  {c.products_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-2 gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#121418]">
            Matching Products ({results.products.length})
          </h2>
          <MobileFilterSortBar
            categories={allCategories}
            activeSearch={q}
            totalCount={results.products.length}
            basePath="/products"
            buttonOnly={true}
          />
        </div>

        {results.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-lg p-12 text-center space-y-4">
            <Box className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#121418]">No items matched your query</h3>
            <p className="text-xs text-[#353C45] max-w-sm mx-auto">
              Please check your spelling or browse the full category list to discover relevant models.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#121418] text-white text-xs font-bold py-2 px-5 rounded-lg"
            >
              View Entire Catalogue
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
