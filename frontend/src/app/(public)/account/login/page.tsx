"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientLogin, safeRedirectPath } from "@/lib/api";

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirectPath(searchParams.get("redirect"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await clientLogin({ username, password });
    setLoading(false);

    if (res.success) {
      if (res.role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push(redirectUrl);
      }
    } else {
      setErrorMsg(res.error || "Invalid email or password.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Breadcrumbs items={[{ label: "Client Portal", href: "/orders" }, { label: "Login" }]} />

      <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#EDF1F6] text-[#3F4A56] rounded-md flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#22272E]">Buyer / Client Login</h1>
          <p className="text-xs text-[#3F4A56]">
            Sign in to track school &amp; corporate bulk orders and message thread history.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3.5 rounded-md text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label htmlFor="field-email-or-username" className="block font-bold text-[#22272E] mb-1">Email or Username</label>
            <div className="relative">
              <input id="field-email-or-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-email@school.edu.in"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#22272E] outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="field-password" className="block font-bold text-[#22272E]">Password</label>
              <Link
                href="/account/forgot-password"
                className="text-[11px] font-semibold text-[#3F4A56] hover:underline"
              >
                Forgotten Password?
              </Link>
            </div>
            <div className="relative">
              <input id="field-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#22272E] focus:bg-[#FFFFFF] rounded-md pl-9 pr-3 py-2.5 text-[#22272E] outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#22272E] py-3 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Signing in...</span> : <span>Sign In &amp; View Orders</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EDF1F6] text-xs text-[#3F4A56]">
          <div>
            New bulk order client?{" "}
            <Link href="/corporate" className="text-[#3F4A56] font-bold hover:underline">
              Submit your bulk inquiry to auto-register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
