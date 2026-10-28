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
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { submitEnquiry } from "@/lib/api";

function QuoteFormContent() {
  const searchParams = useSearchParams();
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
    if (prefilledProduct) initialNotes.push(`Product of interest: ${prefilledProduct}`);
    if (prefilledService) initialNotes.push(`Service needed: ${prefilledService}`);
    if (prefilledTier) initialNotes.push(`Selected Volume Tier: ${prefilledTier}`);
    if (prefilledIndustry) initialNotes.push(`Industry Vertical: ${prefilledIndustry}`);

    if (initialNotes.length > 0) {
      setCustomRequirements(initialNotes.join(" | ") + "\n\n");
    }
  }, [prefilledProduct, prefilledService, prefilledTier, prefilledIndustry]);

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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
      <Breadcrumbs items={[{ label: "Request a Quote" }]} />

      {/* Hero */}
      <div className="border-b border-[#E2E8F0] pb-6 sm:pb-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
            <FileText className="w-3.5 h-3.5" />
            <span>Fast-Track Commercial RFQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#17365D] leading-[1.08]">
            Request a Custom B2B Quotation
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Receive official wholesale unit pricing, digital proof mockups, and estimated production timelines within 2 business hours. Direct factory pricing with verified GST tax invoicing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 surface-card rounded-2xl p-6 sm:p-8">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[#17365D]">
                Quotation request received
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Our commercial sales engineering team is reviewing your specifications and will deliver your formal quotation via email and WhatsApp.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="bg-[#17365D] hover:bg-[#102742] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Continue Browsing Products
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
                <h2 className="text-lg font-bold text-[#17365D]">
                  Tell Us About Your Requirement
                </h2>
                <p className="text-xs text-[#687586] mt-0.5">
                  Fields marked with an asterisk (*) are required.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Row 1: Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechCorp Solutions Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Business Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. procurement@techcorp.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Product Category & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Primary Product Category *
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] bg-white text-xs sm:text-sm"
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
                  <label className="block font-semibold text-[#263445] mb-1">
                    Estimated Quantity (Units / Pieces) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Delivery Timeline */}
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Required Target Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Specifications / Notes */}
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Detailed Specifications &amp; Customization Notes
                </label>
                <textarea
                  rows={4}
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Specify ribbon width (16mm/20mm), hook type (Dog hook/Fish hook), Pantone shades, single/double sided printing, chip types (Mifare 1K), or special packaging instructions."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D] text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Optional Attachment */}
              <div>
                <div className="flex items-center justify-between text-[#263445] text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#E87832]" />
                    <span>Upload Artwork, CAD, Spec Sheet or Excel List (Optional)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Max 10MB</span>
                </div>
                {!attachment ? (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-[#17365D] bg-slate-50 hover:bg-slate-100 rounded-xl py-3 px-4 cursor-pointer transition-all text-xs text-slate-600">
                    <UploadCloud className="w-4 h-4 text-[#E87832]" />
                    <span>Click to browse and attach your design file, artwork, or order spreadsheet</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-4 text-xs text-emerald-800">
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
                  className="w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-3.5 px-6 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Quotation Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Quotation Request & Connect on WhatsApp</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  🔒 We respect your privacy. No spam. A commercial representative will reach out shortly.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Assurances & Immediate Desk (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Direct WhatsApp Callout */}
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#C25E1F] uppercase tracking-[0.14em]">
              <Clock className="w-4 h-4" />
              <span>Instant estimate</span>
            </div>
            <h3 className="text-lg font-bold text-[#17365D]">
              Chat with our sales desk
            </h3>
            <p className="text-xs text-[#687586] leading-relaxed">
              If your order is urgent or requires immediate same-day dispatch from Bengaluru, message us directly with your artwork on WhatsApp.
            </p>
            <a
              href="https://wa.me/919741808034?text=Hi%20The%20Print%20Planet%2C%20I%20need%20an%20urgent%20quote%20for%20bulk%20supplies."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 97418 08034)</span>
            </a>
          </div>

          {/* Guarantees List */}
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-[#17365D]">
              What we guarantee
            </h4>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#17365D] block">Free Digital Pre-Press Proof</strong>
                  <span className="text-[#687586]">Review your artwork rendered on our actual lanyard straps before printing begins.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#17365D] block">Factory Direct Pricing</strong>
                  <span className="text-[#687586]">Genuine manufacturer wholesale rates with zero middleman commissions.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#17365D] block">Verified GST Input Tax Credit</strong>
                  <span className="text-[#687586]">GSTIN: 29AAQFT3909B1ZZ | Standard B2B tax invoice provided with e-way bill.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#17365D] block">Pan-India Courier & Cargo</strong>
                  <span className="text-[#687586]">Air express to metros in 24-48 hours; insured surface cargo for heavy machinery.</span>
                </div>
              </div>
            </div>
          </div>
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
