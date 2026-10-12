"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { ownerGetProducts, ownerDeleteProduct, ownerGetCategories } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import ConfirmModal from "@/components/owner/ConfirmModal";

export default function OwnerProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await ownerGetProducts({
      search,
      category: selectedCategory,
      page: currentPage,
    });
    setProducts(res.results);
    setTotalCount(res.count);
    setLoading(false);
  };

  useEffect(() => {
    ownerGetCategories().then((res) => setCategories(res));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setDeletingId(id);
    const success = await ownerDeleteProduct(id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (success) {
      fetchProducts();
    } else {
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Catalogue Management
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D]">Products ({totalCount})</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/owner/products/new"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/owner/import"
            className="bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk CSV/JSON Import</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by SKU, product name, or material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg pl-8 pr-12 py-2 text-xs outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#17365D] text-white px-2.5 py-1 rounded text-[11px] font-semibold"
          >
            Find
          </button>
        </form>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <label className="text-[#687586] font-semibold">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs outline-none"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#263445]">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE3EB] text-[11px] font-bold text-[#687586] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Trade Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const img =
                    p.primary_image?.secure_url ||
                    (p.images && p.images.length > 0 ? p.images[0].secure_url : null);
                  return (
                    <tr key={p.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F8FAFC] border border-[#DCE3EB] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          {img ? (
                            <img src={img} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-bold text-[#17365D] line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p.material || "Standard"} • {p.dimensions || "CR-80"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {p.category.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#17365D]">
                        {p.price_display || (p.price ? `₹ ${p.price}` : "On Request")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.is_active ? "bg-[#217A4B]" : "bg-slate-300"
                            }`}
                          />
                          <span className="text-[11px] font-medium text-slate-600">
                            {p.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1 text-slate-400 hover:text-[#17365D]"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/owner/products/${p.id}/edit`}
                            className="p-1 text-slate-600 hover:text-[#E87832]"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                            disabled={deletingId === p.id}
                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 24 && (
          <div className="p-4 border-t border-[#DCE3EB] bg-[#F8FAFC] flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {Math.ceil(totalCount / 24)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-[#DCE3EB] rounded font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage * 24 >= totalCount}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-[#DCE3EB] rounded font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Industrial Product"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}"? All associated technical specifications and media links will be removed.`}
        confirmLabel={deletingId ? "Deleting..." : "Delete Permanently"}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={executeDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
