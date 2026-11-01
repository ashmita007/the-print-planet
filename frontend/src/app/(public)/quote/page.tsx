"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Send,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { submitEnquiry } from "@/lib/api";
import { useCart } from "@/lib/cart";

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const { items: cartItems, formattedSubtotal } = useCart();
  const fromCart = searchParams.get("cart") === "true";
  const prefilledProduct = searchParams.get("product") || "";
  const prefilledService = searchParams.get("service") || "";
  const prefilledTier = searchParams.get("tier") || "";
  const prefilledIndustry = searchParams.get("industry") || "";

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productCategory, setProductCategory] = useState("Lanyards & Ribbons");
  const [quantity, setQuantity] = useState("1000");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [customRequirements, setCustomRequirements] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File attachment size must be under 10MB");
        return;
      }
      const allowedExts = [
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".rtf",
        ".jpg", ".jpeg", ".png", ".webp", ".zip", ".rar", ".ai", ".eps", ".cdr", ".psd"
      ];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMessage("Unsupported file format. Allowed formats: PDF, Word, Excel, JPG, PNG, WEBP, ZIP, and Vector artwork.");
        return;
      }
      setAttachment(file);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    const initialNotes: string[] = [];
    if (fromCart && cartItems.length > 0) {
      initialNotes.push(
        `Order Cart Items (${cartItems.length} products - Est: ${formattedSubtotal}):\n` +
          cartItems
            .map(
              (i, idx) =>
                `• ${idx + 1}. ${i.name} (SKU: ${i.sku}) - Qty: ${i.quantity}${
                  i.options?.material ? ` [Material: ${i.options.material}]` : ""
                }${i.options?.customText ? ` [Text: "${i.options.customText}"]` : ""}`
            )
            .join("\n")
      );
    }
    if (prefilledProduct) initialNotes.push(`Product of interest: ${prefilledProduct}`);
    if (prefilledService) initialNotes.push(`Service needed: ${prefilledService}`);
    if (prefilledTier) initialNotes.push(`Selected Volume Tier: ${prefilledTier}`);
    if (prefilledIndustry) initialNotes.push(`Industry Vertical: ${prefilledIndustry}`);

    if (initialNotes.length > 0) {
      setCustomRequirements(initialNotes.join("\n\n") + "\n\n");
    }
  }, [fromCart, cartItems, formattedSubtotal, prefilledProduct, prefilledService, prefilledTier, prefilledIndustry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const fullMessage =
      `📋 *REQUEST FOR QUOTE*\n` +
      `Product Category: ${productCategory}\n` +
      (deliveryDate ? `Required Delivery By: ${deliveryDate}\n` : "") +
      `Details:\n${customRequirements || "Standard B2B Quote requested."}`;

    const res = await submitEnquiry({
      full_name: fullName,
      company_name: companyName,
      email,
      phone,
      requested_quantity: quantity ? parseInt(quantity, 10) : null,
      message: fullMessage,
      attachment: attachment || null,
      source_page: "/quote",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        const waText = encodeURIComponent(
          `🔔 *New Quotation Request - The Print Planet*\n\n` +
          `👤 *Contact:* ${fullName}\n` +
          `🏢 *Company:* ${companyName || "N/A"}\n` +
          `📱 *Phone:* ${phone}\n` +
          `✉️ *Email:* ${email}\n` +
          `📦 *Category:* ${productCategory}\n` +
          `🔢 *Estimated Quantity:* ${quantity} units\n` +
          (deliveryDate ? `📅 *Required By:* ${deliveryDate}\n` : "") +
          `📝 *Requirements:* ${customRequirements || "Quotation required"}`
        );
        window.open(`https://wa.me/919741808034?text=${waText}`, "_blank");
      }
    } else {
      setErrorMessage(res.error || "Submission failed. Please check the required fields.");
    }
  };

  return (
    <div>
      <PageHero
        title="Get a quote"
        lead="Tell us what you need. We reply with a price and delivery time."
        crumbs={[{ label: "Quote" }]}
      />
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 surface-card rounded-lg p-6 sm:p-8">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#16324F]">
                Quotation request received
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{fullName}</strong>. We will send your quote by email or WhatsApp.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="bg-[#16324F] hover:bg-[#0E2238] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Browse products
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCustomRequirements("");
                  }}
                  className="text-xs font-semibold text-slate-600 hover:underline"
                >
                  Submit Another Quote
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
              <div>
                <h2 className="text-lg font-bold text-[#16324F]">
                  Tell Us About Your Requirement
                </h2>
                <p className="text-xs text-[#566373] mt-0.5">
                  Fields marked with an asterisk (*) are required.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Row 1: Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-your-full-name" className="block font-semibold text-[#1C2733] mb-1">
                    Your Full Name *
                  </label>
                  <input id="field-your-full-name" aria-label="Your Full Name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="field-company-organization-name" className="block font-semibold text-[#1C2733] mb-1">
                    Company / Organization Name *
                  </label>
                  <input id="field-company-organization-name" aria-label="Company / Organization Name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechCorp Solutions Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-phone-whatsapp-number" className="block font-semibold text-[#1C2733] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input id="field-phone-whatsapp-number" aria-label="Phone / WhatsApp Number"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="field-business-email-address" className="block font-semibold text-[#1C2733] mb-1">
                    Business Email Address *
                  </label>
                  <input id="field-business-email-address" aria-label="Business Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. procurement@techcorp.com"
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Product Category & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-primary-product-category" className="block font-semibold text-[#1C2733] mb-1">
                    Primary Product Category *
                  </label>
                  <select id="field-primary-product-category" aria-label="Primary Product Category"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] bg-white text-xs sm:text-sm"
                  >
                    <option value="Color & Satin Lanyard Rolls">Color & Satin Lanyard Rolls</option>
                    <option value="Custom Sublimation Printed Lanyards">Custom Sublimation Printed Lanyards</option>
                    <option value="PVC ID Card Holders & Sleeves">PVC ID Card Holders & Sleeves</option>
                    <option value="Metal Clamps, Hooks & Fittings">Metal Clamps, Hooks & Fittings</option>
                    <option value="RFID Smart Cards & Inlays">RFID Smart Cards & Inlays</option>
                    <option value="ID Card Manufacturing Machines">ID Card Manufacturing Machines</option>
                    <option value="Lens Packaging & Optical Boxes">Lens Packaging & Optical Boxes</option>
                    <option value="Complete Employee ID Kits">Complete Employee ID Kits (Lanyard + Holder)</option>
                    <option value="Other Commercial Printing">Other Custom Printing Requirement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-estimated-quantity-units-pieces" className="block font-semibold text-[#1C2733] mb-1">
                    Estimated Quantity (Units / Pieces) *
                  </label>
                  <input id="field-estimated-quantity-units-pieces" aria-label="Estimated Quantity (Units / Pieces)"
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Delivery Timeline */}
              <div>
                <label htmlFor="field-required-target-delivery-date" className="block font-semibold text-[#1C2733] mb-1">
                  Required Target Delivery Date (Optional)
                </label>
                <input id="field-required-target-delivery-date" aria-label="Required Target Delivery Date (Optional)"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Specifications / Notes */}
              <div>
                <label htmlFor="field-detailed-specifications-customization-notes" className="block font-semibold text-[#1C2733] mb-1">
                  Detailed Specifications &amp; Customization Notes
                </label>
                <textarea id="field-detailed-specifications-customization-notes" aria-label="Detailed Specifications & Customization Notes"
                  rows={4}
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Specify ribbon width (16mm/20mm), hook type (Dog hook/Fish hook), Pantone shades, single/double sided printing, chip types (Mifare 1K), or special packaging instructions."
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#16324F] focus:ring-1 focus:ring-[#16324F] text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Optional Attachment */}
              <div>
                <div className="flex items-center justify-between text-[#1C2733] text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#D9601A]" />
                    <span>Upload Artwork, CAD, Spec Sheet or Excel List (Optional)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Max 10MB</span>
                </div>
                {!attachment ? (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-[#D9601A]/60 bg-slate-50 hover:bg-[#FBF0E8]/40 rounded-md py-3 px-4 cursor-pointer transition-all text-xs text-slate-600">
                    <UploadCloud className="w-4 h-4 text-[#D9601A]" />
                    <span>Click to browse and attach your design file, artwork, or order spreadsheet</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md py-2 px-4 text-xs text-emerald-800">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-semibold truncate">{attachment.name}</span>
                      <span className="text-[11px] text-emerald-600 shrink-0">({(attachment.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-emerald-700 hover:text-red-600 p-1 ml-2 cursor-pointer font-bold"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D9601A] hover:bg-[#B94E12] active:scale-98 text-white py-3.5 px-6 rounded-md text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Quotation Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send request</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  We reply by email or WhatsApp.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right column: the fast route and what happens next */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-lg bg-[#0E2238] text-white p-6 space-y-3">
            <h2 className="text-lg font-bold">Need it fast?</h2>
            <p className="text-sm text-slate-300">Send your artwork on WhatsApp.</p>
            <a
              href="https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20need%20an%20urgent%20quote%20for%20bulk%20supplies."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#217A4B] hover:bg-[#1b6540] text-white w-full py-3 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              +91 97418 08034
            </a>
          </div>
          <ul className="px-1 space-y-2.5 text-sm text-[#1C2733]">
            {["Free digital proof", "Factory-direct rates", "GST invoice", "Delivery across India"].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#217A4B] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-400">Loading Quotation Builder...</div>}>
      <QuoteFormContent />
    </Suspense>
  );
}
