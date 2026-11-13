"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { confirmPasswordReset } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await confirmPasswordReset({ uid, token, new_password: newPassword });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.error || "Failed to reset password. Link may have expired.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-[#EDF1F6] text-[#353C45] rounded-md flex items-center justify-center mx-auto mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#121418]">Set New Password</h1>
        <p className="text-xs text-[#353C45]">
          Enter your new account password below to regain access.
        </p>
      </div>

      {success ? (
        <div className="bg-[#E8F8F5] border border-[#A3E4D7] text-[#1E8449] p-5 rounded-md text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-sm">Password Reset Successful!</h3>
          <p className="text-xs text-[#353C45]">
            Your password has been securely updated. You can now log into your client orders dashboard.
          </p>
          <div className="pt-2">
            <Link
              href="/account/login"
              className="inline-block bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] px-5 py-2.5 rounded-md text-xs font-bold transition-all shadow-sm"
            >
              Log in to My Account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3 rounded-md text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="field-new-password" className="block font-bold text-[#121418] mb-1">New Password *</label>
            <div className="relative">
              <input id="field-new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="field-confirm-new-password" className="block font-bold text-[#121418] mb-1">Confirm New Password *</label>
            <div className="relative">
              <input id="field-confirm-new-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !uid || !token}
            title={!uid || !token ? "Open the link from your reset email" : undefined}
            className="w-full bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] py-3 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Updating password...</span> : <span>Save New Password</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-[#EDF1F6] text-xs text-[#353C45]">
        <Link href="/account/login" className="text-slate-500 hover:text-[#121418] font-semibold underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumbs items={[{ label: "Client Portal", href: "/account/login" }, { label: "Reset Password" }]} />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
