"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ArrowRight, Shield, Box } from "lucide-react";
import { Product } from "@/lib/types";
import EnquiryModal from "./EnquiryModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const imageUrl =
    product.primary_image?.secure_url ||
    (product.images && product.images.length > 0 ? product.images[0].secure_url : null) ||
    "/placeholder-product.svg";

  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(imageUrl);
    setHasError(false);
  }, [imageUrl]);

  return (
    <>
      <div className="group bg-white border border-[#DCE3EB] hover:border-[#17365D] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full">
        {/* Image Container with 1:1 Aspect Ratio */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full pt-[100%] bg-[#F8FAFC] overflow-hidden border-b border-[#DCE3EB] block"
        >
          {!hasError && imgSrc && !imgSrc.startsWith("/placeholder") ? (
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => {
                setHasError(true);
                setImgSrc("/placeholder-product.svg");
              }}
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-slate-400">
              <Box className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <span className="text-xs font-semibold text-slate-400">Authentic Industrial Asset</span>
            </div>
          )}

          {/* Featured or Verified Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-[#17365D] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                Featured
              </span>
            )}
            {product.verification_status === "verified" && (
              <span className="bg-[#217A4B] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Specs Verified
              </span>
            )}
          </div>

          {/* SKU Pill */}
          <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs border border-slate-200 text-[#263445] text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
            {product.sku}
          </div>
        </Link>

        {/* Content Details */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Breadcrumb Pill */}
            <div className="mb-1.5">
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-[11px] font-semibold text-[#687586] hover:text-[#E87832] transition-colors line-clamp-1"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Product Title */}
            <h3 className="text-sm font-bold text-[#263445] group-hover:text-[#17365D] transition-colors line-clamp-2 leading-snug">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>

            {/* Technical Highlights Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.material && (
                <span className="text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                  {product.material}
                </span>
              )}
              {product.dimensions && (
                <span className="text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-2 py-0.5 rounded font-medium">
                  {product.dimensions}
                </span>
              )}
              {product.color && (
                <span className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                  {product.color}
                </span>
              )}
            </div>
          </div>

          {/* Price & Action Strip */}
          <div className="mt-4 pt-3 border-t border-[#F5F7FA]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#687586] block">
                  B2B Trade Price
                </span>
                {product.price_display ? (
                  <span className="text-sm font-extrabold text-[#17365D]">
                    {product.price_display}
                  </span>
                ) : product.price ? (
                  <span className="text-sm font-extrabold text-[#17365D]">
                    ₹ {Number(product.price).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#E87832]">
                    Price on Request
                  </span>
                )}
              </div>

              {product.minimum_order_quantity && (
                <span className="text-[10px] text-slate-500 font-medium">
                  MOQ: {product.minimum_order_quantity}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center text-xs font-semibold py-2 px-3 rounded-lg border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:border-[#17365D] transition-colors"
              >
                Details
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center text-xs font-bold py-2 px-3 rounded-lg bg-[#E87832] hover:bg-[#d66b28] text-white transition-colors shadow-xs"
              >
                Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Enquiry Modal */}
      {modalOpen && (
        <EnquiryModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
