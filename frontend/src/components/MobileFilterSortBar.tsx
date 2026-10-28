"use client";

import React, { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Category } from "@/lib/types";
import ProductsFilterModal from "./ProductsFilterModal";

interface MobileFilterSortBarProps {
  categories: Category[];
  activeCategory?: string;
  activeOrdering?: string;
  activeSearch?: string;
  totalCount: number;
  basePath?: string;
  buttonOnly?: boolean;
}

export default function MobileFilterSortBar({
  categories,
  activeCategory,
  activeOrdering,
  activeSearch,
  totalCount,
  basePath = "/products",
  buttonOnly = false,
}: MobileFilterSortBarProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const activeFiltersCount = [
    activeCategory,
    activeSearch,
    activeOrdering && activeOrdering !== "display_order" ? activeOrdering : null,
  ].filter(Boolean).length;

  const triggerButton = (
    <button
      type="button"
      onClick={() => setFilterModalOpen(true)}
      className="inline-flex items-center gap-1.5 bg-[#17365D] hover:bg-[#102742] active:bg-[#0c1f35] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0"
      aria-label="Open filter and sort modal"
    >
      <Filter className="w-3.5 h-3.5 text-[#E87832]" />
      <span>Filter & Sort</span>
      {activeFiltersCount > 0 && (
        <span className="w-4 h-4 rounded-full bg-[#E87832] text-white text-[10px] font-black flex items-center justify-center ml-0.5">
          {activeFiltersCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {buttonOnly ? (
        triggerButton
      ) : (
        <div className="lg:hidden bg-white p-3 rounded-xl border border-[#DCE3EB] flex items-center justify-between gap-2 shadow-2xs">
          <span className="text-xs text-[#687586] font-medium">
            Showing <strong className="text-[#17365D] font-bold">{totalCount}</strong> products
          </span>
          {triggerButton}
        </div>
      )}

      {/* Small Compact Filter & Sort Modal */}
      <ProductsFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        categories={categories}
        currentCategory={activeCategory}
        currentOrdering={activeOrdering}
        currentSearch={activeSearch}
        basePath={basePath}
      />
    </>
  );
}
