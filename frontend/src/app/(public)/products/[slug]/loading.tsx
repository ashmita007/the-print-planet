import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 anim-fade-in">
      <div className="h-3 w-56 skeleton" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-square w-full skeleton rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2.5">
            <div className="h-3 w-28 skeleton" />
            <div className="h-8 w-4/5 skeleton" />
            <div className="h-8 w-3/5 skeleton" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 skeleton rounded-full" />
            <div className="h-6 w-28 skeleton rounded-full" />
          </div>
          <div className="border border-[#DCE3EB] rounded-2xl p-5 space-y-3">
            <div className="h-3 w-24 skeleton" />
            <div className="h-8 w-40 skeleton" />
            <div className="h-10 w-full skeleton rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full skeleton" />
            <div className="h-3 w-11/12 skeleton" />
            <div className="h-3 w-4/5 skeleton" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 skeleton rounded-xl" />
            <div className="h-11 skeleton rounded-xl" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#F0F3F7]">
                <div className="h-3 w-24 skeleton" />
                <div className="h-3 w-32 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
