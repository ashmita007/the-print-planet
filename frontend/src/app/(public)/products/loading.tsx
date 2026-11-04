import React from "react";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 anim-fade-in">
      <div className="h-11 flex items-center">
        <div className="h-3 w-44 skeleton" />
      </div>

      <div className="border-b border-[#DFE6EE] pb-6">
        <div className="max-w-3xl space-y-3 min-h-[148px] sm:min-h-[97px]">
          <div className="h-3 w-48 skeleton" />
          <div className="h-9 sm:h-10 w-3/4 max-w-lg skeleton" />
          <div className="h-3 w-full skeleton" />
        </div>
      </div>

      <div className="lg:hidden h-[58px] bg-[#FFFFFF] p-3 rounded-md border border-[#DFE6EE] flex items-center justify-between gap-2">
        <div className="h-3 w-32 skeleton" />
        <div className="h-8 w-24 skeleton rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div aria-hidden="true" className="hidden lg:block lg:col-span-3 space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
          <div className="h-4 w-32 skeleton" />
          {[6, 4].map((rows, group) => (
            <div key={group} className="space-y-3 pt-3 border-t border-slate-200">
              <div className="h-3 w-24 skeleton" />
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-3 skeleton" style={{ width: `${88 - ((i * 13) % 34)}%` }} />
              ))}
            </div>
          ))}
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="min-h-[132px] md:min-h-[58px] bg-[#FFFFFF] p-3.5 rounded-md border border-[#DFE6EE] flex flex-wrap items-center justify-between gap-4">
            <div className="h-3 w-36 skeleton" />
            <div className="flex gap-1.5">
              <div className="h-6 w-16 skeleton rounded" />
              <div className="h-6 w-28 skeleton rounded" />
              <div className="h-6 w-28 skeleton rounded" />
              <div className="h-6 w-12 skeleton rounded" />
            </div>
          </div>
          <ProductGridSkeleton count={12} className="grid-cols-2 md:grid-cols-3" />
        </div>
      </div>
    </div>
  );
}
