"use client";

import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { getCommercePolicies, ownerGetCommerceSettings, ownerSaveCommerceSettings } from "@/lib/api";
import type { CommerceSettings } from "@/lib/types";

const INPUT = "w-full text-xs p-2 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md outline-none focus:bg-white focus:border-[#121418]";

const CANCEL_LIMITS = [
  { value: "quoted", label: "Until the quote is paid" },
  { value: "paid", label: "Until artwork proofing starts" },
  { value: "proofing", label: "Until production starts" },
  { value: "in_production", label: "Until production finishes (default)" },
  { value: "dispatched", label: "Until the order is dispatched" },
];

type Draft = {
  seller_gstin: string; seller_state: string; invoice_prefix: string; default_gst_rate: string;
  shipping_flat_fee: string; free_shipping_above: string; return_window_days: string; cancellation_allowed_until: string;
  return_policy_text: string; refund_policy_text: string; shipping_policy_text: string;
};

const toDraft = (s: CommerceSettings): Draft => ({
  seller_gstin: s.seller_gstin, seller_state: s.seller_state, invoice_prefix: s.invoice_prefix,
  default_gst_rate: s.default_gst_rate ?? "", shipping_flat_fee: s.shipping_flat_fee,
  free_shipping_above: s.free_shipping_above ?? "", return_window_days: s.return_window_days === null ? "" : String(s.return_window_days),
  cancellation_allowed_until: s.cancellation_allowed_until, return_policy_text: s.return_policy_text,
  refund_policy_text: s.refund_policy_text, shipping_policy_text: s.shipping_policy_text,
});

/** Blank number fields go back as null so the matching feature stays off. */
const toPayload = (d: Draft): Partial<CommerceSettings> => ({
  ...d,
  default_gst_rate: d.default_gst_rate.trim() || null,
  free_shipping_above: d.free_shipping_above.trim() || null,
  return_window_days: d.return_window_days.trim() === "" ? null : Number(d.return_window_days),
  shipping_flat_fee: d.shipping_flat_fee.trim() || "0",
});

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-bold text-[#121418]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function CommerceTab() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    ownerGetCommerceSettings().then((res) => (res.data ? setDraft(toDraft(res.data)) : setStatus({ ok: false, text: res.error ?? "Could not load." })));
    getCommercePolicies().then((p) => p && setStates(p.states));
  }, []);

  if (!draft) return <p className="text-xs text-slate-400" role="status">{status?.text ?? "Loading commerce settings…"}</p>;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const res = await ownerSaveCommerceSettings(toPayload(draft));
    setSaving(false);
    if (res.data) {
      setDraft(toDraft(res.data));
      setStatus({ ok: true, text: "Commerce settings saved." });
    } else setStatus({ ok: false, text: res.error ?? "Could not save." });
  };

  return (
    <form onSubmit={save} className="surface-card space-y-6 rounded-lg p-6 text-xs">
      <div>
        <h2 className="flex items-center gap-1.5 border-b border-[#DFE6EE] pb-2 text-sm font-semibold text-[#121418]">
          <Receipt className="h-4 w-4 text-[#353C45]" aria-hidden /> Tax, shipping and policies
        </h2>
        <p className="mt-2 text-slate-500">Leave a field empty to keep that feature off. Quotes need a GST rate and seller state; invoices also need a prefix and GSTIN.</p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-bold text-[#121418]">Tax and invoices</legend>
        <Field id="cs-gstin" label="Seller GSTIN">
          <input id="cs-gstin" className={`${INPUT} font-mono uppercase`} maxLength={15} value={draft.seller_gstin} onChange={(e) => set("seller_gstin", e.target.value.toUpperCase())} />
        </Field>
        <Field id="cs-state" label="Seller state" hint="Decides CGST + SGST (same state) or IGST (other states).">
          <select id="cs-state" className={INPUT} value={draft.seller_state} onChange={(e) => set("seller_state", e.target.value)}>
            <option value="">Not set</option>
            {states.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </Field>
        <Field id="cs-prefix" label="Invoice prefix" hint="For example TPP gives TPP/2026-27/0001.">
          <input id="cs-prefix" className={`${INPUT} uppercase`} maxLength={10} value={draft.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value.toUpperCase())} />
        </Field>
        <Field id="cs-gst" label="Default GST rate (%)">
          <input id="cs-gst" type="number" min="0" max="100" step="0.01" className={INPUT} value={draft.default_gst_rate} onChange={(e) => set("default_gst_rate", e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-bold text-[#121418]">Shipping</legend>
        <Field id="cs-ship" label="Flat shipping fee (₹)">
          <input id="cs-ship" type="number" min="0" step="0.01" className={INPUT} value={draft.shipping_flat_fee} onChange={(e) => set("shipping_flat_fee", e.target.value)} />
        </Field>
        <Field id="cs-free" label="Free shipping above (₹)" hint="Empty means shipping is never free.">
          <input id="cs-free" type="number" min="0" step="0.01" className={INPUT} value={draft.free_shipping_above} onChange={(e) => set("free_shipping_above", e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-bold text-[#121418]">Cancellations and returns</legend>
        <Field id="cs-cancel" label="Customers can cancel">
          <select id="cs-cancel" className={INPUT} value={draft.cancellation_allowed_until} onChange={(e) => set("cancellation_allowed_until", e.target.value)}>
            {CANCEL_LIMITS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field id="cs-return" label="Return window (days after delivery)" hint="Empty means returns are off.">
          <input id="cs-return" type="number" min="0" step="1" className={INPUT} value={draft.return_window_days} onChange={(e) => set("return_window_days", e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-bold text-[#121418]">Policy pages</legend>
        {([
          ["return_policy_text", "Return policy"],
          ["refund_policy_text", "Refund policy"],
          ["shipping_policy_text", "Shipping policy"],
        ] as const).map(([key, label]) => (
          <Field key={key} id={`cs-${key}`} label={label} hint="Empty shows “Contact us” on the public page.">
            <textarea id={`cs-${key}`} rows={4} className={INPUT} value={draft[key]} onChange={(e) => set(key, e.target.value)} />
          </Field>
        ))}
      </fieldset>

      <p role="status" aria-live="polite" className={`min-h-4 font-semibold ${status ? (status.ok ? "text-emerald-700" : "text-[#C0392B]") : ""}`}>{status?.text}</p>
      <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-md bg-[#121418] px-5 py-2 font-bold text-white hover:bg-[#2A2F37] disabled:opacity-50 active:scale-[0.98] transition">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        Save commerce settings
      </button>
    </form>
  );
}
