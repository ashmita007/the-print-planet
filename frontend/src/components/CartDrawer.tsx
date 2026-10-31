"use client";

import React, { useEffect } from "react";
import Link from "next/link";
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
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#102742]/70 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#DCE3EB]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#DCE3EB] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E87832]/10 text-[#E87832] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-[#E87832]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#17365D] leading-tight">
                    Your Order &amp; Quote Cart
                  </h2>
                  <p className="text-xs text-[#687586]">
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

            {/* Proof banner */}
            <div className="px-4 py-2.5 bg-[#FFF7F2] border-b border-[#E87832]/20 flex items-center gap-2 text-xs text-[#263445] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#E87832] shrink-0" />
              <span>Includes Free Digital Artwork Proofing on all orders</span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F7FA] flex items-center justify-center text-[#687586]">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-[#17365D] text-base">Your cart is currently empty</h3>
                    <p className="text-xs text-[#687586] max-w-xs">
                      Explore our catalogue of ID cards, lanyards, custom apparel, machinery, and promotional gifts.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E87832] hover:bg-[#d66b28] text-white text-xs font-semibold shadow-md transition-colors"
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
                    className="flex gap-3.5 p-3 rounded-xl border border-[#DCE3EB] bg-white hover:border-[#E87832]/50 transition-colors relative group"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-[#F8FAFC] rounded-lg overflow-hidden shrink-0 border border-[#DCE3EB] p-1 flex items-center justify-center">
                      <img
                        src={item.image || "/placeholder-product.svg"}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                        }}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="text-xs sm:text-sm font-semibold text-[#263445] hover:text-[#17365D] line-clamp-1 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-[#C0392B] p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-[#687586] mt-0.5">
                          SKU: {item.sku}
                        </div>

                        {item.options?.material && (
                          <div className="text-[10px] text-[#687586] mt-0.5">
                            Material: <span className="font-medium text-[#263445]">{item.options.material}</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price row */}
                      <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-[#F5F7FA]">
                        <div className="flex items-center border border-[#DCE3EB] rounded-lg overflow-hidden bg-[#F8FAFC]">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 10))}
                            className="w-7 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-mono text-xs font-semibold text-[#263445]">
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
                            <span className="text-xs sm:text-sm font-bold font-mono text-[#17365D]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#E87832]">
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
              <div className="p-4 sm:p-5 border-t border-[#DCE3EB] bg-[#F8FAFC] space-y-3">
                {subtotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#687586] font-medium">Estimated Product Value:</span>
                    <span className="text-lg font-bold font-mono text-[#17365D]">{formattedSubtotal}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#687586]">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[#E87832]" /> PAN-India Dispatch Available
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-[#687586] hover:text-[#C0392B] underline text-[11px]"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/quote?cart=true`}
                    onClick={closeCart}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#E87832] hover:bg-[#d66b28] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    Request RFQ
                  </Link>

                  <a
                    href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#217A4B] hover:bg-[#1b633d] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    WhatsApp Order
                  </a>
                </div>

                <p className="text-[10px] text-center text-[#687586] leading-tight">
                  Official GST Invoicing &amp; Tax Input Credits available for all enterprise clients.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
