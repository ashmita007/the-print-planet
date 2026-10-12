import React from "react";
import Link from "next/link";
import { Search, Layers, Box } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { globalSearch } from "@/lib/api";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = q ? await globalSearch(q) : { products: [], categories: [] };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Search Results" },
          ...(q ? [{ label: `"${q}"` }] : []),
        ]}
      />

      {/* Search Header */}
      <div className="bg-[#102742] text-white p-6 sm:p-8 rounded-2xl border-l-4 border-[#E87832]">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E87832]">
            Catalogue Search
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Search Results for &ldquo;{q}&rdquo;
          </h1>
          <p className="text-xs text-slate-300">
            Found {results.products.length} product(s) and {results.categories.length} category match(es).
          </p>
        </div>
      </div>

      {/* Matching Categories */}
      {results.categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
            Matching Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {results.categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="bg-[#F5F7FA] border border-[#DCE3EB] hover:border-[#17365D] p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-[#263445] transition-colors"
              >
                <span>{c.name}</span>
                <span className="text-[#E87832]">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
          Matching Products ({results.products.length})
        </h2>

        {results.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#DCE3EB] rounded-2xl p-12 text-center space-y-4">
            <Box className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#17365D]">No items matched your query</h3>
            <p className="text-xs text-[#687586] max-w-sm mx-auto">
              Please check your spelling or browse the full category list to discover relevant models.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#17365D] text-white text-xs font-bold py-2 px-5 rounded-lg"
            >
              View Entire Catalogue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
