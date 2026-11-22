"use client";

import React from "react";
import { Save, Loader2, Info } from "lucide-react";

export interface AboutTabProps {
  saving: boolean;
  aboutHeroTag: string;
  aboutHeroTitle: string;
  aboutHeroSubtitle: string;
  aboutStoryTitle: string;
  aboutStoryP1: string;
  aboutStoryP2: string;
  stat1Val: string;
  stat1Label: string;
  stat2Val: string;
  stat2Label: string;
  stat3Val: string;
  stat3Label: string;
  stat4Val: string;
  stat4Label: string;
  standard1Title: string;
  standard1Desc: string;
  standard2Title: string;
  standard2Desc: string;
  standard3Title: string;
  standard3Desc: string;
  facility1Title: string;
  facility1Desc: string;
  facility2Title: string;
  facility2Desc: string;
  facility3Title: string;
  facility3Desc: string;
  setAboutHeroTag: (value: string) => void;
  setAboutHeroTitle: (value: string) => void;
  setAboutHeroSubtitle: (value: string) => void;
  setAboutStoryTitle: (value: string) => void;
  setAboutStoryP1: (value: string) => void;
  setAboutStoryP2: (value: string) => void;
  setStat1Val: (value: string) => void;
  setStat1Label: (value: string) => void;
  setStat2Val: (value: string) => void;
  setStat2Label: (value: string) => void;
  setStat3Val: (value: string) => void;
  setStat3Label: (value: string) => void;
  setStat4Val: (value: string) => void;
  setStat4Label: (value: string) => void;
  setStandard1Title: (value: string) => void;
  setStandard1Desc: (value: string) => void;
  setStandard2Title: (value: string) => void;
  setStandard2Desc: (value: string) => void;
  setStandard3Title: (value: string) => void;
  setStandard3Desc: (value: string) => void;
  setFacility1Title: (value: string) => void;
  setFacility1Desc: (value: string) => void;
  setFacility2Title: (value: string) => void;
  setFacility2Desc: (value: string) => void;
  setFacility3Title: (value: string) => void;
  setFacility3Desc: (value: string) => void;
  handleSaveAbout: (e?: React.FormEvent) => Promise<void>;
}

