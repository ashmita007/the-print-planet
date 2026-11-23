"use client";

import { ChevronDown } from "lucide-react";
import { useDropdown, useHoverIntent } from "./useDropdown";

export const MENU_ITEM =
  "flex w-full items-center gap-2.5 px-4 min-h-10 py-2 text-left text-sm font-medium text-slate-700 hover:bg-[#EDF1F6] hover:text-[#121418] focus-visible:bg-[#EDF1F6] focus-visible:text-[#121418] outline-none transition-colors motion-reduce:transition-none";

/** Icon + label header action that opens a small menu on hover, click or keyboard (Flipkart-style). */
export default function HeaderDropdown({
  id,
  label,
  ariaLabel,
  icon,
  align = "right",
  chevron = true,
  children,
}: {
  id: string;
  label: React.ReactNode;
  ariaLabel?: string;
  icon: React.ReactNode;
  align?: "left" | "right";
  chevron?: boolean;
  /** Panel body; call `close` from link handlers. */
  children: (close: () => void) => React.ReactNode;
}) {
  const { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur } = useDropdown();
  const hover = useHoverIntent(open, setOpen, buttonRef, wrapRef);
  const close = () => setOpen(false);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={hover.onPointerLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          if (open && hover.clickFollowsHover()) return;
          onButtonClick(e);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={id}
        aria-label={ariaLabel}
        className={`flex items-center gap-2 h-10 px-2.5 rounded-md text-sm font-semibold text-[#121418] hover:bg-[#EDF1F6] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[#121418] ${open ? "bg-[#EDF1F6]" : ""}`}
      >
        {icon}
        <span className="whitespace-nowrap">{label}</span>
        {chevron && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>
      {open && (
        <div id={id} data-menu className={`absolute top-full z-50 pt-1.5 w-64 ${align === "right" ? "right-0" : "left-0"}`}>
          <div className="bg-white border border-[#DFE6EE] rounded-lg shadow-[0_16px_40px_-12px_rgba(16,39,66,0.22)] py-1.5 overflow-hidden">{children(close)}</div>
        </div>
      )}
    </div>
  );
}
