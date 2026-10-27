import React from "react";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 anim-fade-in">
      <div className="h-3 w-44 skeleton" />

      <div className="border-b border-[#DCE3EB] pb-6 space-y-3">
        <div className="h-3 w-40 skeleton" />
        <div className="h-8 sm:h-10 w-3/4 max-w-lg skeleton" />
        <div className="h-3 w-full max-w-2xl skeleton" />
        <div className="h-3 w-2/3 max-w-xl skeleton" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-hidden">
          <div className="h-9 w-24 skeleton rounded-lg" />
          <div className="h-9 w-32 skeleton rounded-lg" />
          <div className="h-9 w-28 skeleton rounded-lg" />
        </div>
        <div className="h-9 w-40 skeleton rounded-lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#DCE3EB] rounded-2xl p-3 space-y-3"
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            <div className="aspect-square w-full skeleton rounded-xl" />
            <div className="h-2.5 w-16 skeleton" />
            <div className="h-3.5 w-5/6 skeleton" />
            <div className="h-3 w-2/3 skeleton" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-20 skeleton" />
              <div className="h-3 w-12 skeleton" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="h-8 skeleton rounded-lg" />
              <div className="h-8 skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
