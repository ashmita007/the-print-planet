"use client";

import React from "react";
import { Save, Building2, Loader2, Phone } from "lucide-react";

export interface IdentityTabProps {
  saving: boolean;
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  gstNumber: string;
  footerText: string;
  logoUrl: string;
  setBusinessName: (value: string) => void;
  setTagline: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setWhatsapp: (value: string) => void;
  setAddress: (value: string) => void;
  setGstNumber: (value: string) => void;
  setFooterText: (value: string) => void;
  setLogoUrl: (value: string) => void;
  handleSaveIdentity: (e?: React.FormEvent) => Promise<void>;
}

export default function IdentityTab({
  saving,
  businessName,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  gstNumber,
  footerText,
  logoUrl,
  setBusinessName,
  setTagline,
  setEmail,
  setPhone,
  setWhatsapp,
  setAddress,
  setGstNumber,
  setFooterText,
  setLogoUrl,
  handleSaveIdentity,
}: IdentityTabProps) {
  return (
    <form onSubmit={handleSaveIdentity} className="space-y-6 text-xs">
      <div className="surface-card p-6 rounded-lg space-y-5">
        <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#353C45]" />
          Store Legal Identity &amp; Branding
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-business-name" className="block font-semibold text-[#121418] mb-1">Business Name *</label>
            <input id="field-business-name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-bold text-[#121418]"
            />
          </div>

          <div>
            <label htmlFor="field-tagline" className="block font-semibold text-[#121418] mb-1">Tagline</label>
            <input id="field-tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-official-gst-number" className="block font-semibold text-[#121418] mb-1">Official GST Number</label>
            <input id="field-official-gst-number"
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-mono font-bold"
            />
          </div>

          <div>
            <label htmlFor="field-custom-logo-url-optional" className="block font-semibold text-[#121418] mb-1">Custom Logo URL (optional)</label>
            <input id="field-custom-logo-url-optional"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contact Strip Details */}
      <div className="surface-card p-6 rounded-lg space-y-5">
        <h2 className="text-sm font-semibold text-[#121418] border-b border-[#DFE6EE] pb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#217A4B]" />
          Trade Contact &amp; Dispatch Desk
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="field-primary-phone" className="block font-semibold text-[#121418] mb-1">Primary Phone</label>
            <input id="field-primary-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-semibold"
            />
          </div>

          <div>
            <label htmlFor="field-whatsapp-trade-line" className="block font-semibold text-[#121418] mb-1">WhatsApp Trade Line</label>
            <input id="field-whatsapp-trade-line"
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-semibold text-emerald-700"
            />
          </div>

          <div>
            <label htmlFor="field-official-sales-email" className="block font-semibold text-[#121418] mb-1">Official Sales Email</label>
            <input id="field-official-sales-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="field-factory-headquarters-address" className="block font-semibold text-[#121418] mb-1">Factory &amp; Headquarters Address</label>
          <textarea id="field-factory-headquarters-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label htmlFor="field-footer-introduction-text" className="block font-semibold text-[#121418] mb-1">Footer Introduction Text</label>
          <textarea id="field-footer-introduction-text"
            rows={3}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#121418] hover:bg-[#2A2F37] text-white px-8 py-3 rounded-md font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Identity..." : "Save Identity Settings"}</span>
        </button>
      </div>
    </form>
  );
}
