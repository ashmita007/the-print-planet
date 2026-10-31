"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    formattedSubtotal,
  } = useCart();

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I have a quote enquiry for ${items.length} items:\n` +
      items
        .map(
          (i, idx) =>
            `${idx + 1}. ${i.name} (SKU: ${i.sku}) - Qty: ${i.quantity}${
              i.options?.material ? ` [Material: ${i.options.material}]` : ""
            }`
        )
        .join("\n") +
      `\n\nPlease share official wholesale pricing and turnaround time.`
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#0A1128]/60 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Your Order & Quote Cart
                  </h2>
                  <p className="text-xs text-slate-500">
                    {totalItems} item{totalItems !== 1 ? "s" : ""} selected for production
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping & digital proof banner */}
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Includes Free Digital Artwork Proofing on all orders</span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 text-base">Your cart is currently empty</h3>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Explore our catalogue of ID cards, lanyards, custom apparel, machinery, and promotional gifts.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Browse Catalogue
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-3.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors relative group"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <Image
                        src={item.image || "/placeholder-product.svg"}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {item.sku}</p>

                        {/* Options */}
                        {item.options && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-600">
                            {item.options.material && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                                {item.options.material}
                              </span>
                            )}
                            {item.options.size && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                                {item.options.size}
                              </span>
                            )}
                            {item.options.customText && (
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                                &ldquo;{item.options.customText}&rdquo;
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 10)}
                            className="w-7 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 10)}
                            className="w-7 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          {item.price > 0 ? (
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-blue-600">
                              Wholesale Quote
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout Actions */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
                {subtotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Estimated Product Value:</span>
                    <span className="text-lg font-bold text-slate-900">{formattedSubtotal}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> PAN-India Dispatch Available
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-slate-400 hover:text-red-500 underline text-[11px]"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/quote?cart=true`}
                    onClick={closeCart}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    Request RFQ
                  </Link>

                  <a
                    href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    WhatsApp Order
                  </a>
                </div>

                <p className="text-[10px] text-center text-slate-400 leading-tight">
                  Official GST Invoicing & Tax Input Credits available for all enterprise clients.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
