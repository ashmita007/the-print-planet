"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  Inbox,
  Clock,
  CheckCircle,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  ArrowRight,
  TrendingUp,
  Mail,
  Download,
  Database,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ownerGetDashboardStats,
  ownerTriggerDatabaseBackupEmail,
  ownerDownloadDatabaseBackup,
} from "@/lib/api";
import { DashboardMetrics, Enquiry, Product } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";


export default function OwnerDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Backup states
  const [backupEmailLoading, setBackupEmailLoading] = useState(false);
  const [backupDownloadLoading, setBackupDownloadLoading] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    ownerGetDashboardStats().then((data) => {
      if (data) {
        setMetrics(data.metrics);
        setRecentEnquiries(data.recent_enquiries);
        setRecentProducts(data.recent_products);
      }
      setLoading(false);
    });
  }, []);

  const handleEmailBackup = async () => {
    setBackupEmailLoading(true);
    setBackupNotice(null);
    const res = await ownerTriggerDatabaseBackupEmail();
    setBackupEmailLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: `Full database backup successfully emailed to ${res.recipient} (${res.file_size_kb} KB).`,
      });
      setTimeout(() => setBackupNotice(null), 6000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to dispatch email backup.",
      });
    }
  };

  const handleDownloadBackup = async () => {
    setBackupDownloadLoading(true);
    setBackupNotice(null);
    const res = await ownerDownloadDatabaseBackup();
    setBackupDownloadLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: "Full database Excel backup downloaded successfully.",
      });
      setTimeout(() => setBackupNotice(null), 5000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to download backup.",
      });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#687586]">
        Loading live owner metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      {backupNotice && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            backupNotice.type === "success"
              ? "bg-green-50 border-green-200 text-[#217A4B]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {backupNotice.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-[#217A4B]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{backupNotice.text}</span>
          </div>
          <button
            onClick={() => setBackupNotice(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Owner Command Center
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D]">Dashboard Overview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleEmailBackup}
            disabled={backupEmailLoading}
            title="Generate multi-sheet Excel backup and email to theprintplanet01@gmail.com"
            className="bg-[#217A4B] hover:bg-[#1a623c] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {backupEmailLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>{backupEmailLoading ? "Emailing Backup..." : "Email DB Backup"}</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            disabled={backupDownloadLoading}
            title="Direct download full database as .xlsx"
            className="bg-white border border-[#DCE3EB] hover:bg-[#F5F7FA] text-[#17365D] px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {backupDownloadLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download DB (.xlsx)</span>
          </button>

          <Link
            href="/owner/products/new"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/owner/import"
            className="bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk CSV/JSON Import</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Content Controls Quickstrip */}
      <div className="bg-gradient-to-r from-[#17365D] to-[#102742] text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#E87832] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              CMS Controls
            </span>
            <span className="text-xs font-bold text-slate-200">
              Instant Dynamic Content Management
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Edit the homepage hero banner caption, public About Us story &amp; stats counters without touching code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/owner/settings?tab=hero"
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFA868]" />
            <span>Edit Hero Caption</span>
          </Link>
          <Link
            href="/owner/settings?tab=about"
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-[#FFA868]" />
            <span>Edit About Us CMS</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-[#687586]">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] text-[#17365D] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#17365D]">
            {metrics?.total_products || 0}
          </div>
          <div className="text-[11px] text-[#217A4B] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{metrics?.active_products || 0} currently active on public catalogue</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-[#687586]">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] text-[#17365D] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#17365D]">
            {metrics?.total_categories || 0}
          </div>
          <div className="text-[11px] text-[#687586] font-medium">
            Active industrial product groupings
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-[#687586]">New RFQs</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#E87832] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#E87832]">
            {metrics?.new_enquiries || 0}
          </div>
          <div className="text-[11px] text-[#E87832] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Awaiting sales manager response</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-[#687586]">Total Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] text-[#17365D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#17365D]">
            {metrics?.total_enquiries || 0}
          </div>
          <div className="text-[11px] text-[#687586] font-medium">
            {metrics?.in_progress_enquiries || 0} currently in progress
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Enquiries + Recently Updated Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Enquiries (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCE3EB] flex items-center justify-between bg-[#F8FAFC]">
            <h2 className="font-bold text-sm text-[#17365D]">Recent Customer RFQs</h2>
            <Link
              href="/owner/enquiries"
              className="text-xs font-bold text-[#E87832] hover:underline"
            >
              View All Enquiries &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#DCE3EB] text-xs">
            {recentEnquiries.length > 0 ? (
              recentEnquiries.map((enq) => (
                <div key={enq.id} className="p-4 hover:bg-[#F5F7FA] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#263445]">{enq.full_name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        enq.status === "new"
                          ? "bg-orange-100 text-[#E87832]"
                          : enq.status === "quoted"
                          ? "bg-green-100 text-[#217A4B]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>{enq.company_name || "Direct Buyer"}</span>
                    <span>•</span>
                    <span>{enq.phone}</span>
                    {enq.requested_quantity && (
                      <>
                        <span>•</span>
                        <span>Qty: <strong>{enq.requested_quantity}</strong></span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-600 line-clamp-1 italic">
                    &ldquo;{enq.message}&rdquo;
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No customer enquiries recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recently Updated Products (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCE3EB] flex items-center justify-between bg-[#F8FAFC]">
            <h2 className="font-bold text-sm text-[#17365D]">Active Catalogue Items</h2>
            <Link
              href="/owner/products"
              className="text-xs font-bold text-[#17365D] hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#DCE3EB] text-xs">
            {recentProducts.map((p) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-[#F5F7FA]">
                <div className="truncate pr-3">
                  <p className="font-bold text-[#263445] truncate">{formatProductName(p.name)}</p>
                  <p className="text-[11px] text-[#687586] font-mono">
                    {p.sku} • <span className="uppercase">{formatCategoryName(p.category.name)}</span>
                  </p>
                </div>
                <Link
                  href={`/owner/products/${p.id}/edit`}
                  className="text-xs font-semibold text-[#17365D] hover:text-[#E87832] shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
