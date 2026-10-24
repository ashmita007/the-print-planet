"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/owner/ProductForm";
import { formatProductName } from "@/lib/formatters";
import { ownerGetProduct } from "@/lib/api";
import { Product } from "@/lib/types";


export default function EditProductPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      ownerGetProduct(id).then((res) => {
        setProduct(res);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#687586]">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-xs text-red-600">
        Product not found or has been deleted.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
          Catalogue Operations
        </span>
        <h1 className="text-2xl font-extrabold text-[#17365D]">Edit Product: {formatProductName(product.name)}</h1>
      </div>
      <ProductForm initialProduct={product} isEdit={true} />
    </div>
  );
}
