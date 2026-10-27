"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Box } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
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
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(imageUrl);
    setHasError(false);
    setImgLoaded(false);
  }, [imageUrl]);

  return (
    <>
      <div className="group bg-white border border-[#DCE3EB] hover:border-[#B9C6D6] rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(16,39,66,0.04)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_-12px_rgba(16,39,66,0.22)] hover:-translate-y-0.5 focus-within:border-[#B9C6D6] transition-all duration-300 ease-out flex flex-col h-full">
        {/* Image Container with 1:1 Aspect Ratio */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full pt-[100%] bg-[#F8FAFC] overflow-hidden border-b border-[#DCE3EB] block"
        >
          {!imgLoaded && !hasError && imgSrc && !imgSrc.startsWith("/placeholder") && (
            <div className="absolute inset-0 skeleton" />
          )}

          {!hasError && imgSrc && !imgSrc.startsWith("/placeholder") ? (
            <img
              src={imgSrc}
              alt={formatProductName(product.name)}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setHasError(true);
                setImgSrc("/placeholder-product.svg");
              }}
              className={`absolute inset-0 w-full h-full object-contain p-2 sm:p-4 group-hover:scale-[1.06] transition-[opacity,transform] duration-500 ease-out will-change-transform ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              decoding="async"
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
              <span className="hidden sm:inline-flex bg-white/90 backdrop-blur-sm text-[#217A4B] border border-[#217A4B]/25 text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(16,39,66,0.06)] items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>

          {/* SKU Pill */}
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 bg-white/85 backdrop-blur-sm border border-slate-200/80 text-[#4E6178] text-[9px] sm:text-[10px] font-mono font-semibold tabular-nums px-1.5 sm:px-2 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] max-w-[85%] truncate">
            {product.sku}
          </div>
        </Link>

        {/* Content Details */}
        <div className="p-2 sm:p-3.5 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Breadcrumb Pill */}
            <div className="mb-1">
              <Link
                href={`/categories/${product.category?.slug}`}
                className="text-[9px] sm:text-[11px] font-bold text-[#687586] hover:text-[#E87832] transition-colors line-clamp-1 block uppercase tracking-wider"
              >
                {formatCategoryName(product.category?.name)}
              </Link>
            </div>

            {/* Product Title */}
            <h3 className="text-[11px] sm:text-xs md:text-sm font-bold tracking-[-0.01em] text-[#263445] group-hover:text-[#17365D] transition-colors line-clamp-2 leading-snug min-h-[1.9rem] sm:min-h-[2.4rem]">
              <Link href={`/products/${product.slug}`}>{formatProductName(product.name)}</Link>
            </h3>

            {/* Technical Highlights Badges */}
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap gap-1">
              {product.material && (
                <span className="text-[8.5px] sm:text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                  {product.material}
                </span>
              )}
              {product.dimensions && (
                <span className="hidden sm:inline-block text-[8.5px] sm:text-[10px] bg-[#F5F7FA] text-[#263445] border border-[#DCE3EB] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                  {product.dimensions}
                </span>
              )}
            </div>
          </div>

          {/* Price & Action Strip */}
          <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F5F7FA]">
            <div className="flex items-baseline justify-between mb-1.5 sm:mb-2.5 gap-1">
              <div className="min-w-0 flex-1">
                <span className="hidden sm:block text-[8px] sm:text-[10px] uppercase font-bold text-[#687586]">
                  B2B Trade Price
                </span>
                {product.price_display ? (
                  <span className="text-[11px] sm:text-sm font-black tabular-nums tracking-tight text-[#17365D] block truncate">
                    {product.price_display}
                  </span>
                ) : product.price ? (
                  <span className="text-[11px] sm:text-sm font-black tabular-nums tracking-tight text-[#17365D] block truncate">
                    ₹ {Number(product.price).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold text-[#E87832] block">
                    Price on Request
                  </span>
                )}
              </div>

              {product.minimum_order_quantity && (
                <span className="text-[8.5px] sm:text-[10px] text-slate-500 font-semibold whitespace-nowrap shrink-0">
                  MOQ {product.minimum_order_quantity}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:border-[#17365D] hover:shadow-xs active:scale-[0.98] transition-all text-center"
              >
                Details
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center text-[10px] sm:text-xs font-bold py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg bg-[#E87832] hover:bg-[#d66b28] hover:shadow-sm active:scale-[0.98] text-white transition-all shadow-2xs text-center"
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
