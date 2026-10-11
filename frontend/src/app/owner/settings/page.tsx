"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Building2,
  Lock,
  Globe,
} from "lucide-react";
import { getSiteSettings, ownerUpdateSettings, getApiUrl } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [footerText, setFooterText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setBusinessName(s.business_name);
      setTagline(s.tagline);
      setEmail(s.email);
      setPhone(s.phone);
      setWhatsapp(s.whatsapp);
      setAddress(s.address);
      setGstNumber(s.gst_number || "");
      setFooterText(s.footer_text);
      setLogoUrl(s.logo_url || "");
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await ownerUpdateSettings({
      business_name: businessName,
      tagline,
      email,
      phone,
      whatsapp,
      address,
      gst_number: gstNumber,
      footer_text: footerText,
      logo_url: logoUrl || null,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg("Store settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setErrorMsg(res.error || "Failed to update settings.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSubmitting(true);
    setPassError("");
    setPassSuccess("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") : "";
      const res = await fetch(`${getApiUrl()}/api/v1/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      setPassSubmitting(false);

      if (res.ok) {
        setPassSuccess("Owner password updated securely.");
        setCurrentPassword("");
        setNewPassword("");
        if (data.token) {
          localStorage.setItem("owner_token", data.token);
        }
      } else {
        setPassError(data.error || "Password change failed.");
      }
    } catch (err: any) {
      setPassSubmitting(false);
      setPassError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
          Portal & Identity Configuration
        </span>
        <h1 className="text-2xl font-extrabold text-[#17365D]">Website Settings</h1>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Brand Information */}
        <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
            1. Business Identity & Commercial Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#263445] mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#263445] mb-1">Official GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">Custom Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Strip Details */}
        <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
            2. Customer Contact & Dispatch Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#263445] mb-1">Primary Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">WhatsApp Trade Line</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">Official Sales Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">Factory & Headquarters Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">Footer Introduction Text</label>
            <textarea
              rows={3}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none resize-none"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Store Settings"}
          </button>
        </div>
      </form>

      {/* Password Change Box */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-[#E87832]" />
          Change Owner Password
        </h2>

        {passSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block font-semibold text-[#263445] mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">New Master Password (min 8 characters) *</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={passSubmitting}
            className="bg-[#17365D] hover:bg-[#102742] text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {passSubmitting ? "Updating Password..." : "Update Owner Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
