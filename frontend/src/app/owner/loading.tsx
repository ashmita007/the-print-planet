import React from "react";

export default function OwnerLoading() {
  return (
    <div className="space-y-6 anim-fade-in">
      <div className="space-y-2">
        <div className="h-3 w-28 skeleton" />
        <div className="h-8 w-52 skeleton" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card p-5 rounded-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-2.5 w-24 skeleton" />
              <div className="w-8 h-8 skeleton rounded-lg" />
            </div>
            <div className="h-7 w-16 skeleton" />
            <div className="h-2.5 w-32 skeleton" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 surface-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E6EBF1] flex items-center justify-between">
            <div className="h-3 w-28 skeleton" />
            <div className="h-3 w-16 skeleton" />
          </div>
          <div className="divide-y divide-[#F0F3F7]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-5 py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-32 skeleton" />
                  <div className="h-4 w-16 skeleton rounded-full" />
                </div>
                <div className="h-3 w-3/4 skeleton" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 surface-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E6EBF1]">
            <div className="h-3 w-28 skeleton" />
          </div>
          <div className="divide-y divide-[#F0F3F7]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-3 w-2/3 skeleton" />
                  <div className="h-2.5 w-1/3 skeleton" />
                </div>
                <div className="h-3 w-10 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
