"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  Truck,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  FileText,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
import { useCart } from "@/lib/cart";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const imagesList =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.secure_url)
      : product.primary_image
      ? [product.primary_image.secure_url]
      : ["/placeholder-product.svg"];

  const activeImage = selectedImage || imagesList[0] || "/placeholder-product.svg";
  const moq = product.minimum_order_quantity || 1;

  const handleAddToCart = () => {
    addItem(product, Math.max(quantity, moq));
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I need a quotation for ${formatProductName(product.name)} (SKU: ${
      product.sku
    }, MOQ: ${moq} units).`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0A1128]/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
            {/* Image Gallery Column */}
            <div className="p-5 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200/80 p-4">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 rounded-lg bg-white border overflow-hidden shrink-0 transition-all ${
                        activeImage === img ? "border-blue-600 ring-2 ring-blue-600/20" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quality & Delivery trust signals */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Factory Verified
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> PAN-India Dispatch
                </span>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="space-y-3">
                {product.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {formatCategoryName(product.category.name)}
                  </span>
                )}

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {formatProductName(product.name)}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    SKU: {product.sku}
                  </span>
                  {product.minimum_order_quantity && (
                    <span className="text-slate-600 font-medium">
                      MOQ: {product.minimum_order_quantity} Units
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="pt-2 pb-1 border-y border-slate-100">
                  {product.price_display ? (
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      {product.price_display}
                    </div>
                  ) : product.price ? (
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}{" "}
                      <span className="text-xs text-slate-500 font-normal">per unit</span>
                    </div>
                  ) : (
                    <div className="text-base font-semibold text-blue-600">
                      Direct Wholesale Pricing on Request
                    </div>
                  )}
                </div>

                {/* Description excerpt */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {product.short_description || product.description || "Premium industrial-grade materials engineered for custom printing, corporate identification, and high-volume merchandise."}
                </p>

                {/* Key specs pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {product.material && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Material</span>
                      <span className="font-semibold text-slate-800 truncate block">{product.material}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Dimensions</span>
                      <span className="font-semibold text-slate-800 truncate block">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-5 mt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
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
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Quote</span>
                  </a>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1 text-center py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span>View Full Product Specifications</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
