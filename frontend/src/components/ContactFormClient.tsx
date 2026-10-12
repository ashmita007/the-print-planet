"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { submitEnquiry } from "@/lib/api";

export default function ContactFormClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await submitEnquiry({
      full_name: fullName,
      company_name: companyName,
      email,
      phone,
      requested_quantity: quantity ? parseInt(quantity, 10) : null,
      message,
      source_page: "/contact",
    });

    setIsSubmitting(false);

    if (res.success) {
      router.push("/enquiry/success");
    } else {
      setErrorMessage(res.error || "Submission failed. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
            placeholder="e.g. Ramesh Patel"
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#263445] mb-1">
            Company / Business Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Delta ID Solutions Pvt Ltd"
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-[#263445] mb-1">
            Contact Mobile / Phone *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 97418 00000"
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none"
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
            placeholder="e.g. purchasing@company.com"
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-[#263445] mb-1">
          Estimated Order Quantity (Units / Rolls)
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 500"
          className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none"
        />
      </div>

      <div>
        <label className="block font-semibold text-[#263445] mb-1">
          Detailed Technical Requirements & Delivery Location *
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe required models (e.g. V2, V4 holders, 20mm Royal Blue satin rolls, DCT2000 cutter), custom printing, destination pincode..."
          className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs outline-none resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-[#E87832] hover:bg-[#d66b28] text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Sending RFQ..." : "Submit Quotation Request & Enquire"}
        </button>
      </div>
    </form>
  );
}
