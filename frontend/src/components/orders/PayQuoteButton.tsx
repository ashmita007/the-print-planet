"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { clientStartQuotePayment, clientVerifyQuotePayment } from "@/lib/api";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: () => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

function loadCheckout(): Promise<RazorpayConstructor> {
  const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => {
      const loaded = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (loaded) resolve(loaded);
      else reject(new Error("Razorpay did not load"));
    };
    script.onerror = () => reject(new Error("Razorpay did not load"));
    document.body.appendChild(script);
  });
}

/** Pays the order's quote through Razorpay Checkout (UPI, cards, net banking, wallets). */
export default function PayQuoteButton({ orderNumber, amount, onPaid }: {
  orderNumber: string;
  amount: number;
  onPaid: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setBusy(true);
    setError("");
    const { checkout, error: startError } = await clientStartQuotePayment(orderNumber);
    if (!checkout) {
      setError(startError || "Could not start the payment.");
      setBusy(false);
      return;
    }
    let Razorpay: RazorpayConstructor;
    try {
      Razorpay = await loadCheckout();
    } catch {
      setError("The payment window could not load. Check your connection and try again.");
      setBusy(false);
      return;
    }
    const rzp = new Razorpay({
      key: checkout.key_id,
      order_id: checkout.razorpay_order_id,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      prefill: checkout.prefill,
      theme: { color: "#121418" },
      handler: async (result: RazorpayResult) => {
        const verified = await clientVerifyQuotePayment(orderNumber, result);
        if (!verified.paid) setError(verified.error || "Payment could not be verified.");
        setBusy(false);
        onPaid();
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", () => setError("The payment did not go through. You can try again."));
    rzp.open();
  };

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#121418] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2b3038] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CreditCard className="h-3.5 w-3.5" aria-hidden />}
        Pay ₹{amount.toLocaleString("en-IN")} online
      </button>
      {error && <p role="alert" className="mt-1 max-w-xs text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
