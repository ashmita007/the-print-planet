"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Layers,
  SlidersHorizontal,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import { formatCategoryName } from "@/lib/formatters";
import ProductCard from "./ProductCard";
import SortModal, { SortOptionValue } from "./SortModal";

interface DirectProductShowcaseProps {
  products: Product[];
  categories: Category[];
}

const SORT_LABELS: Record<SortOptionValue, string> = {
  featured: "Featured First",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  name: "Name A–Z",
};

export default function DirectProductShowcase({
  products,
  categories,
}: DirectProductShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOptionValue>("featured");
  const [sortModalOpen, setSortModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 16;

  // Category horizontal scroll controls
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  const checkScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 5);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories.length]);

  const scrollCategory = (direction: "left" | "right") => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const offset = direction === "left" ? -240 : 240;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Convert vertical mouse wheel to horizontal scroll inside category row
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Desktop mouse drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Filter products based on active tab and search query
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter (matches direct slug or child subcategories)
    if (selectedCategory !== "all") {
      const selectedCatObj = categories.find((c) => c.slug === selectedCategory);
      const childCatIds = selectedCatObj
        ? categories.filter((c) => c.parent === selectedCatObj.id).map((c) => c.id)
        : [];

      list = list.filter((p) => {
        if (!p.category) return false;
        if (p.category.slug === selectedCategory) return true;
        if (childCatIds.includes(p.category.id)) return true;
        return false;
      });
    }

    // Search query filter (tokenized across multiple words)
    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const textToSearch = [
          p.name,
          p.sku,
          p.material || "",
          p.color || "",
          p.dimensions || "",
          p.short_description || "",
          p.category?.name || "",
          p.category?.slug || "",
        ]
          .join(" ")
          .toLowerCase();
        return tokens.every((token) => textToSearch.includes(token));
      });
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

  // Reset to page 1 whenever user searches or selects a new category/sort
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate smart page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (typeof i === "number") {
        if (l !== undefined) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
    }
    return rangeWithDots;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const catalogueEl = document.getElementById("catalogue-section");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="catalogue-section" className="max-w-7xl mx-auto px-3 sm:px-6 scroll-mt-24">
      {/* Header with Title and B2B Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
            Catalogue
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17365D] tracking-tight mt-1">
            Explore factory products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Instant B2B pricing, technical specifications, and factory quotations for ID card rolls, holders, clips, and machinery.
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#17365D] transition-colors self-start md:self-auto py-1"
        >
          <span>View full catalogue</span>
          <span className="tabular-nums text-slate-400">({products.length})</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Control Bar: Category Tabs + Quick Search + Sorting */}
      <div className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-2xl p-3 sm:p-5 mb-5 sm:mb-8 space-y-3 sm:space-y-4">
        {/* Category Pills Header with Scroll Controls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-[0.12em] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Category</span>
            </div>

            {/* Left / Right Arrow Buttons for Desktop & Tablet */}
            {(canScrollLeft || canScrollRight) && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCategory("left")}
                  disabled={!canScrollLeft}
                  className="p-1 rounded-lg border border-[#DCE3EB] bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#17365D]" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategory("right")}
                  disabled={!canScrollRight}
                  className="p-1 rounded-lg border border-[#DCE3EB] bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#17365D]" />
                </button>
              </div>
            )}
          </div>

          {/* Category Horizontal Track with Edge Gradients & Mouse Drag */}
          <div className="relative">
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#F5F7FA] to-transparent pointer-events-none z-10" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#F5F7FA] to-transparent pointer-events-none z-10" />
            )}

            <div
              ref={categoryScrollRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-thin scroll-smooth select-none cursor-grab active:cursor-grabbing"
            >
              <button
                type="button"
                onClick={(e) => {
                  setSelectedCategory("all");
                  (e.currentTarget as HTMLElement).scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-[#17365D] text-white shadow-xs"
                    : "bg-white text-[#263445] border border-[#DCE3EB] hover:border-[#17365D]"
                }`}
              >
                <span>All Products</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "bg-[#F5F7FA] text-[#687586]"
                  }`}
                >
                  {products.length}
                </span>
              </button>

              {(categories.filter((c) => !c.parent).length > 0
                ? categories.filter((c) => !c.parent)
                : categories
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => {
                    setSelectedCategory(cat.slug);
                    (e.currentTarget as HTMLElement).scrollIntoView({
                      behavior: "smooth",
                      inline: "center",
                      block: "nearest",
                    });
                  }}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-[#17365D] text-white shadow-xs"
                      : "bg-white text-[#263445] border border-[#DCE3EB] hover:border-[#17365D]"
                  }`}
                >
                  <span>{formatCategoryName(cat.name)}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat.slug ? "bg-white/20 text-white" : "bg-[#F5F7FA] text-[#687586]"
                    }`}
                  >
                    {cat.products_count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-[#DCE3EB]">
          {/* Quick Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#687586] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, SKU (e.g. LAN, V2, DCT)..."
              className="w-full pl-8.5 pr-8 py-1.5 sm:py-2 rounded-lg bg-white border border-[#DCE3EB] text-xs text-[#263445] placeholder-[#687586] focus:outline-none focus:border-[#17365D] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold p-1"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Result Count & Sorting */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-[11px] sm:text-xs text-[#687586]">
            <span className="font-medium whitespace-nowrap">
              Showing <strong className="text-[#17365D] font-bold">{filteredProducts.length > 0 ? startIndex + 1 : 0}</strong>–<strong className="text-[#17365D] font-bold">{endIndex}</strong> of <strong className="text-[#17365D] font-bold">{filteredProducts.length}</strong>
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSortModalOpen(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-[#F8FAFC] border border-[#DCE3EB] hover:border-[#17365D] text-[11px] sm:text-xs font-semibold text-[#263445] hover:text-[#17365D] rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                aria-label="Open sort products modal"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold">{SORT_LABELS[sortBy]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#687586]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Properly Aligned Pagination Bar */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-[#DCE3EB] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Item Counter */}
              <div className="text-xs text-[#687586] font-medium order-2 sm:order-1 text-center sm:text-left">
                Showing <strong className="text-[#17365D] font-bold">{startIndex + 1}</strong>–<strong className="text-[#17365D] font-bold">{endIndex}</strong> of <strong className="text-[#17365D] font-bold">{filteredProducts.length}</strong> products
                <span className="text-slate-400 ml-1.5">(Page {currentPage} of {totalPages})</span>
              </div>

              {/* Right Pagination Navigation */}
              <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCE3EB] bg-white text-xs font-semibold text-[#17365D] hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Pills */}
                {getPageNumbers().map((num, idx) => {
                  if (num === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-slate-400 select-none">
                        ...
                      </span>
                    );
                  }
                  const pageNum = num as number;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[34px] h-[34px] px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "bg-[#17365D] text-white shadow-xs"
                          : "bg-white text-[#263445] border border-[#DCE3EB] hover:border-[#17365D] hover:bg-slate-50"
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCE3EB] bg-white text-xs font-semibold text-[#17365D] hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
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
            className="px-4 py-2 rounded-lg bg-[#17365D] text-white text-xs font-bold hover:bg-[#102742] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Interactive Sort Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
      <SortModal
        isOpen={sortModalOpen}
        onClose={() => setSortModalOpen(false)}
        currentSort={sortBy}
        onSelectSort={setSortBy}
        totalProductsCount={filteredProducts.length}
      />
    </section>
  );
}
