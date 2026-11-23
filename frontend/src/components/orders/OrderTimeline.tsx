"use client";

import { useState } from "react";
import { Check, Copy, Truck } from "lucide-react";
import type { OrderEvent, OrderStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/formatters";

const FLOW: { status: OrderStatus; label: string }[] = [
  { status: "submitted", label: "Request received" },
  { status: "reviewing", label: "Under review" },
  { status: "quoted", label: "Quote ready" },
  { status: "paid", label: "Payment received" },
  { status: "proofing", label: "Artwork proofing" },
  { status: "in_production", label: "In production" },
  { status: "dispatched", label: "Dispatched" },
  { status: "completed", label: "Delivered" },
];

const END_LABEL: Partial<Record<OrderStatus, string>> = { cancelled: "Cancelled", returned: "Returned" };

function CopyAwb({ awb }: { awb: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false); // clipboard blocked: the number stays selectable on screen
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md border border-[#DFE6EE] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#121418] hover:bg-slate-50 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-[#121418]"
      aria-label={`Copy tracking number ${awb}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Vertical, Amazon-style tracker: finished steps, the current one, then what is still to come. */
export default function OrderTimeline({ status, events }: { status: OrderStatus; events: OrderEvent[] }) {
  const ended = status === "cancelled" || status === "returned";
  const currentIndex = FLOW.findIndex((step) => step.status === status);
  const steps = ended ? [...FLOW.filter((s) => events.some((e) => e.status === s.status)), { status, label: END_LABEL[status] ?? status }] : FLOW;
  // A delivered order has no "next" step, so every step shows as done.
  const activeIndex = ended ? steps.length - 1 : status === "completed" ? FLOW.length : currentIndex;

  return (
    <ol className="animate-in fade-in duration-300" aria-label="Order progress">
      {steps.map((step, index) => {
        const state = index < activeIndex ? "done" : index === activeIndex ? "current" : "upcoming";
        const stepEvents = events.filter((e) => e.status === step.status);
        return (
          <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
            {index < steps.length - 1 && (
              <span aria-hidden className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${state === "done" ? "bg-emerald-500" : "bg-[#DFE6EE]"}`} />
            )}
            <span
              aria-hidden
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                state === "done"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : state === "current"
                    ? ended && status !== "returned"
                      ? "border-rose-500 bg-white"
                      : "border-[#F26B1D] bg-white"
                    : "border-[#DFE6EE] bg-white"
              }`}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : state === "current" ? <span className={`h-2 w-2 rounded-full ${ended ? "bg-rose-500" : "bg-[#F26B1D]"}`} /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${state === "upcoming" ? "text-slate-400" : "text-[#121418]"}`}>
                {step.label}
                <span className="sr-only"> ({state === "done" ? "done" : state === "current" ? "current step" : "upcoming"})</span>
              </p>
              {stepEvents.map((event) => (
                <div key={event.id} className="mt-1 space-y-1 text-xs">
                  <p className="text-slate-400">{formatDateTime(event.created_at)}</p>
                  {event.note && <p className="text-slate-600 leading-relaxed">{event.note}</p>}
                  {(event.courier || event.awb) && (
                    <p className="flex flex-wrap items-center gap-2 rounded-md bg-[#E8F8F5] border border-[#A3E4D7] px-2.5 py-1.5 text-emerald-800">
                      <Truck className="h-3.5 w-3.5" aria-hidden />
                      <span className="font-bold">{event.courier || "Courier"}</span>
                      {event.awb && (
                        <>
                          <span className="font-mono font-semibold">{event.awb}</span>
                          <CopyAwb awb={event.awb} />
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
