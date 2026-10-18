"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight,
  ShieldAlert,
  Layers,
  Package,
} from "lucide-react";
import { ownerValidateBulkImport, ownerExecuteBulkImport } from "@/lib/api";


export default function BulkImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [strategy, setStrategy] = useState<"skip" | "update">("skip");

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setExecutionResult(null);
      setErrorMsg("");
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    setIsValidating(true);
    setErrorMsg("");

    const res = await ownerValidateBulkImport(selectedFile);
    setIsValidating(false);

    if (res.success) {
      setValidationResult(res.data);
    } else {
      setErrorMsg(res.error || "File validation failed.");
    }
  };

  const handleExecute = async () => {
    if (!validationResult || !validationResult.preview) return;
    setIsExecuting(true);
    setErrorMsg("");

    const rowsToImport = validationResult.preview.map((r: any) => r.raw_data);
    const res = await ownerExecuteBulkImport(rowsToImport, strategy);
    setIsExecuting(false);

    if (res.success) {
      setExecutionResult(res.data);
    } else {
      setErrorMsg(res.error || "Import execution failed.");
    }
  };

  const downloadErrorReport = () => {
    if (!validationResult?.errors?.length) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Row,SKU,Error", ...validationResult.errors.map((e: any) => `${e.row},"${e.sku || ""}","${e.error}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import-errors-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
          High-Capacity Catalog Ingestion
        </span>
        <h1 className="text-2xl font-extrabold text-[#17365D]">
          Bulk Product Import (CSV & JSON)
        </h1>
        <p className="text-xs text-[#687586] mt-1">
          Safely import reference catalogues, detect existing SKUs, preview rows, and update or skip duplicates.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Upload & Validate File */}
      <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D] border-b border-[#DCE3EB] pb-2">
          Step 1: Select Excel (.xlsx), CSV, or JSON Data File
        </h2>

        <label className="border-2 border-dashed border-[#DCE3EB] hover:border-[#17365D] hover:bg-[#F0F4F8] rounded-2xl p-8 text-center space-y-3 bg-[#F8FAFC] transition-all cursor-pointer block select-none group">
          <input
            type="file"
            accept=".xlsx,.csv,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet className="w-10 h-10 text-[#17365D] mx-auto group-hover:scale-110 transition-transform" />
          <div>
            <span className="bg-[#17365D] group-hover:bg-[#102742] text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-block transition-colors shadow-xs">
              Choose Excel (.xlsx) / CSV / JSON File
            </span>
            <p className="text-[11px] text-slate-500 mt-2">
              Click anywhere in this box or select your client editable Excel workbook <code className="bg-slate-200 px-1 py-0.5 rounded">.xlsx</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">.csv</code>, or <code className="bg-slate-200 px-1 py-0.5 rounded">.json</code>
            </p>
          </div>

          {selectedFile && (
            <div className="pt-2">
              <span className="font-bold text-[#17365D] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg inline-block">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </label>

        {selectedFile && !validationResult && (
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            className="bg-[#E87832] hover:bg-[#d66b28] text-white px-6 py-2.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
          >
            {isValidating ? "Validating Columns & Detecting Duplicates..." : "Validate & Preview Rows"}
          </button>
        )}
      </div>

      {/* Step 2: Validation Preview Table */}
      {validationResult && !executionResult && (
        <div className="bg-white p-6 rounded-xl border border-[#DCE3EB] shadow-2xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE3EB] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
              Step 2: Pre-Import Inspection & Strategy
            </h2>

            {validationResult.error_count > 0 && (
              <button
                type="button"
                onClick={downloadErrorReport}
                className="text-[#C0392B] border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Error Report ({validationResult.error_count})
              </button>
            )}
          </div>

          {/* Validation Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB]">
              <span className="text-[11px] text-slate-500 font-semibold block">Total Rows</span>
              <strong className="text-xl font-black text-[#17365D]">{validationResult.total_rows}</strong>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-[11px] text-[#217A4B] font-semibold block">New Products</span>
              <strong className="text-xl font-black text-[#217A4B]">{validationResult.new_count}</strong>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-[11px] text-[#E87832] font-semibold block">Existing SKUs</span>
              <strong className="text-xl font-black text-[#E87832]">{validationResult.existing_count}</strong>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-[11px] text-[#C0392B] font-semibold block">Invalid Rows</span>
              <strong className="text-xl font-black text-[#C0392B]">{validationResult.error_count}</strong>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#DCE3EB] space-y-2">
            <span className="font-bold text-[#263445] block">Duplicate Handling Strategy:</span>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263445]">
                <input
                  type="radio"
                  name="strategy"
                  value="skip"
                  checked={strategy === "skip"}
                  onChange={() => setStrategy("skip")}
                  className="text-[#17365D]"
                />
                <span>Skip Existing (Preserve existing catalog data, only add new)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263445]">
                <input
                  type="radio"
                  name="strategy"
                  value="update"
                  checked={strategy === "update"}
                  onChange={() => setStrategy("update")}
                  className="text-[#17365D]"
                />
                <span>Update Existing (Overwrite matching SKUs with new specs)</span>
              </label>
            </div>
          </div>

          {/* Preview Rows Table */}
          <div className="border border-[#DCE3EB] rounded-lg overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#DCE3EB] text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationResult.preview?.map((row: any) => (
                  <tr key={row.row_index} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-400">{row.row_index}</td>
                    <td className="p-2.5 font-semibold text-[#17365D] truncate max-w-xs">{row.name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{row.sku}</td>
                    <td className="p-2.5 text-slate-600">{row.category_slug}</td>
                    <td className="p-2.5 font-bold">{row.price ? `₹ ${row.price}` : "—"}</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          row.status === "new"
                            ? "bg-green-100 text-[#217A4B]"
                            : "bg-orange-100 text-[#E87832]"
                        }`}
                      >
                        {row.status === "new" ? "New" : "Existing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setValidationResult(null)}
              className="px-4 py-2 border border-[#DCE3EB] rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel / Choose Another File
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting}
              className="bg-[#217A4B] hover:bg-[#1b633d] text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isExecuting ? "Importing to PostgreSQL Database..." : "Execute Bulk Import Now"}
              {!isExecuting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Execution Result Confirmation */}
      {executionResult && (
        <div className="bg-white p-8 rounded-xl border border-green-200 shadow-md text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-[#217A4B] mx-auto" />
          <h2 className="text-xl font-extrabold text-[#17365D]">Bulk Import Finished Successfully!</h2>
          <div className="flex justify-center gap-6 text-xs text-[#263445]">
            <div>Imported: <strong className="text-[#217A4B] text-base">{executionResult.imported_count}</strong></div>
            <div>Updated: <strong className="text-[#E87832] text-base">{executionResult.updated_count}</strong></div>
            <div>Skipped: <strong className="text-slate-500 text-base">{executionResult.skipped_count}</strong></div>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/owner/products"
              className="bg-[#17365D] hover:bg-[#102742] text-white px-6 py-2.5 rounded-lg font-bold text-xs"
            >
              View Products Table
            </Link>
            <button
              type="button"
              onClick={() => {
                setExecutionResult(null);
                setValidationResult(null);
                setSelectedFile(null);
              }}
              className="border border-[#DCE3EB] px-6 py-2.5 rounded-lg font-semibold text-xs hover:bg-[#F5F7FA]"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
