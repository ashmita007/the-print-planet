import React from "react";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8 anim-fade-in">
      <div className="h-11 flex items-center">
        <div className="h-3 w-32 skeleton" />
      </div>

      <div className="border-b border-[#D8DEE5] pb-6 space-y-3">
        <div className="h-3 w-28 skeleton" />
        <div className="h-8 w-2/3 max-w-md skeleton" />
        <div className="h-3 w-56 skeleton" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-36 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 skeleton rounded-md" />
          ))}
        </div>
      </div>

      <ProductGridSkeleton count={8} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
    </div>
  );
}
