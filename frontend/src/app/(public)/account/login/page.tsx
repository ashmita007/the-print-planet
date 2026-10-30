"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientLogin } from "@/lib/api";

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/orders";

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

      <div className="bg-white border border-[#DCE3EB] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#FFF5EE] text-[#E87832] rounded-xl flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#17365D]">Buyer / Client Login</h1>
          <p className="text-xs text-[#687586]">
            Sign in to track school &amp; corporate bulk orders and message thread history.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3.5 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-[#263445] mb-1">Email or Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-email@school.edu.in"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-[#263445] outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-[#263445]">Password</label>
              <Link
                href="/account/forgot-password"
                className="text-[11px] font-semibold text-[#E87832] hover:underline"
              >
                Forgotten Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-[#263445] outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Signing in...</span> : <span>Sign In &amp; View Orders</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EEF2F7] text-xs text-[#687586]">
          <div>
            New bulk order client?{" "}
            <Link href="/bulk-orders" className="text-[#E87832] font-bold hover:underline">
              Submit your bulk inquiry to auto-register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
