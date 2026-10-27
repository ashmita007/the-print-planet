"use client";

import React, { useEffect, useState } from "react";
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
  ChevronRight,
  Info,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";
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
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [selectedImage]);

  const imagesList = (
    product.images && product.images.length > 0
      ? product.images.map((img) => formatImageUrl(img.secure_url))
      : product.primary_image
      ? [formatImageUrl(product.primary_image.secure_url)]
      : []
  );

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I want to order ${formatProductName(product.name)} (SKU: ${product.sku}). Please share price quote, minimum order quantity, and dispatch time.`
  );

  const handleCopySku = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  // Dynamically extract top 4 highlight attributes for any category
  const dynamicHighlights: { label: string; value: string }[] = [];
  if (product.dimensions) {
    dynamicHighlights.push({ label: "Dimensions / Format", value: product.dimensions });
  }
  if (product.material) {
    dynamicHighlights.push({ label: "Material / Build", value: product.material });
  }
  if (product.color) {
    dynamicHighlights.push({ label: "Color / Finish", value: product.color });
  }
  if (product.minimum_order_quantity) {
    dynamicHighlights.push({ label: "Minimum Order", value: `${product.minimum_order_quantity} Units MOQ` });
  }
  if (product.specifications && typeof product.specifications === "object") {
    for (const [k, v] of Object.entries(product.specifications)) {
      if (dynamicHighlights.length >= 4) break;
      if (v && typeof v === "string" && !dynamicHighlights.some((h) => h.label.toLowerCase() === k.toLowerCase())) {
        dynamicHighlights.push({ label: k, value: v });
      }
    }
  }
  if (dynamicHighlights.length < 4 && product.category?.name) {
    dynamicHighlights.push({ label: "Category", value: formatCategoryName(product.category.name) });
  }
  if (dynamicHighlights.length < 4) {
    dynamicHighlights.push({ label: "Supply Grade", value: "Industrial Heavy-Duty" });
  }

  const isMachine =
    product.category?.slug?.includes("machine") ||
    product.category?.name?.toLowerCase().includes("machine") ||
    Boolean(product.specifications?.["Heating"]) ||
    Boolean(product.specifications?.["Pressure"]) ||
    Boolean(product.specifications?.["Output"]);

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
            className="relative w-full pt-[90%] sm:pt-[100%] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden cursor-zoom-in group select-none"
            title="Click to view full-screen high-resolution image"
          >
            {!imgLoaded && !imgError && selectedImage && !selectedImage.startsWith("/placeholder") && (
              <div className="absolute inset-0 skeleton" />
            )}

            {!imgError && selectedImage && !selectedImage.startsWith("/placeholder") ? (
              <img
                src={selectedImage}
                alt={formatProductName(product.name)}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgError(true);
                  setSelectedImage("/placeholder-product.svg");
                }}
                className={`absolute inset-0 w-full h-full object-contain p-4 sm:p-8 group-hover:scale-[1.03] transition-[opacity,transform] duration-500 ease-out ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-400">
                <Box className="w-16 h-16 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">Industrial ID Asset</span>
              </div>
            )}

            {/* Quiet stock status */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-600 bg-white/85 backdrop-blur-sm px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#217A4B]" />
              <span>In stock · dispatches in 24–48h</span>
            </div>

            <div className="absolute top-3 right-3 text-slate-400 group-hover:text-slate-600 transition-colors">
              <ZoomIn className="w-4 h-4" />
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
                    alt={`${formatProductName(product.name)} view ${idx + 1}`}
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
                  <p className="font-bold text-[#263445]">{isMachine ? "Crate Packaging" : "Moisture Sealed"}</p>
                  <p className="text-slate-500 text-[10px]">{isMachine ? "Heavy-Duty Wood Pallet" : "Export Shrink Wrap"}</p>
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
                  <p className="text-slate-500 text-[10px]">Verified Specifications</p>
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
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 hover:text-[#17365D] transition-colors"
              >
                {formatCategoryName(product.category.name)}
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#17365D] tracking-tight leading-snug">
              {formatProductName(product.name)}
            </h1>

            {/* Short Tagline / Summary */}
            <p className="text-xs sm:text-sm text-[#687586] leading-relaxed">
              {product.short_description || product.description ||
                "Industrial-grade commercial supply engineered for professional ID card printing, lanyard manufacturing, and identification solutions."}
            </p>
          </div>

          {/* Pricing & MOQ Banner */}
          <div className="p-4 sm:p-5 bg-[#FAFBFC] rounded-2xl border border-[#DCE3EB] shadow-xs space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 block">
                  Wholesale price
                </span>
                {product.price_display ? (
                  <div className="text-2xl sm:text-3xl font-semibold text-[#17365D] tracking-tight tabular-nums">
                    {product.price_display}
                  </div>
                ) : product.price ? (
                  <div className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight">
                    ₹ {Number(product.price).toLocaleString("en-IN")}
                    <span className="text-xs font-semibold text-slate-500 ml-1">/ Unit</span>
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
                    : "Commercial Batch Order"}
                </span>
                <span className="text-[10px] text-[#217A4B] font-bold block mt-0.5">
                  Bulk trade tier discounts on high-volume lots
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Highlights 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
            {dynamicHighlights.map((item, idx) => (
              <div key={idx} className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
                  {item.label}
                </span>
                <span className="font-extrabold text-[#17365D] mt-0.5 block text-xs sm:text-sm truncate">
                  {item.value}
                </span>
              </div>
            ))}
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
                Overview & Applications
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
                How It Works & Ordering
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
                          Category Sector
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB] uppercase">
                          {formatCategoryName(product.category?.name || "General Catalog")}
                        </td>
                      </tr>
                      {product.material && (
                        <tr className="bg-[#F8FAFC]">
                          <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                            Material / Construction
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                            {product.material}
                          </td>
                        </tr>
                      )}
                      {product.dimensions && (
                        <tr className="bg-white">
                          <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                            Dimensions / Sheet Format
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                            {product.dimensions}
                          </td>
                        </tr>
                      )}
                      {product.color && (
                        <tr className="bg-[#F8FAFC]">
                          <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                            Color / Surface Finish
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                            {product.color}
                          </td>
                        </tr>
                      )}
                      {product.minimum_order_quantity && (
                        <tr className="bg-white">
                          <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                            Minimum Order Quantity
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                            {product.minimum_order_quantity} Units
                          </td>
                        </tr>
                      )}

                      {/* Dynamic Backend Specs */}
                      {product.specifications &&
                        Object.entries(product.specifications).map(([key, val], idx) => (
                          <tr
                            key={key}
                            className={idx % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"}
                          >
                            <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB]">
                              {key}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB]">
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Overview & Applications */}
            {activeTab === "overview" && (
              <div className="space-y-3 text-xs text-[#263445] leading-relaxed">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE3EB] space-y-2">
                  <h4 className="font-bold text-[#17365D] text-xs">
                    Industrial Application Overview
                  </h4>
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.description ||
                      product.short_description ||
                      "Manufactured specifically for ID card printers, lanyard manufacturing, corporate security, and institutional badge manufacturing."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#17365D]">
                      <Printer className="w-3.5 h-3.5 text-[#E87832]" />
                      <span>Commercial Grade Engineering</span>
                    </div>
                    <p className="text-[11px] text-[#687586]">
                      Built to withstand high-volume continuous operation with high precision tolerances and repeatable outputs.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#17365D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#217A4B]" />
                      <span>Certified Quality Compliance</span>
                    </div>
                    <p className="text-[11px] text-[#687586]">
                      Calibrated for ISO CR-80 standards and tested against physical, thermal, and electrical durability standards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: How It Works & Ordering Workflow (DeltaCardz-style) */}
            {activeTab === "hardware" && (
              <div className="space-y-3 text-xs">
                <p className="text-[#687586] text-[11px]">
                  Direct factory supply workflow — from requirement enquiry to insured delivery in 5 simple steps:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      01
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Pick Your Model or Material</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose from fusing machines, cutters, lanyard printers, PVC sheets, holders, or RFID cards.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      02
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Request a Factory Quotation</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Submit required quantity. Our sales desk replies within 1 working hour with GST-inclusive pricing.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      03
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Video Demo & Free Swatches</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        For machines: get video demo, power, and speed specs. For consumables: physical sample proofing.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#17365D] shrink-0 text-xs">
                      04
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Confirm & Pay via GST Invoice</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Instant proforma on company letterhead. Pay securely via NEFT / RTGS / UPI with GST credit.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#DCE3EB] rounded-xl flex items-start gap-2.5 sm:col-span-2">
                    <div className="w-7 h-7 rounded bg-[#F5F7FA] flex items-center justify-center font-bold text-[#217A4B] shrink-0 text-xs">
                      05
                    </div>
                    <div>
                      <h5 className="font-bold text-[#17365D]">Pan-India Dispatch in 24–48 Hours</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dispatched via top cargo & couriers (DTDC, Blue Dart, VRL, TCI) with real-time tracking from our Bengaluru hub.
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
                      {isMachine ? (
                        <>
                          <li>Heavy-duty fumigated wooden box / plywood crate packaging</li>
                          <li>Shock-absorbent foam lining with corrosion-inhibiting rust shield</li>
                          <li>Pre-delivery testing certificate & operation manual included</li>
                        </>
                      ) : (
                        <>
                          <li>Individually shrink-wrapped lots with moisture-absorbent desiccant</li>
                          <li>Heavy-duty 5-ply export corrugated master cartons</li>
                          <li>Corner-reinforced strapping for zero transit damage</li>
                        </>
                      )}
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE3EB] p-2.5 px-3 flex items-center justify-between gap-2 shadow-xl anim-toast">
        <div className="min-w-0 pr-1">
          <div className="text-base font-black text-[#17365D] truncate leading-none">
            {product.price_display || (product.price ? `₹ ${product.price}` : "Price on Request")}
          </div>
          <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5">
            {product.sku} • {formatCategoryName(product.category?.name || "Direct Factory Supply")}
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
        productName={formatProductName(product.name)}
      />
    </>
  );
}
