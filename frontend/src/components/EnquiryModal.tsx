"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  Building2,
  User,
  Mail,
  Send,
} from "lucide-react";
import { Product } from "@/lib/types";
import { submitEnquiry } from "@/lib/api";

interface EnquiryModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryModal({ product, isOpen, onClose }: EnquiryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [message, setMessage] = useState(
    product
      ? `Hello, please provide best wholesale quotation and delivery lead time for ${product.name} (SKU: ${product.sku}).`
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !message) {
      setErrorMessage("Please fill in your name, contact phone, email, and requirements.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const res = await submitEnquiry({
      full_name: fullName,
      company_name: companyName,
      email,
      phone,
      product: product ? product.id : null,
      product_name_text: product ? product.name : "General Enquiry",
      requested_quantity: quantity ? parseInt(quantity, 10) : null,
      message,
      source_page: typeof window !== "undefined" ? window.location.pathname : "",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || "Failed to submit enquiry. Please try again.");
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello, I would like to enquire about: ${
      product ? product.name : "ID Card Supplies"
    }.\nQuantity: ${quantity || "Bulk"}\nName: ${fullName || ""}\nCompany: ${
      companyName || ""
    }`
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col border border-[#DCE3EB] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator Pill */}
        <div className="bg-[#102742] pt-2 pb-0 flex justify-center sm:hidden">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Modal Sticky Header */}
        <div className="bg-[#102742] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="min-w-0 pr-2">
            <h2 id="modal-headline" className="text-sm sm:text-base font-bold truncate">
              Request Industrial Quotation
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
              {product ? product.name : "Direct factory price & MOQ quote"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {isSuccess ? (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#217A4B]">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#17365D]">
                  Enquiry Received Successfully!
                </h3>
                <p className="text-xs text-[#687586] max-w-sm mx-auto leading-relaxed">
                  Our industrial sales team will review your batch specifications and provide a
                  formal proforma quotation within 2 business hours.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#217A4B] hover:bg-[#1b633d] text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Message Directly on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#DCE3EB] text-[#263445] text-xs font-semibold py-3 px-4 rounded-xl hover:bg-[#F5F7FA] transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#C0392B]" />
                  <span className="text-[11px] sm:text-xs leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Product Mini Identification Bar */}
              {product && (
                <div className="bg-[#F5F7FA] p-2.5 sm:p-3 rounded-xl border border-[#DCE3EB] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {product.primary_image ? (
                      <img
                        src={product.primary_image.secure_url}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                        P
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#263445] text-xs truncate">{product.name}</p>
                      <p className="font-mono text-[10px] text-[#687586] truncate">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                  {product.price_display && (
                    <span className="font-extrabold text-[#17365D] text-xs shrink-0">
                      {product.price_display}
                    </span>
                  )}
                </div>
              )}

              {/* Contact Fields: Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Cards Ltd"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@acme.com"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Estimated Quantity Needed
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500 pcs / 50 rolls"
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none transition-colors"
                />
              </div>

              {/* Requirements & Message */}
              <div>
                <label className="block font-semibold text-[#263445] mb-1">
                  Specifications & Additional Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail colors, dimensions, delivery destination, or customization needs..."
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#263445] outline-none resize-none transition-colors"
                />
              </div>

              {/* Modal Action Buttons: Responsive mobile stack */}
              <div className="pt-3 border-t border-[#DCE3EB]/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto order-2 sm:order-1 text-[#217A4B] bg-[#217A4B]/10 hover:bg-[#217A4B]/20 py-2.5 sm:py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Fast Quote via WhatsApp</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-[#E87832] hover:bg-[#d66b28] active:bg-[#c55d1d] text-white py-3 sm:py-2.5 px-5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Quotation Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
