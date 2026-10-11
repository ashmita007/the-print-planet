"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Box } from "lucide-react";
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
      <div className="group bg-white border border-[#DCE3EB] hover:border-[#17365D] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col h-full">
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
              className="absolute inset-0 w-full h-full object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-slate-400">
              <Box className="w-8 h-8 sm:w-12 sm:h-12 stroke-[1.5] mb-1 sm:mb-2 text-slate-300" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 text-center">
                Industrial Asset
              </span>
            </div>
          )}

          {/* Featured or Verified Badge */}
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-[#17365D] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-2xs">
                Featured
              </span>
            )}
            {product.verification_status === "verified" && (
              <span className="hidden sm:inline-flex bg-[#217A4B] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-2xs items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>

          {/* SKU Pill */}
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 bg-white/90 backdrop-blur-xs border border-slate-200 text-[#263445] text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-2xs max-w-[85%] truncate">
            {product.sku}
          </div>
        </Link>

        {/* Content Details */}
        <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Breadcrumb Pill */}
            <div className="mb-1 sm:mb-1.5">
              <Link
                href={`/categories/${product.category?.slug}`}
                className="text-[10px] sm:text-[11px] font-semibold text-[#687586] hover:text-[#E87832] transition-colors line-clamp-1"
              >
                {product.category?.name}
              </Link>
            </div>

            {/* Product Title */}
            <h3 className="text-xs sm:text-sm font-bold text-[#263445] group-hover:text-[#17365D] transition-colors line-clamp-2 leading-tight sm:leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>

            {/* Technical Highlights Badges */}
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
              {product.material && (
                <span className="text-[9px] sm:text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-1.5 sm:px-2 py-0.5 rounded font-medium truncate max-w-full">
                  {product.material}
                </span>
              )}
              {product.dimensions && (
                <span className="text-[9px] sm:text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-1.5 sm:px-2 py-0.5 rounded font-medium truncate max-w-full">
                  {product.dimensions}
                </span>
              )}
            </div>
          </div>

          {/* Price & Action Strip */}
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#F5F7FA]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2 sm:mb-3 gap-0.5">
              <div>
                <span className="text-[8px] sm:text-[10px] uppercase font-bold text-[#687586] block">
                  B2B Trade Price
                </span>
                {product.price_display ? (
                  <span className="text-xs sm:text-sm font-extrabold text-[#17365D] block truncate">
                    {product.price_display}
                  </span>
                ) : product.price ? (
                  <span className="text-xs sm:text-sm font-extrabold text-[#17365D] block truncate">
                    ₹ {Number(product.price).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs font-bold text-[#E87832] block">
                    Price on Request
                  </span>
                )}
              </div>

              {product.minimum_order_quantity && (
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  MOQ: {product.minimum_order_quantity}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:border-[#17365D] transition-colors text-center"
              >
                Details
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-[#E87832] hover:bg-[#d66b28] text-white transition-colors shadow-2xs text-center"
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
