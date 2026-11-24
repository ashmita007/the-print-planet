"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Layers, Search, X } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { formatCategoryLabel, formatProductName, getProductImageUrl, sizedImage } from "@/lib/formatters";
import { searchHref, stepIndex } from "@/lib/navSearch";
import type { Category, Product } from "@/lib/types";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 200;
const MAX_PRODUCTS = 6;
const MAX_CATEGORIES = 3;
// Smallest on-disk image copy; thumbnails are 36px.
const THUMB_WIDTH = 160;

interface Row {
  key: string;
  href: string;
  label: string;
  hint?: string;
  img?: string;
}

/** Header search pill with live suggestions. Enter goes to /products?search=; arrows pick a suggestion. */
export default function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);

  const q = query.trim();
  const canSuggest = q.length >= MIN_CHARS;

  // ⌘K / Ctrl+K focuses the field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Debounced fetch; a newer keystroke aborts the older request so slow answers never overwrite fresh ones.
  useEffect(() => {
    if (!canSuggest) {
      setRows([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/search/?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: { products?: Product[]; categories?: Category[] } = await res.json();
        const cats: Row[] = (data.categories ?? [])
          .filter((c) => (c.products_count ?? 0) > 0)
          .slice(0, MAX_CATEGORIES)
          .map((c) => ({ key: `c${c.id}`, href: `/categories/${c.slug}`, label: formatCategoryLabel(c.name), hint: "Category" }));
        const prods: Row[] = (data.products ?? []).slice(0, MAX_PRODUCTS).map((p) => ({
          key: `p${p.id}`,
          href: `/products/${p.slug}`,
          label: formatProductName(p.name),
          hint: formatCategoryLabel(p.category?.name),
          img: sizedImage(getProductImageUrl(p), THUMB_WIDTH),
        }));
        setRows([...cats, ...prods]);
        setActive(-1);
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setRows([]);
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, canSuggest]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const allHref = searchHref(query);
  // The last row is always "see all"; it is also what Enter does when no suggestion is highlighted.
  const total = rows.length + (allHref ? 1 : 0);
  const panelOpen = open && canSuggest;

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && active < rows.length) go(rows[active].href);
    else if (allHref) go(allHref);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // Stop the browser from also clearing the field natively; we decide what Escape closes.
      e.preventDefault();
      if (open) setOpen(false);
      else if (query) setQuery("");
      else inputRef.current?.blur();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const next = stepIndex(active, e.key === "ArrowDown" ? 1 : -1, total);
      setActive(next);
    }
  };

  const optionId = (i: number) => `${listId}-${i}`;

  // Keep the keyboard-highlighted option visible inside the scrollable panel.
  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);
  const status = !canSuggest ? "" : loading ? "Searching" : rows.length > 0 ? `${rows.length} suggestions` : "No quick matches";

  return (
    <form
      ref={wrapRef}
      onSubmit={submit}
      role="search"
      className="relative w-full"
      onBlur={(e) => {
        // Tabbing away (not just clicking away) closes the panel.
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {panelOpen ? status : ""}
      </p>
      <div className="relative">
        <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search products or SKU"
          aria-expanded={panelOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={panelOpen && active >= 0 ? optionId(active) : undefined}
          placeholder="Search for PVC cards, lanyards, holders and more"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          enterKeyHint="search"
          className="w-full h-11 lg:h-10 rounded-lg bg-[#F0F2F5] hover:bg-[#E8EBEF] focus:bg-white border border-transparent focus:border-[#121418] focus:ring-4 focus:ring-[#B9C3CF]/30 pl-11 pr-10 text-sm text-ellipsis text-slate-900 placeholder-slate-500 outline-none transition-colors motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#121418] rounded-md"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>

      {panelOpen && (
        <div tabIndex={-1} className="absolute inset-x-0 top-full mt-1.5 z-50 outline-none bg-white border border-[#DFE6EE] rounded-lg shadow-[0_16px_40px_-12px_rgba(16,39,66,0.22)] max-h-[min(36rem,calc(100dvh-14rem))] overflow-y-auto overscroll-contain">
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="py-1.5">
            {rows.length === 0 && !loading && (
              <li role="presentation" className="px-4 py-2.5 text-sm text-slate-500">
                No quick matches. Press Enter to search the full catalogue.
              </li>
            )}
            {rows.length === 0 && loading && (
              <li role="presentation" className="px-4 py-2.5 text-sm text-slate-500">
                Searching…
              </li>
            )}
            {rows.map((row, i) => (
              <li key={row.key} role="option" id={optionId(i)} aria-selected={active === i}>
                <a
                  href={row.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(row.href);
                  }}
                  onMouseEnter={() => setActive(i)}
                  tabIndex={-1}
                  className={`flex items-center gap-3 px-4 min-h-12 py-1.5 ${active === i ? "bg-[#EDF1F6]" : ""}`}
                >
                  {row.img ? (
                    <Image src={row.img} alt="" width={36} height={36} unoptimized className="w-9 h-9 rounded-md object-cover bg-slate-100 shrink-0" />
                  ) : (
                    <span className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-[#353C45]" aria-hidden />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#121418] truncate">{row.label}</span>
                    {row.hint && <span className="block text-xs text-slate-500 truncate">{row.hint}</span>}
                  </span>
                </a>
              </li>
            ))}
            {allHref && (
              <li role="option" id={optionId(rows.length)} aria-selected={active === rows.length} className="border-t border-slate-100 mt-1.5 pt-1.5">
                <a
                  href={allHref}
                  onClick={(e) => {
                    e.preventDefault();
                    go(allHref);
                  }}
                  onMouseEnter={() => setActive(rows.length)}
                  tabIndex={-1}
                  className={`flex items-center gap-2 px-4 min-h-11 text-sm font-bold text-[#121418] ${active === rows.length ? "bg-[#EDF1F6]" : ""}`}
                >
                  <Search className="w-4 h-4 text-[#353C45]" aria-hidden />
                  <span className="truncate">See all results for &ldquo;{q}&rdquo;</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </form>
  );
}
