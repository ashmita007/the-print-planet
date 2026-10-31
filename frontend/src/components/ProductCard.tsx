"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Box,
  Eye,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryUrl =
    product.primary_image?.secure_url ||
    (product.images && product.images.length > 0 ? product.images[0].secure_url : null) ||
    "/placeholder-product.svg";

  const secondaryUrl =
    product.images && product.images.length > 1
      ? product.images[1].secure_url
      : null;

  const [imgSrc, setImgSrc] = useState(primaryUrl);
  const [hasError, setHasError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(primaryUrl);
    setHasError(false);
    setImgLoaded(false);
  }, [primaryUrl]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.minimum_order_quantity || 1);
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
        className="group bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
      >
        {/* Image Container with 1:1 Aspect Ratio */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full pt-[100%] bg-slate-50 overflow-hidden border-b border-slate-100 block"
        >
          {!imgLoaded && !hasError && imgSrc && !imgSrc.startsWith("/placeholder") && (
            <div className="absolute inset-0 skeleton" />
          )}

          {!hasError && imgSrc && !imgSrc.startsWith("/placeholder") ? (
            <>
              {/* Primary Image */}
              <img
                src={primaryUrl}
                alt={formatProductName(product.name)}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setHasError(true);
                  setImgSrc("/placeholder-product.svg");
                }}
                className={`absolute inset-0 w-full h-full object-contain p-3 sm:p-5 transition-all duration-500 ease-out will-change-transform ${
                  isHovered && secondaryUrl ? "opacity-0 scale-95" : "opacity-100 group-hover:scale-105"
                } ${imgLoaded ? "visible" : "invisible"}`}
                loading="lazy"
                decoding="async"
              />

              {/* Secondary Image on Hover (if available) */}
              {secondaryUrl && (
                <img
                  src={secondaryUrl}
                  alt={`${formatProductName(product.name)} alternate view`}
                  className={`absolute inset-0 w-full h-full object-contain p-3 sm:p-5 transition-all duration-500 ease-out will-change-transform ${
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

          {/* Badges (Top Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.is_featured && (
              <span className="bg-[#0A1128] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                Featured
              </span>
            )}
            {product.verification_status === "verified" && (
              <span className="bg-white/95 backdrop-blur-xs text-blue-700 border border-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> Factory Direct
              </span>
            )}
          </div>

          {/* SKU Pill (Bottom Left) */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-600 text-[9px] sm:text-[10px] font-mono font-medium px-2 py-0.5 rounded-md shadow-xs">
            {product.sku}
          </div>

          {/* Quick View Button (Desktop overlay on hover) */}
          <div className="absolute inset-x-0 bottom-3 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 px-3">
            <button
              onClick={handleOpenQuickView}
              className="bg-white/95 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-lg border border-slate-200 hover:border-blue-600 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </Link>

        {/* Content Details */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Category Breadcrumb */}
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline block truncate mb-1"
              >
                {formatCategoryName(product.category.name)}
              </Link>
            )}

            {/* Product Title */}
            <Link
              href={`/products/${product.slug}`}
              className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
              title={product.name}
            >
              {formatProductName(product.name)}
            </Link>

            {/* Micro specs / material */}
            {(product.material || product.dimensions) && (
              <p className="text-[11px] text-slate-500 truncate mt-1">
                {product.material || product.dimensions}
              </p>
            )}
          </div>

          {/* Pricing & Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              {product.price_display ? (
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-none">
                  {product.price_display}
                </div>
              ) : product.price ? (
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-none">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-blue-600 leading-none">
                  Wholesale Rate
                </div>
              )}
              {product.minimum_order_quantity && (
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  MOQ: {product.minimum_order_quantity} Units
                </span>
              )}
            </div>

            {/* Add to Cart / RFQ button */}
            <button
              onClick={handleQuickAdd}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 flex items-center justify-center transition-colors shrink-0 shadow-2xs group/btn"
              title="Add to Quote Cart"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
