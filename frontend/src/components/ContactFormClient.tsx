"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Paperclip, UploadCloud, FileText } from "lucide-react";
import { submitEnquiry } from "@/lib/api";

export default function ContactFormClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      attachment: attachment || null,
      source_page: "/contact",
    });

    setIsSubmitting(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        const waText = encodeURIComponent(
          `🔔 *New Website Enquiry - The Print Planet*\n\n` +
          `👤 *Name:* ${fullName}\n` +
          `🏢 *Company:* ${companyName || 'Individual'}\n` +
          `📱 *Phone:* ${phone}\n` +
          `✉️ *Email:* ${email}\n` +
          `🔢 *Order Quantity:* ${quantity || 'Bulk Inquiry'}\n` +
          `📝 *Message:* ${message || 'Please connect for quotation.'}`
        );
        window.open(`https://wa.me/919741808034?text=${waText}`, "_blank");
      }
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
            placeholder="e.g. Apex Corporate Solutions Pvt Ltd"
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
          Detailed Technical Requirements &amp; Delivery Location *
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

      {/* Optional Attachment Upload */}
      <div>
        <div className="flex items-center justify-between text-[#263445] text-xs mb-1 font-semibold">
          <span className="flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-[#E87832]" />
            <span>Attach Spec Sheet, Artwork, Sample Photo or Excel (Optional)</span>
          </span>
          <span className="text-[11px] text-slate-500">Max 10MB</span>
        </div>
        {!attachment ? (
          <label className="flex items-center justify-center gap-2 border border-dashed border-[#CBD5E1] hover:border-[#17365D] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg py-2.5 px-3 cursor-pointer transition-all text-xs text-[#475569]">
            <UploadCloud className="w-4 h-4 text-[#E87832]" />
            <span>Click to attach file or sample photo</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold truncate">{attachment.name}</span>
              <span className="text-[11px] text-emerald-600 shrink-0">({(attachment.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-emerald-700 hover:text-red-600 p-0.5 ml-2 cursor-pointer font-bold"
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
          className="w-full sm:w-auto bg-[#E87832] hover:bg-[#d66b28] text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Sending RFQ..." : "Submit Quotation Request & Enquire"}
        </button>
      </div>
    </form>
  );
}
