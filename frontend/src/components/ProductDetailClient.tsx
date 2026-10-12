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
  FileText,
  Share2,
  CheckCircle,
} from "lucide-react";
import { Product } from "@/lib/types";
import EnquiryModal from "./EnquiryModal";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
    `Hello, I am interested in ordering: ${product.name} (SKU: ${product.sku}). Please provide trade quote and dispatch lead time.`
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Image Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full pt-[100%] bg-[#F8FAFC] rounded-2xl border border-[#DCE3EB] overflow-hidden shadow-xs">
            {!imgError && selectedImage && !selectedImage.startsWith("/placeholder") ? (
              <img
                src={selectedImage}
                alt={product.name}
                onError={() => {
                  setImgError(true);
                  setSelectedImage("/placeholder-product.svg");
                }}
                className="absolute inset-0 w-full h-full object-contain p-3 sm:p-6"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-400">
                <Box className="w-16 h-16 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">Authentic Industrial Asset</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="bg-[#17365D] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                  Featured Model
                </span>
              )}
              {product.verification_status === "verified" && (
                <span className="bg-[#217A4B] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Specs Verified
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-lg bg-[#F8FAFC] border p-1 shrink-0 overflow-hidden transition-all ${
                    selectedImage === imgUrl
                      ? "border-[#17365D] ring-2 ring-[#17365D]/20"
                      : "border-[#DCE3EB] hover:border-slate-400"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Logistics Trust Box */}
          <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#DCE3EB] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#263445] font-semibold">
              <Truck className="w-4 h-4 text-[#17365D]" />
              <span>Standard Factory Packaging</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Export-grade corrugated packaging with protective moisture wrapping. Bulk orders dispatched from Bengaluru manufacturing hub.
            </p>
          </div>
        </div>

        {/* Right Column: Specifications & Direct Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Link
                href={`/categories/${product.category.slug}`}
                className="bg-[#F5F7FA] text-[#17365D] hover:text-[#E87832] font-semibold px-2.5 py-0.5 rounded border border-[#DCE3EB]"
              >
                {product.category.name}
              </Link>
              <span className="text-slate-400 font-mono text-[11px]">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Pricing & MOQ Banner */}
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#DCE3EB] flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#687586] block">
                Trade Quotation Price
              </span>
              {product.price_display ? (
                <div className="text-2xl font-black text-[#17365D]">
                  {product.price_display}
                </div>
              ) : product.price ? (
                <div className="text-2xl font-black text-[#17365D]">
                  ₹ {Number(product.price).toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-slate-500 ml-1">/ unit</span>
                </div>
              ) : (
                <div className="text-xl font-bold text-[#E87832]">
                  Price Available on Request
                </div>
              )}
            </div>

            {product.minimum_order_quantity && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#687586] block">
                  Minimum Order Quantity
                </span>
                <span className="text-base font-extrabold text-[#263445]">
                  {product.minimum_order_quantity} Units
                </span>
              </div>
            )}
          </div>

          {/* Key Attribute Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {product.material && (
              <div className="p-3 bg-white border border-[#DCE3EB] rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Material</span>
                <span className="font-bold text-[#263445] mt-0.5 block truncate">{product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="p-3 bg-white border border-[#DCE3EB] rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dimensions</span>
                <span className="font-bold text-[#263445] mt-0.5 block truncate">{product.dimensions}</span>
              </div>
            )}
            {product.color && (
              <div className="p-3 bg-white border border-[#DCE3EB] rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Color</span>
                <span className="font-bold text-[#263445] mt-0.5 block truncate">{product.color}</span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex-1 bg-[#E87832] hover:bg-[#d66b28] text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Request Factory Quotation</span>
            </button>

            <a
              href={`https://wa.me/919741808034?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#217A4B] hover:bg-[#1b633d] text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Trade Chat</span>
            </a>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17365D]">
              Product Overview & Application
            </h3>
            <p className="text-xs sm:text-sm text-[#263445] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE3EB]">
              {product.description ||
                "Industrial grade identification component manufactured for long-term durability and dimensional compliance."}
            </p>
          </div>

          {/* Technical Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17365D]">
                Verified Technical Specifications
              </h3>
              <div className="border border-[#DCE3EB] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], index) => (
                      <tr
                        key={key}
                        className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                      >
                        <td className="py-2.5 px-4 font-semibold text-[#687586] border-b border-[#DCE3EB] w-2/5">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#263445] border-b border-[#DCE3EB] w-3/5">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <EnquiryModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
