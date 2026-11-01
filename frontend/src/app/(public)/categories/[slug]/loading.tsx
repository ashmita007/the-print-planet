import React from "react";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8 anim-fade-in">
      <div className="h-11 flex items-center">
        <div className="h-3 w-56 skeleton" />
      </div>

      <div className="border-b border-[#D8DEE5] pb-6 space-y-3">
        <div className="h-3 w-36 skeleton" />
        <div className="h-9 sm:h-10 w-2/3 max-w-md skeleton" />
        <div className="h-3 w-full max-w-2xl skeleton" />
        <div className="h-3 w-1/2 max-w-xl skeleton" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-40 skeleton" />
        <div className="h-9 w-36 skeleton rounded-lg" />
      </div>

      <ProductGridSkeleton count={8} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
    </div>
  );
}
