import React from "react";

export default function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8 anim-fade-in">
      <div className="h-3 w-44 skeleton" />

      <div className="border-b border-[#DCE3EB] pb-6 space-y-3">
        <div className="h-3 w-52 skeleton" />
        <div className="h-8 sm:h-10 w-2/3 max-w-lg skeleton" />
        <div className="h-3 w-full max-w-2xl skeleton" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#DCE3EB] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="w-12 h-12 skeleton rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 skeleton" />
              <div className="h-3 w-full skeleton" />
              <div className="h-3 w-5/6 skeleton" />
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="h-2.5 w-28 skeleton" />
              <div className="h-3 w-2/3 skeleton" />
              <div className="h-3 w-1/2 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
