import React from "react";
import ProductForm from "@/components/owner/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
          Catalogue Operations
        </span>
        <h1 className="text-2xl font-extrabold text-[#17365D]">Add New Catalogue Product</h1>
      </div>
      <ProductForm isEdit={false} />
    </div>
  );
}
