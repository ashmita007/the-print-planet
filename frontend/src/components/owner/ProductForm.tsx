"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  ownerSaveProduct,
  ownerGetCategories,
  ownerUploadImage,
} from "@/lib/api";
import { Product, Category, ProductImage } from "@/lib/types";

interface ProductFormProps {
  initialProduct?: Product | null;
  isEdit?: boolean;
}

export default function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initialProduct?.name || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [categoryId, setCategoryId] = useState<number | string>(
    initialProduct?.category?.id || ""
  );
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || "");
  const [desc, setDesc] = useState(initialProduct?.description || "");
  const [material, setMaterial] = useState(initialProduct?.material || "");
  const [dimensions, setDimensions] = useState(initialProduct?.dimensions || "");
  const [color, setColor] = useState(initialProduct?.color || "");
  const [moq, setMoq] = useState<string>(
    initialProduct?.minimum_order_quantity ? String(initialProduct.minimum_order_quantity) : ""
  );
  const [price, setPrice] = useState<string>(
    initialProduct?.price ? String(initialProduct.price) : ""
  );
  const [priceDisplay, setPriceDisplay] = useState(initialProduct?.price_display || "");
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isActive, setIsActive] = useState(
    initialProduct !== undefined && initialProduct !== null ? initialProduct.is_active : true
  );

  // Specifications key-value pairs
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>(() => {
    if (initialProduct?.specifications) {
      return Object.entries(initialProduct.specifications).map(([key, value]) => ({
        key,
        value,
      }));
    }
    return [
      { key: "Material", value: "Polyester / PVC" },
      { key: "Standard", value: "ISO CR-80 Compliant" },
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

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    ownerGetCategories().then((res) => {
      setCategories(res);
      if (!categoryId && res.length > 0) {
        setCategoryId(res[0].id);
      }
    });
  }, []);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg("");
    const res = await ownerUploadImage(file);
    setUploadingImage(false);

    if (res.success && res.secure_url) {
      setImages([...images, { url: res.secure_url, isPrimary: images.length === 0 }]);
    } else {
      setErrorMsg(res.error || "Image upload failed.");
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, { url: imageUrlInput.trim(), isPrimary: images.length === 0 }]);
    setImageUrlInput("");
  };

  const handleSetPrimaryImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !categoryId) {
      setErrorMsg("Product name, SKU, and Category are mandatory.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Build specs dict
    const specsDict: Record<string, string> = {};
    specsList.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsDict[s.key.trim()] = s.value.trim();
      }
    });

    const payload: any = {
      name,
      sku,
      category: Number(categoryId),
      short_description: shortDesc,
      description: desc,
      material: material || null,
      dimensions: dimensions || null,
      color: color || null,
      minimum_order_quantity: moq ? parseInt(moq, 10) : null,
      price: price ? parseFloat(price) : null,
      price_display: priceDisplay || null,
      is_featured: isFeatured,
      is_active: isActive,
      specifications: specsDict,
      verification_status: "verified",
    };

    const res = await ownerSaveProduct(isEdit && initialProduct ? initialProduct.id : null, payload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Product ${isEdit ? "updated" : "created"} successfully!`);
      setTimeout(() => {
        router.push("/owner/products");
      }, 1000);
    } else {
      setErrorMsg(res.error || "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-4">
        <Link
          href="/owner/products"
          className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products List
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
          1. Basic Product Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              Public Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 20MM Indian Royal Blue Colour Satin Lanyard Roll"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. LAN-RB-20M"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              Category Assignment *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263445]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#17365D] w-4 h-4"
              />
              <span>Active in Public Catalogue</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263445]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-[#E87832] w-4 h-4"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-semibold text-[#263445] mb-1">
            Short Description / Subtitle
          </label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Single-line commercial summary"
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <div className="text-xs">
          <label className="block font-semibold text-[#263445] mb-1">
            Comprehensive Product Description
          </label>
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Full material specification, application in conferences, exhibitions, schools..."
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none resize-none"
          />
        </div>
      </div>

      {/* Section 2: Pricing & Technical Attributes */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
          2. Commercial & Physical Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              Price (Numeric INR)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 300.00"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              Price Display Label
            </label>
            <input
              type="text"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              placeholder="e.g. ₹ 300 / Roll"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">
              Minimum Order Quantity (MOQ)
            </label>
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#263445] mb-1">Material</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Polyester / PVC"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">Dimensions</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 20 mm x 100 m"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">Color / Finish</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Royal Blue / Crystal Clear"
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Dynamic Technical Specifications Builder */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
            3. Detailed Specifications (Key-Value Pairs)
          </h2>
          <button
            type="button"
            onClick={handleAddSpec}
            className="text-xs font-bold text-[#E87832] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Attribute
          </button>
        </div>

        <div className="space-y-2.5">
          {specsList.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <input
                type="text"
                placeholder="Attribute name (e.g. Roll Length)"
                value={spec.key}
                onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                className="w-2/5 bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 outline-none font-semibold text-[#263445]"
              />
              <input
                type="text"
                placeholder="Specification value (e.g. 100 m)"
                value={spec.value}
                onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                className="w-3/5 bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="text-slate-400 hover:text-red-600 p-1"
                title="Remove attribute"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Cloudinary & Media Uploads */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
          4. Product Assets (Cloudinary Storage)
        </h2>

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border-2 border-dashed border-[#DCE3EB] rounded-xl text-center space-y-2 bg-[#F8FAFC]">
            <Upload className="w-6 h-6 text-[#17365D] mx-auto" />
            <div>
              <label className="font-bold text-[#17365D] cursor-pointer hover:underline">
                Upload image file (Cloudinary)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WebP up to 10MB</p>
            </div>
            {uploadingImage && <p className="text-[#E87832] font-semibold">Uploading to Cloudinary...</p>}
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl space-y-2">
            <span className="font-bold text-[#263445] block">Or Add Image Direct URL</span>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/product.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 bg-white border border-[#DCE3EB] rounded-lg px-3 py-1.5 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-[#17365D] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#102742]"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Images List */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative bg-[#F8FAFC] border rounded-xl p-2 flex flex-col items-center gap-2 ${
                  img.isPrimary ? "border-[#17365D] ring-2 ring-[#17365D]/20" : "border-[#DCE3EB]"
                }`}
              >
                <div className="w-full pt-[100%] relative rounded overflow-hidden bg-white border border-slate-200">
                  <img
                    src={img.url}
                    alt={`Product asset ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex items-center justify-between w-full text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    className={`flex items-center gap-1 font-semibold ${
                      img.isPrimary ? "text-[#E87832]" : "text-slate-500 hover:text-[#17365D]"
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    {img.isPrimary ? "Primary" : "Set Primary"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#E87832] hover:bg-[#d66b28] text-white px-8 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? "Saving Changes..." : isEdit ? "Save Product Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
