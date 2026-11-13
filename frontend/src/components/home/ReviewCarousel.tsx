"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";

export type Review = {
  id: string;
  author: string;
  /** Secondary line under the name, e.g. "2 weeks ago". */
  meta?: string;
  /** Link to the reviewer's Google profile (required attribution for Google reviews). */
  authorUrl?: string;
  rating: number;
  text: string;
};

const INKS = ["#F26B1D", "#121418", "#353C45", "#B9C3CF"];

/**
 * Review cards in a native scroll-snap track: swipe on touch, drag with a mouse,
 * arrow buttons and keyboard. A progress bar shows the position.
 */
export default function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + 16), behavior: "smooth" });
  };

  // Mouse drag; touch and pens keep native swiping.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { active: true, startX: e.clientX, startScroll: trackRef.current.scrollLeft, moved: false };
    trackRef.current.style.scrollSnapType = "none";
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = () => {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    drag.current.active = false;
    el.style.scrollSnapType = "";
  };

  return (
    <div>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Customer reviews, scroll sideways"
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 px-4 sm:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] cursor-grab active:cursor-grabbing select-none focus-visible:outline-2 focus-visible:outline-[#121418]"
      >
        {reviews.map((review, i) => {
          const ink = INKS[i % INKS.length];
          return (
            <li
              key={review.id}
              data-no-reveal
              className="group relative snap-start shrink-0 w-[85vw] sm:w-[400px] bg-white border border-[#DFE6EE] rounded-2xl p-6 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: ink }} />
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s < review.rating ? "fill-[#F26B1D] text-[#F26B1D]" : "text-[#B9C3CF]"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 opacity-90" style={{ color: ink }} aria-hidden="true" />
              </div>
              <p className="mt-4 text-[15px] text-[#121418] leading-relaxed line-clamp-6 flex-1">{review.text}</p>
              <div className="mt-5 pt-4 border-t border-[#DFE6EE] flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-sm"
                  style={{ background: ink, color: ink === "#B9C3CF" || ink === "#F26B1D" ? "#121418" : "#FFFFFF" }}
                >
                  {review.author.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "G"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#121418] truncate">
                    {review.authorUrl ? (
                      <a
                        href={review.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="hover:underline underline-offset-2"
                      >
                        {review.author}
                      </a>
                    ) : (
                      review.author
                    )}
                  </p>
                  {review.meta && <p className="text-xs text-[#353C45] truncate">{review.meta}</p>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 flex items-center gap-6">
        <div className="relative flex-1 h-1 rounded-full bg-[#DFE6EE] overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F26B1D] to-[#FF8A3D] transition-[width] duration-200"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous reviews"
            className="w-11 h-11 rounded-full border border-[#121418]/30 flex items-center justify-center text-[#121418] hover:bg-[#121418] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#121418] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next reviews"
            className="w-11 h-11 rounded-full border border-[#121418]/30 flex items-center justify-center text-[#121418] hover:bg-[#121418] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#121418] transition-colors"
          >
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
