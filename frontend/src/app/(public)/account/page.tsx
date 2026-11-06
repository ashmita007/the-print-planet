"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MessageSquare,
  LogOut,
  Mail,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientVerifySession, clientLogout, clientGetBulkOrders } from "@/lib/api";

export default function ClientAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderMetrics, setOrderMetrics] = useState<any>({ total: 0 });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const profile = await clientVerifySession();
      if (cancelled) return;
      if (profile === null) {
        router.replace("/account/login?redirect=/account");
        return;
      }
      if (profile) {
        setUser(profile);
      } else {
        try {
          setUser(JSON.parse(localStorage.getItem("client_user") || "null"));
        } catch {}
      }

      const ordersData = await clientGetBulkOrders();
      if (!cancelled && ordersData.summary_metrics) {
        setOrderMetrics(ordersData.summary_metrics);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await clientLogout();
    router.push("/account/login");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading client account details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

      {/* Account Profile Card */}
      <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE6EE] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EDF1F6] border border-[#DFE6EE] flex items-center justify-center text-[#121418] font-black text-xl">
              {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#121418]">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Client
                </span>
              </div>
              <p className="text-xs text-[#353C45] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || "No email on record"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto bg-[#EDF1F6] hover:bg-slate-200 text-[#121418] px-4 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="group block p-5 rounded-lg border border-[#DFE6EE] hover:border-[#121418] bg-slate-50/50 hover:bg-[#FFFFFF] transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#121418]">
                <Package className="w-4 h-4 text-[#F26B1D]" />
                <span>Bulk Orders &amp; Quotations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-[#353C45]">
              View all active quotations, manufacturing status, proofs, and consignment tracking ({orderMetrics.total || 0} orders).
            </p>
          </Link>

          <Link
            href="/orders"
            className="group block p-5 rounded-lg border border-[#DFE6EE] hover:border-[#121418] bg-slate-50/50 hover:bg-[#FFFFFF] transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#121418]">
                <MessageSquare className="w-4 h-4 text-[#353C45]" />
                <span>Direct Factory Conversations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-[#353C45]">
              Chat directly with our Bangalore factory production specialists and send specification files.
            </p>
          </Link>

          <Link
            href="/corporate"
            className="group block p-5 rounded-lg border border-[#DFE6EE] hover:border-[#121418] bg-slate-50/50 hover:bg-[#FFFFFF] transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#121418]">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>New Bulk Requirement</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-[#353C45]">
              Submit specifications for customized lanyards, student PVC cards, RFID keys, or machinery.
            </p>
          </Link>

          <Link
            href="/account/forgot-password"
            className="group block p-5 rounded-lg border border-[#DFE6EE] hover:border-[#121418] bg-slate-50/50 hover:bg-[#FFFFFF] transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#121418]">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Security &amp; Password</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-[#353C45]">
              Update your account password or request password reset tokens.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
