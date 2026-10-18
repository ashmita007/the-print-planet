"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Copy,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  ownerGetProducts,
  ownerDeleteProduct,
  ownerGetCategories,
  ownerToggleProductStatus,
} from "@/lib/api";
import { Product, Category } from "@/lib/types";
import ConfirmModal from "@/components/owner/ConfirmModal";


export default function OwnerProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // "" | "active" | "hidden"
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await ownerGetProducts({
      search: activeSearch,
      category: selectedCategory,
      status: selectedStatus,
      page: currentPage,
      page_size: pageSize,
    });
    setProducts(res.results || []);
    setTotalCount(res.count || 0);
    setLoading(false);
  };

  useEffect(() => {
    ownerGetCategories().then((res) => setCategories(res || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeSearch, selectedCategory, selectedStatus, currentPage, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(search.trim());
  };

  const clearAllFilters = () => {
    setSearch("");
    setActiveSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(activeSearch || selectedCategory || selectedStatus);

  const handleCopySku = (sku: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = !product.is_active;
    setTogglingId(product.id);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: newStatus } : p))
    );

    const success = await ownerToggleProductStatus(product.id, newStatus);
    setTogglingId(null);

    if (success) {
      setToastMessage(
        `Product "${product.name}" is now ${newStatus ? "Active (Visible)" : "Hidden (Draft)"}.`
      );
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      // Revert optimistic update on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !newStatus } : p))
      );
      alert("Failed to update product visibility status.");
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setDeletingId(id);
    const success = await ownerDeleteProduct(id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (success) {
      setToastMessage(`Product "${name}" permanently deleted.`);
      setTimeout(() => setToastMessage(null), 3000);
      fetchProducts();
    } else {
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") : null;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${backendUrl}/api/v1/owner/export/excel/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setIsExporting(false);

      if (!res.ok) {
        alert("Failed to export Excel. Please ensure you are authenticated.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `The_Print_Planet_Catalogue_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setIsExporting(false);
      alert("An error occurred while generating the Excel export.");
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate numbered pages with sliding window
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#102742] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/20 text-xs flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-[#E87832]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#17365D]/10 text-[#17365D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Package className="w-3 h-3 text-[#E87832]" />
            <span>Industrial Inventory & Products</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#17365D] flex items-center gap-2.5">
            <span>Catalogue Management</span>
            <span className="text-xs bg-[#E87832]/10 text-[#E87832] font-bold px-2.5 py-0.5 rounded-full border border-[#E87832]/20">
              {totalCount} Items
            </span>
          </h1>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            title="Download full catalogue Excel spreadsheet"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export Excel</span>
          </button>

          <Link
            href="/owner/import"
            className="bg-[#17365D] hover:bg-[#102742] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk CSV/Excel</span>
          </Link>

          <Link
            href="/owner/products/new"
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCE3EB] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search by SKU, product name, or material specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#DCE3EB] focus:border-[#17365D] focus:bg-white rounded-xl pl-9 pr-20 py-2.5 text-xs text-[#263445] outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#17365D] hover:bg-[#102742] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl px-2.5 py-1">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-[#263445] font-medium outline-none py-1 cursor-pointer"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-[#263445] font-medium outline-none py-1 cursor-pointer"
              >
                <option value="">All Visibility</option>
                <option value="active">Active Only</option>
                <option value="hidden">Hidden / Draft</option>
              </select>
            </div>

            {/* Page Size Filter */}
            <div className="flex items-center gap-1 bg-[#F5F7FA] border border-[#DCE3EB] rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-500 font-semibold">Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-[#263445] font-bold outline-none py-1 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Clear Filters CTA */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#263445]">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE3EB] text-[11px] font-bold text-[#687586] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">B2B Trade Price</th>
                <th className="py-3.5 px-4">Store Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E87832]" />
                      <span className="text-xs font-semibold text-[#17365D]">
                        Loading catalogue inventory...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const img =
                    p.primary_image?.secure_url ||
                    (p.images && p.images.length > 0 ? p.images[0].secure_url : null);
                  const isToggling = togglingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F5F7FA]/80 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#DCE3EB] p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-[#17365D]/30 transition-colors">
                            {img ? (
                              <img
                                src={img}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <p className="font-bold text-[#17365D] line-clamp-1 group-hover:text-[#E87832] transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {p.material || "Standard Grade"}
                              {p.dimensions ? ` • ${p.dimensions}` : ""}
                              {p.color ? ` • ${p.color}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU with Copy Pill */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleCopySku(p.sku)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                          title="Click to copy SKU"
                        >
                          <span>{p.sku}</span>
                          {copiedSku === p.sku ? (
                            <Check className="w-3 h-3 text-[#217A4B]" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="bg-[#17365D]/10 text-[#17365D] px-2.5 py-1 rounded-md font-semibold text-[11px]">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Trade Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#17365D]">
                          {p.price_display || (p.price ? `₹ ${p.price}` : "On Request")}
                        </span>
                        {Boolean(p.minimum_order_quantity && p.minimum_order_quantity > 1) && (
                          <span className="block text-[10px] text-slate-400">
                            Min MOQ: {p.minimum_order_quantity}
                          </span>
                        )}
                      </td>

                      {/* Interactive Active/Hidden Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            p.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title={`Click to ${p.is_active ? "hide product" : "activate product"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.is_active ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span>{p.is_active ? "Active" : "Hidden"}</span>
                          {isToggling && <Loader2 className="w-3 h-3 animate-spin ml-0.5" />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#17365D] hover:bg-slate-100 transition-colors"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/owner/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#E87832] hover:bg-orange-50 transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                            disabled={deletingId === p.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty States */
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    {hasActiveFilters ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-[#17365D]">
                          No products found matching filters
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Try adjusting your keyword query or resetting the category and visibility filters.
                        </p>
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#E87832]/10 text-[#E87832] flex items-center justify-center mx-auto">
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-[#17365D]">
                            Your Catalogue is Clean & Ready
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1">
                            No products have been added to the store catalogue yet. Start populating your inventory by creating your first product or uploading an existing Excel/CSV catalogue.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <Link
                            href="/owner/products/new"
                            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Add First Product</span>
                          </Link>
                          <Link
                            href="/owner/import"
                            className="bg-[#17365D] hover:bg-[#102742] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Bulk Import Excel/CSV</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* World-Class Numbered Pagination Bar */}
        <div className="p-4 border-t border-[#DCE3EB] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Status summary */}
          <div className="text-slate-500 text-xs">
            Showing <strong className="text-[#17365D]">{startItem}</strong> to{" "}
            <strong className="text-[#17365D]">{endItem}</strong> of{" "}
            <strong className="text-[#17365D]">{totalCount}</strong> products
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 bg-white border border-[#DCE3EB] rounded-lg text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous */}
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 bg-white border border-[#DCE3EB] rounded-lg text-slate-700 font-semibold hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 px-1">
              {getPaginationPages().map((page, index) => {
                if (typeof page === "string") {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">
                      ...
                    </span>
                  );
                }
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    disabled={loading}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#17365D] text-white shadow-xs"
                        : "bg-white border border-[#DCE3EB] text-slate-700 hover:bg-[#F5F7FA]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 bg-white border border-[#DCE3EB] rounded-lg text-slate-700 font-semibold hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 bg-white border border-[#DCE3EB] rounded-lg text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Industrial Product"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}"? All associated technical specifications and media links will be removed from the catalogue.`}
        confirmLabel={deletingId ? "Deleting..." : "Delete Permanently"}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={executeDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
