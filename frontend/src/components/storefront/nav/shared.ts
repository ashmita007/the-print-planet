"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiUrl } from "@/lib/api";
import type { Category, ClientProfile } from "@/lib/types";

export const CDN_LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/pmq4rert/image/upload/v1793343181/the_print_planet/brand/logo_webp.webp";

export const ANNOUNCEMENTS = [
  "PAN-India Factory-Direct Dispatch | Free Digital Proofs on All Custom Orders",
  "Corporate & Educational Bulk Enquiries: Custom Sample Kits Available",
  "High-Speed Card Manufacturing Machinery & Satin Lanyards at Wholesale Rates",
];

export const NAV_ITEMS = [
  { href: "/pvc-card-manufacturer-bangalore", label: "PVC Cards" },
  { href: "/lanyard-manufacturer-bangalore", label: "Lanyards" },
  { href: "/corporate", label: "Corporate & Bulk" },
  { href: "/pricing", label: "Wholesale Tariff" },
  { href: "/contact", label: "Contact" },
];

/** Extra links that only the mobile drawer lists. */
export const DRAWER_EXTRA_ITEMS = [
  { href: "/services", label: "Custom Printing" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Portfolio Gallery" },
];

export const isActivePath = (pathname: string | null, href: string): boolean =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

export interface CategoryGroup {
  main: Category;
  subs: Category[];
}

const byCount = (a: Category, b: Category) => (b.products_count ?? 0) - (a.products_count ?? 0);

/** Top-level categories with their children, busiest first; empty categories are left out. */
export function groupCategories(list: Category[]): CategoryGroup[] {
  const valid = list.filter((c) => (c.products_count ?? 0) > 0);
  const tops = valid.filter((c) => !c.parent);
  const mains = (tops.length > 0 ? tops : valid).slice().sort(byCount);
  return mains.map((main) => ({ main, subs: valid.filter((c) => c.parent === main.id).sort(byCount) }));
}

const REFETCH_MIN_MS = 5 * 60 * 1000;

/**
 * Server-provided categories. They are refreshed when the owner edits categories, when the menu
 * opens, and when the tab regains focus (at most every 5 minutes). With no server data we fetch once on mount.
 */
export function useLiveCategories(initial: Category[]) {
  const [categories, setCategories] = useState<Category[]>(Array.isArray(initial) ? initial : []);
  const lastFetch = useRef(0);
  const hasInitial = Array.isArray(initial) && initial.length > 0;

  useEffect(() => {
    if (hasInitial) setCategories(initial);
  }, [initial, hasInitial]);

  const refresh = useCallback(async () => {
    lastFetch.current = Date.now();
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/categories/?hide_empty=true&ordering=count`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      if (list.length > 0) setCategories(list);
    } catch {
      // keep what we have
    }
  }, []);

  useEffect(() => {
    if (!hasInitial) refresh();
    const onFocus = () => {
      if (Date.now() - lastFetch.current >= REFETCH_MIN_MS) refresh();
    };
    window.addEventListener("categoryUpdated", refresh);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("categoryUpdated", refresh);
      window.removeEventListener("focus", onFocus);
    };
  }, [hasInitial, refresh]);

  return { categories, refresh };
}

/** Buyer login state from localStorage, kept in sync across tabs and login/logout. */
export function useClientAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<ClientProfile | null>(null);

  useEffect(() => {
    const update = () => {
      setLoggedIn(!!localStorage.getItem("client_token"));
      try {
        setUser(JSON.parse(localStorage.getItem("client_user") || "null"));
      } catch {
        setUser(null);
      }
    };
    update();
    window.addEventListener("authChange", update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("authChange", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  return { loggedIn, user };
}

export const displayName = (user: ClientProfile | null): string =>
  user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username || "Client";

/** Link look shared with the category button: an orange underline that draws in on hover, focus and when active. */
export const LINK_UNDERLINE =
  "relative px-2.5 py-2 text-[13px] font-semibold whitespace-nowrap cursor-pointer " +
  "after:absolute after:left-2.5 after:right-2.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#F26B1D] " +
  "after:origin-left after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 " +
  "after:transition-transform after:duration-200 motion-reduce:after:transition-none " +
  "rounded-sm";

