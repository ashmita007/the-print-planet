import React from "react";
import Link from "next/link";
import Marquee from "./Marquee";

const SECTORS = ["Schools", "Corporates", "Hospitals", "Colleges", "Events", "Factories", "Print shops"];

/** Ink band for bulk orders. Opens with a circle wipe as it scrolls in (data-wipe). */
export default function BulkInkBand({ whatsapp }: { whatsapp?: string }) {
  const phone = (whatsapp || "919741808034").replace(/\D/g, "");
  return (
    <section data-wipe aria-labelledby="bulk-band-heading" className="ink-section mt-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-12 gap-10 items-center">
        <h2 id="bulk-band-heading" data-split-skip className="lg:col-span-7 display-xl">
          <span data-reveal className="block">Order for</span>
          <span data-reveal className="block">
            the whole
            <span className="display-note hidden md:inline-block text-[#B9C3CF]">100 to 1,00,000 pieces</span>
          </span>
          <span data-reveal className="block">team.</span>
        </h2>
        <div className="lg:col-span-5 space-y-6">
          <p data-reveal className="text-[15px] leading-relaxed text-[#FAFBFD]/80">
            ID cards, lanyards and holders for a new batch of joiners or a full school year. Your own
            account keeps every quotation, proof and message with our team in one place.
          </p>
          <div data-reveal className="flex flex-wrap gap-3">
            <Link href="/corporate" data-magnetic className="btn-stamp">
              Start a bulk order
            </Link>
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-stamp btn-stamp-outline text-[#FAFBFD] hover:!bg-[#FAFBFD] hover:!text-[#22272E]"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
      <Marquee items={SECTORS} reverse speed={34} label="Who we print for" className="text-[#FAFBFD]/90 border-[#FAFBFD]/15" />
    </section>
  );
}
