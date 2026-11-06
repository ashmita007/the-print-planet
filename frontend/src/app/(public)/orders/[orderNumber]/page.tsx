"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Send,
  Paperclip,
  Building2,
  GraduationCap,
  Download,
  Truck,
  FileText,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { clientGetBulkOrderDetail, clientPostBulkOrderMessage, getClientAuthHeaders } from "@/lib/api";
import AttachmentLink from "@/components/orders/AttachmentLink";
import { BulkOrder, BulkOrderMessage } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<BulkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const [sendError, setSendError] = useState("");

  const fetchDetail = async () => {
    if (!orderNumber) return;
    const res = await clientGetBulkOrderDetail(orderNumber);
    if (res === "unauthorized") {
      router.replace(`/account/login?redirect=${encodeURIComponent(`/orders/${orderNumber}`)}`);
      return;
    }
    if (res) setOrder(res);
    setLoading(false);
  };

  useEffect(() => {
    if (!getClientAuthHeaders().Authorization) {
      router.replace(`/account/login?redirect=${encodeURIComponent(`/orders/${orderNumber}`)}`);
      return;
    }
    fetchDetail();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchDetail();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // Polling replaces the array every 10s, so react to new messages only,
  // and scroll the chat box itself rather than the customer's page.
  const messageCount = order?.messages?.length ?? 0;
  useEffect(() => {
    const box = chatBoxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messageCount]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() && !attachment) return;

    setSending(true);
    const res = await clientPostBulkOrderMessage(orderNumber, newMsg.trim(), attachment || undefined);
    setSending(false);

    if (res.success) {
      setNewMsg("");
      setAttachment(null);
      setSendError("");
      fetchDetail();
    } else {
      setSendError(res.error || "Failed to post message.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Loading order #{orderNumber} and conversation thread...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#121418]">Order Not Found or Unauthorized</h2>
        <p className="text-xs text-slate-500">
          The requested bulk order inquiry could not be retrieved. Please check your credentials or return to your orders list.
        </p>
        <Link
          href="/orders"
          className="inline-block bg-[#121418] text-white px-5 py-2.5 rounded-md text-xs font-bold"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Orders", href: "/orders" },
          { label: order.order_number },
        ]}
      />

      {/* Top Order Summary Card */}
      <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-5 sm:p-6 rounded-lg shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE6EE] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-lg sm:text-xl text-[#121418]">
                {order.order_number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF1F6] text-[#353C45] border border-[#B9C3CF]/30">
                {order.status_label || order.status}
              </span>
            </div>
            <p className="text-xs text-[#353C45] mt-0.5">
              Initiated on {new Date(order.created_at).toLocaleDateString()} for{" "}
              <strong>{order.organization_name}</strong> ({order.organization_type_label})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {order.quoted_amount && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Formal Quote</span>
                <span className="text-lg font-extrabold text-[#2ECC71]">
                  ₹{Number(order.quoted_amount).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {order.tracking_consignment_number && (
              <div className="bg-[#E8F8F5] border border-[#A3E4D7] p-2.5 rounded-md text-xs">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> {order.tracking_courier_partner}
                </span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold block">
                  AWB: {order.tracking_consignment_number}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order specs overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Quantity</span>
            <strong className="text-[#121418] font-bold text-sm">
              {order.estimated_quantity?.toLocaleString()} pcs
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Category</span>
            <strong className="text-[#121418] capitalize">{order.category_type?.replace(/_/g, " ")}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Location</span>
            <strong className="text-[#121418]">{order.city}, {order.state}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Contact Person</span>
            <strong className="text-[#121418]">{order.contact_person} ({order.phone})</strong>
          </div>
        </div>
      </div>

      {/* Main Conversation System Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat & Conversation Backlog */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg flex flex-col h-[650px] shadow-2xs overflow-hidden">
          {/* Conversation Header */}
          <div className="p-4 border-b border-[#DFE6EE] bg-[#EDF1F6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-xs sm:text-sm text-[#121418]">
                Direct Factory Conversation &amp; Proofing Thread
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Sunkadakatte, Bengaluru Desk
            </span>
          </div>

          {/* Messages Scrollable Area */}
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#EDF1F6]">
            {order.messages && order.messages.length > 0 ? (
              order.messages.map((m) => {
                const isClient = m.sender_type === "client";
                const isSystem = m.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center my-3">
                      <div className="inline-block bg-slate-200/70 border border-slate-300 text-slate-700 text-[11px] px-3.5 py-1.5 rounded-full max-w-lg leading-relaxed">
                        <Sparkles className="w-3 h-3 text-[#353C45] inline mr-1 -mt-0.5" />
                        {m.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">{m.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-lg rounded-lg p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isClient
                          ? "bg-[#121418] text-white rounded-tr-none"
                          : "bg-[#FFFFFF] text-[#121418] border border-[#DFE6EE] rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.message}</div>
                      {m.attachment_url && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <AttachmentLink
                            url={m.attachment_url}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold underline text-[#FF8A3D]"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Download attached file</span>
                          </AttachmentLink>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                No messages yet. Send a note to the technical team below.
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#DFE6EE] space-y-2">
            {sendError && (
              <p role="alert" className="text-xs font-semibold text-[#C0392B] bg-[#FDEDEC] px-3 py-2 rounded-md">
                {sendError}
              </p>
            )}
            {attachment && (
              <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-between">
                <span className="truncate max-w-xs text-slate-700">Attached: {attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-rose-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="cursor-pointer p-2.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors focus-within:ring-2 focus-within:ring-[#121418]">
                <Paperclip className="w-5 h-5 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Attach a file</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.zip,.rar,.ai,.eps,.cdr"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                aria-label="Message to our team"
                placeholder="Type your message, spec inquiry, or sample note..."
                className="flex-1 bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-md px-4 py-2.5 text-xs sm:text-sm text-[#121418] outline-none"
              />

              <button
                type="submit"
                disabled={sending || (!newMsg.trim() && !attachment)}
                className="bg-[#F26B1D] hover:bg-[#FF8A3D] disabled:opacity-40 text-[#121418] px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
                <span className="sr-only sm:hidden">Send message</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Order Requirements & Specs Card */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#FFFFFF] border border-[#DFE6EE] p-5 rounded-lg space-y-4 shadow-2xs">
            <h4 className="font-bold text-sm text-[#121418] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#353C45]" />
              <span>Order Requirements</span>
            </h4>

            <div className="bg-[#EDF1F6] p-3.5 rounded-md border border-slate-200 text-xs text-[#121418] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {order.requirements}
            </div>

            {order.attachment_url && (
              <AttachmentLink
                url={order.attachment_url}
                className="w-full bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] py-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#353C45]" />
                <span>Download Uploaded Artwork / Crest</span>
              </AttachmentLink>
            )}
          </div>

          <div className="bg-[#121418] text-white p-5 rounded-lg space-y-3">
            <div className="text-[11px] font-bold text-[#353C45] uppercase tracking-wider">
              Need Instant Assistance?
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Our factory coordinator is on standby for immediate physical mockups, pantone yarn approvals, and emergency bulk dispatches.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <a
                href="tel:+919741808034"
                className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#353C45]" />
                <span>+91 97418 08034</span>
              </a>
              <a
                href="mailto:theprintplanet01@gmail.com"
                className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#353C45]" />
                <span>theprintplanet01@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
