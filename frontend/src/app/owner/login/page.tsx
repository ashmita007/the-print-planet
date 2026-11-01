"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ownerLogin } from "@/lib/api";

export default function OwnerLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "expired") {
        setErrorMessage("Your administrative session has timed out. Please sign in again.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const res = await ownerLogin(cleanUsername, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage("Credentials verified! Opening management dashboard...");
      setTimeout(() => {
        router.push("/owner/dashboard");
      }, 350);
    } else {
      setErrorMessage(res.error || "Authentication failed. Invalid owner credentials.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-[0_24px_60px_-32px_rgba(16,39,66,0.35)] border border-[#D8DEE5] overflow-hidden anim-scale-in">
      {/* Header */}
      <div className="px-7 pt-8 pb-6 text-center space-y-3 border-b border-[#E6EBF1]">
        <Image
          src="/logo.png"
          alt="The Print Planet"
          width={240}
          height={70}
          className="h-11 sm:h-12 w-auto object-contain mx-auto"
          priority
        />
        <div className="space-y-1">
          <h1 className="text-base font-bold text-[#16324F] tracking-tight">
            Owner console
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage the store
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-7 space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-start gap-2.5 anim-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-start gap-2.5 anim-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="field-owner-username-or-email" className="block font-semibold text-[#1C2733] mb-1.5">
              Owner Username or Email
            </label>
            <div className="relative">
              <input id="field-owner-username-or-email"
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or owner email"
                className="w-full bg-[#F3F5F7] border border-[#D8DEE5] focus:border-[#16324F] focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1C2733] outline-none transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-master-password" className="block font-semibold text-[#1C2733]">
                Master Password
              </label>
            </div>
            <div className="relative">
              <input id="field-master-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F3F5F7] border border-[#D8DEE5] focus:border-[#16324F] focus:bg-white rounded-lg pl-9 pr-10 py-2.5 text-xs text-[#1C2733] outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#16324F] hover:bg-[#0E2238] text-white py-3 rounded-md font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Owner Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#D8DEE5] text-center text-xs text-[#566373] space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#217A4B]" />
            Protected by Django PBKDF2 Password Encryption
          </p>
          <div>
            <Link href="/" className="text-[#16324F] hover:underline font-semibold inline-flex items-center gap-1">
              &larr; Return to Public Catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
