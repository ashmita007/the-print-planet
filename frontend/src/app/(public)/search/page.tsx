import React from "react";
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const [results, allCategories] = await Promise.all([
    q ? globalSearch(q) : Promise.resolve({ products: [], categories: [] }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHero
        title={q ? `Results for "${q}"` : "Search"}
        lead={q ? `${results.products.length} products, ${results.categories.length} categories` : undefined}
        crumbs={[{ label: "Search" }]}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Matching Categories */}
      {results.categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#16324F]">
            Matching Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {results.categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="bg-[#F3F5F7] border border-[#D8DEE5] hover:border-[#16324F] p-3.5 rounded-md flex items-center justify-between text-xs font-bold text-[#1C2733] transition-colors"
              >
                <span>{c.name}</span>
                <span className="text-[#D9601A]">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8DEE5] pb-2 gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#16324F]">
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
            <h3 className="text-base font-bold text-[#16324F]">No items matched your query</h3>
            <p className="text-xs text-[#566373] max-w-sm mx-auto">
              Please check your spelling or browse the full category list to discover relevant models.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#16324F] text-white text-xs font-bold py-2 px-5 rounded-lg"
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
