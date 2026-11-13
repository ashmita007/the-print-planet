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
  const params = {
    method,
    page_path: window.location.pathname,
    page_title: document.title,
    lead_source: readAttribution()?.lead_source || "direct",
    ...detail,
  };
  try {
    window.gtag?.("event", "generate_lead", params);
    window.gtag?.("event", `lead_${method}`, params);
    window.clarity?.("event", `lead_${method}`);
  } catch {
    /* analytics must never break the page */
  }
}

const ATTR_KEY = "tpp_attr";
const ATTR_DAYS = 30;

export type Attribution = { lead_source: string; landing_page: string; referrer: string; ts: number };

/** Names the channel from UTM tags, an ad click id, or the referring site. */
function classify(params: URLSearchParams, referrer: string): string {
  const utm = params.get("utm_source");
  if (utm) {
    const medium = params.get("utm_medium") || "referral";
    const campaign = params.get("utm_campaign");
    return `${utm} / ${medium}${campaign ? ` (${campaign})` : ""}`.toLowerCase().slice(0, 120);
  }
  if (params.get("gclid") || params.get("gbraid") || params.get("wbraid")) return "google / cpc";
  if (params.get("fbclid")) return "facebook / social";
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (!host || host.endsWith("theprintplanet.co.in")) return "direct";
  if (/(^|\.)google\./.test(host)) return "google / organic";
  if (/(^|\.)(bing|duckduckgo|yahoo|ecosia)\./.test(host)) return `${host.split(".")[0]} / organic`;
  if (/indiamart|tradeindia|justdial/.test(host)) return `${host.split(".")[0]} / referral`;
  if (/whatsapp|wa\.me/.test(host)) return "whatsapp / social";
  if (/facebook|instagram|linkedin|youtube|t\.co$|twitter|x\.com/.test(host)) return `${host.split(".")[0]} / social`;
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(host)) return `${host.split(".")[0]} / ai`;
  return `${host} / referral`.slice(0, 120);
}

/** First-touch attribution kept for 30 days; a new tagged (UTM or ad) visit replaces it. */
export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Attribution;
    return Date.now() - a.ts < ATTR_DAYS * 864e5 ? a : null;
  } catch {
    return null;
  }
}

function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tagged = ["utm_source", "gclid", "gbraid", "wbraid", "fbclid"].some((k) => params.has(k));
    const current = readAttribution();
    if (current && !tagged) return;
    const source = classify(params, document.referrer);
    // Moving between our own pages must not wipe a real source with "direct".
    if (current && source === "direct") return;
    const attr: Attribution = {
      lead_source: source,
      landing_page: window.location.pathname.slice(0, 255),
      referrer: (document.referrer || "").slice(0, 255),
      ts: Date.now(),
    };
    localStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {
    /* storage blocked: enquiries simply arrive without a source */
  }
}

/**
 * One document-level listener covers every WhatsApp, call and email link on the site.
 * WhatsApp links that carry no message get one naming the page the buyer
 * was looking at, so the owner can reply with the right price straight away.
 */
export default function LeadTracker() {
  useEffect(() => {
    captureAttribution();
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
              `Hi The Print Planet, I'm interested in: ${page}\n${window.location.origin}${window.location.pathname}\nPlease share price and availability.`
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
