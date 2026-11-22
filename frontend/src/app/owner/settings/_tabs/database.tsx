"use client";

import { CheckCircle, AlertCircle, Database, Mail, Download, Loader2, FileSpreadsheet, CloudUpload, CloudDownload } from "lucide-react";
import type { Notice, EmailDiagnostics } from "./types";

export interface DatabaseTabProps {
  email: string;
  backupEmailLoading: boolean;
  backupDownloadLoading: boolean;
  exportCatalogLoading: boolean;
  cloudSyncLoading: boolean;
  cloudRestoreLoading: boolean;
  backupNotice: Notice | null;
  emailTestLoading: boolean;
  emailDiagnostics: EmailDiagnostics | null;
  emailTestNotice: Notice | null;
  setBackupNotice: (n: Notice | null) => void;
  handleCloudSync: (action: "backup" | "restore") => Promise<void>;
  handleEmailBackup: () => Promise<void>;
  handleTestEmail: () => Promise<void>;
  handleDownloadBackup: () => Promise<void>;
  handleExportCatalog: () => Promise<void>;
}

export default function DatabaseTab({
  email,
  backupEmailLoading,
  backupDownloadLoading,
  exportCatalogLoading,
  cloudSyncLoading,
  cloudRestoreLoading,
  backupNotice,
  emailTestLoading,
  emailDiagnostics,
  emailTestNotice,
  setBackupNotice,
  handleCloudSync,
  handleEmailBackup,
  handleTestEmail,
  handleDownloadBackup,
  handleExportCatalog,
}: DatabaseTabProps) {
  return (
    <div className="surface-card p-6 rounded-lg space-y-6 text-xs anim-fade-up">
      <div className="border-b border-[#DFE6EE] pb-4">
        <h2 className="text-sm font-semibold text-[#121418] flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          Backup &amp; recovery
        </h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Multi-sheet Excel backups containing products, categories, RFQ leads, and store configuration.
        </p>
      </div>

      {backupNotice && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
            backupNotice.type === "success"
              ? "bg-green-50 border-green-200 text-[#217A4B]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {backupNotice.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{backupNotice.text}</span>
          </div>
          <button
            onClick={() => setBackupNotice(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Email delivery diagnostics */}
      <div className="border border-[#DFE6EE] rounded-md p-4 bg-[#EDF1F6] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="p-2 bg-[#FFFFFF] border border-[#DFE6EE] text-slate-500 rounded-lg shrink-0">
              <Mail className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-semibold text-[#121418] text-xs sm:text-sm">
                Transactional email
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                RFQ alerts are delivered over HTTPS through Brevo or Resend. Run a live diagnostic to see the provider response.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={emailTestLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#121418] hover:bg-[#2A2F37] text-white rounded-lg font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            {emailTestLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>{emailTestLoading ? "Checking..." : "Test email delivery"}</span>
          </button>
        </div>

        {emailTestNotice && (
          <div
            className={`p-3 rounded-lg border text-xs font-semibold ${
              emailTestNotice.type === "success"
                ? "bg-green-50 border-green-200 text-[#217A4B]"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {emailTestNotice.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{emailTestNotice.text}</span>
            </div>
          </div>
        )}

        {emailDiagnostics && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#353C45]">Provider</div>
                <div className="font-bold text-[#121418] mt-0.5 uppercase">
                  {emailDiagnostics.config?.provider || "none"}
                </div>
              </div>
              <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#353C45]">Sender</div>
                <div className="font-bold text-[#121418] mt-0.5 truncate">
                  {emailDiagnostics.config?.active_sender_email || emailDiagnostics.config?.brevo_sender_email || emailDiagnostics.config?.resend_from_email || "Not set"}
                </div>
              </div>
              <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#353C45]">Sender Status</div>
                <div className={`font-bold mt-0.5 ${emailDiagnostics.sender_verified ? "text-[#217A4B]" : "text-red-600"}`}>
                  {emailDiagnostics.sender_verified ? "Verified" : "Not verified"}
                </div>
              </div>
            </div>
            {emailDiagnostics.resend && (
              <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium text-[#121418]">Resend</span>
                  <span>Key: {emailDiagnostics.resend.key_valid ? "valid" : "not validated"}</span>
                  <span>Domains: {emailDiagnostics.resend.domains?.length || 0}</span>
                  {emailDiagnostics.resend.sandbox && <span className="text-[#2B323B]">Sandbox sender</span>}
                </div>
                {emailDiagnostics.resend.note && (
                  <p className="text-slate-500 leading-relaxed">{emailDiagnostics.resend.note}</p>
                )}
              </div>
            )}
            {emailDiagnostics.problems && emailDiagnostics.problems.length > 0 && (
              <ul className="space-y-1 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {emailDiagnostics.problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Cloud auto-persistence */}
      <div className="border border-[#DFE6EE] rounded-md p-4 bg-[#EDF1F6] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="p-2 bg-[#FFFFFF] border border-[#DFE6EE] text-slate-500 rounded-lg shrink-0 mt-0.5">
              <CloudUpload className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-semibold text-[#121418] text-xs sm:text-sm flex items-center gap-2">
                Cloud auto-persistence
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#217A4B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#217A4B]" />
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Products, categories, and enquiries are mirrored to secure cloud storage on every change, then restored automatically on boot.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCloudSync("backup")}
              disabled={cloudSyncLoading || cloudRestoreLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121418] hover:bg-[#2A2F37] text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cloudSyncLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>{cloudSyncLoading ? "Syncing..." : "Sync now"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCloudSync("restore")}
              disabled={cloudSyncLoading || cloudRestoreLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-slate-50 text-[#121418] border border-[#DFE6EE] rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cloudRestoreLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudDownload className="w-3.5 h-3.5" />
              )}
              <span>{cloudRestoreLoading ? "Restoring..." : "Restore"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#121418] font-bold mb-1">
              <Mail className="w-4 h-4 text-[#217A4B]" />
              <span>Email Full DB Backup</span>
            </div>
            <p className="text-[11px] text-[#353C45] leading-relaxed">
              Generates a live database snapshot and emails it as an Excel attachment directly to <strong>{email || "theprintplanet01@gmail.com"}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleEmailBackup}
            disabled={backupEmailLoading}
            className="w-full bg-[#217A4B] hover:bg-[#1a623c] text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {backupEmailLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>{backupEmailLoading ? "Generating & Emailing..." : "Send DB Backup to Email"}</span>
          </button>
        </div>

        <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#121418] font-bold mb-1">
              <Download className="w-4 h-4 text-[#121418]" />
              <span>Direct DB Download</span>
            </div>
            <p className="text-[11px] text-[#353C45] leading-relaxed">
              Immediately compiles and downloads the full multi-sheet database workbook (.xlsx) to your computer.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={backupDownloadLoading}
            className="w-full bg-[#121418] hover:bg-[#2A2F37] text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {backupDownloadLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{backupDownloadLoading ? "Compiling..." : "Download DB Backup (.xlsx)"}</span>
          </button>
        </div>

        <div className="border border-[#DFE6EE] rounded-lg p-4 bg-[#EDF1F6] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#121418] font-bold mb-1">
              <FileSpreadsheet className="w-4 h-4 text-[#353C45]" />
              <span>Catalog &amp; Images Export</span>
            </div>
            <p className="text-[11px] text-[#353C45] leading-relaxed">
              Exports all catalog products with SKU, category, trade pricing, and image URLs formatted for client onboarding.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCatalog}
            disabled={exportCatalogLoading}
            className="w-full bg-[#FFFFFF] border border-[#DFE6EE] hover:bg-[#EDF1F6] text-[#121418] py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {exportCatalogLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>{exportCatalogLoading ? "Exporting..." : "Export Catalog Sheet"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
