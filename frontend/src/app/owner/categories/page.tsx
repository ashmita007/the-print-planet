"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import {
  ownerGetCategories,
  ownerSaveCategory,
  ownerDeleteCategory,
} from "@/lib/api";
import { Category } from "@/lib/types";
import ConfirmModal from "@/components/owner/ConfirmModal";


export default function OwnerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCats = async () => {
    setLoading(true);
    const res = await ownerGetCategories();
    setCategories(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const startCreate = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setErrorMsg("");
  };

  const startEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setErrorMsg("");
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setErrorMsg("");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isCreating || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setStatusMsg("");

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      display_order: Number(displayOrder) || 0,
      is_active: isActive,
    };

    const res = await ownerSaveCategory(editingCategory ? editingCategory.id : null, payload);
    setSubmitting(false);

    if (res.success) {
      setStatusMsg(`Category ${editingCategory ? "updated" : "created"} successfully!`);
      cancelForm();
      fetchCats();
      setTimeout(() => setStatusMsg(""), 3000);
    } else {
      setErrorMsg(res.error || "Failed to save category.");
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const ok = await ownerDeleteCategory(confirmDelete.id);
    setConfirmDelete(null);
    if (ok) {
      fetchCats();
    } else {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Catalogue Structure
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D]">
            Category Management ({categories.length})
          </h1>
        </div>

        {!isCreating && !editingCategory && (
          <button
            type="button"
            onClick={startCreate}
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Category</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Inline Create/Edit Form */}
      {(isCreating || editingCategory) && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#17365D] shadow-md space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-3">
            <h2 className="font-bold text-sm text-[#17365D]">
              {isCreating ? "Create New Category" : `Edit Category: ${editingCategory?.name}`}
            </h2>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#263445] mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Color ID Card Lanyard Roll"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">Custom Slug (Optional)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="color-id-card-lanyard-roll"
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263445] mb-1">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263445] mb-1">Category Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of products and materials in this group..."
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-lg px-3 py-2 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263445]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#17365D] w-4 h-4"
              />
              <span>Active in Public Menu & Catalogue</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 rounded-lg border border-[#DCE3EB] text-slate-600 font-semibold hover:bg-[#F5F7FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#E87832] hover:bg-[#d66b28] text-white px-5 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#263445]">
          <thead className="bg-[#F8FAFC] border-b border-[#DCE3EB] text-[11px] font-bold text-[#687586] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Active Products</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE3EB]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Loading categories...
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5F7FA]">
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {c.display_order}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#17365D]">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {c.slug}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {c.products_count} products
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.is_active ? "bg-green-100 text-[#217A4B]" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="p-1 text-slate-600 hover:text-[#E87832]"
                        title="Edit category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ id: c.id, name: c.name })}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Catalogue Category"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}"? Any linked products will have their category unlinked.`}
        confirmLabel="Delete Category"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={executeDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
