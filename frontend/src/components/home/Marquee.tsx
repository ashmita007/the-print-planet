import React from "react";

type Props = {
  items: string[];
  reverse?: boolean;
  /** Seconds for one full loop. */
  speed?: number;
  className?: string;
  label?: string;
};

// Each track must be wider than the widest screen (2560px) or the loop shows a gap. A word plus its
// gap is at least ~140px, so 20 entries per track cover it even for short lists.
const MIN_ENTRIES = 20;

function Track({ items, hidden = false }: { items: string[]; hidden?: boolean }) {
  const copies = Math.max(3, Math.ceil(MIN_ENTRIES / Math.max(items.length, 1)));
  return (
    <ul
      data-split-skip
      aria-hidden={hidden || undefined}
      className="marquee-track display-xl !text-[clamp(1.25rem,2.6vw,2.25rem)]"
    >
      {/* Repeated so each track is wider than the screen, leaving no gap in the loop. */}
      {Array.from({ length: copies }, () => items).flat().map((item, i) => (
        <li key={`${item}-${i}`} aria-hidden={i >= items.length || undefined} className="flex items-center gap-8">
          <span>{item}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[0.45em] h-[0.45em] text-[#F26B1D]" fill="currentColor">
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

/**
 * A running strip of large words. Two identical tracks loop seamlessly in CSS;
 * it pauses on hover and stays still (wrapped) under reduced motion.
 */
export default function Marquee({ items, reverse = false, speed = 28, className = "", label }: Props) {
  return (
    <div
      data-marquee={reverse ? "reverse" : "forward"}
      aria-label={label}
      role={label ? "region" : undefined}
      style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
      className={`marquee py-4 sm:py-5 border-y border-current/15 ${className}`}
    >
      <Track items={items} />
      <Track items={items} hidden />
    </div>
  );
}
