"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  Send,
  Paperclip,
  UploadCloud,
  FileText,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatProductName } from "@/lib/formatters";
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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [message, setMessage] = useState(
    product
      ? `Quotation request for ${formatProductName(product.name)} (SKU: ${product.sku}).`
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      product_name_text: product ? formatProductName(product.name) : "General Enquiry",
      requested_quantity: quantity ? parseInt(quantity, 10) : null,
      message: message || "Bulk pricing request",
      attachment: attachment || null,
      source_page: typeof window !== "undefined" ? window.location.pathname : "",
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      if (typeof window !== "undefined") {
        const waText = encodeURIComponent(
          `🔔 *New RFQ Enquiry - The Print Planet*\n\n` +
          `👤 *Customer:* ${fullName}\n` +
          `🏢 *Company:* ${companyName || 'Individual'}\n` +
          `📱 *Phone:* ${phone}\n` +
          `✉️ *Email:* ${email}\n` +
          `📦 *Product:* ${product ? formatProductName(product.name) : 'Wholesale Printing Supplies'}\n` +
          `🔢 *Quantity:* ${quantity || 'Bulk Order'}\n` +
          `📝 *Message:* ${message || 'Please provide quotation with dispatch timeline.'}`
        );
        window.open(`https://wa.me/919741808034?text=${waText}`, "_blank");
      }
    } else {
      setErrorMessage(res.error || "Submission failed. Please retry.");
    }
  };

  const whatsappMessage = encodeURIComponent(
    `🔔 *New RFQ Enquiry - The Print Planet*\n\n` +
    `👤 *Customer:* ${fullName || ''}\n` +
    `🏢 *Company:* ${companyName || 'Individual'}\n` +
    `📱 *Phone:* ${phone || ''}\n` +
    `✉️ *Email:* ${email || ''}\n` +
    `📦 *Product:* ${product ? formatProductName(product.name) : 'Wholesale Printing Supplies'}\n` +
    `🔢 *Quantity:* ${quantity || 'Bulk Order'}\n` +
    `📝 *Message:* ${message || 'Please provide quotation with dispatch timeline.'}`
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs anim-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] sm:max-w-lg md:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-[#DCE3EB] overflow-hidden anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: compact on mobile, spacious on laptop */}
        <div className="bg-[#102742] text-white px-3.5 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h2 id="modal-headline" className="text-xs sm:text-base font-bold truncate">
              Request Quotation
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 truncate">
              {product ? formatProductName(product.name) : "Direct factory price & MOQ quote"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content: tight on mobile, comfortable on laptop */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {isSuccess ? (
            <div className="text-center py-4 sm:py-6 space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#217A4B]">
                <CheckCircle className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <h3 className="text-sm sm:text-lg font-bold text-[#17365D]">
                  Enquiry Logged!
                </h3>
                <p className="text-[11px] sm:text-sm text-[#687586] leading-relaxed max-w-sm mx-auto">
                  Our sales desk will send your quotation within 2 business hours.
                </p>
              </div>
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#217A4B] hover:bg-[#1b633d] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>WhatsApp Fast Quote</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#DCE3EB] text-[#263445] text-xs sm:text-sm font-semibold py-1.5 sm:py-2.5 px-3 sm:px-5 rounded-lg sm:rounded-xl hover:bg-[#F5F7FA]"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 flex items-center gap-2 text-[11px] sm:text-xs">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#C0392B]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Product Mini Identification Bar */}
              {product && (
                <div className="bg-[#F8FAFC] p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#DCE3EB] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {product.primary_image ? (
                      <img
                        src={product.primary_image.secure_url}
                        alt={formatProductName(product.name)}
                        className="w-8 h-8 sm:w-11 sm:h-11 object-contain rounded-md bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-[10px] sm:text-xs shrink-0">
                        P
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#263445] text-[11px] sm:text-sm truncate">{formatProductName(product.name)}</p>
                      <p className="font-mono text-[9px] sm:text-xs text-[#687586] truncate">SKU: {product.sku}</p>
                    </div>
                  </div>
                  {product.price_display && (
                    <span className="font-bold text-[#17365D] text-[11px] sm:text-sm shrink-0">
                      {product.price_display}
                    </span>
                  )}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
                />
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Company & Quantity */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Ltd"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="500 pcs"
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Notes / Message */}
              <div>
                <label className="block font-semibold text-[#263445] text-[11px] sm:text-xs mb-0.5 sm:mb-1">
                  Specs / Notes
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Colors, sizes, delivery location..."
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-[#263445] outline-none resize-none transition-colors"
                />
              </div>

              {/* Optional Attachment Upload */}
              <div>
                <div className="flex items-center justify-between text-[#263445] text-[11px] sm:text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-[#E87832]" />
                    <span>Attach Specs / Artwork (Optional)</span>
                  </span>
                  <span className="text-[10px] text-[#687586]">Max 10MB</span>
                </div>
                {!attachment ? (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-[#CBD5E1] hover:border-[#17365D] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg py-2 px-3 cursor-pointer transition-all text-[11px] text-[#475569]">
                    <UploadCloud className="w-3.5 h-3.5 text-[#E87832]" />
                    <span>Click to attach PDF, artwork, or sample photo</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-3 text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="font-semibold truncate">{attachment.name}</span>
                      <span className="text-[10px] text-emerald-600 shrink-0">({(attachment.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-emerald-700 hover:text-red-600 p-0.5 ml-2 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Responsive stack on mobile, row on laptop */}
              <div className="pt-2 sm:pt-4 border-t border-[#DCE3EB] space-y-1.5 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-[#217A4B] bg-[#217A4B]/10 hover:bg-[#217A4B]/20 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors text-center order-2 sm:order-1"
                >
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>WhatsApp Fast Quote</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#E87832] hover:bg-[#d66b28] active:scale-98 text-white py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 order-1 sm:order-2"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{isSubmitting ? "Sending..." : "Submit Quote Request"}</span>
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
