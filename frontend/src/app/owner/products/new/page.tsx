"use client";

import React from "react";
import ProductForm from "@/components/owner/ProductForm";


export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E87832]/10 text-[#E87832] text-[10px] font-bold uppercase tracking-wider mb-1 border border-[#E87832]/20">
          <span>Industrial Product Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D]">
          Dynamic Catalogue Product Creator
        </h1>
        <p className="text-xs text-[#687586] mt-1">
          Create verified industrial items with dynamic specifications, auto-generated SKUs, instant category creation, and real-time live public card preview.
        </p>
      </div>
      <ProductForm isEdit={false} />
    </div>
  );
}
