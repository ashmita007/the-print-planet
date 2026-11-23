"use client";

import Link from "next/link";

// Shown inside the storefront layout (header and footer stay) when a page's data could not be loaded.
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-extrabold text-[#121418]">This page did not load</h1>
        <p className="text-sm text-[#353C45] leading-relaxed">
          Our catalogue is busy right now. The page you asked for is fine; please try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm font-bold pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] min-h-11 px-5 rounded-md transition-colors"
          >
            Try again
          </button>
          <Link
            href="/products"
            className="border border-[#DFE6EE] text-[#121418] hover:bg-[#EDF1F6] min-h-11 px-5 rounded-md inline-flex items-center justify-center transition-colors"
          >
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}
