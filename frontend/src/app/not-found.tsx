import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#E87832] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#E87832] uppercase tracking-wider">
            404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-[#17365D]">Page or Model Not Found</h1>
          <p className="text-xs text-[#687586] leading-relaxed">
            The requested industrial catalogue page, model code, or product item may have moved or been updated.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs font-bold">
          <Link
            href="/"
            className="bg-[#17365D] hover:bg-[#102742] text-white py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
          <Link
            href="/products"
            className="border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" /> View Products
          </Link>
        </div>
      </div>
    </div>
  );
}
