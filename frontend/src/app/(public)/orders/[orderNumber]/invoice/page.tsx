"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { clientGetInvoice, getClientAuthHeaders } from "@/lib/api";
import { formatInr } from "@/lib/formatters";
import type { AddressSnapshot, InvoiceData } from "@/lib/types";
import QuoteBreakdown from "@/components/orders/QuoteBreakdown";

const addressLines = (a: AddressSnapshot) =>
  [a.full_name, a.line1, a.line2, [a.city, a.state, a.pincode].filter(Boolean).join(", "), a.phone && `Phone ${a.phone}`].filter(Boolean) as string[];

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = String(params?.orderNumber ?? "");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getClientAuthHeaders().Authorization) {
      router.replace(`/account/login?redirect=${encodeURIComponent(`/orders/${orderNumber}/invoice`)}`);
      return;
    }
    clientGetInvoice(orderNumber).then((res) => (res.error ? setError(res.error) : setInvoice(res.data ?? null)));
  }, [orderNumber, router]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <p role="alert" className="text-sm text-slate-600">{error}</p>
        <Link href={`/orders/${encodeURIComponent(orderNumber)}`} className="text-xs font-bold underline">Back to the order</Link>
      </div>
    );
  }
  if (!invoice) return <p className="px-4 py-16 text-center text-xs text-slate-400" aria-live="polite">Loading invoice…</p>;

  const s = invoice.snapshot;
  const billing = Object.keys(s.billing_address).length ? s.billing_address : { full_name: s.buyer.name, phone: s.buyer.phone };
  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-6 space-y-4">
      {/* Hides the site's own header, footer and nav; the invoice sheet uses plain divs so its number and GSTIN print. */}
      <style>{`@media print { header, footer, nav, .no-print { display: none !important; } body { background: #fff !important; } .invoice-sheet { border: 0 !important; box-shadow: none !important; padding: 0 !important; } }`}</style>
      <div className="no-print flex items-center justify-between">
        <Link href={`/orders/${encodeURIComponent(orderNumber)}`} className="text-xs font-bold underline">Back to the order</Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-[#121418] px-4 py-2 text-xs font-bold text-white hover:bg-[#2A2F37] active:scale-[0.98] transition">
          <Printer className="h-4 w-4" aria-hidden /> Print or save as PDF
        </button>
      </div>

      <article className="invoice-sheet rounded-lg border border-[#DFE6EE] bg-white p-6 sm:p-8 text-[#121418] space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold">Tax invoice</h1>
            <p className="font-mono font-bold text-sm mt-1">{invoice.number}</p>
            <p className="text-slate-500">Issued {new Date(invoice.issued_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            <p className="text-slate-500">Order {s.order_number}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold text-sm">{s.seller.name}</p>
            <p className="max-w-xs sm:ml-auto text-slate-600">{s.seller.address}</p>
            <p className="font-mono mt-1">GSTIN {s.seller.gstin}</p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-[10px] font-bold uppercase text-slate-400">Bill to</h2>
            <p className="font-bold">{s.buyer.name}</p>
            {addressLines(billing).map((line) => <p key={line} className="text-slate-600">{line}</p>)}
            {s.buyer.gstin && <p className="font-mono">GSTIN {s.buyer.gstin}</p>}
          </div>
          <div>
            <h2 className="text-[10px] font-bold uppercase text-slate-400">Ship to</h2>
            {Object.keys(s.shipping_address).length ? addressLines(s.shipping_address).map((line) => <p key={line} className="text-slate-600">{line}</p>) : <p className="text-slate-600">As billing address</p>}
          </div>
        </section>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#DFE6EE] text-[10px] uppercase text-slate-400">
              <th scope="col" className="py-2 font-bold">Item</th>
              <th scope="col" className="py-2 font-bold">HSN</th>
              <th scope="col" className="py-2 text-right font-bold">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {s.lines.map((line) => (
              <tr key={line.description} className="border-b border-[#EDF1F6]">
                <td className="py-2 font-semibold">{line.description}</td>
                <td className="py-2 font-mono">{line.hsn_code || "-"}</td>
                <td className="py-2 text-right tabular-nums">{line.quantity.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sm:ml-auto sm:max-w-xs">
          <QuoteBreakdown data={{ subtotal: s.subtotal, shipping: s.shipping, gst_rate: s.gst_rate, cgst: s.cgst, sgst: s.sgst, igst: s.igst, tax: s.tax, total: s.total }} />
        </div>

        <div className="border-t border-[#DFE6EE] pt-3 text-slate-500">
          Paid online {formatInr(s.total)} · Razorpay {s.payment.razorpay_payment_id}. This is a computer-generated invoice.
        </div>
      </article>
    </div>
  );
}
