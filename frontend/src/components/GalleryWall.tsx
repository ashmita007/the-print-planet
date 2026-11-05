"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

export interface GalleryPiece {
  title: string;
  group: string;
  image: string;
}

export default function GalleryWall({ pieces }: { pieces: GalleryPiece[] }) {
  const groups = ["All", ...Array.from(new Set(pieces.map((p) => p.group)))];
  const [active, setActive] = useState("All");
  const wall = useRef<HTMLDivElement>(null);

  const choose = (group: string) => {
    if (group === active) return;
    const tiles = wall.current?.querySelectorAll<HTMLElement>("[data-piece]");

    if (!tiles || prefersReducedMotion()) {
      setActive(group);
      return;
    }

    // Tiles stay mounted and toggle display, so Flip can measure both layouts in one pass.
    const state = Flip.getState(tiles);
    tiles.forEach((tile) => {
      tile.style.display = group === "All" || tile.dataset.piece === group ? "" : "none";
    });
    setActive(group);
    Flip.from(state, {
      duration: 0.5,
      ease: "power3.inOut",
      stagger: 0.02,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.35 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.25 }),
    });
  };

  return (
    <div>
      <div role="group" aria-label="Filter gallery" className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            aria-pressed={active === group}
            onClick={() => choose(group)}
            className={`shrink-0 min-h-10 px-4 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
              active === group
                ? "bg-[#22272E] border-[#22272E] text-white"
                : "bg-[#FFFFFF] border-[#DFE6EE] text-[#22272E] hover:border-[#22272E]"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div ref={wall} data-no-reveal className="relative mt-5 grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {pieces.map((piece, index) => (
          <Link
            key={piece.title}
            data-piece={piece.group}
            data-tilt
            href={`/quote?product=${encodeURIComponent(piece.title)}`}
            style={active === "All" || active === piece.group ? undefined : { display: "none" }}
            className={`group flex flex-col overflow-hidden rounded-lg bg-[#EDF1F6] border border-[#DFE6EE] hover:border-[#22272E] transition-colors ${
              index === 0 ? "col-span-2 lg:row-span-2" : ""
            }`}
          >
            <div data-print className="relative flex-1 aspect-square lg:aspect-auto lg:min-h-64">
              <Image
                src={piece.image}
                alt={piece.title}
                fill
                sizes={index === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
                className="object-contain p-4 sm:p-8 transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
            <div className="flex items-end justify-between gap-2 p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#DFE6EE]">
              <span className="text-sm sm:text-base font-bold text-[#22272E] leading-snug">{piece.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0 mb-0.5 text-[#36404B] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
