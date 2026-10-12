"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Sparkles,
  ArrowDownUp,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ArrowDownAZ,
  SlidersHorizontal,
} from "lucide-react";

export type SortOptionValue = "featured" | "price-asc" | "price-desc" | "name";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOptionValue;
  onSelectSort: (val: SortOptionValue) => void;
  totalProductsCount?: number;
}

const SORT_OPTIONS: {
  id: SortOptionValue;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}[] = [
  {
    id: "featured",
    label: "Featured First",
    description: "Factory flagship lines and verified ISO models first",
    icon: Sparkles,
    tag: "Recommended",
  },
  {
    id: "price-asc",
    label: "Price: Low to High",
    description: "Wholesale starter materials, roll clips and fittings",
    icon: ArrowUpNarrowWide,
  },
  {
    id: "price-desc",
    label: "Price: High to Low",
    description: "Production machinery, multi-tank fusing and equipment",
    icon: ArrowDownWideNarrow,
  },
  {
    id: "name",
    label: "Name A–Z",
    description: "Alphabetical catalogue index by product title",
    icon: ArrowDownAZ,
  },
];

export default function SortModal({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
  totalProductsCount,
}: SortModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSelect = (val: SortOptionValue) => {
    onSelectSort(val);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-modal-title"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[92dvh] sm:max-h-[85vh] flex flex-col border border-[#DCE3EB] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="bg-[#102742] pt-2 pb-0 flex justify-center sm:hidden">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#102742] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#E87832]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="sort-modal-title" className="text-sm sm:text-base font-bold">
                Sort Products
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {totalProductsCount ? `${totalProductsCount} items available` : "Select catalogue display order"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close sort dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sort Options List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#17365D]/5 border-[#17365D] ring-2 ring-[#17365D]/20 shadow-xs"
                    : "bg-[#F8FAFC] hover:bg-white border-[#DCE3EB] hover:border-[#17365D]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-[#17365D] text-white shadow-2xs"
                        : "bg-white border border-[#DCE3EB] text-[#263445]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? "text-[#17365D]" : "text-[#263445]"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.tag && (
                        <span className="bg-[#E87832]/10 text-[#E87832] border border-[#E87832]/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                          {opt.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#687586] mt-0.5 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? "bg-[#17365D] border-[#17365D] text-white"
                      : "border-[#CBD5E1] bg-white text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#F8FAFC] border-t border-[#DCE3EB] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#687586] font-medium">
            Active: <strong className="text-[#17365D]">{SORT_OPTIONS.find((o) => o.id === currentSort)?.label}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#17365D] hover:bg-[#102742] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
