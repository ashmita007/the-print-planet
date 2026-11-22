"use client";

import React from "react";
import { ImageIcon, Upload, RefreshCw, Star } from "lucide-react";

export interface MediaSectionProps {
  images: { url: string; isPrimary: boolean; }[];
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  handleDrop: (e: React.DragEvent) => Promise<void>;
  isDragging: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadingImage: boolean;
  imageUrlInput: string;
  setImageUrlInput: React.Dispatch<React.SetStateAction<string>>;
  handleAddImageUrl: () => void;
  handleSetPrimaryImage: (index: number) => void;
  handleRemoveImage: (index: number) => void;
}

export default function MediaSection({
  images,
  setIsDragging,
  handleDrop,
  isDragging,
  handleFileUpload,
  uploadingImage,
  imageUrlInput,
  setImageUrlInput,
  handleAddImageUrl,
  handleSetPrimaryImage,
  handleRemoveImage,
}: MediaSectionProps) {
  return (
    <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
        <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#353C45]" />
          <span>5. High-Resolution Product Images</span>
        </h2>
        <span className="text-[11px] text-[#353C45]">
          {images.length} asset(s) attached
        </span>
      </div>

      {/* Upload Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Cloudinary Drag-and-Drop / File input */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-5 border-2 border-dashed rounded-md text-center space-y-2 transition-all cursor-pointer block select-none group ${
            isDragging
              ? "border-[#B9C3CF] bg-orange-50/50 scale-[1.01]"
              : "border-[#DFE6EE] hover:border-[#121418] hover:bg-[#EDF1F6] bg-[#EDF1F6]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploadingImage}
          />
          <Upload
            className={`w-7 h-7 mx-auto transition-transform group-hover:scale-110 ${
              isDragging ? "text-[#353C45]" : "text-[#121418]"
            }`}
          />
          <div>
            <span className="font-bold text-[#121418] block text-xs group-hover:text-[#353C45] transition-colors">
              Upload from Device (Cloudinary)
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Click anywhere or drop JPG, PNG, WebP up to 10MB
            </p>
          </div>
          {uploadingImage && (
            <div className="pt-1 text-[#353C45] font-semibold flex items-center justify-center gap-1.5 text-xs anim-fade-in">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading asset to Cloudinary CDN...</span>
            </div>
          )}
        </label>

        {/* Direct Image URL input */}
        <div className="p-4 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md space-y-2 flex flex-col justify-between">
          <div>
            <span className="font-bold text-[#121418] block">Or Add Image Direct URL</span>
            <p className="text-[11px] text-slate-500">Paste an external CDN or Cloudinary URL</p>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/item.jpg"
                aria-label="Image URL"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg px-3 py-1.5 text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="bg-[#121418] text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#2A2F37] shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Live Uploaded Images Cards */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative bg-[#EDF1F6] border rounded-md p-2 flex flex-col items-center gap-2 transition-all ${
                img.isPrimary
                  ? "border-[#B9C3CF] ring-2 ring-[#B9C3CF]/30 shadow-xs"
                  : "border-[#DFE6EE] hover:border-slate-400"
              }`}
            >
              <div className="w-full pt-[100%] relative rounded-lg overflow-hidden bg-[#FFFFFF] border border-slate-200">
                <img
                  src={img.url}
                  alt={`Asset ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-contain p-1.5"
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-[#121418] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                    Primary
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between w-full text-[10px] pt-1">
                <button
                  type="button"
                  onClick={() => handleSetPrimaryImage(idx)}
                  className={`flex items-center gap-1 font-semibold ${
                    img.isPrimary ? "text-[#353C45]" : "text-slate-500 hover:text-[#121418]"
                  }`}
                >
                  <Star className={`w-3 h-3 ${img.isPrimary ? "fill-current" : ""}`} />
                  {img.isPrimary ? "Primary" : "Set Primary"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-dashed border-[#DFE6EE] rounded-md text-center text-xs text-slate-400">
          No images added yet. Upload an image above or a fallback placeholder will be displayed.
        </div>
      )}
    </div>
  );
}
