"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { ownerLogin } from "@/lib/api";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const res = await ownerLogin(username, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/owner/dashboard");
    } else {
      setErrorMessage(res.error || "Authentication failed. Invalid owner credentials.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE3EB] overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#102742] text-white p-8 text-center space-y-2 border-b-4 border-[#E87832]">
        <div className="w-12 h-12 rounded-xl bg-[#E87832] flex items-center justify-center font-black text-white text-2xl mx-auto shadow-md">
          P
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">The Print Planet</h1>
        <p className="text-xs text-slate-300">
          Industrial Owner Administration & Catalogue Portal
        </p>
      </div>

      {/* Form Content */}
      <div className="p-8 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263445] mb-1.5">
              Owner Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or owner@theprintplanet.in"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#263445] outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#263445] outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Authenticating..." : "Login to Management Portal"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-4 border-t border-[#DCE3EB] text-center text-xs text-[#687586] space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#217A4B]" />
            Protected by Django PBKDF2 Password Hashing
          </p>
          <div>
            <Link href="/" className="text-[#17365D] hover:underline font-semibold">
              &larr; Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
