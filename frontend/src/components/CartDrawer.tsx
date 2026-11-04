"use client";

import React from "react";
import Link from "next/link";
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
import { formatProductName } from "@/lib/formatters";
import { useOverlay } from "@/lib/useOverlay";

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

  const { mounted, ref } = useOverlay<HTMLDivElement>(isOpen, closeCart, { x: "100%" });

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
    <>
      {mounted && (
        <div ref={ref} className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            data-backdrop
            onClick={closeCart}
            className="fixed inset-0 bg-[#22272E]/70 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <div
            data-panel
            role="dialog"
            aria-modal="true"
            aria-label="Your order and quote cart"
            tabIndex={-1}
            className="relative w-full max-w-md bg-[#FFFFFF] h-[100dvh] shadow-2xl flex flex-col z-10 border-l border-[#DFE6EE] outline-none"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#DFE6EE] flex items-center justify-between bg-[#EDF1F6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-[#22272E]/10 text-[#5B6877] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-[#5B6877]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#22272E] leading-tight">
                    Your Order &amp; Quote Cart
                  </h2>
                  <p className="text-xs text-[#5B6877]">
                    {totalItems} item{totalItems !== 1 ? "s" : ""} selected for production
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proof banner */}
            <div className="px-4 py-2.5 bg-[#EDF1F6] border-b border-[#B9C3CF]/20 flex items-center gap-2 text-xs text-[#22272E] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#5B6877] shrink-0" />
              <span>Includes Free Digital Artwork Proofing on all orders</span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-lg bg-[#EDF1F6] flex items-center justify-center text-[#5B6877]">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-[#22272E] text-base">Your cart is currently empty</h3>
                    <p className="text-xs text-[#5B6877] max-w-xs">
                      Explore our catalogue of ID cards, lanyards, custom apparel, machinery, and promotional gifts.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#22272E] hover:bg-[#363D47] text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Browse Catalogue
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const step = item.minimumOrderQuantity >= 10 ? 10 : 1;
                  return (
                  <div
                    key={item.id}
                    className="anim-fade-up flex gap-3.5 p-3 rounded-md border border-[#DFE6EE] bg-[#FFFFFF] hover:border-[#B9C3CF]/50 transition-colors relative group"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-[#EDF1F6] rounded-lg overflow-hidden shrink-0 border border-[#DFE6EE] p-1 flex items-center justify-center">
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
                            className="text-xs sm:text-sm font-semibold text-[#22272E] hover:text-[#22272E] line-clamp-1 transition-colors"
                          >
                            {formatProductName(item.name)}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-[#C0392B] p-1 transition-colors"
                            aria-label={`Remove ${formatProductName(item.name)}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-[#5B6877] mt-0.5">
                          SKU: {item.sku}
                        </div>

                        {item.options?.material && (
                          <div className="text-[10px] text-[#5B6877] mt-0.5">
                            Material: <span className="font-medium text-[#22272E]">{item.options.material}</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price row */}
                      <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-[#EDF1F6]">
                        <div className="flex items-center border border-[#DFE6EE] rounded-lg overflow-hidden bg-[#EDF1F6]">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(item.minimumOrderQuantity || 1, item.quantity - step))}
                            className="w-8 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs"
                            aria-label={`Decrease quantity of ${formatProductName(item.name)}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-mono text-xs font-semibold text-[#22272E]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + step)}
                            className="w-8 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs"
                            aria-label={`Increase quantity of ${formatProductName(item.name)}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          {item.price > 0 ? (
                            <span className="text-xs sm:text-sm font-bold font-mono text-[#22272E]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#5B6877]">
                              Wholesale Quote
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Footer / Checkout Actions */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#DFE6EE] bg-[#EDF1F6] space-y-3">
                {subtotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5B6877] font-medium">Estimated Product Value:</span>
                    <span className="text-lg font-bold font-mono text-[#22272E]">{formattedSubtotal}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#5B6877]">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[#5B6877]" /> PAN-India Dispatch Available
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-[#5B6877] hover:text-[#C0392B] underline text-[11px]"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/quote?cart=true`}
                    onClick={closeCart}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-md bg-[#22272E] hover:bg-[#363D47] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    Request RFQ
                  </Link>

                  <a
                    href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-md bg-[#217A4B] hover:bg-[#1b633d] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    WhatsApp Order
                  </a>
                </div>

                <p className="text-[10px] text-center text-[#5B6877] leading-tight">
                  Official GST Invoicing &amp; Tax Input Credits available for all enterprise clients.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
