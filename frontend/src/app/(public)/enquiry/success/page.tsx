import React from "react";
import Link from "next/link";
import { CheckCircle, Phone, ArrowLeft, Package } from "lucide-react";

export default function EnquirySuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#217A4B]">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#353C45] uppercase tracking-wider">
          Enquiry Received
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121418]">
          Thank You! Your Request Has Been Logged.
        </h1>
        <p className="text-xs sm:text-sm text-[#353C45] leading-relaxed max-w-lg mx-auto">
          Our wholesale desk has received your requirements and saved them to our database.
          A dedicated trade specialist will prepare your itemized proforma quote with volume pricing.
        </p>
      </div>

      <div className="p-4 bg-[#EDF1F6] rounded-md border border-[#DFE6EE] max-w-md mx-auto text-xs text-[#121418] space-y-2">
        <p className="font-semibold">Need urgent same-day order confirmation?</p>
        <p className="text-[#353C45]">Connect directly with our manufacturing desk:</p>
        <div className="pt-1 flex justify-center gap-4">
          <a
            href="tel:+919741808034"
            className="font-bold text-[#121418] hover:underline flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5 text-[#353C45]" />
            +91 97418 08034
          </a>
          <a
            href="https://wa.me/919741808034?text=Hello%2C%20following%20up%20on%20my%20website%20quotation%20enquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#217A4B] hover:underline flex items-center gap-1"
          >
            WhatsApp Follow-up
          </a>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] py-2.5 px-6 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Package className="w-4 h-4" />
          <span>Continue Browsing Catalogue</span>
        </Link>
        <Link
          href="/"
          className="border border-[#DFE6EE] text-[#121418] hover:bg-[#EDF1F6] py-2.5 px-6 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
