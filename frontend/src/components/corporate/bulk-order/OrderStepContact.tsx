"use client";

import React from "react";
import { Field, inputClass } from "../FormControls";
import { INDIAN_STATES, type OrgType } from "../orderData";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FieldName, Draft } from "./shared";

export interface OrderStepContactProps {
  continueFromDetails: (e: React.FormEvent) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  org: { value: OrgType; label: string; nameLabel: string; namePlaceholder: string; };
  shownError: (name: FieldName) => string;
  form: Draft;
  attempt: number;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  touch: (name: FieldName | "password") => void;
  errors: Record<FieldName, string>;
  goTo: (next: number) => void;
}

export default function OrderStepContact({
  continueFromDetails,
  headingRef,
  org,
  shownError,
  form,
  attempt,
  set,
  touch,
  errors,
  goTo,
}: OrderStepContactProps) {
  return (
    <form onSubmit={continueFromDetails} noValidate className="space-y-5">
      <div data-step-item>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-[#121418] outline-none">
          Who should we quote?
        </h2>
        <p className="text-[15px] text-[#2B323B] mt-1">We use this for your quotation, GST invoice and delivery.</p>
      </div>

      <div data-step-item className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="orgName" label={org.nameLabel} error={shownError("orgName")} valid={!!form.orgName.trim()} attempt={attempt}>
          <input
            id="orgName"
            type="text"
            autoComplete="organization"
            value={form.orgName}
            placeholder={org.namePlaceholder}
            aria-invalid={!!shownError("orgName")}
            aria-describedby={shownError("orgName") ? "orgName-error" : undefined}
            onChange={(e) => set("orgName", e.target.value)}
            onBlur={() => touch("orgName")}
            className={inputClass}
          />
        </Field>
        <Field id="contactPerson" label="Your name" error={shownError("contactPerson")} valid={!!form.contactPerson.trim()} attempt={attempt}>
          <input
            id="contactPerson"
            type="text"
            autoComplete="name"
            value={form.contactPerson}
            placeholder="e.g. Priya Sharma"
            aria-invalid={!!shownError("contactPerson")}
            aria-describedby={shownError("contactPerson") ? "contactPerson-error" : undefined}
            onChange={(e) => set("contactPerson", e.target.value)}
            onBlur={() => touch("contactPerson")}
            className={inputClass}
          />
        </Field>
        <Field
          id="email"
          label="Work email"
          error={shownError("email")}
          valid={!errors.email}
          hint="Your quotation updates go here."
          attempt={attempt}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            placeholder="name@company.com"
            aria-invalid={!!shownError("email")}
            aria-describedby={shownError("email") ? "email-error" : "email-hint"}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            className={inputClass}
          />
        </Field>
        <Field id="phone" label="Phone or WhatsApp" error={shownError("phone")} valid={!errors.phone} attempt={attempt}>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            placeholder="+91 98765 43210"
            aria-invalid={!!shownError("phone")}
            aria-describedby={shownError("phone") ? "phone-error" : undefined}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => touch("phone")}
            className={inputClass}
          />
        </Field>
        <Field id="city" label="Delivery city" error={shownError("city")} attempt={attempt}>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            aria-invalid={!!shownError("city")}
            aria-describedby={shownError("city") ? "city-error" : undefined}
            onChange={(e) => set("city", e.target.value)}
            onBlur={() => touch("city")}
            className={inputClass}
          />
        </Field>
        <Field id="state" label="State">
          <select
            id="state"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            className={inputClass}
          >
            {INDIAN_STATES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div data-step-item className="sm:max-w-[calc(50%-0.625rem)]">
        <Field
          id="gstNumber"
          label="GSTIN"
          optional
          hint="Add it to claim input tax credit on this order."
          error={shownError("gstNumber")}
          valid={!!form.gstNumber && !errors.gstNumber}
          attempt={attempt}
        >
          <input
            id="gstNumber"
            type="text"
            maxLength={15}
            value={form.gstNumber}
            placeholder="29AAAAA0000A1Z5"
            aria-invalid={!!shownError("gstNumber")}
            aria-describedby={shownError("gstNumber") ? "gstNumber-error" : "gstNumber-hint"}
            onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
            onBlur={() => touch("gstNumber")}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      <div data-step-item className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => goTo(0)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md text-[#121418] hover:bg-[#EDF1F6] font-bold text-[15px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-[15px] transition-colors"
        >
          <span>Review order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
