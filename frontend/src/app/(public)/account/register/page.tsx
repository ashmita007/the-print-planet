"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Building, Phone, ArrowRight, UserPlus, CheckCircle2, MailCheck, RotateCw } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientRegister, resendEmailOtp, safeRedirectPath, verifyEmailOtp } from "@/lib/api";

export default function ClientRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirectPath(searchParams.get("redirect"));

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 2: the 6-digit code emailed to the buyer. ?verify=email opens it directly (from login).
  const verifyParam = searchParams.get("verify") || "";
  const [step, setStep] = useState<"details" | "verify">(verifyParam ? "verify" : "details");
  const [pendingEmail, setPendingEmail] = useState(verifyParam);
  const [code, setCode] = useState("");
  const [infoMsg, setInfoMsg] = useState(
    verifyParam ? `Enter the 6-digit code we emailed to ${verifyParam}. Check spam if it isn't in your inbox.` : ""
  );
  const [resendIn, setResendIn] = useState(verifyParam ? 60 : 0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === "verify") codeRef.current?.focus();
  }, [step]);

  const goToVerify = (address: string, message: string, wait = 60) => {
    setPendingEmail(address);
    setStep("verify");
    setCode("");
    setErrorMsg("");
    setInfoMsg(message);
    setResendIn(wait);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (code.length !== 6) {
      setErrorMsg("Enter all 6 digits of the code.");
      return;
    }
    setLoading(true);
    const res = await verifyEmailOtp(pendingEmail, code);
    setLoading(false);
    if (res.success) {
      setInfoMsg("");
      setSuccessMsg("Email verified. Your account is ready, taking you in...");
      setTimeout(() => router.push(redirectUrl), 1000);
      return;
    }
    if (res.errorCode === "already_verified") {
      router.push(`/account/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setCode("");
    setErrorMsg(res.error || "That code didn't work. Try again.");
    codeRef.current?.focus();
  };

  const handleResend = async () => {
    if (resendIn > 0 || !pendingEmail) return;
    setErrorMsg("");
    setLoading(true);
    const res = await resendEmailOtp(pendingEmail);
    setLoading(false);
    if (res.success) {
      setCode("");
      setInfoMsg(`We sent a new code to ${pendingEmail}. Only the newest code works.`);
      setResendIn(res.resendAfter || 60);
    } else {
      setErrorMsg(res.error || "Could not send a new code.");
      if (res.resendAfter) setResendIn(Math.min(res.resendAfter, 3600));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await clientRegister({
      full_name: fullName.trim(),
      company_name: companyName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    });

    setLoading(false);

    if (res.success && res.verificationRequired) {
      goToVerify(
        res.email || email.trim().toLowerCase(),
        `${res.message || "We sent you a 6-digit code."} Enter it below to finish. Check spam if it isn't in your inbox.`,
        res.resendAfter && res.resendAfter < 3600 ? res.resendAfter : 60
      );
    } else if (res.success) {
      router.push(redirectUrl);
    } else {
      setErrorMsg(res.error || "Registration failed. Please check your details and try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 space-y-6">
      <Breadcrumbs items={[{ label: "Client Portal", href: "/orders" }, { label: "Create Account" }]} />

      <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#EDF1F6] text-[#353C45] rounded-md flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#121418]">{step === "verify" ? "Verify Your Email" : "Create Client Account"}</h1>
          <p className="text-xs text-[#353C45]">
            Register to track custom bulk orders, access factory quotations, and chat directly with our production team.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3.5 rounded-md text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-md text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {infoMsg && !successMsg && (
          <div className="bg-[#FFF4EC] border border-[#F9C9A6] text-[#7A3A10] p-3.5 rounded-md text-xs font-semibold flex items-start gap-2" role="status">
            <MailCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label htmlFor="field-otp" className="block font-bold text-[#121418] mb-1">
                Verification code
              </label>
              <input
                id="field-otp"
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                aria-describedby="otp-help"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md px-3 py-3 text-center text-2xl font-extrabold tracking-[0.5em] text-[#121418] outline-none"
              />
              <p id="otp-help" className="mt-1.5 text-[11px] text-[#353C45]">
                Sent to <span className="font-bold text-[#121418]">{pendingEmail}</span>. The code expires in 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] py-3 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Checking...</span> : <span>Verify &amp; Open My Account</span>}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || resendIn > 0}
                className="inline-flex items-center gap-1.5 font-bold text-[#121418] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-default"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("details"); setInfoMsg(""); setErrorMsg(""); }}
                className="font-semibold text-slate-500 hover:text-[#121418] underline cursor-pointer"
              >
                Change email
              </button>
            </div>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label htmlFor="field-full-name" className="block font-bold text-[#121418] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="field-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Sharma"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="field-company-name" className="block font-bold text-[#121418] mb-1">
              Organization / School / Company Name
            </label>
            <div className="relative">
              <input
                id="field-company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Delhi Public School or ABC Tech Pvt Ltd"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
              />
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="field-email" className="block font-bold text-[#121418] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.in"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="field-phone" className="block font-bold text-[#121418] mb-1">
                Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="field-password" className="block font-bold text-[#121418] mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="field-confirm-password" className="block font-bold text-[#121418] mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="field-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#121418] outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] py-3 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? <span>Sending code...</span> : <span>Create Account &amp; Verify Email</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-center text-[#353C45]">We&apos;ll email you a 6-digit code to confirm it&apos;s you.</p>
        </form>
        )}

        <div className="text-center pt-3 border-t border-[#EDF1F6] text-xs text-[#353C45] space-y-1">
          <div>
            Already registered?{" "}
            <Link
              href={`/account/login${redirectUrl !== "/orders" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-[#121418] font-bold hover:underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
