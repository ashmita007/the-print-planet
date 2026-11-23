"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { ownerGetCustomers } from "@/lib/api";
import { formatDateTime, formatInr } from "@/lib/formatters";
import type { OwnerCustomerRow } from "@/lib/types";
import OwnerPageHeader from "@/components/owner/OwnerPageHeader";

export default function OwnerCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OwnerCustomerRow[]>([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait for typing to pause before asking the server.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await ownerGetCustomers(search, page);
      if (cancelled) return;
      if (res) {
        setRows(res.results);
        setCount(res.count);
        setHasNext(!!res.next);
        setError("");
      } else {
        setError("Could not load customers. Please log in again.");
      }
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, page]);

  return (
    <div className="space-y-6 max-w-5xl">
      <OwnerPageHeader eyebrow="History" title="Customers" count={count}>
        <p className="text-sm text-slate-600 mt-1">
          Everyone who has placed an order or sent an enquiry. Open a customer to see the full conversation.
        </p>
      </OwnerPageHeader>

      <div className="relative w-full sm:w-80">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, email, phone, company..."
          aria-label="Search customers"
          className="w-full bg-[#EDF1F6] border border-[#DFE6EE] focus:border-[#121418] focus:bg-white rounded-lg pl-8 pr-3 py-2 text-sm outline-none"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
      </div>

      <section className="surface-card rounded-lg overflow-hidden">
        {error ? (
          <p role="alert" className="p-6 text-sm text-red-600">{error}</p>
        ) : loading && rows.length === 0 ? (
          <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-label="Loading" /></div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-slate-500 bg-[#EDF1F6]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Customer</th>
                  <th className="py-2.5 px-4 font-medium">Company</th>
                  <th className="py-2.5 px-4 font-medium">Orders</th>
                  <th className="py-2.5 px-4 font-medium">Paid</th>
                  <th className="py-2.5 px-4 font-medium">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Link href={`/owner/customers/${c.id}`} className="font-semibold text-[#121418] underline-offset-2 hover:underline">
                        {c.name}
                      </Link>
                      <span className="block text-slate-500">{c.email}</span>
                      {c.phone && <span className="block text-slate-400">{c.phone}</span>}
                    </td>
                    <td className="py-3 px-4">{c.company || "—"}</td>
                    <td className="py-3 px-4 tabular-nums">{c.orders_count}</td>
                    <td className="py-3 px-4 tabular-nums">{formatInr(c.paid_total)}</td>
                    <td className="py-3 px-4">{c.last_activity ? formatDateTime(c.last_activity) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(page > 1 || hasNext) && (
        <div className="flex items-center gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[#DFE6EE] px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
          <span className="text-slate-500">Page {page}</span>
          <button type="button" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[#DFE6EE] px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
