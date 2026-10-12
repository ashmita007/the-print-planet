"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Shield,
  Layers,
  Box,
  Truck,
  Phone,
  Mail,
  CheckCircle2,
  ZoomIn,
  Check,
  Copy,
  Clock,
  FileCheck2,
  Printer,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import { Product } from "@/lib/types";
import EnquiryModal from "./EnquiryModal";
import ImageLightboxModal from "./ImageLightboxModal";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "overview" | "hardware" | "shipping">("specs");

  const formatImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder-product.svg";
    return url;
  };

  const initialImage = formatImageUrl(
    product.primary_image?.secure_url ||
    (product.images && product.images.length > 0 ? product.images[0].secure_url : "/placeholder-product.svg")
  );

  const [selectedImage, setSelectedImage] = useState<string>(initialImage);
  const [imgError, setImgError] = useState(false);

  const imagesList = (
    product.images && product.images.length > 0
      ? product.images.map((img) => formatImageUrl(img.secure_url))
      : product.primary_image
      ? [formatImageUrl(product.primary_image.secure_url)]
      : []
  );

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I want to order ${product.name} (SKU: ${product.sku}). Please share price quote, minimum order quantity, and dispatch time.`
  );

  const handleCopySku = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  // Extract key attributes
  const rollLength = product.specifications?.["Roll Length"] || "100 m";
  const rollWidth = product.dimensions || product.specifications?.["Lanyard Width"] || "20 mm";
  const printType = product.specifications?.["Printing Type"] || "Screen / Sublimation Print";
  const coreType = product.specifications?.["Core Type"] || "Plastic Core";
  const material = product.material || product.specifications?.["Material"] || "Satin Polyester";
  const color = product.color || product.specifications?.["Color"] || "Indian Orange";

  return (
    <>
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Gallery + Trust Cards (5 Cols on LG)         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Hero Image Container */}
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative w-full pt-[90%] sm:pt-[100%] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] rounded-2xl border border-[#DCE3EB] overflow-hidden shadow-xs cursor-zoom-in group select-none"
            title="Click to view full-screen high-resolution image"
          >
            {!imgError && selectedImage && !selectedImage.startsWith("/placeholder") ? (
              <img
                src={selectedImage}
                alt={product.name}
                onError={() => {
                  setImgError(true);
                  setSelectedImage("/placeholder-product.svg");
                }}
                className="absolute inset-0 w-full h-full object-contain p-4 sm:p-8 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-400">
                <Box className="w-16 h-16 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">Industrial ID Asset</span>
              </div>
            )}

            {/* Status Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              {product.is_featured && (
                <span className="bg-[#17365D] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E87832]" /> Featured Model
                </span>
              )}
              {product.verification_status === "verified" && (
                <span className="bg-[#217A4B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Specs Verified
                </span>
              )}
            </div>

            {/* Tap to Zoom Badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#17365D] border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs group-hover:bg-[#17365D] group-hover:text-white transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tap to Zoom</span>
            </div>

            {/* Ready to Ship Pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#217A4B] border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#217A4B] animate-pulse" />
              <span>In Stock • Ready to Dispatch</span>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl bg-[#F8FAFC] border p-1 shrink-0 overflow-hidden transition-all ${
                    selectedImage === imgUrl
                      ? "border-[#17365D] ring-2 ring-[#17365D]/20 shadow-xs"
                      : "border-[#DCE3EB] hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Select product image ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Logistics & Trust Features Card */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#DCE3EB] space-y-3 text-xs">
            <h4 className="font-bold text-[#17365D] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#E87832]" /> B2B Supply & Dispatch Guarantees
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-[#DCE3EB]/80">
                <Clock className="w-3.5 h-3.5 text-[#17365D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#263445]">24–48h Dispatch</p>
                  <p className="text-slate-500 text-[10px]">Bengaluru Hub</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-[#DCE3EB]/80">
                <Box className="w-3.5 h-3.5 text-[#17365D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#263445]">Moisture Sealed</p>
                  <p className="text-slate-500 text-[10px]">Export Shrink Wrap</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-[#DCE3EB]/80">
                <FileCheck2 className="w-3.5 h-3.5 text-[#17365D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#263445]">GST Tax Invoice</p>
                  <p className="text-slate-500 text-[10px]">100% Tax Compliant</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-[#DCE3EB]/80">
                <Shield className="w-3.5 h-3.5 text-[#17365D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#263445]">QC Inspected</p>
                  <p className="text-slate-500 text-[10px]">Tensile & Color Fast</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Desk */}
            <div className="pt-2 border-t border-[#DCE3EB] flex items-center justify-between text-[11px] text-[#687586]">
              <span>Direct Sales Desk:</span>
              <a
                href="tel:+919741808034"
                className="font-bold text-[#17365D] hover:text-[#E87832] flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> +91 97418 08034
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Specifications, Pricing & CTAs (7 Cols)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Badges & Category */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href={`/categories/${product.category.slug}`}
                className="bg-[#102742] text-white hover:bg-[#17365D] font-bold px-2.5 py-1 rounded-md transition-colors text-[11px]"
              >
                {product.category.name}
              </Link>

              {/* SKU Pill with Copy */}
              <button
                type="button"
                onClick={handleCopySku}
                className="flex items-center gap-1 bg-[#F5F7FA] hover:bg-slate-200 text-[#263445] px-2.5 py-1 rounded-md border border-[#DCE3EB] font-mono text-[11px] font-semibold transition-colors"
                title="Click to copy SKU"
              >
                <span>SKU: {product.sku}</span>
                {copiedSku ? (
                  <Check className="w-3 h-3 text-[#217A4B]" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17365D] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Short Tagline / Summary */}
            <p className="text-xs sm:text-sm text-[#687586] leading-relaxed">
              {product.short_description ||
                "Industrial-grade satin polyester lanyard roll for corporate ID cards, security passes, and event identification straps."}
            </p>
          </div>

          {/* Pricing & MOQ Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#F5F7FA] via-white to-[#F8FAFC] rounded-2xl border border-[#DCE3EB] shadow-xs space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687586] block">
                  Wholesale Factory Price
                </span>
                {product.price_display ? (
                  <div className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight">
                    {product.price_display}
                  </div>
                ) : product.price ? (
                  <div className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight">
                    ₹ {Number(product.price).toLocaleString("en-IN")}
                    <span className="text-xs font-semibold text-slate-500 ml-1">/ Roll</span>
                  </div>
                ) : (
                  <div className="text-xl font-extrabold text-[#E87832]">
                    Price on Request
                  </div>
                )}
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Ex-factory Bengaluru • GST applicable extra
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687586] block">
                  Order Quantity
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#263445] block">
                  {product.minimum_order_quantity
                    ? `${product.minimum_order_quantity} Units MOQ`
                    : "1 Roll (Sample) / 50 Rolls (Carton)"}
                </span>
                <span className="text-[10px] text-[#217A4B] font-bold block mt-0.5">
                  Bulk tier pricing available for 10+ rolls
                </span>
              </div>
            </div>
          </div>

          {/* Quick Specifications 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
            <div className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Width</span>
              <span className="font-extrabold text-[#17365D] mt-0.5 block text-xs sm:text-sm truncate">
                {rollWidth}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll Length</span>
              <span className="font-extrabold text-[#17365D] mt-0.5 block text-xs sm:text-sm truncate">
                {rollLength}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Material</span>
              <span className="font-extrabold text-[#17365D] mt-0.5 block text-xs sm:text-sm truncate">
                {material}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Color</span>
              <span className="font-extrabold text-[#17365D] mt-0.5 block text-xs sm:text-sm truncate">
                {color}
              </span>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex-1 bg-[#E87832] hover:bg-[#d66b28] active:bg-[#c55d1d] text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Request Factory Quotation</span>
            </button>

            <a
              href={`https://wa.me/919741808034?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#217A4B] hover:bg-[#1b633d] active:bg-[#154e30] text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>WhatsApp Trade Chat</span>
            </a>
          </div>

          {/* Comprehensive Content Tabs */}
          <div className="pt-4 border-t border-[#DCE3EB] space-y-4">
            {/* Tabs Navigation */}
            <div className="flex border-b border-[#DCE3EB] gap-1 overflow-x-auto scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "specs"
                    ? "border-[#17365D] text-[#17365D]"
                    : "border-transparent text-[#687586] hover:text-[#263445]"
                }`}
              >
                Technical Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-[#17365D] text-[#17365D]"
                    : "border-transparent text-[#687586] hover:text-[#263445]"
                }`}
              >
                Overview & Printing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("hardware")}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "hardware"
                    ? "border-[#17365D] text-[#17365D]"
                    : "border-transparent text-[#687586] hover:text-[#263445]"
                }`}
              >
                Hardware Compatibility
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "shipping"
                    ? "border-[#17365D] text-[#17365D]"
                    : "border-transparent text-[#687586] hover:text-[#263445]"
                }`}
              >
                Packaging & Dispatch
              </button>
            </div>

            {/* Tab 1: Technical Specifications Table */}
            {activeTab === "specs" && (
              <div className="space-y-3">
                <div className="border border-[#DCE3EB] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      <tr className="bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB] w-2/5">
                          Product Code (SKU)
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#17365D] font-mono border-b border-[#DCE3EB] w-3/5">
                          {product.sku}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Ribbon Width
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          {rollWidth}
                        </td>
                      </tr>
                      <tr className="bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Roll Continuous Length
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          {rollLength} (Approx. 100 meters continuous)
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Material Formulation
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          100% Virgin High-Tenacity Polyester (Double/Single Satin Finish)
                        </td>
                      </tr>
                      <tr className="bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Shade & Color Fastness
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          {color} (Reactive vat dyed • High wash and sweat fastness)
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Recommended Printing Method
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          {printType}
                        </td>
                      </tr>
                      <tr className="bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                          Core & Winding
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                          {coreType} (Standard rotary machine compatible)
                        </td>
                      </tr>

                      {/* Dynamic Backend Specs */}
                      {product.specifications &&
                        Object.entries(product.specifications)
                          .filter(
                            ([k]) =>
                              ![
                                "Roll Length",
                                "Lanyard Width",
                                "Printing Type",
                                "Core Type",
                                "Material",
                                "Color",
                              ].includes(k)
                          )
                          .map(([key, val], idx) => (
                            <tr
                              key={key}
                              className={idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                            >
                              <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                                {key}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                                {val}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Overview & Printing Methods */}
            {activeTab === "overview" && (
              <div className="space-y-3 text-xs text-[#263445] leading-relaxed">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE3EB] space-y-2">
                  <h4 className="font-bold text-[#17365D] text-xs">
                    Industrial Application Overview
                  </h4>
                  <p>
                    {product.description ||
                      "Manufactured specifically for ID card strap manufacturing, corporate lanyards, and institutional passes. The satin weave provides a high-density, flat surface that ensures sharp edge definition during screen printing."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#17365D]">
                      <Printer className="w-3.5 h-3.5 text-[#E87832]" />
                      <span>Screen Printing Compatibility</span>
                    </div>
                    <p className="text-[11px] text-[#687586]">
                      Accepts plastisol, solvent, and water-based screen printing inks with high color retention and zero bleed-through.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#17365D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#217A4B]" />
                      <span>Dimensional Stability</span>
                    </div>
                    <p className="text-[11px] text-[#687586]">
                      Calibrated 20 mm width fits standard machine feeding guides without curvature or edge fraying during high-speed cutting.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Hardware Compatibility */}
            {activeTab === "hardware" && (
              <div className="space-y-3 text-xs">
                <p className="text-[#687586] text-[11px]">
                  This 20 mm satin roll is dimensionally tailored for all industry-standard 20 mm ID card hardware and attachments:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      01
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">20 mm Metal Dog Hooks & Oval Hooks</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Zinc-alloy and nickel-plated snap hooks for badge holding.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      02
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Safety Breakaway Clasps</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mandatory OH&S safety release clips for industrial and hospital ID cords.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      03
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Alligator & Bulldog Clips</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        20 mm wide base clips for direct pocket and collar badge attachment.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      04
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Detachable Buckles & Crimp Rings</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Side release plastic buckles and metal crimp clips for loop termination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Packaging & Dispatch */}
            {activeTab === "shipping" && (
              <div className="space-y-3 text-xs text-[#263445]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1.5">
                    <h5 className="font-bold text-[#17365D] flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-[#E87832]" /> Packaging Standards
                    </h5>
                    <ul className="space-y-1 text-[11px] text-[#687586] list-disc list-inside">
                      <li>Each 100 m roll individually shrink-wrapped with moisture desiccant</li>
                      <li>Master Carton: 50 rolls (5,000 meters total)</li>
                      <li>Carton Dimensions: Approx. 45 × 35 × 30 cm (Heavy-duty 5-ply corrugated)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1.5">
                    <h5 className="font-bold text-[#17365D] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#217A4B]" /> Pan-India Logistics
                    </h5>
                    <ul className="space-y-1 text-[11px] text-[#687586] list-disc list-inside">
                      <li>Express Couriers: DTDC, Professional, Blue Dart, Delhivery</li>
                      <li>Surface Transport / Cargo: VRL, TCI Freight, ARC, Navata</li>
                      <li>Local Bengaluru: Same-day porter / pickup available</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY BOTTOM DOCK (Visible on Mobile Only)        */}
      {/* ========================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE3EB] p-2.5 px-3 flex items-center justify-between gap-2 shadow-xl animate-in slide-in-from-bottom-2">
        <div className="min-w-0 pr-1">
          <div className="text-base font-black text-[#17365D] truncate leading-none">
            {product.price_display || `₹ ${product.price || 300}`}
          </div>
          <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5">
            {product.sku} • 100m Roll
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`https://wa.me/919741808034?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#217A4B] text-white py-2 px-3 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
            aria-label="WhatsApp quick chat"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#E87832] text-white py-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
            aria-label="Request quote"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Get Quote</span>
          </button>
        </div>
      </div>

      {/* Spacing safeguard for mobile dock */}
      <div className="sm:hidden h-12" />

      {/* Responsive Enquiry Modal */}
      {modalOpen && (
        <EnquiryModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Responsive Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={imagesList.length > 0 ? imagesList : [selectedImage]}
        initialIndex={Math.max(0, imagesList.indexOf(selectedImage))}
        productName={product.name}
      />
    </>
  );
}
