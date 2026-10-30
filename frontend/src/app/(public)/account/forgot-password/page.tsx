"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { requestForgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await requestForgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || "Password reset instructions have been dispatched.");
    } else {
      setErrorMsg(res.error || "Failed to submit request.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumbs items={[{ label: "Client Portal", href: "/account/login" }, { label: "Forgotten Password" }]} />

      <div className="bg-white border border-[#DCE3EB] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#FFF5EE] text-[#E87832] rounded-xl flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#17365D]">Forgotten Password</h1>
          <p className="text-xs text-[#687586]">
            Enter your registered school, corporate, or buyer account email address.
          </p>
        </div>

        {successMsg ? (
          <div className="bg-[#E8F8F5] border border-[#A3E4D7] text-[#1E8449] p-4 rounded-xl text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Request Dispatched</span>
            </div>
            <p className="leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/account/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17365D] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {errorMsg && (
              <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-[#263445] mb-1">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="procurement@school.edu.in"
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-[#263445] outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E87832] hover:bg-[#d66b28] text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Dispatching link...</span> : <span>Send Password Reset Link</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#EEF2F7] text-xs text-[#687586] flex items-center justify-between">
          <Link href="/account/login" className="text-slate-500 hover:text-[#17365D] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>

          <Link href="/bulk-orders" className="text-[#E87832] font-bold hover:underline">
            New Bulk Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
