"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Product } from "@/lib/types";
import EnquiryModal from "./EnquiryModal";

interface ProductHeroShowcaseProps {
  flagshipProducts: Product[];
  totalProductsCount: number;
}

export default function ProductHeroShowcase({
  flagshipProducts,
  totalProductsCount,
}: ProductHeroShowcaseProps) {
  // Take top 6 flagship items for the hero carousel stage
  const heroProducts = flagshipProducts.slice(0, 6);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const activeProduct = heroProducts[activeIndex] || heroProducts[0];

  const imageUrl =
    activeProduct?.primary_image?.secure_url ||
    (activeProduct?.images && activeProduct.images.length > 0
      ? activeProduct.images[0].secure_url
      : null) ||
    "/placeholder-product.svg";

  const [heroImg, setHeroImg] = useState(imageUrl);

  useEffect(() => {
    setHeroImg(imageUrl);
  }, [imageUrl]);

  // Auto-rotate every 6 seconds unless paused
  useEffect(() => {
    if (isPaused || heroProducts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroProducts.length]);

  if (!activeProduct) return null;

  return (
    <section className="relative bg-[#102742] text-white overflow-hidden py-8 sm:py-12 lg:py-16 border-b-4 border-[#E87832]">
      {/* Background blueprint grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#E87832]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Column: Industrial Proposition & Quick Catalogs */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E87832] text-[11px] sm:text-xs font-bold tracking-wide uppercase border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#217A4B] animate-pulse" />
              <span>Factory-Direct Industrial Supplies</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-[1.12]">
              Industrial ID Supplies,{" "}
              <span className="text-[#E87832]">Lanyard Rolls</span> & Card Machines.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Manufacturer trade supply of 100m single/double satin lanyard rolls, optical-grade CR-80 PVC holders, nickel-plated dog hooks, 13.56MHz RFID cards, and heavy-duty card cutters.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <a
                href="#catalogue-section"
                className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group text-center"
              >
                <span>Browse {totalProductsCount} Live Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Request Custom Specs</span>
              </Link>
            </div>

            {/* Technical Factory Standards */}
            <div className="pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-3 text-xs">
              <div>
                <div className="font-extrabold text-white text-xs sm:text-base">CR-80 ISO</div>
                <div className="text-slate-400 text-[9px] sm:text-[11px]">86 × 54 mm Standard</div>
              </div>
              <div>
                <div className="font-extrabold text-white text-xs sm:text-base">100m - 500m</div>
                <div className="text-slate-400 text-[9px] sm:text-[11px]">Continuous Rolls</div>
              </div>
              <div>
                <div className="font-extrabold text-white text-xs sm:text-base">Dispatch</div>
                <div className="text-slate-400 text-[9px] sm:text-[11px]">Same-Day Wholesale</div>
              </div>
            </div>
          </div>

          {/* Right Column: PRODUCT-FIRST HERO SHOWCASE STAGE */}
          <div
            className="lg:col-span-7"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="bg-[#17365D]/90 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 shadow-2xl relative overflow-hidden">
              {/* Top Banner inside Hero Card */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#E87832] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Product Spotlight</span>
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    {activeProduct.category?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(
                        (prev) => (prev - 1 + heroProducts.length) % heroProducts.length
                      )
                    }
                    className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 px-1">
                    {activeIndex + 1}/{heroProducts.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) => (prev + 1) % heroProducts.length)
                    }
                    className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Main Product Showcase Block: Split Image + Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 py-3 sm:py-5 items-center">
                {/* Product Image Stage */}
                <div className="sm:col-span-5 relative">
                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="block aspect-[4/3] sm:aspect-square max-h-56 sm:max-h-none bg-white rounded-xl p-3 sm:p-4 overflow-hidden border border-white/20 shadow-md group relative"
                  >
                    <img
                      src={heroImg}
                      alt={activeProduct.name}
                      onError={() => setHeroImg("/placeholder-product.svg")}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#17365D] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-xs">
                      Factory Direct
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded">
                      {activeProduct.sku}
                    </div>
                  </Link>
                </div>

                {/* Product Information & Live Pricing */}
                <div className="sm:col-span-7 space-y-2.5 sm:space-y-3.5">
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white leading-snug hover:text-[#E87832] transition-colors">
                      <Link href={`/products/${activeProduct.slug}`}>
                        {activeProduct.name}
                      </Link>
                    </h3>
                  </div>

                  {/* Specifications Pills */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 text-xs">
                    {activeProduct.material && (
                      <span className="bg-white/10 text-slate-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.material}
                      </span>
                    )}
                    {activeProduct.dimensions && (
                      <span className="bg-white/10 text-slate-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.dimensions}
                      </span>
                    )}
                    {activeProduct.color && (
                      <span className="bg-white/10 text-slate-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.color}
                      </span>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 sm:p-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">
                        Wholesale B2B Rate
                      </span>
                      <span className="text-base sm:text-xl font-extrabold text-[#E87832]">
                        {activeProduct.price_display ||
                          (activeProduct.price
                            ? `₹ ${Number(activeProduct.price).toLocaleString("en-IN")}`
                            : "Trade Quote on Request")}
                      </span>
                    </div>

                    {activeProduct.minimum_order_quantity && (
                      <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
                        MOQ: {activeProduct.minimum_order_quantity} Units
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex-1 bg-[#E87832] hover:bg-[#d66b28] text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs transition-colors shadow-sm text-center"
                    >
                      Request Batch Quotation
                    </button>
                    <Link
                      href={`/products/${activeProduct.slug}`}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs transition-colors border border-white/15 text-center"
                    >
                      Specs
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Dynamic Horizontal Swipe on Mobile, Grid on Desktop */}
              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Featured Factory Lines (Tap to switch):
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-6">
                  {heroProducts.map((prod, idx) => {
                    const thumbImg =
                      prod.primary_image?.secure_url ||
                      (prod.images && prod.images.length > 0
                        ? prod.images[0].secure_url
                        : "/placeholder-product.svg");
                    const isSelected = idx === activeIndex;

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`p-1.5 rounded-xl border transition-all text-left flex flex-col items-center shrink-0 w-24 sm:w-auto ${
                          isSelected
                            ? "bg-white text-[#17365D] border-[#E87832] shadow-md ring-2 ring-[#E87832]"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/15"
                        }`}
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg p-1 overflow-hidden shrink-0 mb-1">
                          <img
                            src={thumbImg}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-full leading-tight text-center">
                          {prod.sku.replace("LAN-", "").replace("MCH-", "").replace("HLD-", "").replace("CRD-", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Enquiry Modal */}
      {modalOpen && (
        <EnquiryModal
          product={activeProduct}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
