"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Box,
  Eye,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName, getProductImageUrl } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryUrl = getProductImageUrl(product);

  const secondaryUrl =
    product.images && product.images.length > 1
      ? product.images[1].secure_url
      : null;

  const [imgSrc, setImgSrc] = useState(primaryUrl);
  const [hasError, setHasError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImgSrc(primaryUrl);
    setHasError(false);
    setImgLoaded(false);
  }, [primaryUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [imgSrc]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.minimum_order_quantity || 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group bg-white border border-[#DCE3EB] hover:border-[#E87832]/60 rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(16,39,66,0.04)] hover:shadow-[0_12px_28px_-8px_rgba(23,54,93,0.18)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative"
      >
        {/* Image Container with 1:1 Aspect Ratio */}
        <div className="relative w-full pt-[100%] bg-[#F8FAFC] overflow-hidden border-b border-[#DCE3EB] block">
          {!imgLoaded && !hasError && (
            <div className="absolute inset-0 skeleton" />
          )}

          {/* Clickable Image Surface */}
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 block z-0"
            aria-label={`View ${formatProductName(product.name)}`}
          >
            {!hasError && imgSrc ? (
              <>
                {/* Primary Image */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt={formatProductName(product.name)}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    if (imgSrc !== "/placeholder-product.svg") {
                      setImgSrc("/placeholder-product.svg");
                    } else {
                      setHasError(true);
                    }
                  }}
                  className={`absolute inset-0 w-full h-full object-contain p-2.5 sm:p-4 transition-transform duration-300 ease-out will-change-transform ${
                    isHovered && secondaryUrl ? "opacity-0 scale-95" : "opacity-100 group-hover:scale-105"
                  }`}
                  loading="lazy"
                  decoding="async"
                />

                {/* Secondary Image on Hover (if available) */}
                {secondaryUrl && (
                  <img
                    src={secondaryUrl}
                    alt={`${formatProductName(product.name)} alternate view`}
                    className={`absolute inset-0 w-full h-full object-contain p-2.5 sm:p-4 transition-all duration-300 ease-out will-change-transform ${
                      isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-slate-400">
                <Box className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5] mb-1.5 text-slate-300" />
                <span className="text-[10px] font-semibold text-slate-400 text-center">
                  Production Spec
                </span>
              </div>
            )}
          </Link>

          {/* Badges (Top Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.is_featured && (
              <span className="bg-[#17365D] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                Featured
              </span>
            )}
            {product.verification_status === "verified" && (
              <span className="bg-white/95 backdrop-blur-xs text-[#217A4B] border border-[#217A4B]/30 text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#217A4B]" /> Factory Direct
              </span>
            )}
          </div>

          {/* SKU Pill (Bottom Left) */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs border border-slate-200 text-[#4E6178] text-[9px] sm:text-[10px] font-mono font-medium px-2 py-0.5 rounded shadow-2xs max-w-[85%] truncate z-10 pointer-events-none">
            {product.sku}
          </div>

          {/* Quick View Button (Desktop overlay on hover) */}
          <div className="absolute inset-x-0 bottom-2.5 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 px-3">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="bg-white/95 hover:bg-[#17365D] hover:text-white text-[#263445] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-[#DCE3EB] hover:border-[#17365D] transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          <div>
            {/* Category Breadcrumb */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-[10px] sm:text-[11px] font-semibold text-[#E87832] uppercase tracking-wider hover:text-[#d66b28] block truncate mb-1 transition-colors"
              >
                {formatCategoryName(product.category.name)}
              </Link>
            )}

            {/* Product Title */}
            <h3 className="text-xs sm:text-sm font-bold text-[#263445] group-hover:text-[#17365D] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
              <Link href={`/products/${product.slug}`} title={product.name}>
                {formatProductName(product.name)}
              </Link>
            </h3>

            {/* Micro specs / material */}
            {(product.material || product.dimensions) && (
              <p className="text-[10px] sm:text-[11px] text-[#687586] truncate mt-1">
                {product.material || product.dimensions}
              </p>
            )}
          </div>

          {/* Pricing & Actions */}
          <div className="pt-2 border-t border-[#F5F7FA] flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {product.price_display ? (
                <div className="text-xs sm:text-sm font-bold font-mono tabular-nums text-[#17365D] truncate">
                  {product.price_display}
                </div>
              ) : product.price ? (
                <div className="text-xs sm:text-sm font-bold font-mono tabular-nums text-[#17365D] truncate">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </div>
              ) : (
                <div className="text-[10px] sm:text-[11px] font-bold text-[#E87832]">
                  Price on Request
                </div>
              )}
              {product.minimum_order_quantity && (
                <span className="text-[9px] sm:text-[10px] text-[#687586] font-mono block mt-0.5">
                  MOQ {product.minimum_order_quantity}
                </span>
              )}
            </div>

            {/* Quick Actions: Details & RFQ/Cart */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/products/${product.slug}`}
                className="text-[10px] sm:text-xs font-semibold py-1 px-2 rounded-md border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:border-[#17365D] transition-all"
              >
                Details
              </Link>
              <button
                onClick={handleQuickAdd}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md ${
                  added
                    ? "bg-[#217A4B] text-white"
                    : "bg-[#E87832] hover:bg-[#d66b28] text-white"
                } flex items-center justify-center transition-all shadow-2xs group/btn active:scale-95`}
                title={added ? "Added to Quote Cart!" : "Add to Quote Cart"}
                aria-label="Add to cart"
              >
                {added ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5] animate-in zoom-in-75 duration-150" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
