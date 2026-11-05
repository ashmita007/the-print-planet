import React from "react";

type Props = {
  items: string[];
  reverse?: boolean;
  speed?: number;
  className?: string;
  label?: string;
};

/**
 * A strip of large words that runs with the scroll (PageReveal drives it through
 * data-marquee). Without JavaScript, or with reduced motion, it simply sits still.
 */
export default function Marquee({ items, reverse = false, speed = 28, className = "", label }: Props) {
  return (
    <div
      data-marquee={reverse ? "reverse" : "forward"}
      data-speed={speed}
      aria-label={label}
      role={label ? "region" : undefined}
      className={`marquee py-4 sm:py-5 border-y border-current/15 ${className}`}
    >
      <ul data-split-skip className="marquee-track display-xl !text-[clamp(1.25rem,2.6vw,2.25rem)]">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-8">
            <span>{item}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[0.45em] h-[0.45em] text-[#B9C3CF]" fill="currentColor">
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
