"use client";

import { useEffect, useRef } from "react";

interface WordHighlightProps {
  text: string;
  /** Words that turn to the accent colour instead of ink. */
  accent?: string[];
  id?: string;
}

/**
 * The page's one scroll moment: a statement whose words turn from half ink to ink as it crosses the
 * middle of the screen. Scrubbed to the scrollbar inside its own section (it runs back on the way up).
 * Rendered in full ink; script only "arms" it, so without script, under reduced motion and in print the
 * statement reads at full contrast.
 */
export default function WordHighlight({ text, accent = [], id }: WordHighlightProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".mo-w"));
    if (spans.length === 0) return;

    el.classList.add("is-armed");
    let shown = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.45;
      const rect = el.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end + rect.height)));
      // At the very bottom of the page it can climb no further, so the statement stands in full ink.
      const atEnd = vh + window.scrollY >= document.documentElement.scrollHeight - 2;
      const count = atEnd ? spans.length : Math.round(t * spans.length);
      if (count === shown) return;
      shown = count;
      spans.forEach((span, i) => span.classList.toggle("is-on", i < count));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
      el.classList.remove("is-armed");
    };
  }, []);

  return (
    <p
      ref={ref}
      id={id}
      className="mo-wh font-hero font-extrabold text-[1.75rem] sm:text-4xl lg:text-5xl leading-[1.16] tracking-[-0.02em] text-[#0E2238] max-w-4xl text-pretty"
    >
      {words.map((word, i) => {
        const bare = word.replace(/[.,;:!?]/g, "");
        return (
          <span key={i}>
            {i > 0 && " "}
            <span className={`mo-w${accent.includes(bare) ? " mo-w--accent" : ""}`}>{word}</span>
          </span>
        );
      })}
    </p>
  );
}
