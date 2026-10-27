"use client";

import React from "react";
import ProductForm from "@/components/owner/ProductForm";


export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
          Catalogue
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17365D] mt-1">
          New product
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
          Add specifications, pricing, and media. SKUs are generated automatically and the public card preview updates live.
        </p>
      </div>
      <ProductForm isEdit={false} />
    </div>
  );
}
