import React from "react";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8 anim-fade-in">
      <div className="h-3 w-32 skeleton" />

      <div className="border-b border-[#E2E8F0] pb-6 space-y-3">
        <div className="h-3 w-28 skeleton" />
        <div className="h-8 w-2/3 max-w-md skeleton" />
        <div className="h-3 w-56 skeleton" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-36 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 surface-card rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-3 space-y-3">
            <div className="aspect-square w-full skeleton rounded-xl" />
            <div className="h-3.5 w-5/6 skeleton" />
            <div className="h-3 w-2/3 skeleton" />
            <div className="h-8 w-full skeleton rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
