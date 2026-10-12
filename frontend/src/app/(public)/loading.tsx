import React from "react";

export default function PublicLoading() {
  return (
    <div className="w-full space-y-8 sm:space-y-12 pb-16 animate-pulse">
      {/* Hero Skeleton Stage */}
      <section className="bg-[#102742] py-8 sm:py-14 border-b-4 border-[#E87832]/50">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left proposition skeleton */}
            <div className="lg:col-span-5 space-y-4">
              <div className="h-5 w-44 bg-white/10 rounded-full" />
              <div className="h-8 sm:h-12 w-4/5 bg-white/15 rounded-xl" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 bg-[#E87832]/40 rounded-xl" />
                <div className="h-10 w-32 bg-white/10 rounded-xl" />
              </div>
            </div>

            {/* Right showcase stage skeleton */}
            <div className="lg:col-span-7">
              <div className="bg-[#17365D]/80 rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div className="h-4 w-32 bg-white/20 rounded" />
                  <div className="h-4 w-16 bg-white/20 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 aspect-square w-40 sm:w-full mx-auto bg-white/10 rounded-xl" />
                  <div className="sm:col-span-7 space-y-3">
                    <div className="h-5 w-4/5 bg-white/20 rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-white/10 rounded" />
                      <div className="h-6 w-24 bg-white/10 rounded" />
                    </div>
                    <div className="h-12 bg-white/10 rounded-xl" />
                    <div className="h-9 w-full bg-[#E87832]/40 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Skeleton Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-5">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-7 w-64 bg-slate-300 rounded-lg" />
        </div>

        {/* Category Pills Bar Skeleton */}
        <div className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex gap-2 overflow-hidden">
            <div className="h-8 w-28 bg-[#17365D]/30 rounded-lg shrink-0" />
            <div className="h-8 w-36 bg-slate-200 rounded-lg shrink-0" />
            <div className="h-8 w-44 bg-slate-200 rounded-lg shrink-0" />
            <div className="h-8 w-32 bg-slate-200 rounded-lg shrink-0" />
            <div className="h-8 w-40 bg-slate-200 rounded-lg shrink-0" />
          </div>
          <div className="h-9 w-full sm:w-80 bg-white border border-[#DCE3EB] rounded-lg" />
        </div>

        {/* Product Cards Shimmer Grid (2 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#DCE3EB] rounded-xl overflow-hidden p-2 sm:p-3 space-y-2.5 shadow-2xs"
            >
              <div className="w-full aspect-square bg-[#F8FAFC] rounded-lg" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-300 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-16 bg-[#17365D]/20 rounded" />
                <div className="h-3 w-12 bg-slate-200 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="h-7 bg-slate-100 rounded-md" />
                <div className="h-7 bg-[#E87832]/30 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
