"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ownerDecideRequest, ownerListRequests } from "@/lib/api";
import { formatDateTime, formatInr } from "@/lib/formatters";
import type { OrderRequest } from "@/lib/types";
import OwnerPageHeader from "@/components/owner/OwnerPageHeader";

const FILTERS = [
  { value: "pending", label: "Waiting" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
] as const;

const INPUT = "w-full text-xs p-2 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md outline-none focus:bg-white focus:border-[#121418]";

function RequestCard({ request, onDone }: { request: OrderRequest; onDone: (text: string) => void }) {
  const [refund, setRefund] = useState(request.paid_amount ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"" | "approve" | "decline">("");
  const [error, setError] = useState("");
  const paid = Number(request.paid_amount) > 0;

  const decide = async (decision: "approve" | "decline") => {
    setBusy(decision);
    setError("");
    const res = await ownerDecideRequest(request.id, {
      decision,
      owner_note: note.trim(),
      ...(decision === "approve" && paid ? { refund_amount: String(refund || "0") } : {}),
    });
    setBusy("");
    if (res.error) return setError(res.error);
    onDone(decision === "approve" ? "Request approved." : "Request declined.");
  };

  return (
    <li className="rounded-lg border border-[#DFE6EE] bg-white p-4 space-y-3 shadow-2xs">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-[#121418] capitalize">
          {request.kind} request ·{" "}
          <Link href={`/owner/orders?order=${encodeURIComponent(request.order_number)}`} className="font-mono underline">{request.order_number}</Link>
        </p>
        <span className="text-xs text-slate-500">{formatDateTime(request.created_at)}</span>
      </div>
      <p className="text-xs text-slate-600">{request.organization_name} · order is {request.order_status.replace(/_/g, " ")}{paid ? ` · paid ${formatInr(request.paid_amount)}` : " · not paid"}</p>
      <p className="rounded-md bg-[#EDF1F6] p-3 text-xs text-[#121418] whitespace-pre-wrap">{request.reason || "No reason given."}</p>

      {request.status === "pending" ? (
        <div className="space-y-2">
          {paid && (
            <div>
              <label htmlFor={`refund-${request.id}`} className="mb-1 block text-[11px] font-bold text-[#121418]">
                Refund amount (₹, up to {formatInr(request.paid_amount)}; 0 for no refund)
              </label>
              <input id={`refund-${request.id}`} type="number" min="0" step="0.01" className={INPUT} value={refund} onChange={(e) => setRefund(e.target.value)} />
            </div>
          )}
          <div>
            <label htmlFor={`note-${request.id}`} className="mb-1 block text-[11px] font-bold text-[#121418]">Note to the customer (optional)</label>
            <input id={`note-${request.id}`} className={INPUT} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <p role="alert" className="min-h-4 text-xs font-semibold text-[#C0392B]">{error}</p>
          <div className="flex gap-2">
            <button type="button" disabled={!!busy} onClick={() => decide("approve")} className="inline-flex items-center gap-1.5 rounded-md bg-[#121418] px-4 py-2 text-xs font-bold text-white hover:bg-[#2A2F37] disabled:opacity-50 active:scale-[0.98] transition">
              {busy === "approve" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {paid ? "Approve and refund" : "Approve"}
            </button>
            <button type="button" disabled={!!busy} onClick={() => decide("decline")} className="rounded-md border border-[#DFE6EE] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 active:scale-[0.98] transition">
              Decline
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs font-semibold text-slate-600">
          {request.status === "approved" ? "Approved" : "Declined"} {formatDateTime(request.decided_at)}
          {request.refund_amount && Number(request.refund_amount) > 0 ? ` · refunded ${formatInr(request.refund_amount)} (${request.razorpay_refund_id})` : ""}
          {request.owner_note ? ` · ${request.owner_note}` : ""}
        </p>
      )}
    </li>
  );
}

export default function OwnerRequestsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("pending");
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await ownerListRequests(filter);
    if (res.error) setStatus({ ok: false, text: res.error });
    else setRequests(res.data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <OwnerPageHeader eyebrow="Sales" title="Cancel and return requests">
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">Approve to cancel or return the order. Paid orders are refunded through Razorpay.</p>
      </OwnerPageHeader>

      <div className="flex gap-2" role="group" aria-label="Request status">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}
            className={`rounded-md border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${filter === f.value ? "border-[#121418] bg-[#121418] text-white" : "border-[#DFE6EE] bg-white text-[#121418] hover:bg-slate-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <p role="status" aria-live="polite" className={`min-h-4 text-xs font-semibold ${status ? (status.ok ? "text-emerald-700" : "text-[#C0392B]") : ""}`}>{status?.text}</p>

      {loading ? (
        <p className="text-xs text-slate-400">Loading requests…</p>
      ) : requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#B9C3CF] bg-white p-8 text-center text-sm text-slate-500">Nothing here.</p>
      ) : (
        <ul className="animate-in fade-in duration-300 grid gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} onDone={(text) => { setStatus({ ok: true, text }); load(); }} />
          ))}
        </ul>
      )}
    </div>
  );
}
