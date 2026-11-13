import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";
import { GUIDES } from "@/lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: { absolute: "ID Card & Lanyard Guides | The Print Planet" },
  description:
    "Practical guides on dragon sheets, PVC ID card making, ID card machines, lanyard sublimation printing and choosing ID card holders.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "ID Card & Lanyard Guides | The Print Planet",
    description: "How PVC ID cards and printed lanyards are made, and what you need to make them.",
    url: `${SITE_URL}/guides`,
    siteName: "The Print Planet",
  },
};

export default function GuidesIndex() {
  return (
    <>
      <PageHero
        title="ID card and lanyard guides"
        lead="How PVC ID cards and printed lanyards are made, which machines and materials you need, and how to choose holders."
        crumbs={[{ label: "Guides" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid sm:grid-cols-2 gap-5">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group bg-white border border-[#DFE6EE] rounded-2xl p-6 flex flex-col hover:-translate-y-0.5 transition-transform"
          >
            <h2 className="text-xl font-extrabold tracking-tight text-[#121418] group-hover:text-[#F26B1D]">{g.h1}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#2B323B] flex-1">{g.lead}</p>
            <p className="mt-5 flex items-center justify-between text-xs text-[#353C45]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {g.readMinutes} min read
              </span>
              <span className="flex items-center gap-1 font-bold text-[#121418]">
                Read <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </p>
          </Link>
        ))}
      </div>
      <PageCta title="Ready to order? Get a wholesale price." />
    </>
  );
}
