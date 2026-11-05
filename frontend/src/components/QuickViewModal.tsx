"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  X,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Truck,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName, getProductImageUrl } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import { useOverlay } from "@/lib/useOverlay";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(
    product.minimum_order_quantity || 1
  );
  const [added, setAdded] = useState(false);
  const { mounted, ref } = useOverlay<HTMLDivElement>(isOpen, onClose, { autoAlpha: 0, y: 18, scale: 0.96 });

  if (!mounted) return null;

  const imagesList =
    product.images && product.images.length > 0
      ? product.images.map((img) => getProductImageUrl(img))
      : [getProductImageUrl(product)];

  const activeImage = selectedImage || imagesList[0] || "/placeholder-product.svg";
  const moq = product.minimum_order_quantity || 1;

  const handleAddToCart = () => {
    setAdded(true);
    addItem(product, Math.max(quantity, moq));
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 400);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I need a quotation for ${formatProductName(product.name)} (SKU: ${
      product.sku
    }, MOQ: ${moq} units).`
  );

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          data-backdrop
          onClick={onClose}
          className="fixed inset-0 bg-[#22272E]/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <div
          data-panel
          role="dialog"
          aria-modal="true"
          aria-label={formatProductName(product.name)}
          tabIndex={-1}
          className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-lg shadow-2xl overflow-hidden z-10 border border-[#DFE6EE] outline-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
            {/* Image Gallery Column */}
            <div className="p-5 bg-[#EDF1F6] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#DFE6EE]">
              <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#FFFFFF] border border-[#DFE6EE] p-4 flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                  }}
                  className="w-full h-full object-contain p-2"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`View image ${idx + 1}`}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 rounded-lg bg-[#FFFFFF] border overflow-hidden shrink-0 transition-all ${
                        activeImage === img ? "border-[#B9C3CF] ring-2 ring-[#B9C3CF]/30" : "border-[#DFE6EE] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                        }}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quality & Delivery trust signals */}
              <div className="mt-4 pt-3 border-t border-[#DFE6EE] flex items-center justify-between text-[11px] text-[#3F4A56]">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#217A4B]" /> Factory Verified
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#3F4A56]" /> PAN-India Dispatch
                </span>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="space-y-3">
                {product.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#3F4A56] bg-[#22272E]/10 px-2 py-0.5 rounded">
                    {formatCategoryName(product.category.name)}
                  </span>
                )}

                <h2 className="text-lg sm:text-xl font-bold text-[#22272E] leading-snug">
                  {formatProductName(product.name)}
                </h2>

                <div className="flex items-center gap-3 text-xs text-[#3F4A56]">
                  <span className="font-mono bg-[#EDF1F6] border border-[#DFE6EE] px-2 py-0.5 rounded text-[#22272E]">
                    SKU: {product.sku}
                  </span>
                  {product.minimum_order_quantity && (
                    <span className="text-[#3F4A56] font-medium font-mono">
                      MOQ: {product.minimum_order_quantity} Units
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="pt-2 pb-1 border-y border-[#EDF1F6]">
                  {product.price_display ? (
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[#22272E]">
                      {product.price_display}
                    </div>
                  ) : product.price ? (
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[#22272E]">
                      ₹{Number(product.price).toLocaleString("en-IN")}{" "}
                      <span className="text-xs text-[#3F4A56] font-normal">per unit</span>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-[#3F4A56]">
                      Direct Wholesale Pricing on Request
                    </div>
                  )}
                </div>

                {/* Description excerpt */}
                <p className="text-xs text-[#3F4A56] leading-relaxed line-clamp-3">
                  {product.short_description || product.description || "Premium industrial-grade materials engineered for custom printing, corporate identification, and high-volume merchandise."}
                </p>

                {/* Key specs pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {product.material && (
                    <div className="p-2 rounded-lg bg-[#EDF1F6] border border-[#DFE6EE]">
                      <span className="text-[#3F4A56] block text-[9px] uppercase font-bold">Material</span>
                      <span className="font-semibold text-[#22272E] truncate block">{product.material}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="p-2 rounded-lg bg-[#EDF1F6] border border-[#DFE6EE]">
                      <span className="text-[#3F4A56] block text-[9px] uppercase font-bold">Dimensions</span>
                      <span className="font-semibold text-[#22272E] truncate block">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-5 mt-4 border-t border-[#EDF1F6]">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] active:scale-98 text-[#22272E] text-xs font-semibold shadow-xs transition-all"
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart / RFQ</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md bg-[#217A4B] hover:bg-[#1b633d] active:scale-98 text-white text-xs font-semibold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Quote</span>
                  </a>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1 text-center py-2 text-xs font-semibold text-[#3F4A56] hover:text-[#22272E] transition-colors"
                >
                  <span>View Full Product Specifications</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
    </div>,
    document.body
  );
}
