"use client";

import { useEffect, useRef, useState } from "react";
import { clientCreateOrderRequest } from "@/lib/api";
import { formatDateTime, formatInr } from "@/lib/formatters";
import type { BulkOrder, CommercePolicies, OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["submitted", "reviewing", "quoted", "paid", "proofing", "in_production", "dispatched", "completed"];
const DAY_MS = 86_400_000;

/** Mirrors the server rules so the button only shows when the request can succeed; the server still decides. */
function allowedKinds(order: BulkOrder, policies: CommercePolicies | null): ("cancel" | "return")[] {
  if (!policies) return [];
  const kinds: ("cancel" | "return")[] = [];
  const limit = FLOW.includes(policies.cancellation_allowed_until as OrderStatus) ? policies.cancellation_allowed_until : "in_production";
  const index = FLOW.indexOf(order.status);
  if (index !== -1 && index < FLOW.indexOf(limit as OrderStatus)) kinds.push("cancel");
  if (order.status === "completed" && policies.return_window_days !== null) {
    const done = order.timeline?.filter((e) => e.status === "completed").map((e) => new Date(e.created_at).getTime()) ?? [];
    const since = done.length ? Math.min(...done) : new Date(order.updated_at).getTime();
    if (Date.now() <= since + policies.return_window_days * DAY_MS) kinds.push("return");
  }
  return kinds.filter((kind) => !order.requests?.some((r) => r.kind === kind && r.status === "pending"));
}

const WORDING = {
  cancel: { title: "Cancel this order", cta: "Request cancellation", hint: "Tell us why you want to cancel." },
  return: { title: "Return this order", cta: "Request a return", hint: "Tell us what is wrong with the delivery." },
} as const;

/** Past requests with their outcome, plus a dialog to raise a new cancel or return request. */
export default function OrderRequestPanel({ order, policies, onChanged }: {
  order: BulkOrder;
  policies: CommercePolicies | null;
  onChanged: () => void;
}) {
  const kinds = allowedKinds(order, policies);
  const [open, setOpen] = useState<"cancel" | "return" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requests = order.requests ?? [];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!open) return;
    setBusy(true);
    setError("");
    const res = await clientCreateOrderRequest(order.order_number, open, reason);
    setBusy(false);
    if (res.error) return setError(res.error);
    setOpen(null);
    setReason("");
    onChanged();
  };

  if (!kinds.length && !requests.length) return null;

  return (
    <div className="bg-white border border-[#DFE6EE] p-5 rounded-lg space-y-3 shadow-2xs">
      <h4 className="font-bold text-sm text-[#121418]">Cancel or return</h4>
      {requests.map((r) => (
        <div key={r.id} className="rounded-md bg-[#EDF1F6] p-3 text-xs space-y-0.5">
          <p className="font-bold text-[#121418] capitalize">
            {r.kind} request ·{" "}
            <span className={r.status === "approved" ? "text-emerald-700" : r.status === "declined" ? "text-rose-700" : "text-amber-700"}>{r.status}</span>
          </p>
          <p className="text-slate-500">Sent {formatDateTime(r.created_at)}</p>
          {r.status === "approved" && r.refund_amount && Number(r.refund_amount) > 0 && (
            <p className="text-emerald-700 font-semibold">Refund of {formatInr(r.refund_amount)} started to your original payment method.</p>
          )}
          {r.owner_note && <p className="text-slate-600">Note from us: {r.owner_note}</p>}
        </div>
      ))}
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => setOpen(kind)}
          className="w-full rounded-md border border-[#DFE6EE] bg-white px-3 py-2 text-xs font-bold text-[#121418] hover:bg-slate-50 active:scale-[0.98] transition focus-visible:outline-2 focus-visible:outline-[#121418]"
        >
          {WORDING[kind].cta}
        </button>
      ))}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        aria-labelledby="request-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-[#DFE6EE] p-0 backdrop:bg-black/50"
      >
        {open && (
          <form onSubmit={submit} className="p-5 space-y-3">
            <h3 id="request-title" className="text-base font-bold text-[#121418]">{WORDING[open].title}</h3>
            <label htmlFor="request-reason" className="block text-xs font-semibold text-[#121418]">{WORDING[open].hint}</label>
            <textarea
              id="request-reason"
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-[#DFE6EE] bg-[#EDF1F6] p-3 text-sm outline-none focus:bg-white focus:border-[#121418]"
            />
            <p role="alert" aria-live="polite" className="min-h-4 text-xs font-semibold text-[#C0392B]">{error}</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(null)} className="rounded-md border border-[#DFE6EE] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Keep order
              </button>
              <button type="submit" disabled={busy || !reason.trim()} className="rounded-md bg-[#F26B1D] px-4 py-2 text-xs font-bold text-[#121418] hover:bg-[#FF8A3D] disabled:opacity-40 active:scale-[0.98] transition">
                {busy ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
