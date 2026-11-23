"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ownerGetCustomer } from "@/lib/api";
import { formatDateTime, formatInr } from "@/lib/formatters";
import type { OwnerCustomerDetail, OwnerCustomerOrder } from "@/lib/types";
import OwnerPageHeader from "@/components/owner/OwnerPageHeader";

type Entry = { key: string; at: string; who: string; text: string; internal: boolean; kind: "message" | "event" };

/** Messages and timeline events of one order, oldest first. */
function conversation(order: OwnerCustomerOrder): Entry[] {
  const messages: Entry[] = order.messages.map((m) => ({
    key: `m${m.id}`, at: m.created_at, who: m.sender_name || m.sender_type, text: m.message, internal: false, kind: "message",
  }));
  const events: Entry[] = order.timeline.map((e) => ({
    key: `e${e.id}`,
    at: e.created_at,
    who: e.actor,
    text: [e.status_label, e.note, e.awb && `AWB ${e.awb}`].filter(Boolean).join(" · "),
    internal: e.internal,
    kind: "event",
  }));
  return [...messages, ...events].sort((a, b) => a.at.localeCompare(b.at));
}

export default function OwnerCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<OwnerCustomerDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const numeric = Number(id);
    if (!Number.isInteger(numeric)) {
      setError("Customer not found.");
      return;
    }
    ownerGetCustomer(numeric).then((res) => {
      if (cancelled) return;
      if (res) setData(res);
      else setError("Could not load this customer.");
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!data) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-label="Loading" />;

  const { profile } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/owner/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#121418]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All customers
      </Link>
      <OwnerPageHeader eyebrow="Customer" title={profile.name} />

      <section className="surface-card rounded-lg p-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <p><span className="text-slate-500">Email </span>{profile.email}</p>
        <p><span className="text-slate-500">Phone </span>{profile.phone || "—"}</p>
        <p><span className="text-slate-500">Company </span>{profile.company || "—"}</p>
        <p><span className="text-slate-500">Joined </span>{formatDateTime(profile.joined_at)}</p>
        <p><span className="text-slate-500">Orders </span>{profile.orders_count}</p>
        <p><span className="text-slate-500">Paid in total </span>{formatInr(profile.paid_total)}</p>
        {data.addresses.length > 0 && (
          <div className="sm:col-span-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Addresses</span>
            {data.addresses.map((a) => (
              <p key={a.id}>
                {a.label && <strong>{a.label}: </strong>}
                {[a.full_name, a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                {a.gstin && ` · GSTIN ${a.gstin}`}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card rounded-lg p-5 space-y-3">
        <h2 className="text-base font-bold text-[#121418]">Orders ({data.orders.length})</h2>
        {data.orders.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
        {data.orders.map((o) => {
          const entries = conversation(o);
          return (
            <details key={o.id} className="rounded-md border border-[#DFE6EE]">
              <summary className="cursor-pointer list-none p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <Link href={`/owner/orders?order=${encodeURIComponent(o.order_number)}`} className="font-mono font-bold underline-offset-2 hover:underline">
                  {o.order_number}
                </Link>
                <span className="rounded-full border border-[#DFE6EE] bg-[#EDF1F6] px-2 py-0.5 font-semibold">{o.status_label}</span>
                <span className="tabular-nums">Total {o.total !== null ? formatInr(o.total) : "pending"}</span>
                <span className="tabular-nums">Paid {o.paid !== null ? formatInr(o.paid) : "—"}</span>
                <span className="text-slate-500 ml-auto">{formatDateTime(o.created_at)}</span>
              </summary>
              <ol className="border-t border-[#DFE6EE] p-3 space-y-2 text-xs">
                {entries.length === 0 && <li className="text-slate-500">Nothing recorded for this order.</li>}
                {entries.map((e) => (
                  <li key={e.key} className={`rounded-md p-2 ${e.kind === "message" ? "bg-[#EDF1F6]" : "bg-white border border-dashed border-slate-200"}`}>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                      <span className="font-semibold uppercase">{e.kind === "message" ? `Message · ${e.who}` : `Timeline · ${e.who}`}</span>
                      {e.internal && <span className="rounded bg-amber-100 text-amber-800 px-1.5 font-semibold">Internal</span>}
                      <span>{formatDateTime(e.at)}</span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-[#121418]">{e.text}</p>
                  </li>
                ))}
              </ol>
            </details>
          );
        })}
      </section>

      <section className="surface-card rounded-lg p-5 space-y-3">
        <h2 className="text-base font-bold text-[#121418]">Enquiries ({data.enquiries.length})</h2>
        {data.enquiries.length === 0 && <p className="text-sm text-slate-500">No enquiries from this email.</p>}
        {data.enquiries.map((e) => (
          <div key={e.id} className="rounded-md border border-[#DFE6EE] p-3 text-xs space-y-1">
            <div className="flex flex-wrap gap-x-4 text-slate-500">
              <span className="font-semibold text-[#121418]">{e.product_name || "General enquiry"}</span>
              {e.requested_quantity !== null && <span>Qty {e.requested_quantity}</span>}
              <span className="capitalize">{e.status}</span>
              <span className="ml-auto">{formatDateTime(e.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap text-[#121418]">{e.message}</p>
          </div>
        ))}
      </section>

      {(data.payments.length > 0 || data.refunds.length > 0) && (
        <section className="surface-card rounded-lg p-5 space-y-2 text-xs">
          <h2 className="text-base font-bold text-[#121418]">Payments and refunds</h2>
          {data.payments.map((p) => (
            <p key={`${p.order_number}-${p.created_at}`} className="flex flex-wrap gap-x-4">
              <span className="font-mono font-semibold">{p.order_number}</span>
              <span className="tabular-nums">{formatInr(p.amount)}</span>
              <span>{p.captured_at ? `Captured ${formatDateTime(p.captured_at)}` : "Not paid"}</span>
              <span className="font-mono text-slate-500">{p.razorpay_payment_id}</span>
            </p>
          ))}
          {data.refunds.map((r) => (
            <p key={`${r.order_number}-${r.razorpay_refund_id}-${r.kind}`} className="flex flex-wrap gap-x-4">
              <span className="font-mono font-semibold">{r.order_number}</span>
              <span>Refund ({r.kind}, {r.status})</span>
              <span className="tabular-nums">{r.refund_amount !== null ? formatInr(r.refund_amount) : "—"}</span>
              <span className="font-mono text-slate-500">{r.razorpay_refund_id}</span>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
