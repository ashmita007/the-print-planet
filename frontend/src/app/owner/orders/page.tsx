"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Search,
  Filter,
  Download,
  RefreshCw,
  Send,
  MessageSquare,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  Paperclip,
  ExternalLink,
  ChevronRight,
  X,
  AlertCircle,
  IndianRupee,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  ownerGetBulkOrders,
  ownerGetBulkOrderDetail,
  ownerReplyBulkOrder,
  ownerDownloadConversationsBackup,
} from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "submitted", label: "Inquiry Submitted" },
  { value: "reviewing", label: "Technical Review" },
  { value: "quoted", label: "Quotation Ready" },
  { value: "proofing", label: "Artwork Proofing" },
  { value: "in_production", label: "In Production" },
  { value: "dispatched", label: "Dispatched / In Transit" },
  { value: "completed", label: "Delivered & Complete" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgTypeFilter, setOrgTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Active / selected order for conversation modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reply form states
  const [replyMessage, setReplyMessage] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [quotedAmount, setQuotedAmount] = useState<string>("");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await ownerGetBulkOrders({
      page,
      search,
      status: statusFilter,
      org_type: orgTypeFilter,
    });
    setOrders(res.results || []);
    setTotalCount(res.count || 0);
    setLoading(false);
  }, [page, search, statusFilter, orgTypeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = async (orderIdOrNumber: string | number) => {
    setDetailLoading(true);
    setReplyFeedback(null);
    const detail = await ownerGetBulkOrderDetail(orderIdOrNumber);
    if (detail) {
      setSelectedOrder(detail);
      setUpdateStatus(detail.status || "submitted");
      setQuotedAmount(detail.quoted_amount ? String(detail.quoted_amount) : "");
      setCourierPartner(detail.tracking_courier_partner || "");
      setTrackingNumber(detail.tracking_consignment_number || "");
      setReplyMessage("");
    }
    setDetailLoading(false);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!replyMessage.trim() && !quotedAmount && !updateStatus) {
      setReplyFeedback({ type: "error", text: "Please enter a message or update the order quotation/status." });
      return;
    }

    setReplySubmitting(true);
    setReplyFeedback(null);

    const res = await ownerReplyBulkOrder(selectedOrder.id, {
      message: replyMessage.trim() || `Order status updated to ${updateStatus}.`,
      status: updateStatus,
      quoted_amount: quotedAmount ? parseFloat(quotedAmount) : undefined,
      tracking_courier_partner: courierPartner.trim() || undefined,
      tracking_consignment_number: trackingNumber.trim() || undefined,
    });

    setReplySubmitting(false);

    if (res.success) {
      setReplyFeedback({ type: "success", text: "Reply posted & order updated successfully!" });
      setReplyMessage("");
      // Refresh selected order
      const refreshed = await ownerGetBulkOrderDetail(selectedOrder.id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      }
      // Refresh background orders list
      fetchOrders();
    } else {
      setReplyFeedback({ type: "error", text: res.error || "Failed to post reply." });
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    await ownerDownloadConversationsBackup();
    setBackupLoading(false);
  };

  const getStatusBadge = (status: string, label: string = status) => {
    switch (status) {
      case "submitted":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Submitted</span>;
      case "reviewing":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Reviewing</span>;
      case "quoted":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Quotation Ready</span>;
      case "proofing":
      case "in_production":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">In Production</span>;
      case "dispatched":
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Dispatched / Complete</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{label}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DCE3EB] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#17365D]/10 rounded-xl text-[#17365D]">
              <Briefcase className="w-5 h-5 text-[#17365D]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#17365D]">
              Bulk Orders &amp; Client Conversations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#687586] mt-1 max-w-2xl">
            Direct owner management for Corporate &amp; School volume RFQs. Chat with institutional buyers, issue quotes, and assign courier AWB tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE3EB] bg-white hover:bg-slate-50 text-[#17365D] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Download full Excel archive of all customer messages & bulk orders"
          >
            <Download className="w-4 h-4 text-[#E87832]" />
            <span>{backupLoading ? "Generating..." : "Download Conversations (.xlsx)"}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#17365D] hover:bg-[#102742] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE3EB] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order #, company, school, contact, phone, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl outline-none text-[#263445] transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-[#F8FAFC] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl outline-none text-[#263445]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Org Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={orgTypeFilter}
              onChange={(e) => {
                setOrgTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-[#F8FAFC] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl outline-none text-[#263445]"
            >
              <option value="all">All Sectors</option>
              <option value="corporate">Corporate &amp; Enterprise</option>
              <option value="school">Schools &amp; Universities</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table & List */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#E87832]" />
            <p className="text-xs">Loading institutional bulk orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-base text-[#17365D]">No bulk orders found</h3>
            <p className="text-xs text-slate-400">
              {search || statusFilter !== "all" || orgTypeFilter !== "all"
                ? "Try clearing your search query or filters."
                : "Institutional inquiries submitted by corporate or school clients will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#DCE3EB] text-[#687586] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Organization &amp; Sector</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Quantity &amp; Category</th>
                  <th className="py-3 px-4">Quoted (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Chats</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(o.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#17365D]">
                      {o.order_number}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#263445]">{o.organization_name}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        {o.organization_type === "school" ? (
                          <>
                            <GraduationCap className="w-3 h-3 text-[#17365D]" />
                            <span>School / Institution</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-[#E87832]" />
                            <span>Corporate Enterprise</span>
                          </>
                        )}
                        {o.city ? ` · ${o.city}` : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#263445] font-medium">{o.contact_person}</div>
                      <div className="text-[10px] text-slate-400">{o.phone || o.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#17365D]">
                        {Number(o.estimated_quantity).toLocaleString("en-IN")} units
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {o.category_type.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#263445]">
                      {o.quoted_amount ? (
                        <span className="text-emerald-700 font-bold">
                          ₹{Number(o.quoted_amount).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.status, o.status_label)}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <MessageSquare className="w-3 h-3 text-[#17365D]" />
                        <span>{o.messages_count ?? o.messages?.length ?? 0}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(o.id);
                        }}
                        className="inline-flex items-center gap-1 bg-[#17365D] hover:bg-[#102742] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>Open &amp; Reply</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Detail & Two-Way Conversation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DCE3EB] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-[#17365D] text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase bg-white/10 px-2.5 py-0.5 rounded-md text-[#FFA868]">
                    #{selectedOrder.order_number}
                  </span>
                  {getStatusBadge(selectedOrder.status, selectedOrder.status_label)}
                </div>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <span>{selectedOrder.organization_name}</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Order Specs & Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-4 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Client Contact</span>
                  <div className="font-bold text-[#17365D]">{selectedOrder.contact_person}</div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3 h-3 text-[#E87832]" />
                    <span>{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 truncate">
                    <Mail className="w-3 h-3 text-[#E87832]" />
                    <span className="truncate">{selectedOrder.email}</span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-4 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Order Specs</span>
                  <div className="font-bold text-[#17365D]">
                    {Number(selectedOrder.estimated_quantity).toLocaleString("en-IN")} units
                  </div>
                  <div className="text-slate-600 capitalize">
                    {selectedOrder.category_type.replace(/_/g, " ")}
                  </div>
                  {selectedOrder.city && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{selectedOrder.city}, {selectedOrder.state || "India"}</span>
                    </div>
                  )}
                  {selectedOrder.gst_number && (
                    <div className="text-[10px] font-mono text-slate-500">
                      GSTIN: {selectedOrder.gst_number}
                    </div>
                  )}
                </div>

                <div className="bg-[#F8FAFC] border border-[#DCE3EB] p-4 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Quotation &amp; Courier</span>
                  <div className="font-bold text-emerald-700 text-sm">
                    {selectedOrder.quoted_amount ? `₹${Number(selectedOrder.quoted_amount).toLocaleString("en-IN")}` : "No Quote Issued Yet"}
                  </div>
                  {selectedOrder.tracking_consignment_number ? (
                    <div className="text-slate-600">
                      <span className="font-bold">{selectedOrder.tracking_courier_partner || "Courier"}:</span>{" "}
                      <span className="font-mono">{selectedOrder.tracking_consignment_number}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No tracking consignment yet</div>
                  )}
                  {selectedOrder.attachment && (
                    <a
                      href={selectedOrder.attachment_url || selectedOrder.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#E87832] hover:underline font-bold pt-1"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>Download Attached Spec/File</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Requirements Note */}
              {selectedOrder.requirements && (
                <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wide">
                    Client Requirements / Notes:
                  </span>
                  <p className="text-[#263445] whitespace-pre-line leading-relaxed">
                    {selectedOrder.requirements}
                  </p>
                </div>
              )}

              {/* Explored/Checked Products */}
              {selectedOrder.checked_products && selectedOrder.checked_products.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E87832]" />
                    <span>Products Explored By User Prior to Bulk Inquiry:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.checked_products.map((p: any) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-[#17365D] text-xs font-medium border border-slate-200"
                      >
                        <span>{p.name}</span>
                        {p.sku && <span className="text-[10px] text-slate-400 font-mono">({p.sku})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Messages Thread */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#17365D]" />
                  <span>Conversation History ({selectedOrder.messages?.length || 0} messages)</span>
                </h4>

                <div className="space-y-3 border border-[#DCE3EB] rounded-2xl p-4 bg-[#F8FAFC] max-h-72 overflow-y-auto">
                  {selectedOrder.messages?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No conversation messages yet.</p>
                  ) : (
                    selectedOrder.messages?.map((msg: any) => {
                      const isOwner = msg.sender_type === "owner";
                      const isSystem = msg.sender_type === "system";

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center my-2">
                            <span className="inline-block bg-slate-200 text-slate-600 text-[11px] px-3 py-1 rounded-full">
                              {msg.message}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOwner ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-[#17365D]">{msg.sender_name}</span>
                            <span>·</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                              isOwner
                                ? "bg-[#17365D] text-white rounded-tr-none shadow-2xs"
                                : "bg-white text-[#263445] border border-[#DCE3EB] rounded-tl-none shadow-2xs"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.message}</p>
                            {msg.attachment_url && (
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-[11px] font-bold mt-2 underline ${
                                  isOwner ? "text-[#FFA868]" : "text-[#E87832]"
                                }`}
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>View Attachment</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Owner Reply & Update Form */}
              <form onSubmit={handleSendReply} className="bg-white border border-[#DCE3EB] p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                  Post Owner Response &amp; Update Order Status
                </h4>

                {replyFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      replyFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {replyFeedback.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#17365D] mb-1">
                      Update Status:
                    </label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl outline-none"
                    >
                      {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17365D] mb-1">
                      Quoted Amount (₹ INR):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 45000"
                      value={quotedAmount}
                      onChange={(e) => setQuotedAmount(e.target.value)}
                      className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17365D] mb-1">
                      Courier Partner:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DTDC Express / Blue Dart"
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#17365D] mb-1">
                      Tracking / Consignment AWB Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. D12345678IN"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17365D] mb-1">
                    Response Message to Buyer:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter formal quote details, timeline specifications, or delivery confirmation to the customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full text-xs p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl outline-none focus:border-[#17365D] focus:bg-white transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#DCE3EB] text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={replySubmitting}
                    className="px-5 py-2 rounded-xl bg-[#E87832] hover:bg-[#d66b28] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{replySubmitting ? "Sending..." : "Post Reply & Update Order"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
