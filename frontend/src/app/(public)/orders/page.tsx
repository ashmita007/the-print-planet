"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  FileText,
  MessageSquare,
  Truck,
  ArrowRight,
  PlusCircle,
  Search,
  Building2,
  GraduationCap,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientGetBulkOrders, clientGetCheckedProducts, clientLogout } from "@/lib/api";
import { BulkOrder } from "@/lib/types";

export default function ClientOrdersDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [checkedProducts, setCheckedProducts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    submitted: 0,
    reviewing: 0,
    quoted: 0,
    in_production: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token") || localStorage.getItem("owner_token");
      const userStr = localStorage.getItem("client_user") || localStorage.getItem("owner_user");
      if (!token) {
        router.push("/account/login?redirect=/orders");
        return;
      }
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {}
      }

      Promise.all([
        clientGetBulkOrders(),
        clientGetCheckedProducts(),
      ]).then(([ordersData, checkedData]) => {
        setOrders(ordersData.results || []);
        if (ordersData.summary_metrics) {
          setMetrics(ordersData.summary_metrics);
        }
        setCheckedProducts(checkedData.results || []);
        setLoading(false);
      });
    }
  }, [router]);

  const handleLogout = async () => {
    await clientLogout();
    router.push("/account/login");
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.organization_name.toLowerCase().includes(q) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      (o.status_label && o.status_label.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string, label: string = status) => {
    switch (status) {
      case "submitted":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Submitted</span>;
      case "reviewing":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Technical Review</span>;
      case "quoted":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Quotation Ready</span>;
      case "proofing":
      case "in_production":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">In Production</span>;
      case "dispatched":
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Dispatched / Complete</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{label}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Client Portal", href: "/orders" }, { label: "My Bulk Orders" }]} />

      {/* Header bar */}
      <div className="bg-white border border-[#DCE3EB] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E87832]">
            Client Orders &amp; Conversation Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17365D]">
            Welcome, {user?.first_name || user?.username || "Client"}
          </h1>
          <p className="text-xs sm:text-sm text-[#687586] mt-0.5">
            Track your bulk order quotations, sample proofs, production status, and direct factory conversations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/bulk-orders"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bulk Inquiry</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-[#F5F7FA] hover:bg-slate-200 text-[#263445] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Orders</span>
          <div className="text-xl sm:text-2xl font-black text-[#17365D]">{metrics.total}</div>
        </div>
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Submitted</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{metrics.submitted}</div>
        </div>
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-blue-600 uppercase">Reviewing</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">{metrics.reviewing}</div>
        </div>
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-purple-600 uppercase">Quoted</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600">{metrics.quoted}</div>
        </div>
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase">In Production</span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">{metrics.in_production}</div>
        </div>
        <div className="bg-white border border-[#DCE3EB] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">{metrics.completed}</div>
        </div>
      </div>

      {/* Orders Filter & List Table */}
      <div className="bg-white border border-[#DCE3EB] rounded-2xl overflow-hidden shadow-2xs space-y-4">
        <div className="p-4 sm:p-5 border-b border-[#E6EBF1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#17365D] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#E87832]" />
            <span>Orders &amp; Message Threads ({filteredOrders.length})</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, school, city..."
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#263445] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your orders &amp; conversation records...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E6EBF1] text-[#687586] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Sector</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Quotation</th>
                  <th className="px-5 py-3">Dispatch AWB</th>
                  <th className="px-5 py-3 text-right">Conversation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#17365D]">
                      <Link href={`/orders/${o.order_number}`} className="hover:text-[#E87832] transition-colors underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#263445]">
                      <div>{o.organization_name}</div>
                      <div className="text-[10px] text-slate-400">{o.city || "Bengaluru"}</div>
                    </td>
                    <td className="px-5 py-4">
                      {o.organization_type === "school" || o.organization_type === "college" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          <GraduationCap className="w-3 h-3" />
                          <span>School</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <Building2 className="w-3 h-3" />
                          <span>Corporate</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#17365D]">
                      {o.estimated_quantity?.toLocaleString()} pcs
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(o.status, o.status_label)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#2ECC71]">
                      {o.quoted_amount ? `₹${Number(o.quoted_amount).toLocaleString("en-IN")}` : <span className="text-slate-400 font-normal">Pending</span>}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                      {o.tracking_consignment_number ? (
                        <span className="text-emerald-700 font-bold">{o.tracking_courier_partner}: {o.tracking_consignment_number}</span>
                      ) : (
                        <span className="text-slate-400">Pre-dispatch</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/orders/${o.order_number}`}
                        className="inline-flex items-center gap-1.5 bg-[#17365D] hover:bg-[#102742] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#E87832]" />
                        <span>Chat ({o.messages_count || 1})</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#17365D]">No Bulk Orders Found</h3>
            <p className="text-xs text-[#687586] max-w-sm mx-auto">
              You do not have any active bulk inquiries under this account yet. Submit your specifications to start your order.
            </p>
            <Link
              href="/bulk-orders"
              className="inline-block bg-[#E87832] text-white px-4 py-2 rounded-lg text-xs font-bold"
            >
              Start New Bulk Order
            </Link>
          </div>
        )}
      </div>
      {/* Products Checked by User Section */}
      {checkedProducts.length > 0 && (
        <div className="bg-white border border-[#DCE3EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E87832]" />
              <span>Products You Explored &amp; Checked ({checkedProducts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Available to add directly into your bulk quotation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {checkedProducts.map((item) => {
              const p = item.product_details;
              if (!p) return null;
              const imgUrl = p.primary_image?.secure_url || "/placeholder-product.svg";
              return (
                <Link
                  key={item.id}
                  href={`/products/${p.slug}`}
                  className="p-2.5 rounded-xl border border-[#DCE3EB] hover:border-[#17365D] hover:shadow-sm bg-[#FAFBFC] transition-all group flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-white rounded-lg p-1.5 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                    <img src={imgUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">{p.sku}</span>
                    <h4 className="text-xs font-bold text-[#17365D] group-hover:text-[#E87832] transition-colors truncate">
                      {p.name}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
