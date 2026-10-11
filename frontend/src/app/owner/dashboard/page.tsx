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
} from "lucide-react";
import { ownerGetDashboardStats } from "@/lib/api";
import { DashboardMetrics, Enquiry, Product } from "@/lib/types";

export default function OwnerDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#687586]">
        Loading live owner metrics from PostgreSQL...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Owner Command Center
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D]">Dashboard Overview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
                  <p className="font-bold text-[#263445] truncate">{p.name}</p>
                  <p className="text-[11px] text-[#687586] font-mono">
                    {p.sku} • {p.category.name}
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
