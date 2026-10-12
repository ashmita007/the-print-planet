import React from "react";
import Link from "next/link";
import { Filter, Layers, ArrowUpDown, Search, RotateCcw, Box } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategories, getProducts } from "@/lib/api";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    material?: string;
    color?: string;
    ordering?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      category: params.category,
      search: params.search,
      material: params.material,
      color: params.color,
      ordering: params.ordering,
      page: currentPage,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);
  const totalPages = Math.ceil(productsData.count / 24);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Product Catalogue", href: "/products" },
          ...(activeCategory ? [{ label: activeCategory.name }] : []),
        ]}
      />

      {/* Header Banner */}
      <div className="bg-[#102742] rounded-2xl p-6 sm:p-8 text-white border-l-4 border-[#E87832] shadow-sm">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Industrial Wholesale Catalogue
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {activeCategory ? activeCategory.name : "All Products & Equipment"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeCategory
              ? activeCategory.description
              : "Complete inventory of ID card holders, color satin rolls, metal clips, dog hooks, punching machinery, and RFID cards."}
          </p>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6 bg-[#F5F7FA] p-5 rounded-xl border border-[#DCE3EB]">
          <div className="flex items-center justify-between border-b border-[#DCE3EB] pb-3">
            <span className="font-bold text-sm text-[#17365D] flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#E87832]" /> Filter Catalogue
            </span>
            {(params.category || params.search || params.material || params.color || params.ordering) && (
              <Link
                href="/products"
                className="text-[11px] text-[#C0392B] font-semibold flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </Link>
            )}
          </div>

          {/* Search Filter Form */}
          <form method="get" action="/products" className="space-y-3">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <label className="block text-xs font-bold text-[#263445]">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={params.search || ""}
                placeholder="Model code, size..."
                className="w-full bg-white border border-[#DCE3EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#263445] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Categories Filter List */}
          <div>
            <label className="block text-xs font-bold text-[#263445] mb-2">Category Filter</label>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 text-xs">
              <Link
                href={`/products${params.search ? `?search=${encodeURIComponent(params.search)}` : ""}`}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                  !params.category ? "bg-[#17365D] text-white font-bold" : "text-[#263445] hover:bg-white"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] opacity-75">All</span>
              </Link>
              {categories.map((c) => {
                const isSelected = params.category === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                      isSelected
                        ? "bg-[#17365D] text-white font-bold"
                        : "text-[#263445] hover:bg-white"
                    }`}
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? "bg-white/20" : "bg-slate-200"}`}>
                      {c.products_count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <section className="lg:col-span-9 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EB] flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[#687586]">
              Showing <strong className="text-[#17365D]">{productsData.results.length}</strong> of{" "}
              <strong className="text-[#17365D]">{productsData.count}</strong> products
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#687586]">Sort by:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: "Default", val: "display_order" },
                  { label: "Price: Low to High", val: "price" },
                  { label: "Price: High to Low", val: "-price" },
                  { label: "Name", val: "name" },
                ].map((s) => (
                  <Link
                    key={s.val}
                    href={`/products?${new URLSearchParams({
                      ...(params.category ? { category: params.category } : {}),
                      ...(params.search ? { search: params.search } : {}),
                      ordering: s.val,
                    }).toString()}`}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      (params.ordering || "display_order") === s.val
                        ? "bg-[#17365D] text-white font-bold"
                        : "bg-[#F5F7FA] text-[#263445] hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {productsData.results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-5">
              {productsData.results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#DCE3EB] rounded-2xl p-12 text-center space-y-4">
              <Box className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
              <div>
                <h3 className="text-base font-bold text-[#17365D]">No products found matching filters</h3>
                <p className="text-xs text-[#687586] mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords or clearing active filters to view all available reference products.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-block bg-[#17365D] text-white text-xs font-bold py-2.5 px-5 rounded-lg hover:bg-[#102742] transition-colors"
              >
                Reset All Filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <Link
                  key={pNum}
                  href={`/products?${new URLSearchParams({
                    ...(params.category ? { category: params.category } : {}),
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.ordering ? { ordering: params.ordering } : {}),
                    page: pNum.toString(),
                  }).toString()}`}
                  className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    currentPage === pNum
                      ? "bg-[#17365D] text-white shadow-xs"
                      : "bg-white border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA]"
                  }`}
                >
                  {pNum}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
