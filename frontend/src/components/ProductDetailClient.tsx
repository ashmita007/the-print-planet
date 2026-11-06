"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Shield,
  Layers,
  Box,
  Truck,
  Phone,
  Mail,
  ZoomIn,
  Check,
  Copy,
  Clock,
  FileCheck2,
  Printer,
  ChevronRight,
  Info,
  ShoppingBag,
  UploadCloud,
  FileText,
  Sliders,
  Sparkles,
  Plus,
  Minus,
  Paperclip,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCategoryName, formatProductName, getProductImageUrl } from "@/lib/formatters";
import { useCart } from "@/lib/cart";
import EnquiryModal from "./EnquiryModal";
import ImageLightboxModal from "./ImageLightboxModal";
import { trackUserCheckedProduct } from "@/lib/api";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  // Customization & Ordering options
  const moq = product.minimum_order_quantity || 1;
  const [quantity, setQuantity] = useState<number>(moq);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(product.material || "Standard Grade");
  const [selectedDimensions, setSelectedDimensions] = useState<string>(product.dimensions || "Standard");
  const [customText, setCustomText] = useState<string>("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const initialImage = getProductImageUrl(product);

  const [selectedImage, setSelectedImage] = useState<string>(initialImage);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const mainImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setSelectedImage(initialImage);
    setImgError(false);
    setImgLoaded(false);
  }, [initialImage]);

  useEffect(() => {
    setImgLoaded(false);
    const img = mainImageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (product?.id) {
      trackUserCheckedProduct(product.id);
    }
  }, [product?.id]);

  const imagesList =
    product.images && product.images.length > 0
      ? product.images.map((img) => getProductImageUrl(img))
      : [getProductImageUrl(product)];

  const whatsappMessage = encodeURIComponent(
    `Hello The Print Planet, I want to order ${formatProductName(product.name)} (SKU: ${product.sku}, Qty: ${quantity}${
      selectedMaterial ? `, Material: ${selectedMaterial}` : ""
    }${customText ? `, Custom Text: "${customText}"` : ""}). Please share price quote and dispatch time.`
  );

  const handleCopySku = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity, {
      material: selectedMaterial,
      size: selectedDimensions,
      customText: customText || undefined,
      artworkName: artworkFile?.name || undefined,
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArtworkFile(e.target.files[0]);
    }
  };

  // Highlights
  const isMachine =
    product.category?.slug?.includes("machine") ||
    product.category?.name?.toLowerCase().includes("machine");

  // Material alternatives
  const availableMaterials = [
    product.material || "Industrial Grade PVC",
    "Satin Heat-Transfer Fabric",
    "Rigid Polycarbonate",
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Gallery & Trust Highlights (5 Cols)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Hero Image */}
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative w-full pt-[90%] sm:pt-[100%] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden cursor-zoom-in group select-none shadow-xs"
            title="Click to zoom high-resolution preview"
          >
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 skeleton" />
            )}

            {!imgError && selectedImage ? (
              <img
                ref={mainImageRef}
                src={selectedImage}
                alt={formatProductName(product.name)}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  if (selectedImage !== "/placeholder-product.svg") {
                    setSelectedImage("/placeholder-product.svg");
                  } else {
                    setImgError(true);
                  }
                }}
                className={`absolute inset-0 w-full h-full object-contain p-4 sm:p-8 group-hover:scale-105 transition-all duration-500 ease-out ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-400">
                <Box className="w-16 h-16 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">Manufactured Product Spec</span>
              </div>
            )}

            {/* In stock badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Stock • Ready to Dispatch in 24–48h</span>
            </div>

            <div className="absolute top-3 right-3 text-slate-400 group-hover:text-[#353C45] transition-colors">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-md bg-slate-50 border p-1 shrink-0 overflow-hidden transition-all ${
                    selectedImage === imgUrl
                      ? "border-[#B9C3CF] ring-2 ring-[#B9C3CF]/25 shadow-xs"
                      : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100"
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

          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#2B323B]">
            <li className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#353C45]" aria-hidden="true" /> GST invoice
            </li>
            <li className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#353C45]" aria-hidden="true" /> Delivery across India
            </li>
          </ul>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Customization, Pricing & Ordering (7 Cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-[11px] font-bold uppercase tracking-wider text-[#353C45] hover:underline"
              >
                {formatCategoryName(product.category.name)}
              </Link>

              {/* SKU Pill with Copy */}
              <button
                type="button"
                onClick={handleCopySku}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] font-semibold transition-colors"
                title="Click to copy SKU"
              >
                <span>SKU: {product.sku}</span>
                {copiedSku ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight leading-snug">
              {formatProductName(product.name)}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.short_description || product.description ||
                "Industrial-grade commercial supply engineered for professional ID card printing, lanyard manufacturing, and identification solutions."}
            </p>
          </div>

          {/* Pricing Banner */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Wholesale Factory Price
                </span>
                {product.price_display ? (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight tabular-nums">
                    {product.price_display}
                  </div>
                ) : product.price ? (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#121418] tracking-tight">
                    ₹{Number(product.price).toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-semibold text-slate-500">/ unit</span>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-[#353C45]">
                    Direct Wholesale Quote
                  </div>
                )}
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Ex-factory Bengaluru • Tiered wholesale volume pricing available
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Minimum Order
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 block">
                  {moq} Units MOQ
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  Volume discounts apply
                </span>
              </div>
            </div>
          </div>

          {/* Customization Options Box */}
          <div className="p-5 bg-[#FFFFFF] rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-[#353C45]" />
              <h3 className="text-sm font-bold text-[#121418]">Configure &amp; Customize</h3>
            </div>

            {/* Material & Size Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="field-material-finish" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Material / Finish
                </label>
                <select id="field-material-finish" aria-label="Material / Finish"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#B9C3CF]"
                >
                  {availableMaterials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="field-dimensions-format" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dimensions / Format
                </label>
                <input id="field-dimensions-format" aria-label="Dimensions / Format"
                  type="text"
                  value={selectedDimensions}
                  onChange={(e) => setSelectedDimensions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#B9C3CF]"
                />
              </div>
            </div>

            {/* Custom Branding Text Field */}
            <div>
              <label htmlFor="field-custom-branding-text-organization" className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Branding Text / Organization Name (Optional)
              </label>
              <input id="field-custom-branding-text-organization" aria-label="Custom Branding Text / Organization Name (Optional)"
                type="text"
                placeholder="e.g. Acme Corp 2026, Bangalore Tech Summit..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#B9C3CF]"
              />
            </div>

            {/* Artwork / Logo Upload Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Artwork or Logo (PDF, AI, CDR, PNG, JPG under 10MB)
              </label>
              <label className="border-2 border-dashed border-slate-200 hover:border-[#B9C3CF]/60 rounded-md p-3 flex items-center justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-[#EDF1F6]/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#121418]/10 text-[#353C45] flex items-center justify-center shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {artworkFile ? artworkFile.name : "Choose or drag logo/artwork file"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Free digital proofing included with your order
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ai,.cdr,.png,.jpg,.jpeg,.zip"
                  className="hidden"
                />
                <span className="text-[11px] font-bold text-[#353C45] px-3 py-1 bg-[#FFFFFF] border border-slate-200 rounded-lg shadow-2xs">
                  Browse
                </span>
              </label>
            </div>

            {/* Quantity Selector & Tier Pricing */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Order Quantity</span>
                <span className="text-[10px] text-slate-400 block">MOQ: {moq} units</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(moq, q - 50))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    aria-label="Order quantity"
                    type="number"
                    min={moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(moq, parseInt(e.target.value, 10) || moq))}
                    className="w-16 text-center text-xs font-bold text-slate-900 bg-transparent outline-none tabular-nums"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 50)}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-[#F26B1D] hover:bg-[#FF8A3D] active:scale-98 text-[#121418] py-3 px-4 rounded-md font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Order / RFQ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-[#121418] hover:bg-slate-800 active:scale-98 text-white py-3 px-4 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Formal Quotation</span>
              </button>

              <a
                href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#217A4B] hover:bg-[#1b633d] active:scale-98 text-white py-3 px-4 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Quote</span>
              </a>
            </div>
          </div>

          {/* Description and specifications stay in the page, so buyers and search engines both get them. */}
          <div className="pt-4 border-t border-slate-200 space-y-6">
            <section aria-labelledby="product-details">
              <h2 id="product-details" className="text-lg font-bold text-[#121418]">
                Product details
              </h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-sm text-slate-700">
                {product.description || product.short_description || "Ask us for the full details of this product."}
              </p>
            </section>

            <section aria-labelledby="product-specs" className="space-y-2">
              <h2 id="product-specs" className="text-lg font-bold text-[#121418]">
                Specifications
              </h2>
            {/* Specs Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200 w-2/5">
                        SKU
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 font-mono border-b border-slate-200 w-3/5">
                        {product.sku}
                      </td>
                    </tr>
                    <tr className="bg-[#FFFFFF]">
                      <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200">
                        Category
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200 uppercase">
                        {formatCategoryName(product.category?.name || "General Catalog")}
                      </td>
                    </tr>
                    {product.material && (
                      <tr className="bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200">
                          Material
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200">
                          {product.material}
                        </td>
                      </tr>
                    )}
                    {product.dimensions && (
                      <tr className="bg-[#FFFFFF]">
                        <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200">
                          Size
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200">
                          {product.dimensions}
                        </td>
                      </tr>
                    )}
                    {product.color && (
                      <tr className="bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200">
                          Finish
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200">
                          {product.color}
                        </td>
                      </tr>
                    )}
                    {product.specifications &&
                      Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-slate-50" : "bg-[#FFFFFF]"}
                        >
                          <td className="py-2.5 px-4 font-semibold text-slate-500 border-b border-slate-200">
                            {key}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200">
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3 flex items-center justify-between gap-2 shadow-xl">
        <div className="min-w-0 pr-1">
          <div className="text-base font-extrabold text-[#121418] truncate leading-none">
            {product.price_display || (product.price ? `₹${product.price}` : "Wholesale Quote")}
          </div>
          <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5">
            SKU: {product.sku}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="bg-[#121418] text-white py-2 px-3.5 rounded-md font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#121418] text-white py-2 px-3 rounded-md font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <span>Quote</span>
          </button>
        </div>
      </div>

      {/* Spacing safeguard */}
      <div className="sm:hidden h-12" />

      {/* Modal windows */}
      {modalOpen && (
        <EnquiryModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

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
