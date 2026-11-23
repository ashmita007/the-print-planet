"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useRouter,
} from "next/navigation";
import Link from "next/link";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import {
  ownerSaveProduct,
  ownerGetCategories,
  ownerSaveCategory,
  ownerUploadImage,
} from "@/lib/api";
import {
  Product,
  Category,
  ProductSavePayload,
} from "@/lib/types";
import {
  formatProductName,
} from "@/lib/formatters";
import IdentitySection from "./product-form/IdentitySection";
import PricingSection from "./product-form/PricingSection";
import StockTaxSection from "./product-form/StockTaxSection";
import MaterialSection from "./product-form/MaterialSection";
import SpecsSection from "./product-form/SpecsSection";
import MediaSection from "./product-form/MediaSection";
import LivePreview from "./product-form/LivePreview";
import {
  SPEC_PRESETS,
} from "./product-form/shared";

interface ProductFormProps {
  initialProduct?: Product | null;
  isEdit?: boolean;
}

// Preset technical specification packages for industrial ID lines

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
  const [stock, setStock] = useState<string>(
    initialProduct?.stock_quantity === null || initialProduct?.stock_quantity === undefined ? "" : String(initialProduct.stock_quantity)
  );
  const [gstRate, setGstRate] = useState<string>(initialProduct?.gst_rate ?? "");
  const [hsnCode, setHsnCode] = useState<string>(initialProduct?.hsn_code ?? "");
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

    const payload: ProductSavePayload = {
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
      stock_quantity: stock.trim() === "" ? null : parseInt(stock, 10),
      gst_rate: gstRate.trim() === "" ? null : gstRate.trim(),
      hsn_code: hsnCode,
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
          <IdentitySection
            name={name}
            setName={setName}
            setShowCatCreator={setShowCatCreator}
            showCatCreator={showCatCreator}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            catFeedback={catFeedback}
            setCatFeedback={setCatFeedback}
            newCatName={newCatName}
            setNewCatName={setNewCatName}
            newCatDesc={newCatDesc}
            setNewCatDesc={setNewCatDesc}
            handleCreateCategory={handleCreateCategory}
            creatingCat={creatingCat}
            generateDynamicSKU={generateDynamicSKU}
            sku={sku}
            setSku={setSku}
            isActive={isActive}
            setIsActive={setIsActive}
            isFeatured={isFeatured}
            setIsFeatured={setIsFeatured}
            shortDesc={shortDesc}
            setShortDesc={setShortDesc}
            desc={desc}
            setDesc={setDesc}
          />

          {/* Section 2: Pricing, MOQ & B2B Visibility */}
          <PricingSection
            price={price}
            setPrice={setPrice}
            autoSuggestPriceDisplay={autoSuggestPriceDisplay}
            priceDisplay={priceDisplay}
            setPriceDisplay={setPriceDisplay}
            moq={moq}
            setMoq={setMoq}
            setPriceVisibility={setPriceVisibility}
            priceVisibility={priceVisibility}
          />

          <StockTaxSection stock={stock} setStock={setStock} gstRate={gstRate} setGstRate={setGstRate} hsnCode={hsnCode} setHsnCode={setHsnCode} />

          {/* Section 3: Physical & Material Highlights */}
          <MaterialSection
            material={material}
            setMaterial={setMaterial}
            dimensions={dimensions}
            setDimensions={setDimensions}
            color={color}
            setColor={setColor}
          />

          {/* Section 4: Dynamic Technical Specifications Builder with Presets */}
          <SpecsSection
            handleAddSpec={handleAddSpec}
            handleApplyPreset={handleApplyPreset}
            specsList={specsList}
            handleSpecChange={handleSpecChange}
            handleRemoveSpec={handleRemoveSpec}
          />

          {/* Section 5: Cloudinary Image Upload & Media Management */}
          <MediaSection
            images={images}
            setIsDragging={setIsDragging}
            handleDrop={handleDrop}
            isDragging={isDragging}
            handleFileUpload={handleFileUpload}
            uploadingImage={uploadingImage}
            imageUrlInput={imageUrlInput}
            setImageUrlInput={setImageUrlInput}
            handleAddImageUrl={handleAddImageUrl}
            handleSetPrimaryImage={handleSetPrimaryImage}
            handleRemoveImage={handleRemoveImage}
          />
        </div>

        {/* Right Column: Live Interactive Public Preview (4 Cols) */}
        {showLivePreview && (
          <LivePreview
            primaryPreviewImg={primaryPreviewImg}
            name={name}
            isFeatured={isFeatured}
            sku={sku}
            activeCategory={activeCategory}
            material={material}
            dimensions={dimensions}
            priceVisibility={priceVisibility}
            priceDisplay={priceDisplay}
            price={price}
            moq={moq}
            specsList={specsList}
            images={images}
          />
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
