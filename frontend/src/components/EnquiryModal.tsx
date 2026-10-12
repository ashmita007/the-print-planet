"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  AlertCircle,
  Phone,
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
      ? `Quotation request for ${product.name} (SKU: ${product.sku}).`
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
    if (!fullName || !phone || !email) {
      setErrorMessage("Please fill in your name, phone, and email.");
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
      message: message || "Bulk pricing request",
      source_page: typeof window !== "undefined" ? window.location.pathname : "",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || "Submission failed. Please retry.");
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello, quotation enquiry for: ${
      product ? product.name : "ID Card Supplies"
    }.\nQuantity: ${quantity || "Bulk"}\nName: ${fullName || ""}`
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] max-h-[90vh] flex flex-col border border-[#DCE3EB] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-[#102742] text-white px-3.5 py-2.5 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h2 id="modal-headline" className="text-xs sm:text-sm font-bold truncate">
              Request Quotation
            </h2>
            <p className="text-[10px] text-slate-300 truncate">
              {product ? product.name : "Direct factory price & MOQ quote"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Compact Content */}
        <div className="p-3.5 overflow-y-auto overscroll-contain flex-1">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#217A4B]">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#17365D]">
                  Enquiry Logged!
                </h3>
                <p className="text-[11px] text-[#687586] leading-relaxed">
                  Our sales desk will send your quotation within 2 business hours.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2 justify-center">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#217A4B] hover:bg-[#1b633d] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Fast Quote</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#DCE3EB] text-[#263445] text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#F5F7FA]"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              {errorMessage && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-1.5 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#C0392B]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Product Mini Identification Bar */}
              {product && (
                <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#DCE3EB] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {product.primary_image ? (
                      <img
                        src={product.primary_image.secure_url}
                        alt={product.name}
                        className="w-8 h-8 object-contain rounded bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-[10px] shrink-0">
                        P
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#263445] text-[11px] truncate">{product.name}</p>
                      <p className="font-mono text-[9px] text-[#687586] truncate">SKU: {product.sku}</p>
                    </div>
                  </div>
                  {product.price_display && (
                    <span className="font-bold text-[#17365D] text-[11px] shrink-0">
                      {product.price_display}
                    </span>
                  )}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none"
                />
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none"
                  />
                </div>
              </div>

              {/* Company & Quantity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                    Company
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Ltd"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="500 pcs"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none"
                  />
                </div>
              </div>

              {/* Notes / Message */}
              <div>
                <label className="block font-semibold text-[#263445] text-[11px] mb-0.5">
                  Specs / Notes
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Colors, sizes, delivery location..."
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#263445] outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#DCE3EB] space-y-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E87832] hover:bg-[#d66b28] active:bg-[#c55d1d] text-white py-2 px-4 rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Sending..." : "Submit Quote Request"}</span>
                </button>

                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-[#217A4B] bg-[#217A4B]/10 hover:bg-[#217A4B]/20 py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Phone className="w-3 h-3" />
                  <span>WhatsApp Fast Quote</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
