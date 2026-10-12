"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  basePath: string;
  queryParams?: Record<string, string | number | undefined | null>;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 24,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build query string for a specific page number
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && key !== "page") {
        params.set(key, String(val));
      }
    });
    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // Generate visible page numbers with smart ellipsis
  const getPageNumbers = () => {
    const delta = 1; // Number of pages around current
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (typeof i === "number") {
        if (l !== undefined) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
    }

    return rangeWithDots;
  };

  const startItem = totalCount ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalCount ? Math.min(currentPage * pageSize, totalCount) : undefined;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 sm:pt-8 border-t border-[#DCE3EB]"
    >
      {/* Item Range Counter */}
      {totalCount !== undefined && totalCount > 0 ? (
        <p className="text-xs text-[#687586] text-center sm:text-left order-2 sm:order-1 font-medium">
          Showing <span className="font-bold text-[#17365D]">{startItem}</span>–
          <span className="font-bold text-[#17365D]">{endItem}</span> of{" "}
          <span className="font-bold text-[#17365D]">{totalCount}</span> products
        </p>
      ) : (
        <p className="text-xs text-[#687586] text-center sm:text-left order-2 sm:order-1 font-medium">
          Page <span className="font-bold text-[#17365D]">{currentPage}</span> of{" "}
          <span className="font-bold text-[#17365D]">{totalPages}</span>
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2">
        {/* First Page (Desktop) */}
        {totalPages > 3 && (
          <Link
            href={getPageUrl(1)}
            aria-label="Go to first page"
            className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center transition-colors border ${
              hasPrevious
                ? "bg-white border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:text-[#17365D]"
                : "bg-[#F8FAFC] border-slate-200 text-slate-300 pointer-events-none"
            }`}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Previous Button */}
        <Link
          href={hasPrevious ? getPageUrl(currentPage - 1) : "#"}
          aria-label="Previous page"
          className={`flex items-center gap-1 px-2.5 sm:px-3 h-8 rounded-lg text-xs font-semibold transition-colors border ${
            hasPrevious
              ? "bg-white border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:text-[#17365D] shadow-2xs"
              : "bg-[#F8FAFC] border-slate-200 text-slate-300 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Link>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((num, idx) => {
            if (num === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-8 flex items-center justify-center text-xs text-slate-400 font-bold select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = num as number;
            const isCurrent = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={getPageUrl(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  isCurrent
                    ? "bg-[#17365D] text-white shadow-xs border border-[#17365D]"
                    : "bg-white border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:border-slate-300 hover:text-[#17365D]"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        <Link
          href={hasNext ? getPageUrl(currentPage + 1) : "#"}
          aria-label="Next page"
          className={`flex items-center gap-1 px-2.5 sm:px-3 h-8 rounded-lg text-xs font-semibold transition-colors border ${
            hasNext
              ? "bg-white border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:text-[#17365D] shadow-2xs"
              : "bg-[#F8FAFC] border-slate-200 text-slate-300 pointer-events-none"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* Last Page (Desktop) */}
        {totalPages > 3 && (
          <Link
            href={getPageUrl(totalPages)}
            aria-label="Go to last page"
            className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center transition-colors border ${
              hasNext
                ? "bg-white border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] hover:text-[#17365D]"
                : "bg-[#F8FAFC] border-slate-200 text-slate-300 pointer-events-none"
            }`}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </nav>
  );
}
