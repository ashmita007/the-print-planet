"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Box,
  Eye,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatProductName, getProductImageUrl } from "@/lib/formatters";
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
        className="group bg-white border border-[#D8DEE5] hover:border-[#16324F] rounded-lg overflow-hidden transition-colors duration-200 flex flex-col h-full relative"
      >
        {/* Image Container with 1:1 Aspect Ratio */}
        <div className="relative w-full pt-[100%] bg-white overflow-hidden block">
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

          {/* Quick View Button (Desktop overlay on hover) */}
          <div className="absolute inset-x-0 bottom-2.5 hidden sm:flex justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 z-20 px-3">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="bg-white/95 hover:bg-[#16324F] hover:text-white text-[#1C2733] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-[#D8DEE5] hover:border-[#16324F] transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          <div>
            {/* Category Breadcrumb */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-[11px] text-[#566373] hover:text-[#B94E12] block truncate mb-1 transition-colors"
              >
                {formatProductName(product.category.name)}
              </Link>
            )}

            {/* Product Title */}
            <h3 className="text-sm font-semibold text-[#16324F] line-clamp-2 leading-snug min-h-[2.5rem]">
              <Link href={`/products/${product.slug}`} title={product.name}>
                {formatProductName(product.name)}
              </Link>
            </h3>

            <p className="font-mono text-[11px] text-[#566373] truncate mt-1">{product.sku}</p>
          </div>

          {/* Pricing & Actions */}
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              {product.price_display ? (
                <div className="font-heading text-sm sm:text-[15px] font-bold tabular-nums text-[#16324F] truncate">
                  {product.price_display}
                </div>
              ) : product.price ? (
                <div className="font-heading text-sm sm:text-[15px] font-bold tabular-nums text-[#16324F] truncate">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </div>
              ) : (
                <div className="text-[13px] font-semibold text-[#566373]">
                  Price on Request
                </div>
              )}
              {product.minimum_order_quantity && (
                <span className="text-[9px] sm:text-[10px] text-[#566373] font-mono block mt-0.5">
                  MOQ {product.minimum_order_quantity}
                </span>
              )}
            </div>

            {/* Quick Actions: Details & RFQ/Cart */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`w-9 h-9 rounded-md ${
                  added
                    ? "bg-[#217A4B] text-white"
                    : "bg-[#D9601A] hover:bg-[#B94E12] text-white"
                } flex items-center justify-center transition-colors`}
                title={added ? "Added to Quote Cart!" : "Add to Quote Cart"}
                aria-label={`Add ${formatProductName(product.name)} to cart`}
              >
                {added ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
