"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  Filter,
  Search,
  ArrowUpDown,
  RotateCcw,
  Check,
} from "lucide-react";
import { Category } from "@/lib/types";

interface ProductsFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentCategory?: string;
  currentOrdering?: string;
  currentSearch?: string;
  basePath?: string;
}

export default function ProductsFilterModal({
  isOpen,
  onClose,
  categories,
  currentCategory = "",
  currentOrdering = "display_order",
  currentSearch = "",
  basePath = "/products",
}: ProductsFilterModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [categoryVal, setCategoryVal] = useState(currentCategory);
  const [orderingVal, setOrderingVal] = useState(currentOrdering);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearchVal(currentSearch);
    setCategoryVal(currentCategory);
    setOrderingVal(currentOrdering);
  }, [currentSearch, currentCategory, currentOrdering, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams();
    if (categoryVal) query.set("category", categoryVal);
    if (searchVal.trim()) query.set("search", searchVal.trim());
    if (orderingVal && orderingVal !== "display_order") query.set("ordering", orderingVal);

    const targetUrl = `${basePath}${query.toString() ? `?${query.toString()}` : ""}`;
    router.push(targetUrl);
    onClose();
  };

  const handleReset = () => {
    setSearchVal("");
    setCategoryVal("");
    setOrderingVal("display_order");
    router.push(basePath);
    onClose();
  };

  const sortOptions = [
    { label: "Default", val: "display_order" },
    { label: "Price: Low to High", val: "price" },
    { label: "Price: High to Low", val: "-price" },
    { label: "Name A–Z", val: "name" },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl sm:shadow-2xl w-full max-w-[340px] sm:max-w-md md:max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col border border-[#DCE3EB] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Modal Header */}
        <div className="bg-[#102742] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E87832]" />
            <h3 id="filter-modal-title" className="text-xs sm:text-base font-bold tracking-tight">
              Filter & Sort
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close filter dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body: tight on mobile, spacious on laptop */}
        <form onSubmit={handleApply} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#263445]">Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search models, sizes..."
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#263445]">Category</label>
            <select
              value={categoryVal}
              onChange={(e) => setCategoryVal(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
            >
              <option value="">All Wholesale Categories</option>
              {(categories.filter((c) => !c.parent).length > 0
                ? categories.filter((c) => !c.parent)
                : categories
              ).map((mainCat) => {
                const childSubs = categories.filter((c) => c.parent === mainCat.id);
                if (childSubs.length === 0) {
                  return (
                    <option key={mainCat.id} value={mainCat.slug}>
                      {mainCat.name} ({mainCat.products_count})
                    </option>
                  );
                }
                return (
                  <optgroup key={mainCat.id} label={`── ${mainCat.name} ──`}>
                    <option value={mainCat.slug}>
                      All {mainCat.name} ({mainCat.products_count})
                    </option>
                    {childSubs.map((sub) => (
                      <option key={sub.id} value={sub.slug}>
                        ↳ {sub.name} ({sub.products_count})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Sort By Radio Pills */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#263445]">Sort Order</label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {sortOptions.map((opt) => {
                const isSelected = orderingVal === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setOrderingVal(opt.val)}
                    className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-left text-[11px] sm:text-xs font-semibold transition-all border ${
                      isSelected
                        ? "bg-[#17365D] text-white border-[#17365D] shadow-2xs"
                        : "bg-[#F8FAFC] text-[#263445] border-[#DCE3EB] hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate block">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-4 border-t border-[#DCE3EB] space-y-2">
            <button
              type="submit"
              className="w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Apply Filters</span>
            </button>

            {(categoryVal || searchVal || (orderingVal && orderingVal !== "display_order")) && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-semibold text-[#C0392B] hover:underline flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
