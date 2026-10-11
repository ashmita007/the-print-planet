"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#C0392B] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#C0392B] uppercase tracking-wider">
            Operational Error
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D]">Something Went Wrong</h1>
          <p className="text-xs text-[#687586] leading-relaxed">
            An unexpected error occurred while communicating with the service. Please retry the request.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs font-bold">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-[#17365D] hover:bg-[#102742] text-white py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Request
          </button>
          <Link
            href="/"
            className="border border-[#DCE3EB] text-[#263445] hover:bg-[#F5F7FA] py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
