"use client";

import { useEffect } from "react";

type LeadMethod = "whatsapp" | "phone" | "email" | "form";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/** Sends one lead event to GA4 (as the recommended `generate_lead`) and Clarity. Safe when neither is loaded. */
export function trackLead(method: LeadMethod, detail: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const params = { method, page_path: window.location.pathname, page_title: document.title, ...detail };
  try {
    window.gtag?.("event", "generate_lead", params);
    window.gtag?.("event", `lead_${method}`, params);
    window.clarity?.("event", `lead_${method}`);
  } catch {
    /* analytics must never break the page */
  }
}

/**
 * One document-level listener covers every WhatsApp, call and email link on the site.
 * WhatsApp links that carry no message get one naming the page the buyer
 * was looking at, so the owner can reply with the right price straight away.
 */
export default function LeadTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";

      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
        try {
          const url = new URL(href);
          // Owner screens message customers; leave those links alone.
          if (!window.location.pathname.startsWith("/owner") && !url.searchParams.get("text")) {
            const page = document.title.split("|")[0].trim();
            url.searchParams.set(
              "text",
              `Hi The Print Planet, I'm interested in: ${page}\n${window.location.href}\nPlease share price and availability.`
            );
            a.href = url.toString();
          }
        } catch {
          /* leave the link untouched */
        }
        trackLead("whatsapp");
      } else if (href.startsWith("tel:")) {
        trackLead("phone");
      } else if (href.startsWith("mailto:")) {
        trackLead("email");
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
