import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HERO_DEFAULTS } from "@/lib/hero";

// Home only: while the catalogue loads, show the real headline and buttons (the same text the hero
// renders), not grey blocks, so the first paint already says what the site sells.
export default function HomeLoading() {
  return (
    <section className="bg-[#0E2238] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6">
          <p className="font-mono text-xs text-slate-200 font-medium tracking-wide mb-5">{HERO_DEFAULTS.badge}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-hero font-extrabold tracking-[-0.025em] leading-[1.08]">
            {HERO_DEFAULTS.title}
            <span className="block text-[#FF8A3D] mt-1 sm:mt-1.5">{HERO_DEFAULTS.subtitle}</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-100 leading-relaxed max-w-xl">{HERO_DEFAULTS.caption}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-7">
            <Link href="/products" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#0E2238] font-bold text-sm transition-colors">
              <span>Browse all products</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/quote" className="inline-flex items-center justify-center py-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-[#F26B1D] transition-colors">
              Request a custom quote
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6 aspect-[16/10] w-full bg-white/5 rounded-md" aria-hidden="true" />
      </div>
    </section>
  );
}
