"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ownerAdvanceOrder, ownerIssueInvoice, ownerPreviewQuote, ownerSaveQuote } from "@/lib/api";
import { formatInr } from "@/lib/formatters";
import type { BulkOrder, OrderStatus, QuotePreview } from "@/lib/types";
import OrderTimeline from "@/components/orders/OrderTimeline";
import QuoteBreakdown from "@/components/orders/QuoteBreakdown";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: "Inquiry submitted",
  reviewing: "Under review",
  quoted: "Quotation ready",
  paid: "Paid",
  proofing: "Artwork proofing",
  in_production: "In production",
  dispatched: "Dispatched",
  completed: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const INPUT = "w-full text-xs p-2 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md outline-none focus:bg-white focus:border-[#121418]";

/** Timeline, next-status buttons and quote builder for one order. The server decides every number and transition. */
export default function OrderDesk({ order, onChanged }: { order: BulkOrder; onChanged: (order: BulkOrder) => void }) {
  const [subtotal, setSubtotal] = useState(order.quote_subtotal ?? "");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [preview, setPreview] = useState<QuotePreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [courier, setCourier] = useState(order.tracking_courier_partner ?? "");
  const [awb, setAwb] = useState(order.tracking_consignment_number ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const next = order.allowed_next ?? [];
  const canQuote = !order.is_paid ? ["submitted", "reviewing", "quoted"].includes(order.status) : !order.quote_subtotal;
  const needsCourier = pending === "dispatched";

  // Live preview: wait for typing to pause, then ask the server (it owns shipping and GST rules).
  useEffect(() => {
    const value = subtotal.trim();
    if (!canQuote || !value || !(Number(value) > 0)) {
      setPreview(null);
      setPreviewError("");
      return;
    }
    let alive = true;
    const timer = setTimeout(async () => {
      const res = await ownerPreviewQuote(order.id, value);
      if (!alive) return;
      setPreview(res.data ?? null);
      setPreviewError(res.error ?? "");
    }, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [subtotal, canQuote, order.id]);

  const stored = useMemo(
    () => (order.quote_subtotal && order.quoted_amount
      ? { subtotal: order.quote_subtotal, shipping: order.quote_shipping, gst_rate: order.quote_gst_rate, cgst: order.quote_cgst, sgst: order.quote_sgst, igst: order.quote_igst, tax: order.quote_tax, total: order.quoted_amount }
      : null),
    [order],
  );

  const run = async (label: string, action: () => Promise<{ data?: BulkOrder; error?: string }>, done: string) => {
    setBusy(label);
    setMessage(null);
    const res = await action();
    setBusy("");
    if (res.error || !res.data) return setMessage({ ok: false, text: res.error ?? "Something went wrong." });
    setMessage({ ok: true, text: done });
    onChanged(res.data);
  };

  const advance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    run("advance", () => ownerAdvanceOrder(order.id, {
      status: pending, note: note.trim(),
      ...(pending === "dispatched" ? { courier: courier.trim(), awb: awb.trim() } : {}),
    }),
      `Order moved to ${STATUS_LABEL[pending]}.`).then(() => {
      setPending(null);
      setNote("");
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-labelledby="desk-progress" className="rounded-lg border border-[#DFE6EE] bg-white p-4 space-y-3">
        <h4 id="desk-progress" className="text-xs font-bold uppercase tracking-wider text-[#121418]">Timeline</h4>
        <OrderTimeline status={order.status} events={(order.timeline ?? []).filter((e) => !e.internal)} />
        {(order.timeline ?? []).some((e) => e.internal) && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs space-y-1">
            <p className="font-bold text-amber-800">Owner notes (not shown to the customer)</p>
            {(order.timeline ?? []).filter((e) => e.internal).map((e) => <p key={e.id} className="text-amber-900">{e.note}</p>)}
          </div>
        )}
      </section>

      <div className="space-y-4">
        <section aria-labelledby="desk-status" className="rounded-lg border border-[#DFE6EE] bg-white p-4 space-y-3">
          <h4 id="desk-status" className="text-xs font-bold uppercase tracking-wider text-[#121418]">Move order forward</h4>
          {next.length === 0 ? (
            <p className="text-xs text-slate-500">No further steps. This order is {STATUS_LABEL[order.status].toLowerCase()}.</p>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Next status">
              {next.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={pending === status}
                  onClick={() => setPending(pending === status ? null : status)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    pending === status ? "border-[#121418] bg-[#121418] text-white" : status === "cancelled" ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-[#DFE6EE] text-[#121418] hover:bg-slate-50"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          )}
          {pending && (
            <form onSubmit={advance} className="space-y-2">
              {needsCourier && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label htmlFor="desk-courier" className="mb-1 block text-[11px] font-bold text-[#121418]">Courier partner</label>
                    <input id="desk-courier" className={INPUT} placeholder="DTDC, Blue Dart…" value={courier} onChange={(e) => setCourier(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="desk-awb" className="mb-1 block text-[11px] font-bold text-[#121418]">Tracking number (AWB)</label>
                    <input id="desk-awb" className={`${INPUT} font-mono`} value={awb} onChange={(e) => setAwb(e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="desk-note" className="mb-1 block text-[11px] font-bold text-[#121418]">Note for the customer (optional)</label>
                <input id="desk-note" className={INPUT} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button type="submit" disabled={busy === "advance"} className="inline-flex items-center gap-1.5 rounded-md bg-[#121418] px-4 py-2 text-xs font-bold text-white hover:bg-[#2A2F37] disabled:opacity-50 active:scale-[0.98] transition">
                {busy === "advance" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                Confirm: {STATUS_LABEL[pending]}
              </button>
            </form>
          )}
        </section>

        <section aria-labelledby="desk-quote" className="rounded-lg border border-[#DFE6EE] bg-white p-4 space-y-3">
          <h4 id="desk-quote" className="text-xs font-bold uppercase tracking-wider text-[#121418]">Quote builder</h4>
          {order.quoted_amount && !order.quote_subtotal && (
            <p className="rounded-md bg-[#EDF1F6] p-2.5 text-xs text-slate-700">Existing total {formatInr(order.quoted_amount)} (no breakdown).</p>
          )}
          {canQuote ? (
            <>
              <div>
                <label htmlFor="desk-subtotal" className="mb-1 block text-[11px] font-bold text-[#121418]">Goods subtotal (₹, before shipping and GST)</label>
                <input id="desk-subtotal" type="number" min="0" step="0.01" inputMode="decimal" className={INPUT} value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
              </div>
              <div aria-live="polite" className="min-h-16">
                {previewError ? (
                  <p role="alert" className="text-xs font-semibold text-[#C0392B]">{previewError}</p>
                ) : preview ? (
                  <QuoteBreakdown data={preview} />
                ) : (
                  <p className="text-xs text-slate-400">Enter a subtotal to see shipping, GST and the total.</p>
                )}
              </div>
              {!order.is_paid && (
                <div>
                  <label htmlFor="desk-quote-notes" className="mb-1 block text-[11px] font-bold text-[#121418]">Notes on the quote (optional)</label>
                  <input id="desk-quote-notes" className={INPUT} value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)} />
                </div>
              )}
              <button
                type="button"
                disabled={!preview || busy === "quote"}
                onClick={() => run("quote", () => ownerSaveQuote(order.id, subtotal.trim(), quoteNotes.trim()), `Quote saved: ${formatInr(preview?.total)}.`)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#F26B1D] px-4 py-2 text-xs font-bold text-[#121418] hover:bg-[#FF8A3D] disabled:opacity-40 active:scale-[0.98] transition"
              >
                {busy === "quote" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                {order.is_paid ? "Add tax breakdown" : "Save and send quote"}
              </button>
            </>
          ) : stored ? (
            <QuoteBreakdown data={stored} />
          ) : (
            <p className="text-xs text-slate-500">This order can no longer be quoted.</p>
          )}
          {order.is_paid && !order.invoice && order.quote_subtotal && (
            <button
              type="button"
              disabled={busy === "invoice"}
              onClick={() => run("invoice", () => ownerIssueInvoice(order.id), "Invoice issued.")}
              className="rounded-md border border-[#DFE6EE] px-4 py-2 text-xs font-bold text-[#121418] hover:bg-slate-50 disabled:opacity-50 active:scale-[0.98] transition"
            >
              Issue invoice
            </button>
          )}
          {order.invoice && <p className="text-xs font-semibold text-emerald-700">Invoice {order.invoice.number} issued.</p>}
        </section>

        <p role="status" aria-live="polite" className={`min-h-4 text-xs font-semibold ${message ? (message.ok ? "text-emerald-700" : "text-[#C0392B]") : ""}`}>
          {message?.text}
        </p>
      </div>
    </div>
  );
}
