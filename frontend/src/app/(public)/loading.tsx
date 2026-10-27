import React from "react";

export default function PublicLoading() {
  return (
    <div className="w-full space-y-10 sm:space-y-14 pb-16 anim-fade-in">
      <section className="bg-[#102742] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="h-5 w-44 skeleton skeleton-dark rounded-full" />
              <div className="h-9 sm:h-12 w-4/5 skeleton skeleton-dark rounded-xl" />
              <div className="h-3.5 w-full skeleton skeleton-dark" />
              <div className="h-3.5 w-3/4 skeleton skeleton-dark" />
              <div className="flex gap-3 pt-3">
                <div className="h-11 w-36 skeleton skeleton-dark rounded-lg" />
                <div className="h-11 w-32 skeleton skeleton-dark rounded-lg" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#17365D]/70 rounded-2xl p-5 sm:p-7 border border-white/[0.08] space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
                  <div className="h-3.5 w-32 skeleton skeleton-dark" />
                  <div className="h-3.5 w-16 skeleton skeleton-dark" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-5 aspect-square w-44 sm:w-full mx-auto skeleton skeleton-dark rounded-xl" />
                  <div className="sm:col-span-7 space-y-3">
                    <div className="h-5 w-4/5 skeleton skeleton-dark" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 skeleton skeleton-dark rounded-full" />
                      <div className="h-6 w-24 skeleton skeleton-dark rounded-full" />
                    </div>
                    <div className="h-12 skeleton skeleton-dark rounded-xl" />
                    <div className="h-10 w-full skeleton skeleton-dark rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-32 skeleton" />
          <div className="h-8 w-72 skeleton" />
        </div>

        <div className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex gap-2 overflow-hidden">
            <div className="h-8 w-28 skeleton rounded-lg shrink-0" />
            <div className="h-8 w-36 skeleton rounded-lg shrink-0" />
            <div className="h-8 w-44 skeleton rounded-lg shrink-0" />
            <div className="h-8 w-32 skeleton rounded-lg shrink-0" />
            <div className="h-8 w-40 skeleton rounded-lg shrink-0" />
          </div>
          <div className="h-9 w-full sm:w-80 skeleton rounded-lg" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden p-3 space-y-3"
            >
              <div className="w-full aspect-square skeleton rounded-xl" />
              <div className="h-2.5 w-16 skeleton" />
              <div className="h-3.5 w-5/6 skeleton" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-5 w-16 skeleton" />
                <div className="h-3 w-12 skeleton" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="h-8 skeleton rounded-lg" />
                <div className="h-8 skeleton rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
