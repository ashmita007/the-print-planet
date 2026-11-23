"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBoxProps {
  /** "field" is the desktop input; "panel" is the full-width bar opened from the icon button. */
  variant: "field" | "panel";
  /** Called after a search is submitted so the parent can close the panel. */
  onDone?: () => void;
  /** Field only: ⌘K pressed while the field is hidden (compact layout). */
  onShortcutWhenHidden?: () => void;
  /** Panel only: close button. */
  onClose?: () => void;
}

export default function SearchBox({ variant, onDone, onShortcutWhenHidden, onClose }: SearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // ⌘K / Ctrl+K focuses the visible field, or asks the parent to open the panel.
  useEffect(() => {
    if (variant !== "field") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (inputRef.current?.offsetParent) inputRef.current.focus();
        else onShortcutWhenHidden?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant, onShortcutWhenHidden]);

  useEffect(() => {
    if (variant === "panel") inputRef.current?.focus();
  }, [variant]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onDone?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (query) setQuery("");
    else if (variant === "panel") onClose?.();
    else inputRef.current?.blur();
  };

  const panel = variant === "panel";

  return (
    <form
      onSubmit={submit}
      role="search"
      className={panel ? "relative w-full flex items-center gap-2" : "relative w-full min-w-[260px] max-w-md"}
    >
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search products or SKU"
          placeholder="Search products or SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          enterKeyHint="search"
          className={`w-full bg-[#EDF1F6] hover:bg-white focus:bg-white border border-[#DFE6EE] hover:border-[#121418]/30 focus:border-[#121418] focus:ring-4 focus:ring-[#B9C3CF]/20 rounded-md pl-9 text-sm text-slate-900 placeholder-slate-500 outline-none transition-colors motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden ${
            panel ? "h-11 pr-3" : "h-10 pr-16"
          }`}
        />
        {!panel && !query && (
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded pointer-events-none leading-none">
            ⌘K
          </kbd>
        )}
        {!panel && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-[#121418] rounded"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>
      {panel && (
        <>
          <button type="submit" className="h-11 px-4 rounded-md bg-[#121418] text-white text-sm font-bold hover:bg-[#2B323B] transition-colors">
            Search
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="h-11 w-11 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-[#EDF1F6]"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </>
      )}
    </form>
  );
}