export default function AboutTab({
  saving,
  aboutHeroTag,
  aboutHeroTitle,
  aboutHeroSubtitle,
  aboutStoryTitle,
  aboutStoryP1,
  aboutStoryP2,
  stat1Val,
  stat1Label,
  stat2Val,
  stat2Label,
  stat3Val,
  stat3Label,
  stat4Val,
  stat4Label,
  standard1Title,
  standard1Desc,
  standard2Title,
  standard2Desc,
  standard3Title,
  standard3Desc,
  facility1Title,
  facility1Desc,
  facility2Title,
  facility2Desc,
  facility3Title,
  facility3Desc,
  setAboutHeroTag,
  setAboutHeroTitle,
  setAboutHeroSubtitle,
  setAboutStoryTitle,
  setAboutStoryP1,
  setAboutStoryP2,
  setStat1Val,
  setStat1Label,
  setStat2Val,
  setStat2Label,
  setStat3Val,
  setStat3Label,
  setStat4Val,
  setStat4Label,
  setStandard1Title,
  setStandard1Desc,
  setStandard2Title,
  setStandard2Desc,
  setStandard3Title,
  setStandard3Desc,
  setFacility1Title,
  setFacility1Desc,
  setFacility2Title,
  setFacility2Desc,
  setFacility3Title,
  setFacility3Desc,
  handleSaveAbout,
}: AboutTabProps) {
  return (
    <div className="space-y-6">
      <div className="surface-card p-6 rounded-lg space-y-6 text-xs">
        <div className="border-b border-[#DFE6EE] pb-3">
          <h2 className="text-sm font-semibold text-[#121418] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#353C45]" />
            Dynamic About Us Content Management System (CMS)
          </h2>
          <p className="text-[11px] text-[#353C45] mt-0.5">
            Edit factory background, mission story, daily output statistics counters, and quality standards for the public <code>/about</code> page.
          </p>
        </div>

        {/* Section 1: Hero Banner on About Page */}
        <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#121418]">
            1. About Page Hero Banner
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-hero-tag-pill" className="block font-semibold text-[#121418] mb-1">Hero Tag Pill</label>
              <input id="field-hero-tag-pill"
                type="text"
                value={aboutHeroTag}
                onChange={(e) => setAboutHeroTag(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label htmlFor="field-hero-title" className="block font-semibold text-[#121418] mb-1">Hero Title</label>
              <input id="field-hero-title"
                type="text"
                value={aboutHeroTitle}
                onChange={(e) => setAboutHeroTitle(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field-hero-subtitle" className="block font-semibold text-[#121418] mb-1">Hero Subtitle</label>
            <textarea id="field-hero-subtitle"
              rows={2}
              value={aboutHeroSubtitle}
              onChange={(e) => setAboutHeroSubtitle(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Story & Manufacturing Mission */}
        <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#121418]">
            2. Manufacturing Mission &amp; Background Story
          </h3>

          <div>
            <label htmlFor="field-section-heading" className="block font-semibold text-[#121418] mb-1">Section Heading</label>
            <input id="field-section-heading"
              type="text"
              value={aboutStoryTitle}
              onChange={(e) => setAboutStoryTitle(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none font-semibold"
            />
          </div>

          <div>
            <label htmlFor="field-story-paragraph-1" className="block font-semibold text-[#121418] mb-1">Story Paragraph 1</label>
            <textarea id="field-story-paragraph-1"
              rows={3}
              value={aboutStoryP1}
              onChange={(e) => setAboutStoryP1(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none leading-relaxed"
            />
          </div>

          <div>
            <label htmlFor="field-story-paragraph-2" className="block font-semibold text-[#121418] mb-1">Story Paragraph 2</label>
            <textarea id="field-story-paragraph-2"
              rows={3}
              value={aboutStoryP2}
              onChange={(e) => setAboutStoryP2(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DFE6EE] focus:border-[#121418] rounded-lg px-3 py-2 text-xs outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Daily Output Statistics Counters */}
        <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#121418]">
            3. Factory Output Counters (Displayed in Stats Grid)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
              <label htmlFor="field-counter-1-holders" className="block font-semibold text-slate-700 mb-1">Counter 1 (Holders)</label>
              <input id="field-counter-1-holders"
                type="text"
                value={stat1Val}
                onChange={(e) => setStat1Val(e.target.value)}
                placeholder="e.g. 50,000+"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#121418] mb-2 outline-none"
              />
              <input
                type="text"
                value={stat1Label}
                onChange={(e) => setStat1Label(e.target.value)}
                placeholder="Holders Produced Daily"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
              <label htmlFor="field-counter-2-ribbons" className="block font-semibold text-slate-700 mb-1">Counter 2 (Ribbons)</label>
              <input id="field-counter-2-ribbons"
                type="text"
                value={stat2Val}
                onChange={(e) => setStat2Val(e.target.value)}
                placeholder="e.g. 10,000+ m"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#121418] mb-2 outline-none"
              />
              <input
                type="text"
                value={stat2Label}
                onChange={(e) => setStat2Label(e.target.value)}
                placeholder="Daily Satin Ribbon Output"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
              <label htmlFor="field-counter-3-active-skus" className="block font-semibold text-slate-700 mb-1">Counter 3 (Active SKUs)</label>
              <input id="field-counter-3-active-skus"
                type="text"
                value={stat3Val}
                onChange={(e) => setStat3Val(e.target.value)}
                placeholder="e.g. 180+"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#121418] mb-2 outline-none"
              />
              <input
                type="text"
                value={stat3Label}
                onChange={(e) => setStat3Label(e.target.value)}
                placeholder="Active Commercial SKUs"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE]">
              <label htmlFor="field-counter-4-clients" className="block font-semibold text-slate-700 mb-1">Counter 4 (Clients)</label>
              <input id="field-counter-4-clients"
                type="text"
                value={stat4Val}
                onChange={(e) => setStat4Val(e.target.value)}
                placeholder="e.g. 500+"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#121418] mb-2 outline-none"
              />
              <input
                type="text"
                value={stat4Label}
                onChange={(e) => setStat4Label(e.target.value)}
                placeholder="Institutional Clients Across India"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Quality & Core Production Standards */}
        <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#121418]">
            4. Quality &amp; Core Standards
          </h3>

          <div className="space-y-3">
            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={standard1Title}
                onChange={(e) => setStandard1Title(e.target.value)}
                placeholder="Standard 1 Title (e.g. ISO CR-80 Standard Compliance)"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={2}
                value={standard1Desc}
                onChange={(e) => setStandard1Desc(e.target.value)}
                placeholder="Standard 1 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={standard2Title}
                onChange={(e) => setStandard2Title(e.target.value)}
                placeholder="Standard 2 Title (e.g. Pure Grade Polyvinyl Chloride)"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={2}
                value={standard2Desc}
                onChange={(e) => setStandard2Desc(e.target.value)}
                placeholder="Standard 2 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={standard3Title}
                onChange={(e) => setStandard3Title(e.target.value)}
                placeholder="Standard 3 Title (e.g. Rigid Hardware Attachments)"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={2}
                value={standard3Desc}
                onChange={(e) => setStandard3Desc(e.target.value)}
                placeholder="Standard 3 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Facilities Strip */}
        <div className="space-y-4 p-4 rounded-md bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#121418]">
            5. Facility Pillars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={facility1Title}
                onChange={(e) => setFacility1Title(e.target.value)}
                placeholder="Facility 1 Title"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={3}
                value={facility1Desc}
                onChange={(e) => setFacility1Desc(e.target.value)}
                placeholder="Facility 1 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={facility2Title}
                onChange={(e) => setFacility2Title(e.target.value)}
                placeholder="Facility 2 Title"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={3}
                value={facility2Desc}
                onChange={(e) => setFacility2Desc(e.target.value)}
                placeholder="Facility 2 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
              />
            </div>

            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DFE6EE] space-y-2">
              <input
                type="text"
                value={facility3Title}
                onChange={(e) => setFacility3Title(e.target.value)}
                placeholder="Facility 3 Title"
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs font-bold text-[#121418] outline-none"
              />
              <textarea
                rows={3}
                value={facility3Desc}
                onChange={(e) => setFacility3Desc(e.target.value)}
                placeholder="Facility 3 Description..."
                className="w-full bg-[#EDF1F6] border border-[#DFE6EE] rounded px-2.5 py-1.5 text-xs outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveAbout}
            disabled={saving}
            className="bg-[#121418] hover:bg-[#2A2F37] text-white px-6 py-2.5 rounded-md font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving About Us..." : "Save About Us CMS"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
