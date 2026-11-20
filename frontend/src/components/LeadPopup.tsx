"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, CheckCircle } from "lucide-react";
import { submitEnquiry } from "@/lib/api";
import { trackLead } from "@/components/LeadTracker";

/**
 * Quick callback form: after a visitor has spent DELAY_MS on a page it asks for
 * a name and mobile number. The owner wants it mandatory: it cannot be closed
 * and appears on every page until the visitor sends it once.
 */
const DELAY_MS = 12_000;
const DONE_KEY = "tpp_callback_done";
// Pages that already are a contact form, or where a popup would get in the way.
const SKIP = [/^\/quote/, /^\/contact/, /^\/enquiry/, /^\/login/, /^\/register/, /^\/account/, /^\/cart/, /^\/checkout/, /^\/privacy-policy/, /^\/terms/];

const MOBILE_RE = /^[6-9]\d{9}$/;

function storage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export default function LeadPopup() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // A new timer on every page; it only opens if the visitor stays on that page.
  useEffect(() => {
    if (SKIP.some((re) => re.test(pathname))) return;
    if (storage("local")?.getItem(DONE_KEY)) return;
    const timer = window.setTimeout(() => {
      setError("");
      setOpen(true);
    }, DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      setOpen(false);
    };
  }, [pathname]);

  // Focus the form and stop the page behind it from scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!MOBILE_RE.test(digits)) return setError("Please enter a valid 10-digit mobile number.");
    setSending(true);
    setError("");
    const page = document.title.split("|")[0].trim();
    const res = await submitEnquiry({
      full_name: name.trim().slice(0, 255),
      email: "",
      phone: `+91 ${digits}`,
      message: `Callback request from the website popup while viewing: ${page}`,
      product_name_text: page.slice(0, 255),
      source_page: `${pathname} (popup)`.slice(0, 255),
    });
    setSending(false);
    if (!res.success) return setError(res.error || "Could not send. Please try again or WhatsApp us.");
    storage("local")?.setItem(DONE_KEY, String(Date.now()));
    trackLead("form", { form: "popup" });
    setSent(true);
    window.setTimeout(() => setOpen(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-[#0E2238]/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="callback-title"
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#DFE6EE] p-5 pb-6"
      >
        {sent ? (
          <div className="text-center py-6 space-y-2" role="status">
            <CheckCircle className="w-10 h-10 mx-auto text-[#217A4B]" />
            <p className="font-bold text-[#121418]">Thank you, {name.trim().split(" ")[0]}!</p>
            <p className="text-sm text-[#353C45]">Our team will call or WhatsApp you shortly with prices.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            <div>
              <h2 id="callback-title" className="text-lg font-extrabold text-[#121418] leading-snug">
                Get wholesale prices on WhatsApp
              </h2>
              <p className="text-sm text-[#353C45] mt-1">
                Leave your name and mobile number. We will send current rates and stock for what you are viewing.
              </p>
            </div>
            <div>
              <label htmlFor="cb-name" className="block text-xs font-semibold text-[#121418] mb-1">Name</label>
              <input
                id="cb-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                required
                className="w-full rounded-lg border border-[#DFE6EE] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B1D]"
              />
            </div>
            <div>
              <label htmlFor="cb-mobile" className="block text-xs font-semibold text-[#121418] mb-1">Mobile number</label>
              <div className="flex rounded-lg border border-[#DFE6EE] focus-within:ring-2 focus-within:ring-[#F26B1D]">
                <span className="px-3 py-2.5 text-sm text-[#353C45] border-r border-[#DFE6EE]">+91</span>
                <input
                  id="cb-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={14}
                  required
                  className="w-full rounded-r-lg px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>
            {error && <p className="text-xs font-medium text-red-600" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F26B1D] hover:bg-[#d95c14] disabled:opacity-60 text-white font-bold text-sm py-3"
            >
              <Phone className="w-4 h-4" />
              {sending ? "Sending..." : "Get prices"}
            </button>
            <p className="text-[11px] text-[#5B6470] leading-snug">
              We use your number only to reply about this enquiry. See our{" "}
              <Link href="/privacy-policy" className="underline">privacy policy</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
