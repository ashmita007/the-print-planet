"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import { clientDeleteAddress, clientListAddresses, clientSaveAddress, getClientAuthHeaders, getCommercePolicies } from "@/lib/api";
import type { Address, AddressInput } from "@/lib/types";

const EMPTY: AddressInput = {
  label: "", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", gstin: "",
  is_default_shipping: false, is_default_billing: false,
};

const INPUT =
  "w-full bg-white border border-[#B9C3CF] hover:border-[#6C7A89] focus:border-[#121418] focus:ring-2 focus:ring-[#121418]/15 rounded-md px-3 py-2.5 text-sm text-[#121418] outline-none transition-colors";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-[#121418]">{label}</label>
      {children}
    </div>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number | null; form: AddressInput } | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await clientListAddresses();
    if (res.error) setStatus({ ok: false, text: res.error });
    else setAddresses(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!getClientAuthHeaders().Authorization) {
      router.replace("/account/login?redirect=/account/addresses");
      return;
    }
    load();
    getCommercePolicies().then((p) => p && setStates(p.states));
  }, [load, router]);

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, form: { ...prev.form, [key]: value } } : prev));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setStatus(null);
    const res = await clientSaveAddress(editing.id, editing.form);
    setSaving(false);
    if (res.error) return setStatus({ ok: false, text: res.error });
    setStatus({ ok: true, text: "Address saved." });
    setEditing(null);
    load();
  };

  const remove = async (address: Address) => {
    if (!window.confirm(`Delete the address for ${address.full_name}, ${address.city}?`)) return;
    const res = await clientDeleteAddress(address.id);
    setStatus(res.error ? { ok: false, text: res.error } : { ok: true, text: "Address deleted." });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
      <Breadcrumbs items={[{ label: "My account", href: "/account" }, { label: "Addresses" }]} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121418]">Saved addresses</h1>
          <p className="text-sm text-slate-500 mt-1">Used for delivery and for the GST split on your quotes and invoices.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing({ id: null, form: EMPTY })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#F26B1D] px-4 py-2.5 text-xs font-bold text-[#121418] hover:bg-[#FF8A3D] active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add address
          </button>
        )}
      </div>

      <p role="status" aria-live="polite" className={`text-xs font-semibold ${status ? (status.ok ? "text-emerald-700" : "text-[#C0392B]") : ""}`}>
        {status?.text}
      </p>

      {editing && (
        <form onSubmit={save} className="animate-in fade-in duration-300 space-y-4 rounded-lg border border-[#DFE6EE] bg-white p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-[#121418]">{editing.id === null ? "New address" : "Edit address"}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="addr-label" label="Label (for example Office)">
              <input id="addr-label" className={INPUT} maxLength={50} value={editing.form.label ?? ""} onChange={(e) => set("label", e.target.value)} />
            </Field>
            <Field id="addr-name" label="Full name">
              <input id="addr-name" required className={INPUT} autoComplete="name" value={editing.form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </Field>
            <Field id="addr-phone" label="Phone">
              <input id="addr-phone" required type="tel" className={INPUT} autoComplete="tel" value={editing.form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field id="addr-gstin" label="GSTIN (optional)">
              <input id="addr-gstin" className={`${INPUT} font-mono uppercase`} maxLength={15} value={editing.form.gstin ?? ""} onChange={(e) => set("gstin", e.target.value.toUpperCase())} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="addr-line1" label="Address line 1">
                <input id="addr-line1" required className={INPUT} autoComplete="address-line1" value={editing.form.line1} onChange={(e) => set("line1", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="addr-line2" label="Address line 2 (optional)">
                <input id="addr-line2" className={INPUT} autoComplete="address-line2" value={editing.form.line2 ?? ""} onChange={(e) => set("line2", e.target.value)} />
              </Field>
            </div>
            <Field id="addr-city" label="City">
              <input id="addr-city" required className={INPUT} autoComplete="address-level2" value={editing.form.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field id="addr-state" label="State">
              <select id="addr-state" required className={INPUT} autoComplete="address-level1" value={editing.form.state} onChange={(e) => set("state", e.target.value)}>
                <option value="">Choose a state</option>
                {states.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </Field>
            <Field id="addr-pin" label="Pincode">
              <input id="addr-pin" required inputMode="numeric" pattern="\d{6}" maxLength={6} className={INPUT} autoComplete="postal-code" value={editing.form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-[#121418]">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={editing.form.is_default_shipping} onChange={(e) => set("is_default_shipping", e.target.checked)} /> Default shipping address
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={editing.form.is_default_billing} onChange={(e) => set("is_default_billing", e.target.checked)} /> Default billing address
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-[#DFE6EE] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-md bg-[#121418] px-5 py-2 text-xs font-bold text-white hover:bg-[#2A2F37] disabled:opacity-50 active:scale-[0.98] transition">
              {saving ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading your addresses…</p>
      ) : addresses.length === 0 && !editing ? (
        <div className="rounded-lg border border-dashed border-[#B9C3CF] bg-white p-8 text-center text-sm text-slate-500">
          <MapPin className="mx-auto mb-2 h-6 w-6 text-slate-400" aria-hidden />
          No saved addresses yet. Add one to speed up your next quote.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-lg border border-[#DFE6EE] bg-white p-4 text-sm shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-[#121418]">{a.label || a.full_name}</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditing({ id: a.id, form: { ...EMPTY, ...a } })} aria-label={`Edit address ${a.label || a.full_name}`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 active:scale-95 transition">
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button type="button" onClick={() => remove(a)} aria-label={`Delete address ${a.label || a.full_name}`} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 active:scale-95 transition">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-slate-600">{a.full_name} · {a.phone}</p>
              <p className="text-slate-600">{[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ")}</p>
              {a.gstin && <p className="mt-1 font-mono text-xs text-slate-500">GSTIN {a.gstin}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase">
                {a.is_default_shipping && <span className="rounded-full bg-[#EDF1F6] px-2 py-0.5 text-[#121418]">Default shipping</span>}
                {a.is_default_billing && <span className="rounded-full bg-[#EDF1F6] px-2 py-0.5 text-[#121418]">Default billing</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
