"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, Phone, MessageSquare, Building2, User, Mail } from "lucide-react";
import { Product } from "@/lib/types";
import { submitEnquiry } from "@/lib/api";

interface EnquiryModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryModal({ product, isOpen, onClose }: EnquiryModalProps) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [message, setMessage] = useState(
    product ? `Hello, please provide best wholesale quotation and delivery lead time for ${product.name} (SKU: ${product.sku}).` : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

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
    `Hello, I would like to enquire about: ${product ? product.name : "ID Card Supplies"}.\nQuantity: ${quantity || "Bulk"}\nName: ${fullName || ""}\nCompany: ${companyName || ""}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DCE3EB] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#102742] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Request Industrial Quotation</h2>
            <p className="text-xs text-slate-300">
              {product ? product.name : "Direct factory price & MOQ quote"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="w-16 h-16 text-[#217A4B] mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-[#17365D]">Enquiry Received Successfully!</h3>
                <p className="text-xs text-[#687586] mt-1.5 max-w-sm mx-auto">
                  Our industrial sales team will review your requirements and provide a formal quotation within 2 business hours.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#217A4B] text-white text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-[#1b633d] transition-colors"
                >
                  Message Directly on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#DCE3EB] text-[#263445] text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-[#F5F7FA]"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Product mini bar if applicable */}
              {product && (
                <div className="bg-[#F5F7FA] p-3 rounded-lg border border-[#DCE3EB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {product.primary_image && (
                      <img
                        src={product.primary_image.secure_url}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded bg-white border border-slate-200 p-0.5"
                      />
                    )}
                    <div>
                      <p className="font-bold text-[#263445] line-clamp-1">{product.name}</p>
                      <p className="font-mono text-[11px] text-[#687586]">SKU: {product.sku}</p>
                    </div>
                  </div>
                  {product.price_display && (
                    <span className="font-extrabold text-[#17365D] text-xs">
                      {product.price_display}
                    </span>
                  )}
                </div>
              )}

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
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none"
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
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

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
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none"
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
                    className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

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
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none"
                />
              </div>

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
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 text-xs outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <a
                  href={`https://wa.me/919741808034?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#217A4B] font-bold hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Fast Quote via WhatsApp
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Submit Quotation Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
