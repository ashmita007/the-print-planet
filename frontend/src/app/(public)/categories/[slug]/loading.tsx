import React from "react";

export default function CategoryDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 anim-fade-in">
      <div className="h-3 w-56 skeleton" />

      <div className="border-b border-[#E2E8F0] pb-6 space-y-3">
        <div className="h-3 w-36 skeleton" />
        <div className="h-9 sm:h-10 w-2/3 max-w-md skeleton" />
        <div className="h-3 w-full max-w-2xl skeleton" />
        <div className="h-3 w-1/2 max-w-xl skeleton" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-40 skeleton" />
        <div className="h-9 w-36 skeleton rounded-lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-3 space-y-3">
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
