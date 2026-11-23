"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientListAddresses } from "@/lib/api";
import type { Address } from "@/lib/types";

export type AddressChoice = { shippingId: string; billingId: string };

const select =
  "w-full bg-white border border-[#B9C3CF] hover:border-[#6C7A89] focus:border-[#121418] focus:ring-2 focus:ring-[#121418]/15 rounded-md px-3.5 py-3 text-[15px] text-[#121418] outline-none transition-colors";

const describe = (a: Address) => `${a.label ? `${a.label}: ` : ""}${a.full_name}, ${a.line1}, ${a.city} ${a.pincode}`;

/** Lets a signed-in buyer pick saved shipping and billing addresses; the server copies them onto the order. */
export default function AddressPicker({ value, onChange, onPickShipping }: {
  value: AddressChoice;
  onChange: (next: AddressChoice) => void;
  onPickShipping?: (address: Address | null) => void;
}) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    clientListAddresses().then((res) => {
      if (!alive) return;
      if (res.error) return setError(res.error);
      const list = res.data ?? [];
      setAddresses(list);
      const shipping = list.find((a) => a.is_default_shipping) ?? list[0];
      const billing = list.find((a) => a.is_default_billing) ?? shipping;
      if (shipping && !value.shippingId) {
        onChange({ shippingId: String(shipping.id), billingId: billing ? String(billing.id) : "" });
        onPickShipping?.(shipping);
      }
    });
    return () => {
      alive = false;
    };
    // Run once on mount: later changes come from the buyer's own choices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p role="alert" className="text-sm font-semibold text-[#C0392B]">{error}</p>;
  if (!addresses) return <p className="text-sm text-slate-500" aria-live="polite">Loading your saved addresses…</p>;

  if (!addresses.length) {
    return (
      <p className="rounded-md bg-[#EDF1F6] p-3.5 text-sm text-[#2B323B]">
        Save a delivery address to get an exact GST split on your quote.{" "}
        <Link href="/account/addresses" className="font-bold underline">Add an address</Link>
      </p>
    );
  }

  const byId = (id: string) => addresses.find((a) => String(a.id) === id) ?? null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="ship-address" className="mb-1.5 block text-sm font-semibold text-[#121418]">Ship to</label>
        <select
          id="ship-address"
          className={select}
          value={value.shippingId}
          onChange={(e) => {
            onChange({ ...value, shippingId: e.target.value });
            onPickShipping?.(byId(e.target.value));
          }}
        >
          {addresses.map((a) => <option key={a.id} value={a.id}>{describe(a)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="bill-address" className="mb-1.5 block text-sm font-semibold text-[#121418]">Bill to</label>
        <select id="bill-address" className={select} value={value.billingId} onChange={(e) => onChange({ ...value, billingId: e.target.value })}>
          {addresses.map((a) => <option key={a.id} value={a.id}>{describe(a)}</option>)}
        </select>
      </div>
      <p className="sm:col-span-2 text-xs text-slate-500">
        <Link href="/account/addresses" className="font-semibold underline">Manage addresses</Link>
      </p>
    </div>
  );
}
