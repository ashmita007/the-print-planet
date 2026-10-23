"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Award,
  Layers,
  FileText,
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

  // Auto-rotate every 5.5 seconds unless paused
  useEffect(() => {
    if (isPaused || heroProducts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, heroProducts.length]);

  if (!activeProduct) return null;

  return (
    <section className="relative bg-[#0D1E35] text-white overflow-hidden py-8 sm:py-12 lg:py-16 border-b-4 border-[#E87832]">
      {/* Ambient background glows & technical grid */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E87832]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#17365D]/40 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Industrial Proposition & Quotation */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 w-full text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white shadow-xs transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] sm:text-xs font-black tracking-wide text-white uppercase">
                The Print Planet™
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#FFA868]">
                India&apos;s Direct B2B Factory
              </span>
            </div>

            {/* Main Primary SEO & Brand Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black tracking-tight leading-[1.14] text-white">
              Print Planet —{" "}
              <span className="bg-gradient-to-r from-[#FF7A1A] via-[#FFA868] to-[#FFC799] bg-clip-text text-transparent">
                Factory Direct
              </span>
              <span className="block text-lg sm:text-2xl lg:text-[1.55rem] font-extrabold text-slate-100 mt-2 sm:mt-2.5 leading-snug">
                Wholesale ID Cards, Lanyard Rolls &amp; Machinery
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
              Official portal of <strong>The Print Planet</strong> (theprintplanet.co.in). India&apos;s leading B2B manufacturing hub for satin lanyard rolls, rigid PVC ID card holders, RFID smart cards, dog hooks, and card die cutting machinery with 24–48h pan-India dispatch.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <a
                href="#catalogue-section"
                className="bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_6px_20px_rgba(232,120,50,0.35)] flex items-center justify-center gap-2 group text-center"
              >
                <span>Browse {totalProductsCount} Live Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/quote"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/25 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 text-center backdrop-blur-xs"
              >
                <FileText className="w-4 h-4 text-[#FFA868]" />
                <span>Instant Factory Quote</span>
              </Link>
            </div>

            {/* Technical Factory Standards Strip */}
            <div className="pt-3 sm:pt-4 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">CR-80 ISO</span>
                </div>
                <div className="text-slate-300 text-[10px]">85.6 × 54 mm Standard</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-[#FFA868] mb-0.5">
                  <Award className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">Optical Grade</span>
                </div>
                <div className="text-slate-300 text-[10px]">UV &amp; Scratch Proof</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-white text-[11px] sm:text-xs">Fast Dispatch</span>
                </div>
                <div className="text-slate-300 text-[10px]">24–48h Pan-India</div>
              </div>
            </div>
          </div>

          {/* Right Column: PRODUCT-FIRST HERO SHOWCASE STAGE */}
          <div
            className="lg:col-span-7 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="bg-gradient-to-b from-[#142C4B]/95 to-[#0F223A]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/10">
              {/* Spotlight Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFA868] flex items-center gap-1.5 bg-[#E87832]/15 border border-[#E87832]/30 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#FFA868]" />
                    <span>Factory Spotlight</span>
                  </span>
                  <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                  <span className="text-[11px] sm:text-xs text-slate-200 font-medium truncate max-w-[130px] sm:max-w-[200px]">
                    {activeProduct.category?.name}
                  </span>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(
                        (prev) => (prev - 1 + heroProducts.length) % heroProducts.length
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-200 px-1.5">
                    {activeIndex + 1}/{heroProducts.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) => (prev + 1) % heroProducts.length)
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Product Showcase Block */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 py-4 sm:py-5 items-center">
                {/* Product Image Stage */}
                <div className="sm:col-span-5 relative">
                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="block aspect-square max-h-52 sm:max-h-none w-48 sm:w-full mx-auto bg-gradient-to-b from-white to-slate-50 rounded-2xl p-3 sm:p-5 overflow-hidden border border-white/30 shadow-lg group relative"
                  >
                    <img
                      src={heroImg}
                      alt={activeProduct.name}
                      onError={() => setHeroImg("/placeholder-product.svg")}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#17365D] text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                      Factory Direct
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {activeProduct.sku}
                    </div>
                  </Link>
                </div>

                {/* Product Information & Live Pricing */}
                <div className="sm:col-span-7 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white leading-snug hover:text-[#FFA868] transition-colors">
                      <Link href={`/products/${activeProduct.slug}`}>
                        {activeProduct.name}
                      </Link>
                    </h3>
                  </div>

                  {/* Specifications Pills */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {activeProduct.material && (
                      <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.material}
                      </span>
                    )}
                    {activeProduct.dimensions && (
                      <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.dimensions}
                      </span>
                    )}
                    {activeProduct.color && (
                      <span className="bg-white/10 text-slate-200 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium border border-white/10">
                        {activeProduct.color}
                      </span>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex items-baseline justify-between backdrop-blur-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 block">
                        Wholesale Factory Rate
                      </span>
                      <span className="text-lg sm:text-2xl font-black text-[#FFA868]">
                        {activeProduct.price_display ||
                          (activeProduct.price
                            ? `₹ ${Number(activeProduct.price).toLocaleString("en-IN")}`
                            : "Trade Quote on Request")}
                      </span>
                    </div>

                    {activeProduct.minimum_order_quantity && (
                      <span className="text-[11px] sm:text-xs text-slate-200 font-semibold bg-white/10 px-2 py-1 rounded-md border border-white/10">
                        MOQ: {activeProduct.minimum_order_quantity} Units
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex-1 bg-gradient-to-r from-[#E87832] to-[#FF7A1A] hover:from-[#d66b28] hover:to-[#e66c15] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-[0_4px_14px_rgba(232,120,50,0.4)] text-center cursor-pointer"
                    >
                      Request Batch Quotation
                    </button>
                    <Link
                      href={`/products/${activeProduct.slug}`}
                      className="bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-colors border border-white/20 text-center"
                    >
                      Specs &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Dynamic Horizontal Swipe on Mobile, Grid on Desktop */}
              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Featured Factory Lines (Tap to switch):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-rotating</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-6 snap-x touch-pan-x">
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
                        className={`p-1.5 rounded-xl border transition-all text-left flex flex-col items-center shrink-0 w-20 sm:w-auto snap-start cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#17365D] border-[#E87832] shadow-md ring-2 ring-[#E87832]"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/15"
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg p-1 overflow-hidden shrink-0 mb-1 border border-slate-100">
                          <img
                            src={thumbImg}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[8.5px] sm:text-[10px] font-bold truncate max-w-full leading-tight text-center">
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
