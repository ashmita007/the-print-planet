"use client";

import { ColorBar } from "@/components/animations/PrintMarks";
import { heroCopy, HERO_LIMITS, heroHeadlineClass } from "@/lib/hero";
import React from "react";
import { Save, Loader2, Sparkles, Eye } from "lucide-react";

export interface HeroTabProps {
  saving: boolean;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCaption: string;
  setHeroBadge: (value: string) => void;
  setHeroTitle: (value: string) => void;
  setHeroSubtitle: (value: string) => void;
  setHeroCaption: (value: string) => void;
  previewHero: ReturnType<typeof heroCopy>;
  headlineLength: number;
  handleSaveHero: (e?: React.FormEvent) => Promise<void>;
}

export default function HeroTab({
  saving,
  heroBadge,
  heroTitle,
  heroSubtitle,
  heroCaption,
  setHeroBadge,
  setHeroTitle,
  setHeroSubtitle,
  setHeroCaption,
  previewHero,
  headlineLength,
  handleSaveHero,
}: HeroTabProps) {
  return (
    <div className="space-y-6">
      <div className="surface-card p-6 rounded-lg space-y-5 text-xs">
        <div className="border-b border-[#DFE6EE] pb-3">
          <h2 className="text-sm font-semibold text-[#121418] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#353C45]" />
            Homepage Hero Banner &amp; Headline Editor
          </h2>
          <p className="text-[11px] text-[#353C45] mt-0.5">
            Customize the high-impact headline, category pill, and primary caption displayed at the very top of the homepage.
          </p>
        </div>

        {/* Same copy rules and styling as the public homepage hero */}
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-[#121418] mb-2">
            <Eye className="w-3.5 h-3.5 text-[#2B323B]" />
            How it looks on the homepage
          </p>
          <div className="bg-[#121418] text-white p-6 sm:p-10 rounded-md">
            <div className="flex items-center gap-3 mb-5">
              <ColorBar />
              <span className="font-mono text-xs text-slate-300">{previewHero.badge}</span>
            </div>
            <p className={`${heroHeadlineClass(previewHero)} font-heading font-extrabold tracking-[-0.02em] leading-[1.06] max-w-2xl`}>
              {previewHero.title}
              <span className="block text-[#B9C3CF]">{previewHero.subtitle}</span>
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">{previewHero.caption}</p>
            <div className="mt-6 inline-flex px-5 py-3 rounded-md bg-[#B9C3CF] text-[#121418] font-bold text-sm">Browse products</div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="field-small-line-above-the" className="block font-bold text-[#121418] mb-1">
              Small line above the headline
            </label>
            <input id="field-small-line-above-the"
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. The Print Planet™ • India's Direct B2B Factory"
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-headline" className="block font-bold text-[#121418] mb-1">
                Headline *
              </label>
              <input id="field-headline"
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Print Planet — Factory Direct"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none font-semibold"
              />
            </div>

            <div>
              <label htmlFor="field-headline-second-line-orange" className="block font-bold text-[#121418] mb-1">
                Headline second line (orange) *
              </label>
              <input id="field-headline-second-line-orange"
                type="text"
                required
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. Wholesale ID Cards, Lanyard Rolls & Machinery"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none"
              />
            </div>

            <p className={`sm:col-span-2 text-[11px] ${headlineLength > HERO_LIMITS.headline ? "text-[#2B323B] font-semibold" : "text-[#353C45]"}`}>
              Headline total: {headlineLength} of {HERO_LIMITS.headline} characters.
              {headlineLength > HERO_LIMITS.headline ? " Longer headlines show smaller on the homepage." : ""}
            </p>
          </div>

          <div>
            <label htmlFor="field-line-under-the-headline" className="block font-bold text-[#121418] mb-1">
              Line under the headline *
            </label>
            <textarea id="field-line-under-the-headline"
              rows={2}
              required
              value={heroCaption}
              onChange={(e) => setHeroCaption(e.target.value)}
              placeholder="Official portal of The Print Planet..."
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 text-xs outline-none leading-relaxed"
            />
            <span className={`text-[11px] mt-0.5 block ${heroCaption.trim().length > HERO_LIMITS.caption ? "text-[#2B323B] font-semibold" : "text-[#353C45]"}`}>
              {heroCaption.trim().length} of {HERO_LIMITS.caption} characters recommended.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveHero}
              disabled={saving}
              className="bg-[#121418] hover:bg-[#2A2F37] text-white px-6 py-2.5 rounded-md font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving Hero..." : "Save Homepage Hero"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
