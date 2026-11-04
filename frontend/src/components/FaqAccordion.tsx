"use client";

import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export interface FaqItem {
  question: string;
  answer: string;
}

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      gsap.to(panel.current, {
        height: open ? "auto" : 0,
        duration: prefersReducedMotion() ? 0 : 0.4,
        ease: "power3.inOut",
      });
    },
    { dependencies: [open] }
  );

  return (
    <div data-reveal className="border-b border-[#DFE6EE] last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm sm:text-base font-bold text-[#22272E] hover:text-[#4E5A67] transition-colors"
        >
          <span>{item.question}</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-[#5B6877] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {/* Stays in the DOM when closed so answers remain crawlable for FAQPage schema */}
      <div ref={panel} className="overflow-hidden" style={{ height: open ? "auto" : 0 }}>
        <p className="pb-4 pr-8 text-xs sm:text-sm text-[#4E5A67] leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto">
      {items.map((item, index) => (
        <FaqRow
          key={item.question}
          item={item}
          open={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
