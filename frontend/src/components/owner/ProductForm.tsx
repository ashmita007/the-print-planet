"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Star,
  Sparkles,
  Eye,
  EyeOff,
  FolderPlus,
  RefreshCw,
  Layers,
  Tag,
  DollarSign,
  Package,
  Sliders,
  Shield,
  ExternalLink,
  Box,
} from "lucide-react";
import {
  ownerSaveProduct,
  ownerGetCategories,
  ownerSaveCategory,
  ownerUploadImage,
} from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { formatCategoryName, formatProductName } from "@/lib/formatters";

interface ProductFormProps {
  initialProduct?: Product | null;
  isEdit?: boolean;
}

// Preset technical specification packages for industrial ID lines
const SPEC_PRESETS = [
  {
    name: "Lanyard Roll",
    badge: "Ribbon",
    specs: [
      { key: "Roll Length", value: "100 Meters Continuous" },
      { key: "Ribbon Width", value: "20 mm" },
      { key: "Weave Pattern", value: "Fine Satin Smooth Weave" },
      { key: "GSM", value: "180 GSM" },
      { key: "Print Compatibility", value: "Heat Transfer / Screen Print" },
    ],
  },
  {
    name: "ID Badge Holder",
    badge: "PVC Holder",
    specs: [
      { key: "Standard Fit", value: "CR-80 (85.6 × 54 mm)" },
      { key: "Orientation", value: "Vertical & Horizontal Slot" },
      { key: "Material Grade", value: "Optical High-Clarity PVC" },
      { key: "Thickness", value: "0.40 mm Rigid" },
      { key: "UV Resistance", value: "Non-Yellowing Stabilized" },
    ],
  },
  {
    name: "Industrial Machine",
    badge: "Machinery",
    specs: [
      { key: "Power Voltage", value: "220V / 50Hz AC" },
      { key: "Punch Speed", value: "1,500 – 2,000 Cards/Hour" },
      { key: "Die Material", value: "Hardened Tungsten Alloy" },
      { key: "Warranty Support", value: "1 Year Commercial Warranty" },
      { key: "Operating Weight", value: "48 Kg Heavy-Duty Cast" },
    ],
  },
  {
    name: "Fittings & Hooks",
    badge: "Hardware",
    specs: [
      { key: "Attachment Style", value: "Side-Lever Dog Hook" },
      { key: "Tensile Strength", value: "50+ Newton Spring Tension" },
      { key: "Electroplating", value: "Anti-Rust Nickel Chrome" },
      { key: "Webbing Width", value: "Compatible with 16mm & 20mm" },
    ],
  },
  {
    name: "RFID Smart Card",
    badge: "Cards",
    specs: [
      { key: "Operating Frequency", value: "13.56 MHz (ISO 14443A)" },
      { key: "Chip Type", value: "Mifare 1K S50 Compatible" },
      { key: "Reading Range", value: "2.5 cm – 5.0 cm" },
      { key: "Memory Size", value: "1024 Bytes EEPROM" },
    ],
  },
];

