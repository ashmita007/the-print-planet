"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, CreditCard, KeyRound, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  ownerGetPaymentSettings,
  ownerSavePaymentSettings,
  ownerTestPaymentKeys,
  ownerGetPayments,
  PaymentGatewaySummary,
  OwnerPaymentRow,
} from "@/lib/api";

const INPUT =
  "w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#121418] transition-colors";

const STATUS_LABEL: Record<OwnerPaymentRow["status"], { text: string; cls: string }> = {
  paid: { text: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  needs_review: { text: "Needs review", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  not_paid: { text: "Not paid", cls: "bg-slate-50 text-slate-600 border-slate-200" },
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
}

export default function OwnerPaymentsPage() {
  const [summary, setSummary] = useState<PaymentGatewaySummary | null>(null);
  const [loadError, setLoadError] = useState("");
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "test" | "off" | "clear">("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [payments, setPayments] = useState<OwnerPaymentRow[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ownerGetPaymentSettings().then((s) => {
      if (!s) return setLoadError("Could not load payment settings. Please log in again.");
      setSummary(s);
      setKeyId(s.key_id);
    });
    ownerGetPayments().then((p) => p && setPayments(p.results));
  }, []);

  const apply = (s: PaymentGatewaySummary, text: string) => {
    setSummary(s);
    setKeyId(s.key_id);
    setKeySecret("");
    setWebhookSecret("");
    setNotice({ ok: true, text });
  };

  const save = async (enabled: boolean) => {
    setBusy(enabled ? "save" : "off");
    setNotice(null);
    const res = await ownerSavePaymentSettings({
      key_id: keyId.trim(),
      key_secret: keySecret.trim() || undefined,
      webhook_secret: webhookSecret.trim() || undefined,
      enabled,
    });
    setBusy("");
    if (res.settings) apply(res.settings, enabled ? "Saved. Customers can now pay quotes online." : "Saved. Online payment is off.");
    else setNotice({ ok: false, text: res.error || "Could not save." });
  };

  const test = async () => {
    setBusy("test");
    setNotice(null);
    const res = await ownerTestPaymentKeys({ key_id: keyId.trim(), key_secret: keySecret.trim() || undefined });
    setBusy("");
    setNotice(res.ok
      ? { ok: true, text: `Razorpay accepted these ${res.mode} keys. Click Save and turn on to use them.` }
      : { ok: false, text: res.error || "Razorpay did not accept these keys." });
  };

  const clearKeys = async () => {
    if (!window.confirm("Remove the saved Razorpay keys and turn online payment off?")) return;
    setBusy("clear");
    const res = await ownerSavePaymentSettings({ clear_secrets: true });
    setBusy("");
    if (res.settings) apply(res.settings, "Keys removed. Online payment is off.");
    else setNotice({ ok: false, text: res.error || "Could not remove the keys." });
  };

  const copyWebhook = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.webhook_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;
  if (!summary) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-label="Loading" />;

  const live = summary.active_source !== "none";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">Razorpay</span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121418] mt-1">Online payments</h1>
        <p className="text-sm text-slate-600 mt-1">
          Customers pay a quoted bulk order from their order page by UPI, card, net banking or wallet.
          The amount is always your quote.
        </p>
      </div>

      <div className={`surface-card rounded-lg p-4 flex items-start gap-3 border ${live ? "border-emerald-200" : "border-slate-200"}`}>
        {live ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden /> : <CreditCard className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />}
        <div className="text-sm">
          <p className="font-semibold text-[#121418]">
            {live ? `Online payment is ON (${summary.active_mode === "live" ? "live, real money" : "test mode"})` : "Online payment is OFF"}
          </p>
          <p className="text-slate-600">
            {summary.active_source === "admin" && "Using the keys saved below."}
            {summary.active_source === "environment" && "Using keys set on the server. Keys saved here would take over."}
            {summary.active_source === "none" && "The Pay button is hidden from customers until keys are saved and turned on."}
          </p>
        </div>
      </div>

      {!summary.can_store_secrets && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          The server has no private DJANGO_SECRET_KEY, so keys cannot be saved safely. Set it on the server first.
        </div>
      )}

      {live && !summary.webhook_ready && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          No webhook secret saved. Payments are still confirmed when the customer finishes checkout, but not if they close the page early. Add the webhook below.
        </div>
      )}

      {summary.secrets_unreadable && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          The saved Key Secret can no longer be read (the server key changed). Enter it again.
        </div>
      )}

      <section className="surface-card rounded-lg p-5 space-y-4">
        <h2 className="text-base font-bold text-[#121418] flex items-center gap-2"><KeyRound className="h-4 w-4" aria-hidden /> API keys</h2>
        <p className="text-xs text-slate-600">
          Razorpay Dashboard &rarr; Account &amp; Settings &rarr; API Keys. Use <strong>Test</strong> keys first, then <strong>Live</strong> keys after KYC.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-semibold text-slate-700 space-y-1">
            <span>Key ID</span>
            <input className={INPUT} value={keyId} onChange={(e) => setKeyId(e.target.value)} placeholder="rzp_test_..." autoComplete="off" spellCheck={false} />
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1">
            <span>Key Secret {summary.has_key_secret && <span className="font-normal text-slate-500">(saved, ends in {summary.key_secret_last4})</span>}</span>
            <input className={INPUT} type="password" value={keySecret} onChange={(e) => setKeySecret(e.target.value)}
              placeholder={summary.has_key_secret ? "Leave blank to keep the saved secret" : "Paste the Key Secret"} autoComplete="new-password" />
          </label>
        </div>

        <h2 className="text-base font-bold text-[#121418] flex items-center gap-2 pt-2"><ShieldCheck className="h-4 w-4" aria-hidden /> Webhook</h2>
        <p className="text-xs text-slate-600">
          Razorpay Dashboard &rarr; Account &amp; Settings &rarr; Webhooks &rarr; Add new webhook. This confirms payments even if the customer closes the page.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-700">Webhook URL</span>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded-lg bg-[#EDF1F6] border border-[#DFE6EE] px-3 py-2">{summary.webhook_url}</code>
              <button type="button" onClick={copyWebhook} className="rounded-lg border border-[#DFE6EE] px-2.5 hover:bg-slate-50" aria-label="Copy webhook URL">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-slate-500">Active events: {summary.webhook_events.join(", ")}</span>
          </div>
          <label className="font-semibold text-slate-700 space-y-1">
            <span>Webhook secret {summary.has_webhook_secret && <span className="font-normal text-slate-500">(saved)</span>}</span>
            <input className={INPUT} type="password" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={summary.has_webhook_secret ? "Leave blank to keep it" : "The secret you typed in Razorpay"} autoComplete="new-password" />
          </label>
        </div>

        {notice && (
          <p role={notice.ok ? "status" : "alert"} className={`text-sm ${notice.ok ? "text-emerald-700" : "text-red-600"}`}>{notice.text}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={test} disabled={!!busy}
            className="rounded-lg border border-[#121418] px-4 py-2 text-sm font-semibold disabled:opacity-60">
            {busy === "test" ? "Checking..." : "Test keys"}
          </button>
          <button type="button" onClick={() => save(true)} disabled={!!busy}
            className="rounded-lg bg-[#121418] text-white px-4 py-2 text-sm font-semibold hover:bg-[#2b3038] disabled:opacity-60">
            {busy === "save" ? "Saving..." : "Save and turn on"}
          </button>
          {summary.enabled && (
            <button type="button" onClick={() => save(false)} disabled={!!busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60">
              {busy === "off" ? "Saving..." : "Turn off"}
            </button>
          )}
          {summary.has_key_secret && (
            <button type="button" onClick={clearKeys} disabled={!!busy}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
              Remove keys
            </button>
          )}
        </div>
      </section>

      <section className="surface-card rounded-lg p-5">
        <h2 className="text-base font-bold text-[#121418] mb-3">Recent payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No online payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Amount</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Razorpay payment</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3">
                      <Link href={`/owner/orders?order=${encodeURIComponent(p.order_number)}`} className="font-semibold underline-offset-2 hover:underline">
                        {p.order_number}
                      </Link>
                      <span className="block text-slate-500">{p.organization_name}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full border px-2 py-0.5 font-semibold ${STATUS_LABEL[p.status].cls}`}>{STATUS_LABEL[p.status].text}</span>
                    </td>
                    <td className="py-2 pr-3 font-mono">{p.razorpay_payment_id || "—"}</td>
                    <td className="py-2">{formatDate(p.captured_at || p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-slate-500 mt-3">
          &quot;Needs review&quot; means money arrived for an older quote. Settle it with the customer and refund from the Razorpay dashboard if needed.
        </p>
      </section>
    </div>
  );
}
