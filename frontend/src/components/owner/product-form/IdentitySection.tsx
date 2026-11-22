"use client";

import React from "react";
import { Tag, Sparkles, FolderPlus } from "lucide-react";
import { formatProductName, formatCategoryName } from "@/lib/formatters";
import { type Category } from "@/lib/types";

export interface IdentitySectionProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setShowCatCreator: React.Dispatch<React.SetStateAction<boolean>>;
  showCatCreator: boolean;
  categoryId: string | number;
  setCategoryId: React.Dispatch<React.SetStateAction<string | number>>;
  categories: Category[];
  catFeedback: { type: "success" | "error"; message: string; } | null;
  setCatFeedback: React.Dispatch<React.SetStateAction<{ type: "success" | "error"; message: string; } | null>>;
  newCatName: string;
  setNewCatName: React.Dispatch<React.SetStateAction<string>>;
  newCatDesc: string;
  setNewCatDesc: React.Dispatch<React.SetStateAction<string>>;
  handleCreateCategory: (e: React.FormEvent) => Promise<void>;
  creatingCat: boolean;
  generateDynamicSKU: () => void;
  sku: string;
  setSku: React.Dispatch<React.SetStateAction<string>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  isFeatured: boolean;
  setIsFeatured: React.Dispatch<React.SetStateAction<boolean>>;
  shortDesc: string;
  setShortDesc: React.Dispatch<React.SetStateAction<string>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;
}

export default function IdentitySection({
  name,
  setName,
  setShowCatCreator,
  showCatCreator,
  categoryId,
  setCategoryId,
  categories,
  catFeedback,
  setCatFeedback,
  newCatName,
  setNewCatName,
  newCatDesc,
  setNewCatDesc,
  handleCreateCategory,
  creatingCat,
  generateDynamicSKU,
  sku,
  setSku,
  isActive,
  setIsActive,
  isFeatured,
  setIsFeatured,
  shortDesc,
  setShortDesc,
  desc,
  setDesc,
}: IdentitySectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
        <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#353C45]" />
          <span>1. Core Product Identity & Category</span>
        </h2>
      </div>

      <div className="space-y-4 text-xs">
        {/* Product Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-[#121418]">
              Product Commercial Name *
            </label>
            {name && (
              <button
                type="button"
                onClick={() => setName(formatProductName(name))}
                className="text-[10px] text-[#353C45] hover:underline font-bold flex items-center gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Format Proper Case</span>
              </button>
            )}
          </div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName(formatProductName(name))}
            aria-label="Product name"
        placeholder="e.g. 20MM Indian Royal Blue Colour Satin Lanyard Roll"
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3.5 py-2.5 outline-none font-medium text-[#121418] text-sm"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Auto-formats on blur to professional Title Case while preserving technical codes (PVC, RFID, ID, GSM, A4).
          </p>
        </div>

        {/* Category Assignment with Quick Add Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-[#121418]">Category Line *</label>
            <button
              type="button"
              onClick={() => setShowCatCreator(!showCatCreator)}
              className="text-[11px] font-bold text-[#353C45] hover:underline flex items-center gap-1"
            >
              <FolderPlus className="w-3 h-3" />
              <span>{showCatCreator ? "Close Creator" : "+ Quick Create Category"}</span>
            </button>
          </div>

          <select
            aria-label="Category line"
            value={String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-medium text-[#121418] uppercase"
          >
            <option value="" disabled>
              -- Select Verified Category --
            </option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {formatCategoryName(c.name)} ({c.products_count || 0} models)
              </option>
            ))}
          </select>

          {catFeedback && (
            <div
              className={`mt-2 p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                catFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <span>{catFeedback.message}</span>
              <button
                type="button"
                onClick={() => setCatFeedback(null)}
                className="text-xs hover:opacity-75"
              >
                &times;
              </button>
            </div>
          )}

          {/* Inline Quick Category Creator */}
          {showCatCreator && (
            <div className="mt-3 p-4 bg-[#EDF1F6] border border-[#B9C3CF]/30 rounded-md space-y-3 anim-fade-up">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#121418] text-xs">
                  Create New Category On-The-Fly
                </span>
                <span className="text-[10px] text-slate-500">Auto-assigns upon creation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Silicone Wristbands)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg px-3 py-1.5 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg px-3 py-1.5 text-xs outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatCreator(false)}
                  className="px-3 py-1 text-slate-500 text-xs hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCat || !newCatName.trim()}
                  className="bg-[#121418] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#2A2F37] disabled:opacity-50"
                >
                  {creatingCat ? "Creating..." : "Save Category"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SKU & Generator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#121418]">SKU (Product Code) *</label>
              <button
                type="button"
                onClick={generateDynamicSKU}
                className="text-[11px] font-bold text-[#121418] hover:underline flex items-center gap-1"
                title="Auto generate industrial SKU"
              >
                <Sparkles className="w-3 h-3 text-[#353C45]" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              aria-label="SKU"
        placeholder="e.g. LAN-RB-20M"
              className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-mono font-bold text-[#121418]"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#121418]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#121418] w-4 h-4"
              />
              <span>Active in Public Catalogue</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#121418]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-[#353C45] w-4 h-4"
              />
              <span>Featured Hero</span>
            </label>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="field-single-line-subtitle-summary" className="block font-semibold text-[#121418] mb-1">
            Single-Line Subtitle / Summary
          </label>
          <input id="field-single-line-subtitle-summary"
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="e.g. 20mm premium gloss single satin lanyard roll with heat-transfer capability."
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
          />
        </div>

        {/* Full Description */}
        <div>
          <label htmlFor="field-full-application-technical-description" className="block font-semibold text-[#121418] mb-1">
            Full Application & Technical Description
          </label>
          <textarea id="field-full-application-technical-description"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Detail industrial specifications, compatible clips, temperature resistance, and packaging units..."
            className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
