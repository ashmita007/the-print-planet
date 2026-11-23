"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { ANNOUNCEMENTS } from "./shared";

/** Dark strip above the header. It is not sticky, so it scrolls away with the page. */
export default function TopBar({ phone, email }: { phone: string; email: string }) {
  const [index, setIndex] = useState(0);

  // Plain text swap; people who prefer reduced motion get a still message.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 flex items-center bg-[#121418] text-white text-[11px] sm:text-xs px-3.5 sm:px-6">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-slate-200 truncate font-medium flex-1 min-w-0">{ANNOUNCEMENTS[index]}</p>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-300">
          <a href={`mailto:${email}`} className="hover:text-[#B9C3CF] transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#FF8A3D]" aria-hidden />
            <span>{email}</span>
          </a>
          <span className="text-white/20" aria-hidden>|</span>
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="hover:text-[#B9C3CF] transition-colors flex items-center gap-1.5 font-semibold tabular-nums text-white"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF8A3D]" aria-hidden />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
