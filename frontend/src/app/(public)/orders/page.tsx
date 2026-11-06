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
  X,
  Send,
  Paperclip,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  clientGetBulkOrders,
  clientGetCheckedProducts,
  clientLogout,
  clientVerifySession,
  clientSubmitBulkOrder,
} from "@/lib/api";
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
  const [loadError, setLoadError] = useState("");

  // New Inquiry / Conversation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgType, setOrgType] = useState("corporate");
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [categoryType, setCategoryType] = useState("custom_lanyards");
  const [quantity, setQuantity] = useState("500");
  const [requirements, setRequirements] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const toLogin = () => router.replace("/account/login?redirect=/orders");

    (async () => {
      const profile = await clientVerifySession();
      if (cancelled) return;
      if (profile === null) return toLogin();
      if (profile) setUser(profile);
      else {
        try {
          setUser(JSON.parse(localStorage.getItem("client_user") || "null"));
        } catch {}
      }

      const [ordersData, checkedData] = await Promise.all([clientGetBulkOrders(), clientGetCheckedProducts()]);
      if (cancelled) return;
      if (ordersData.unauthorized) return toLogin();
      setOrders(ordersData.results || []);
      if (ordersData.summary_metrics) setMetrics(ordersData.summary_metrics);
      setLoadError(ordersData.error || "");
      setCheckedProducts(checkedData.results || []);
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

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!requirements.trim()) {
      setFormError("Please describe your custom printing or bulk requirement.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("organization_type", orgType);
    formData.append(
      "organization_name",
      orgName.trim() || (user?.first_name ? `${user.first_name}'s Enterprise` : "Direct Client")
    );
    formData.append(
      "contact_person",
      user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username || "Buyer"
    );
    formData.append("email", user?.email || "");
    formData.append("phone", phone.trim() || "+91 97418 08034");
    formData.append("city", city.trim() || "Bengaluru");
    formData.append("category_type", categoryType);
    formData.append("estimated_quantity", quantity || "500");
    formData.append("requirements", requirements.trim());
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const res = await clientSubmitBulkOrder(formData);
    setSubmitting(false);

    if (res.success && res.order_number) {
      setIsModalOpen(false);
      router.push(`/orders/${res.order_number}`);
    } else {
      setFormError(res.error || "Failed to start conversation. Please try again.");
    }
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#121418]/10 text-[#121418] border border-[#121418]/20">Technical Review</span>;
      case "quoted":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE]">Quotation Ready</span>;
      case "proofing":
      case "in_production":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE]">In Production</span>;
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
      <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-5 sm:p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#353C45]">
            Client Orders &amp; Conversation Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121418]">
            Welcome, {user?.first_name || user?.username || "Client"}
          </h1>
          <p className="text-xs sm:text-sm text-[#353C45] mt-0.5">
            Track your bulk order quotations, sample proofs, production status, and direct factory conversations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Chat / Inquiry</span>
          </button>

          <Link
            href="/corporate"
            className="bg-[#FFFFFF] border border-[#DFE6EE] hover:bg-slate-50 text-[#121418] px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            title="Open Full Corporate Customizer Desk"
          >
            <span>Customizer Desk</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-[#EDF1F6] hover:bg-slate-200 text-[#121418] px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Orders</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#121418]">{metrics.total}</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Submitted</span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600">{metrics.submitted}</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-[#121418] uppercase">Reviewing</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#121418]">{metrics.reviewing}</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-[#121418] uppercase">Quoted</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#121418]">{metrics.quoted}</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-[#121418] uppercase">In Production</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#121418]">{metrics.in_production}</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-4 rounded-md space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">{metrics.completed}</div>
        </div>
      </div>

      {/* Orders Filter & List Table */}
      <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg overflow-hidden shadow-2xs space-y-4">
        <div className="p-4 sm:p-5 border-b border-[#DFE6EE] flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#121418] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#353C45]" />
            <span>Orders &amp; Message Threads ({filteredOrders.length})</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, school, city..."
              aria-label="Search your orders"
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#121418] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loading ? (
          <div role="status" className="p-12 text-center text-sm text-slate-500">Loading your orders&hellip;</div>
        ) : loadError ? (
          <div role="alert" className="p-12 text-center text-sm font-medium text-[#C0392B]">
            We could not load your orders right now. Please refresh in a moment.
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF1F6] border-b border-[#DFE6EE] text-[#353C45] font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#EDF1F6]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#121418]">
                      <Link href={`/orders/${o.order_number}`} className="hover:text-[#353C45] transition-colors underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#121418]">
                      <div>{o.organization_name}</div>
                      <div className="text-[10px] text-slate-400">{o.city || "Bengaluru"}</div>
                    </td>
                    <td className="px-5 py-4">
                      {o.organization_type === "school" || o.organization_type === "college" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#121418] bg-[#EDF1F6] px-2 py-0.5 rounded">
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
                    <td className="px-5 py-4 font-semibold text-[#121418]">
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
                        className="inline-flex items-center gap-1.5 bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#353C45]" />
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
            <h3 className="text-sm font-bold text-[#121418]">No Bulk Orders Found</h3>
            <p className="text-xs text-[#353C45] max-w-sm mx-auto">
              You do not have any active bulk inquiries under this account yet. Submit your specifications to start your order.
            </p>
            <Link
              href="/corporate"
              className="inline-block bg-[#121418] text-white px-4 py-2 rounded-lg text-xs font-bold"
            >
              Start New Bulk Order
            </Link>
          </div>
        )}
      </div>
      {/* Products Checked by User Section */}
      {checkedProducts.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#121418] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-[#353C45]" />
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
                  className="p-2.5 rounded-md border border-[#DFE6EE] hover:border-[#121418] hover:shadow-sm bg-[#EDF1F6] transition-all group flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-[#FFFFFF] rounded-lg p-1.5 mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                    <img src={imgUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">{p.sku}</span>
                    <h4 className="text-xs font-bold text-[#121418] group-hover:text-[#353C45] transition-colors truncate">
                      {p.name}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* Interactive Quick Conversation / Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121418]/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#121418] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#F26B1D]" />
                  <span>Start Direct Inquiry &amp; Conversation</span>
                </h3>
                <p className="text-xs text-[#353C45]">
                  Connect directly with our Bangalore factory production team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] p-3 rounded-md text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInquiry} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">Organization Sector</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  >
                    <option value="corporate">Corporate / Company</option>
                    <option value="school">School / Academy</option>
                    <option value="college">College / University</option>
                    <option value="reseller">Reseller / Printing Press</option>
                    <option value="other">Other Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">Product Category</label>
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  >
                    <option value="custom_lanyards">Custom Satin Lanyards &amp; Ribbons</option>
                    <option value="student_pvc_cards">Student / Employee PVC ID Cards</option>
                    <option value="rfid_smart_cards">1K / 4K RFID &amp; Smart Cards</option>
                    <option value="id_card_machinery">ID Card &amp; Fusing Machinery</option>
                    <option value="lanyard_raw_materials">Lanyard Hooks, Clips &amp; Raw Materials</option>
                    <option value="custom_printing">Custom Printing / Packaging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="E.g. St. Joseph Academy or Infosys"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">Estimated Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="500"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 97418 08034"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#121418] mb-1 text-xs">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md px-3 py-2 text-xs text-[#121418] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#121418] mb-1 text-xs">
                  Requirements &amp; Initial Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Tell us what size, width (16mm/20mm), fittings (dog hook/quick release), or specifications you need..."
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-md p-2.5 text-xs text-[#121418] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#121418] mb-1 text-xs">
                  Attach Artwork / Specifications (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachment(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EDF1F6] file:text-[#121418] hover:file:bg-slate-200 cursor-pointer"
                  />
                  {attachment && (
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE6EE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <span>Starting conversation...</span> : <span>Submit &amp; Open Conversation</span>}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
