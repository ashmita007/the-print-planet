"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  Inbox,
  CheckCircle,
  PlusCircle,
  FileSpreadsheet,
  TrendingUp,
  Mail,
  Download,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import {
  ownerGetDashboardStats,
  ownerTriggerDatabaseBackupEmail,
  ownerDownloadDatabaseBackup,
  ownerDownloadConversationsBackup,
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
  const [backupConvLoading, setBackupConvLoading] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDownloadConversationsBackup = async () => {
    setBackupConvLoading(true);
    setBackupNotice(null);
    const res = await ownerDownloadConversationsBackup();
    setBackupConvLoading(false);
    if (res.success) {
      setBackupNotice({
        type: "success",
        text: "Dedicated customer conversations & bulk orders backup downloaded successfully.",
      });
      setTimeout(() => setBackupNotice(null), 5000);
    } else {
      setBackupNotice({
        type: "error",
        text: res.error || "Failed to download conversations backup.",
      });
    }
  };

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
      <div className="space-y-8 anim-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 skeleton" />
            <div className="h-8 w-40 skeleton" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 skeleton rounded-lg" />
            <div className="h-9 w-24 skeleton rounded-lg" />
            <div className="h-9 w-28 skeleton rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-card p-5 rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-2.5 w-24 skeleton" />
                <div className="w-8 h-8 skeleton rounded-lg" />
              </div>
              <div className="h-7 w-16 skeleton" />
              <div className="h-2.5 w-32 skeleton" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 surface-card rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DFE6EE] flex items-center justify-between">
              <div className="h-3 w-32 skeleton" />
              <div className="h-3 w-16 skeleton" />
            </div>
            <div className="divide-y divide-[#EDF1F6]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-5 py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-32 skeleton" />
                    <div className="h-4 w-16 skeleton rounded-full" />
                  </div>
                  <div className="h-3 w-3/4 skeleton" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 surface-card rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DFE6EE]">
              <div className="h-3 w-32 skeleton" />
            </div>
            <div className="divide-y divide-[#EDF1F6]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-2/3 skeleton" />
                    <div className="h-2.5 w-1/3 skeleton" />
                  </div>
                  <div className="h-3 w-10 skeleton" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Backup feedback toast */}
      {backupNotice && (
        <div
          className={`fixed bottom-5 right-5 z-[60] max-w-sm px-4 py-3 rounded-md border text-xs font-medium flex items-start gap-2.5 shadow-lg anim-toast ${
            backupNotice.type === "success"
              ? "bg-[#FFFFFF] border-emerald-200 text-[#217A4B]"
              : "bg-[#FFFFFF] border-red-200 text-red-700"
          }`}
        >
          {backupNotice.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#217A4B]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          )}
          <span className="flex-1">{backupNotice.text}</span>
          <button
            onClick={() => setBackupNotice(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
            Owner dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121418] mt-1">Overview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleEmailBackup}
            disabled={backupEmailLoading}
            title="Generate multi-sheet Excel backup and email it to the owner inbox"
            className="bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-[#121418] px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {backupEmailLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{backupEmailLoading ? "Emailing..." : "Email backup"}</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            disabled={backupDownloadLoading}
            title="Direct download full database as .xlsx"
            className="bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-[#121418] px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {backupDownloadLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Download</span>
          </button>

          <button
            onClick={handleDownloadConversationsBackup}
            disabled={backupConvLoading}
            title="Download dedicated backup of all customer conversations, messages & bulk order threads"
            className="bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#121418] hover:bg-[#EDF1F6] text-[#121418] px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {backupConvLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#353C45]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#353C45]" />
            )}
            <span>Backup Conversations</span>
          </button>

          <Link
            href="/owner/products/new"
            className="bg-[#121418] hover:bg-[#2A2F37] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add product</span>
          </Link>

          <Link
            href="/owner/import"
            className="bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-[#121418] px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </Link>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Bulk Orders",
            value: (metrics as any)?.total_bulk_orders || 0,
            icon: Briefcase,
            href: "/owner/orders",
            note: `${(metrics as any)?.pending_bulk_orders || 0} need quotes`,
            noteTone: "text-[#353C45] font-bold",
            accent: true,
          },
          {
            label: "Total products",
            value: metrics?.total_products || 0,
            icon: Package,
            href: "/owner/products",
            note: `${metrics?.active_products || 0} active on public catalogue`,
            noteTone: "text-[#217A4B]",
            accent: false,
          },
          {
            label: "Categories",
            value: metrics?.total_categories || 0,
            icon: Layers,
            href: "/owner/categories",
            note: "Active product groupings",
            noteTone: "text-slate-500",
            accent: false,
          },
          {
            label: "New RFQs",
            value: metrics?.new_enquiries || 0,
            icon: Inbox,
            href: "/owner/enquiries",
            note: "Awaiting response",
            noteTone: "text-[#2B323B]",
            accent: true,
          },
          {
            label: "Total inquiries",
            value: metrics?.total_enquiries || 0,
            icon: TrendingUp,
            href: "/owner/enquiries",
            note: `${metrics?.in_progress_enquiries || 0} in progress`,
            noteTone: "text-slate-500",
            accent: false,
          },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`surface-card surface-hover p-5 rounded-lg space-y-4 anim-fade-up stagger-${index + 1} block transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 pt-1">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    card.accent
                      ? "bg-[#EDF1F6] text-[#2B323B]"
                      : "bg-[#EDF1F6] text-[#2B323B]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-[28px] leading-none font-bold tracking-tight tabular-nums ${
                  card.accent ? "text-[#2B323B]" : "text-[#121418]"
                }`}
              >
                {card.value}
              </div>
              <div className={`text-[11px] font-medium ${card.noteTone}`}>{card.note}</div>
            </Link>
          );
        })}
      </div>

      {/* Two Columns: Recent Enquiries + Recently Updated Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Enquiries (7 Cols) */}
        <div className="lg:col-span-7 surface-card rounded-lg overflow-hidden anim-fade-up stagger-3">
          <div className="px-5 py-3.5 border-b border-[#DFE6EE] flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#121418]">Recent customer RFQs</h2>
            <Link
              href="/owner/enquiries"
              className="text-[11px] font-medium text-slate-500 hover:text-[#2B323B] transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#DFE6EE] text-xs">
            {recentEnquiries.length > 0 ? (
              recentEnquiries.map((enq) => (
                <div key={enq.id} className="px-5 py-3.5 hover:bg-[#EDF1F6] transition-colors duration-150 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#121418]">{enq.full_name}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-medium capitalize text-slate-500">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          enq.status === "new"
                            ? "bg-[#121418]"
                            : enq.status === "quoted"
                            ? "bg-[#217A4B]"
                            : "bg-slate-400"
                        }`}
                      />
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
                  <p className="text-slate-500 line-clamp-1">
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
        <div className="lg:col-span-5 surface-card rounded-lg overflow-hidden anim-fade-up stagger-4">
          <div className="px-5 py-3.5 border-b border-[#DFE6EE] flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#121418]">Active catalogue</h2>
            <Link
              href="/owner/products"
              className="text-[11px] font-medium text-slate-500 hover:text-[#2B323B] transition-colors"
            >
              Manage &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#DFE6EE] text-xs">
            {recentProducts.map((p) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#EDF1F6] transition-colors duration-150">
                <div className="truncate">
                  <p className="font-medium text-[#121418] truncate">{formatProductName(p.name)}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    {p.sku} • <span className="uppercase">{formatCategoryName(p.category.name)}</span>
                  </p>
                </div>
                <Link
                  href={`/owner/products/${p.id}/edit`}
                  className="text-[11px] font-medium text-slate-500 hover:text-[#2B323B] transition-colors shrink-0"
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
