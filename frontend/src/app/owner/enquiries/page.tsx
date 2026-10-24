"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Building2,
  Calendar,
  Save,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { ownerGetEnquiries, ownerUpdateEnquiry } from "@/lib/api";
import { Enquiry } from "@/lib/types";


export default function OwnerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);

  // Edit fields
  const [statusVal, setStatusVal] = useState<string>("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    const res = await ownerGetEnquiries({
      status: selectedStatus || undefined,
      search: activeSearch || undefined,
      page: currentPage,
      page_size: pageSize,
    });
    setEnquiries(res.results || []);
    setTotalCount(res.count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, [selectedStatus, activeSearch, currentPage, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(search.trim());
  };

  const clearFilters = () => {
    setSearch("");
    setActiveSearch("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const openDetail = (enq: Enquiry) => {
    setActiveEnquiry(enq);
    setStatusVal(enq.status);
    setAdminNotes(enq.admin_notes || "");
    setSaveSuccess(false);
  };

  const handleSaveNotes = async () => {
    if (!activeEnquiry) return;
    setSaving(true);
    const success = await ownerUpdateEnquiry(activeEnquiry.id, {
      status: statusVal,
      admin_notes: adminNotes,
    });
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      fetchEnquiries();
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E87832] uppercase tracking-wider">
            Lead & RFQ Operations
          </span>
          <h1 className="text-2xl font-extrabold text-[#17365D] flex items-center gap-2">
            <span>Customer Enquiries</span>
            <span className="text-xs bg-[#E87832]/10 text-[#E87832] font-bold px-2.5 py-0.5 rounded-full border border-[#E87832]/20">
              {totalCount} Total
            </span>
          </h1>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by customer name, company, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg pl-8 pr-12 py-2 text-xs outline-none focus:bg-white focus:border-[#17365D] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#17365D] hover:bg-[#102742] text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
          >
            Find
          </button>
        </form>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
          <label className="text-[#687586] font-semibold">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer"
          >
            <option value="">All Enquiries</option>
            <option value="new">New (Unreviewed)</option>
            <option value="in_progress">In Progress</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed / Won</option>
            <option value="spam">Spam / Discard</option>
          </select>

          {(selectedStatus || activeSearch) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Master List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Enquiry List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#DCE3EB] text-[11px] font-bold text-[#687586] flex items-center justify-between">
            <span>Enquiries List ({totalCount})</span>
            <span>Click to review details</span>
          </div>

          <div className="divide-y divide-[#DCE3EB] max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#E87832]" />
                <span>Loading customer enquiries...</span>
              </div>
            ) : enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => openDetail(enq)}
                  className={`p-4 transition-colors cursor-pointer text-xs space-y-1.5 ${
                    activeEnquiry?.id === enq.id ? "bg-[#17365D]/5 border-l-4 border-l-[#17365D]" : "hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17365D] text-sm">{enq.full_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enq.status === "new"
                          ? "bg-orange-100 text-[#E87832]"
                          : enq.status === "closed"
                          ? "bg-green-100 text-[#217A4B]"
                          : enq.status === "quoted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {enq.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[#687586] flex items-center gap-3 text-[11px]">
                    {enq.company_name && <span>{enq.company_name}</span>}
                    <span>{enq.phone}</span>
                    <span className="truncate max-w-[150px]">{enq.email}</span>
                  </div>

                  <p className="text-[#263445] line-clamp-2 text-xs italic bg-[#F8FAFC] p-2 rounded border border-[#DCE3EB]/50">
                    &ldquo;{enq.message}&rdquo;
                  </p>

                  {(enq.attachment_url || enq.attachment) && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-flex items-center gap-1 font-semibold">
                      <span>📎</span>
                      <span>Customer Attachment Attached</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      Item: <strong>{enq.product_name_text || enq.product_details?.name || "General RFQ"}</strong>
                    </span>
                    <span suppressHydrationWarning>{new Date(enq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                No customer enquiries found matching criteria.
              </div>
            )}
          </div>

          {/* Numbered Pagination for Enquiries */}
          {totalCount > 0 && (
            <div className="p-3 bg-[#F8FAFC] border-t border-[#DCE3EB] flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Showing {startItem} – {endItem} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 bg-white border border-[#DCE3EB] rounded text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 bg-white border border-[#DCE3EB] rounded text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2 font-bold text-[#17365D]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 bg-white border border-[#DCE3EB] rounded text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1 bg-white border border-[#DCE3EB] rounded text-slate-600 hover:bg-[#F5F7FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Detail & Note Editor (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-xs space-y-5 text-xs">
          {activeEnquiry ? (
            <>
              <div className="border-b border-[#DCE3EB] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-[#17365D]">Enquiry #{activeEnquiry.id} Details</h2>
                  <span suppressHydrationWarning className="text-[11px] text-slate-400">
                    Received on {new Date(activeEnquiry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-[#217A4B] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Enquiry status & internal notes updated.</span>
                </div>
              )}

              {/* Customer Contact Box */}
              <div className="space-y-2 bg-[#F8FAFC] p-3.5 rounded-lg border border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#E87832]" />
                  <a href={`tel:${activeEnquiry.phone}`} className="font-bold text-[#17365D] hover:underline">
                    {activeEnquiry.phone}
                  </a>
                  <a
                    href={`https://wa.me/${activeEnquiry.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(activeEnquiry.full_name)}%2C%20following%20up%20on%20your%20ID%20supplies%20quotation.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto bg-[#217A4B] text-white text-[10px] font-bold px-2 py-0.5 rounded hover:bg-[#1a613b]"
                  >
                    WhatsApp
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#E87832]" />
                  <a href={`mailto:${activeEnquiry.email}`} className="font-semibold text-slate-700 hover:underline">
                    {activeEnquiry.email}
                  </a>
                </div>

                {activeEnquiry.company_name && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company: <strong>{activeEnquiry.company_name}</strong></span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-[#263445] mb-1">Customer Message</label>
                <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#DCE3EB] text-[#263445] leading-relaxed">
                  {activeEnquiry.message}
                </div>
              </div>

              {/* Customer Attachment if present */}
              {(activeEnquiry.attachment_url || activeEnquiry.attachment) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>📎</span>
                    <span>Customer Attached File / Artwork</span>
                  </div>
                  <a
                    href={activeEnquiry.attachment_url || (activeEnquiry.attachment as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#E87832] hover:bg-[#d66b28] text-white px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors"
                  >
                    <span>View / Download Attachment</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-[#263445] mb-1">Update Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs outline-none cursor-pointer"
                >
                  <option value="new">New (Unreviewed)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="quoted">Quoted (Proforma Sent)</option>
                  <option value="closed">Closed / Order Fulfilled</option>
                  <option value="spam">Spam / Discard</option>
                </select>
              </div>

              {/* Internal Private Notes */}
              <div>
                <label className="block font-bold text-[#263445] mb-1">
                  Private Internal Notes (Staff Only)
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record quote amounts, shipping terms, dispatch dates..."
                  className="w-full bg-[#F5F7FA] border border-[#DCE3EB] rounded-lg p-3 text-xs outline-none resize-none focus:bg-white focus:border-[#17365D] transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                className="w-full bg-[#17365D] hover:bg-[#102742] text-white py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Saving..." : "Save Status & Internal Notes"}</span>
              </button>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <p>Select any customer enquiry from the list to view complete contact details and manage follow-ups.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