export default function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | string>(
    initialProduct?.category?.id || ""
  );

  // New Category inline creation modal
  const [showCatCreator, setShowCatCreator] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catFeedback, setCatFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Core Product details
  const [name, setName] = useState(initialProduct?.name || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || "");
  const [desc, setDesc] = useState(initialProduct?.description || "");

  // Physical & technical attributes
  const [material, setMaterial] = useState(initialProduct?.material || "");
  const [dimensions, setDimensions] = useState(initialProduct?.dimensions || "");
  const [color, setColor] = useState(initialProduct?.color || "");

  // Pricing & B2B settings
  const [moq, setMoq] = useState<string>(
    initialProduct?.minimum_order_quantity ? String(initialProduct.minimum_order_quantity) : "50"
  );
  const [price, setPrice] = useState<string>(
    initialProduct?.price ? String(initialProduct.price) : ""
  );
  const [priceDisplay, setPriceDisplay] = useState(initialProduct?.price_display || "");
  const [priceVisibility, setPriceVisibility] = useState<boolean>(
    initialProduct !== undefined && initialProduct !== null
      ? Boolean(initialProduct.price_visibility)
      : true
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isActive, setIsActive] = useState(
    initialProduct !== undefined && initialProduct !== null ? initialProduct.is_active : true
  );

  // Specifications key-value pairs
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>(() => {
    if (initialProduct?.specifications && Object.keys(initialProduct.specifications).length > 0) {
      return Object.entries(initialProduct.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [
      { key: "Standard Fit", value: "CR-80 (85.6 × 54 mm)" },
      { key: "Material Grade", value: "Industrial Polymer" },
    ];
  });

  // Images state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images.map((img) => ({
        url: img.secure_url,
        isPrimary: img.is_primary,
      }));
    }
    if (initialProduct?.primary_image) {
      return [{ url: initialProduct.primary_image.secure_url, isPrimary: true }];
    }
    return [];
  });

  // UI state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Fetch initial categories
  useEffect(() => {
    ownerGetCategories().then((res) => {
      setCategories(res);
      if (!categoryId && res.length > 0) {
        setCategoryId(res[0].id);
      }
    });
  }, []);

  // Selected category object
  const activeCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(categoryId)) || null;
  }, [categories, categoryId]);

  // Dynamic SKU Generator
  const generateDynamicSKU = () => {
    const catPrefix = activeCategory?.slug
      ? activeCategory.slug
          .split("-")
          .map((w) => w[0]?.toUpperCase())
          .slice(0, 3)
          .join("")
      : "PRD";

    // Extract initials from name
    const cleanName = name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase())
      .join("");

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const suggested = `${catPrefix || "PRD"}-${cleanName || "MOD"}-${randomSuffix}`;
    setSku(suggested);
  };

  // Price Display Helper
  const autoSuggestPriceDisplay = () => {
    if (!price) return;
    const num = Number(price);
    if (isNaN(num)) return;
    const formatted = `₹ ${num.toLocaleString("en-IN")}`;
    if (name.toLowerCase().includes("roll")) {
      setPriceDisplay(`${formatted} / Roll`);
    } else if (name.toLowerCase().includes("holder") || name.toLowerCase().includes("hook")) {
      setPriceDisplay(`${formatted} / Pack of 50`);
    } else if (name.toLowerCase().includes("machine")) {
      setPriceDisplay(`${formatted} / Unit`);
    } else {
      setPriceDisplay(`${formatted} / Unit`);
    }
  };

  // Handle Specifications
  const handleAddSpec = () => {
    setSpecsList([...specsList, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specsList];
    updated[index][field] = val;
    setSpecsList(updated);
  };

  const handleApplyPreset = (preset: (typeof SPEC_PRESETS)[0]) => {
    const currentKeys = new Set(specsList.map((s) => s.key.toLowerCase().trim()));
    const newItems = preset.specs.filter((s) => !currentKeys.has(s.key.toLowerCase().trim()));
    setSpecsList([...specsList, ...newItems]);
  };

  const [isDragging, setIsDragging] = useState(false);

  // Handle Image Uploads
  const processImageFile = async (file: File) => {
    setUploadingImage(true);
    setErrorMsg("");
    const res = await ownerUploadImage(file);
    setUploadingImage(false);

    if (res.success && res.secure_url) {
      setImages((prev) => [
        ...prev,
        { url: res.secure_url!, isPrimary: prev.length === 0 },
      ]);
    } else {
      setErrorMsg(res.error || "Image upload failed. Ensure image is under 10MB.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
      e.target.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processImageFile(file);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), isPrimary: prev.length === 0 },
    ]);
    setImageUrlInput("");
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  // Handle Inline Quick Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    setCatFeedback(null);
    const generatedSlug = newCatName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const res = await ownerSaveCategory(null, {
      name: newCatName.trim(),
      slug: generatedSlug,
      description: newCatDesc.trim() || undefined,
      is_active: true,
    });
    setCreatingCat(false);

    if (res.success && res.data) {
      const createdCategory = res.data;
      setCategories((prev) => {
        const filtered = prev.filter((c) => String(c.id) !== String(createdCategory.id));
        return [...filtered, createdCategory];
      });
      setCategoryId(String(createdCategory.id));
      setNewCatName("");
      setNewCatDesc("");
      setShowCatCreator(false);
      setCatFeedback({
        type: "success",
        message: `Category "${createdCategory.name}" created and assigned!`,
      });
      setTimeout(() => setCatFeedback(null), 4000);

      // Notify Navbar, products page, and other components in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("categoryUpdated", { detail: createdCategory }));
      }
    } else {
      setCatFeedback({
        type: "error",
        message: res.error || "Failed to create category",
      });
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !categoryId) {
      setErrorMsg("Product Title, SKU, and Category Assignment are mandatory.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Build specifications dictionary
    const specsDict: Record<string, string> = {};
    specsList.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsDict[s.key.trim()] = s.value.trim();
      }
    });

    const payload: any = {
      name: formatProductName(name.trim()),
      sku: sku.trim().toUpperCase(),
      category: Number(categoryId),
      category_id: Number(categoryId),
      short_description: shortDesc.trim(),
      description: desc.trim(),
      material: material.trim() || null,
      dimensions: dimensions.trim() || null,
      color: color.trim() || null,
      minimum_order_quantity: moq ? parseInt(moq, 10) : null,
      price: price ? parseFloat(price) : null,
      price_display: priceDisplay.trim() || null,
      price_visibility: priceVisibility,
      is_featured: isFeatured,
      is_active: isActive,
      specifications: specsDict,
      verification_status: "verified",
      // Include all images for automatic database creation
      images: images.map((img, i) => ({
        secure_url: img.url,
        is_primary: img.isPrimary,
        display_order: i,
        alt_text: name.trim(),
      })),
    };

    const res = await ownerSaveProduct(
      isEdit && initialProduct ? initialProduct.id : null,
      payload
    );
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Product "${name}" ${isEdit ? "updated" : "created"} successfully!`);
      setTimeout(() => {
        router.push("/owner/products");
      }, 1000);
    } else {
      setErrorMsg(res.error || "Failed to save product.");
    }
  };

  // Primary image for live preview
  const primaryPreviewImg =
    images.find((img) => img.isPrimary)?.url ||
    (images.length > 0 ? images[0].url : "/placeholder-product.svg");

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl pb-16">
      {/* Top Header Strip with Live Actions */}
      <div className="bg-[#FFFFFF] p-4 rounded-md border border-[#DFE6EE] shadow-2xs flex flex-wrap items-center justify-between gap-3 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/products"
            className="text-xs font-semibold text-[#121418] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-[#353C45] font-medium">
            Status:{" "}
            <strong className={isActive ? "text-[#217A4B]" : "text-amber-600"}>
              {isActive ? "Public Catalogue" : "Draft (Hidden)"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="bg-[#EDF1F6] hover:bg-slate-200 text-[#121418] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#DFE6EE]"
          >
            {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showLivePreview ? "Hide Live Card" : "Preview Live Card"}</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#121418] hover:bg-[#2A2F37] text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEdit ? (
              <span>Update Product</span>
            ) : (
              <span>Publish Product</span>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2 anim-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-md text-[#217A4B] text-xs flex items-center gap-2 anim-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Sections (8 Cols) + Live Interactive Preview (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Dynamic Builder Form */}
        <div className={`space-y-6 ${showLivePreview ? "lg:col-span-8" : "lg:col-span-12"}`}>
          {/* Section 1: Basic Identity & Dynamic Category */}
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

          {/* Section 2: Pricing, MOQ & B2B Visibility */}
          <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
              <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#353C45]" />
                <span>2. Commercial Pricing & Minimum Order Quantity</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="field-numeric-price-inr" className="block font-semibold text-[#121418] mb-1">
                  Numeric Price (INR)
                </label>
                <input id="field-numeric-price-inr"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 225.00"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none font-bold text-[#121418]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#121418]">Price Display Tag</label>
                  <button
                    type="button"
                    onClick={autoSuggestPriceDisplay}
                    className="text-[10px] font-bold text-[#353C45] hover:underline"
                    title="Auto-format display price"
                  >
                    Auto-Format
                  </button>
                </div>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={(e) => setPriceDisplay(e.target.value)}
                  placeholder="e.g. ₹ 225 / Roll"
                      aria-label="Price label"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label htmlFor="field-minimum-order-moq" className="block font-semibold text-[#121418] mb-1">
                  Minimum Order (MOQ)
                </label>
                <input id="field-minimum-order-moq"
                  type="number"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            {/* Visibility Mode */}
            <div className="pt-2 text-xs">
              <label className="block font-semibold text-[#121418] mb-1.5">
                B2B Price Display Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriceVisibility(true)}
                  className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                    priceVisibility
                      ? "bg-[#121418] text-white border-[#121418]"
                      : "bg-[#EDF1F6] text-[#353C45] border-[#DFE6EE] hover:bg-slate-200"
                  }`}
                >
                  Show Live B2B Price
                </button>
                <button
                  type="button"
                  onClick={() => setPriceVisibility(false)}
                  className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                    !priceVisibility
                      ? "bg-[#121418] text-white border-[#121418]"
                      : "bg-[#EDF1F6] text-[#353C45] border-[#DFE6EE] hover:bg-slate-200"
                  }`}
                >
                  Price on Request (Hide Live Rate)
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Physical & Material Highlights */}
          <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE6EE] pb-3">
              <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
                <Box className="w-4 h-4 text-[#353C45]" />
                <span>3. Physical Specifications & Dimensions</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="field-primary-material" className="block font-semibold text-[#121418] mb-1">Primary Material</label>
                <input id="field-primary-material"
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Polyester / Satin"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label htmlFor="field-dimensions-gauge" className="block font-semibold text-[#121418] mb-1">Dimensions / Gauge</label>
                <input id="field-dimensions-gauge"
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 20 mm x 100 m"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label htmlFor="field-color-finish" className="block font-semibold text-[#121418] mb-1">Color / Finish</label>
                <input id="field-color-finish"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Royal Blue"
                  className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-[#FFFFFF] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Technical Specifications Builder with Presets */}
          <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#DFE6EE] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE6EE] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#121418] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#353C45]" />
                  <span>4. Dynamic Technical Specification Key-Values</span>
                </h2>
                <p className="text-[11px] text-[#353C45] mt-0.5">
                  Appears in detailed product technical table on public pages.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs font-bold text-[#353C45] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>

            {/* Quick Presets Injector */}
            <div className="p-3 bg-[#EDF1F6] border border-[#DFE6EE] rounded-md space-y-1.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em] block">
                Quick Industrial Spec Presets (Click to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SPEC_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] font-semibold bg-[#FFFFFF] border border-[#DFE6EE] hover:border-[#121418] hover:text-[#121418] text-[#121418] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-[#353C45]" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Key-Value Pair Inputs */}
            <div className="space-y-2.5">
              {specsList.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Attribute name (e.g. GSM / Voltage)"
                      aria-label="Attribute name"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    className="w-2/5 bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3 py-2 outline-none font-semibold text-[#121418]"
                  />
                  <input
                    type="text"
                    placeholder="Specification value (e.g. 180 GSM)"
                      aria-label="Attribute value"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    className="w-3/5 bg-[#EDF1F6] border border-[#DFE6EE] rounded-lg px-3 py-2 outline-none text-[#121418]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-slate-400 hover:text-red-600 p-1.5 transition-colors shrink-0"
                    title="Remove attribute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Cloudinary Image Upload & Media Management */}
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
        </div>

        {/* Right Column: Live Interactive Public Preview (4 Cols) */}
        {showLivePreview && (
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-[#121418] text-white p-4 rounded-lg shadow-md space-y-3 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <span className="text-[11px] font-bold text-[#353C45] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Public Preview</span>
                </span>
                <span className="text-[10px] text-slate-400">Catalogue Card</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                This shows exactly how customers see this item in the public store grid.
              </p>

              {/* Live Rendered Product Card */}
              <div className="bg-[#FFFFFF] rounded-md overflow-hidden shadow-lg border border-slate-200 text-[#121418]">
                {/* Image Stage */}
                <div className="relative w-full pt-[100%] bg-[#EDF1F6] border-b border-[#DFE6EE]">
                  {primaryPreviewImg ? (
                    <img
                      src={primaryPreviewImg}
                      alt={name || "Product Preview"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                      }}
                      className="absolute inset-0 w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-slate-400">
                      <Box className="w-10 h-10 stroke-[1.5] mb-1 text-slate-300" />
                      <span className="text-[10px] font-semibold text-slate-400">
                        Asset Preview
                      </span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isFeatured && (
                      <span className="bg-[#121418] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-2xs">
                        Featured
                      </span>
                    )}
                    <span className="bg-[#217A4B] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>

                  {/* SKU Pill */}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs border border-slate-200 text-[#121418] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs max-w-[85%] truncate">
                    {sku || "SKU-AUTO"}
                  </div>
                </div>

                {/* Content details */}
                <div className="p-3 space-y-2">
                  <div>
                    <span className="text-[9px] font-semibold text-[#353C45] block truncate">
                      {activeCategory?.name || "Uncategorized"}
                    </span>
                    <h3 className="text-xs font-bold text-[#121418] line-clamp-2 leading-snug min-h-[2rem]">
                      {name || "Untitled Product"}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {material && (
                      <span className="text-[9px] bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                        {material}
                      </span>
                    )}
                    {dimensions && (
                      <span className="text-[9px] bg-[#EDF1F6] text-[#121418] border border-[#DFE6EE] px-1.5 py-0.5 rounded font-medium truncate max-w-full">
                        {dimensions}
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-[#EDF1F6] flex items-baseline justify-between">
                    <div>
                      <span className="text-[8px] uppercase font-bold text-[#353C45] block">
                        B2B Trade Price
                      </span>
                      <span className="text-xs font-extrabold text-[#121418] block truncate">
                        {!priceVisibility
                          ? "Price on Request"
                          : priceDisplay ||
                            (price ? `₹ ${Number(price).toLocaleString("en-IN")}` : "Price on Request")}
                      </span>
                    </div>

                    {moq && (
                      <span className="text-[9px] text-slate-500 font-semibold">
                        MOQ: {moq}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold py-1 rounded-md border border-[#DFE6EE] text-[#121418] text-center bg-[#EDF1F6]">
                      Details
                    </span>
                    <span className="text-[10px] font-bold py-1 rounded-md bg-[#121418] text-white text-center shadow-2xs">
                      Quote
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Summary Stats */}
              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Custom Attributes:</span>
                  <strong className="text-white">
                    {specsList.filter((s) => s.key && s.value).length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Gallery Images:</span>
                  <strong className="text-white">{images.length}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Publish Bar */}
      <div className="pt-4 border-t border-[#DFE6EE] flex items-center justify-between">
        <Link
          href="/owner/products"
          className="text-xs font-semibold text-[#353C45] hover:text-[#121418]"
        >
          Cancel & Return
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#121418] hover:bg-[#2A2F37] text-white px-8 py-3 rounded-md font-bold text-xs tracking-wide transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : isEdit ? (
            <span>Update Product</span>
          ) : (
            <span>Publish Product to Catalogue</span>
          )}
        </button>
      </div>
    </form>
  );
}
