"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight, Layers, SlidersHorizontal, Package } from "lucide-react";
import { Product, Category } from "@/lib/types";
import ProductCard from "./ProductCard";

interface DirectProductShowcaseProps {
  products: Product[];
  categories: Category[];
}

export default function DirectProductShowcase({
  products,
  categories,
}: DirectProductShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [visibleLimit, setVisibleLimit] = useState<number>(16);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleLimit(16);
  }, [selectedCategory, searchQuery]);

  // Filter products based on active tab and search query
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category?.slug === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortBy === "featured") {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleLimit);

  return (
    <section id="catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
      {/* Header with Title and B2B Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E87832]/10 border border-[#E87832]/25 text-[#E87832] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Direct Wholesale Catalogue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
            Explore Factory Products Directly
          </h2>
          <p className="text-xs sm:text-sm text-[#687586] mt-1 max-w-xl">
            Real manufacturer stock with live specifications, authentic photos, trade pricing, and direct RFQ batch quotation.
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#17365D] hover:text-[#E87832] transition-colors self-start md:self-auto py-2 px-3.5 rounded-lg border border-[#DCE3EB] hover:border-[#E87832] bg-white shadow-2xs"
        >
          <span>View Full Catalogue ({products.length} Items)</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Control Bar: Category Tabs + Quick Search + Sorting */}
      <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div>
          <div className="text-[11px] font-bold text-[#687586] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#E87832]" />
            <span>Select Category Line:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === "all"
                  ? "bg-[#17365D] text-white shadow-xs"
                  : "bg-white text-[#263445] border border-[#DCE3EB] hover:border-[#17365D]"
              }`}
            >
              <span>All Products</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === "all" ? "bg-white/20 text-white" : "bg-[#F5F7FA] text-[#687586]"
                }`}
              >
                {products.length}
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? "bg-[#17365D] text-white shadow-xs"
                    : "bg-white text-[#263445] border border-[#DCE3EB] hover:border-[#17365D]"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.slug ? "bg-white/20 text-white" : "bg-[#F5F7FA] text-[#687586]"
                  }`}
                >
                  {cat.products_count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#DCE3EB]">
          {/* Quick Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#687586] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, SKU (e.g. LAN, V2, DCT)..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#DCE3EB] text-xs text-[#263445] placeholder-[#687586] focus:outline-none focus:border-[#17365D] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Result Count & Sorting */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4 text-xs text-[#687586]">
            <span className="font-medium whitespace-nowrap">
              Showing <strong className="text-[#17365D] font-bold">{Math.min(visibleLimit, filteredProducts.length)}</strong> of <strong className="text-[#17365D] font-bold">{filteredProducts.length}</strong> products
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#687586] hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#DCE3EB] text-xs font-medium text-[#263445] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#17365D]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {visibleLimit < filteredProducts.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 16)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#17365D] hover:bg-[#102742] text-white font-bold text-xs tracking-wide transition-all shadow-md group"
              >
                <span>Load More Products (+16)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-[#687586] mt-2">
                Showing {visibleProducts.length} of {filteredProducts.length} models
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-dashed border-[#DCE3EB] rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#17365D] text-base mb-1">No products match your filter</h3>
          <p className="text-xs text-[#687586] max-w-sm mx-auto mb-4">
            Try selecting &ldquo;All Products&rdquo; or adjusting your search keywords.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-lg bg-[#17365D] text-white text-xs font-bold hover:bg-[#102742] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
