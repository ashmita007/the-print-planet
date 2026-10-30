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
import { clientGetBulkOrderDetail, clientPostBulkOrderMessage } from "@/lib/api";
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDetail = async () => {
    if (!orderNumber) return;
    const res = await clientGetBulkOrderDetail(orderNumber);
    if (res) {
      setOrder(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 10000); // Polling for messages
    return () => clearInterval(interval);
  }, [orderNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() && !attachment) return;

    setSending(true);
    const res = await clientPostBulkOrderMessage(orderNumber, newMsg.trim(), attachment || undefined);
    setSending(false);

    if (res.success) {
      setNewMsg("");
      setAttachment(null);
      fetchDetail();
    } else {
      alert(res.error || "Failed to post message.");
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
        <h2 className="text-xl font-bold text-[#17365D]">Order Not Found or Unauthorized</h2>
        <p className="text-xs text-slate-500">
          The requested bulk order inquiry could not be retrieved. Please check your credentials or return to your orders list.
        </p>
        <Link
          href="/orders"
          className="inline-block bg-[#17365D] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
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
      <div className="bg-white border border-[#DCE3EB] p-5 sm:p-6 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6EBF1] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg sm:text-xl text-[#17365D]">
                {order.order_number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5EE] text-[#E87832] border border-[#E87832]/30">
                {order.status_label || order.status}
              </span>
            </div>
            <p className="text-xs text-[#687586] mt-0.5">
              Initiated on {new Date(order.created_at).toLocaleDateString()} for{" "}
              <strong>{order.organization_name}</strong> ({order.organization_type_label})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {order.quoted_amount && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Formal Quote</span>
                <span className="text-lg font-black text-[#2ECC71]">
                  ₹{Number(order.quoted_amount).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {order.tracking_consignment_number && (
              <div className="bg-[#E8F8F5] border border-[#A3E4D7] p-2.5 rounded-xl text-xs">
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
            <strong className="text-[#17365D] font-bold text-sm">
              {order.estimated_quantity?.toLocaleString()} pcs
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Category</span>
            <strong className="text-[#17365D] capitalize">{order.category_type?.replace(/_/g, " ")}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Location</span>
            <strong className="text-[#17365D]">{order.city}, {order.state}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Contact Person</span>
            <strong className="text-[#17365D]">{order.contact_person} ({order.phone})</strong>
          </div>
        </div>
      </div>

      {/* Main Conversation System Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat & Conversation Backlog */}
        <div className="lg:col-span-8 bg-white border border-[#DCE3EB] rounded-2xl flex flex-col h-[650px] shadow-2xs overflow-hidden">
          {/* Conversation Header */}
          <div className="p-4 border-b border-[#E6EBF1] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-xs sm:text-sm text-[#17365D]">
                Direct Factory Conversation &amp; Proofing Thread
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Sunkadakatte, Bengaluru Desk
            </span>
          </div>

          {/* Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAFBFC]">
            {order.messages && order.messages.length > 0 ? (
              order.messages.map((m) => {
                const isClient = m.sender_type === "client";
                const isSystem = m.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center my-3">
                      <div className="inline-block bg-slate-200/70 border border-slate-300 text-slate-700 text-[11px] px-3.5 py-1.5 rounded-full max-w-lg leading-relaxed">
                        <Sparkles className="w-3 h-3 text-[#E87832] inline mr-1 -mt-0.5" />
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
                      className={`max-w-[85%] sm:max-w-lg rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isClient
                          ? "bg-[#17365D] text-white rounded-tr-none"
                          : "bg-white text-[#263445] border border-[#DCE3EB] rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.message}</div>
                      {m.attachment_url && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <a
                            href={m.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold underline text-[#FFA868]"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>View Attached File</span>
                          </a>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-[#E6EBF1] space-y-2">
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
              <label className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <Paperclip className="w-5 h-5 text-slate-400" />
                <input
                  type="file"
                  className="hidden"
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
                placeholder="Type your message, spec inquiry, or sample note..."
                className="flex-1 bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#263445] outline-none"
              />

              <button
                type="submit"
                disabled={sending || (!newMsg.trim() && !attachment)}
                className="bg-[#E87832] hover:bg-[#d66b28] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Order Requirements & Specs Card */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#DCE3EB] p-5 rounded-2xl space-y-4 shadow-2xs">
            <h4 className="font-bold text-sm text-[#17365D] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E87832]" />
              <span>Order Requirements</span>
            </h4>

            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 text-xs text-[#263445] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {order.requirements}
            </div>

            {order.attachment_url && (
              <a
                href={order.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#E87832]" />
                <span>Download Uploaded Artwork / Crest</span>
              </a>
            )}
          </div>

          <div className="bg-[#17365D] text-white p-5 rounded-2xl space-y-3">
            <div className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
              Need Instant Assistance?
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Our factory coordinator is on standby for immediate physical mockups, pantone yarn approvals, and emergency bulk dispatches.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <a
                href="tel:+919741808034"
                className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#E87832]" />
                <span>+91 97418 08034</span>
              </a>
              <a
                href="mailto:theprintplanet01@gmail.com"
                className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#E87832]" />
                <span>theprintplanet01@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
