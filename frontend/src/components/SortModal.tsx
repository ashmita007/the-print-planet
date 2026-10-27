"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Sparkles,
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
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}[] = [
  {
    id: "featured",
    label: "Featured First",
    icon: Sparkles,
    tag: "Recommended",
  },
  {
    id: "price-asc",
    label: "Price: Low to High",
    icon: ArrowUpNarrowWide,
  },
  {
    id: "price-desc",
    label: "Price: High to Low",
    icon: ArrowDownWideNarrow,
  },
  {
    id: "name",
    label: "Name A–Z",
    icon: ArrowDownAZ,
  },
];

export default function SortModal({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs anim-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl sm:shadow-2xl w-full max-w-[320px] sm:max-w-md border border-[#DCE3EB] overflow-hidden anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Header */}
        <div className="bg-[#102742] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E87832]" />
            <h3 id="sort-modal-title" className="text-xs sm:text-base font-bold tracking-tight">
              Sort Catalogue
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close sort dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Responsive Options List */}
        <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-2.5">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-left transition-all flex items-center justify-between text-xs sm:text-sm font-semibold ${
                  isSelected
                    ? "bg-[#17365D] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#263445] hover:bg-slate-100 border border-[#DCE3EB]/60"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? "text-[#E87832]" : "text-[#687586]"}`} />
                  <span className="truncate">{opt.label}</span>
                  {opt.tag && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#E87832]/10 text-[#E87832]"
                      }`}
                    >
                      {opt.tag}
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0 stroke-[3]" />
                ) : (
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
