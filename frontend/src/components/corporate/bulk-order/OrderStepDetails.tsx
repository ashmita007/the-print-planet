"use client";

import React from "react";
import { ChipGroup, Field, inputClass } from "../FormControls";
import { OrgType, ORG_TYPES, QUANTITY_PRESETS, MIN_QUANTITY, ATTACHMENT_EXTENSIONS, type ProductLine } from "../orderData";
import { Check, X, FileUp, ArrowRight } from "lucide-react";
import { Draft } from "./shared";

export interface OrderStepDetailsProps {
  continueFromOrder: (e: React.FormEvent) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  form: Draft;
  changeOrgType: (next: OrgType) => void;
  productLines: ProductLine[];
  product: ProductLine;
  setForm: React.Dispatch<React.SetStateAction<Draft>>;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  quantityError: "Minimum bulk quantity is 100 units" | "";
  attempt: number;
  markerRef: React.RefObject<HTMLSpanElement | null>;
  attachment: File | null;
  setAttachment: React.Dispatch<React.SetStateAction<File | null>>;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  chooseFile: (file: File | undefined) => void;
  dragging: boolean;
  attachmentError: string;
}

export default function OrderStepDetails({
  continueFromOrder,
  headingRef,
  form,
  changeOrgType,
  productLines,
  product,
  setForm,
  set,
  quantityError,
  attempt,
  markerRef,
  attachment,
  setAttachment,
  setDragging,
  chooseFile,
  dragging,
  attachmentError,
}: OrderStepDetailsProps) {
  return (
    <form onSubmit={continueFromOrder} noValidate className="space-y-7">
      <div data-step-item>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-[#121418] outline-none">
          What do you need?
        </h2>
        <p className="text-[15px] text-[#2B323B] mt-1">Pick the closest match. We will confirm every detail with you.</p>
      </div>

      <div data-step-item>
        <ChipGroup
          legend="Ordering for"
          value={form.orgType}
          onChange={(value) => changeOrgType(value as OrgType)}
          options={ORG_TYPES.map((type) => ({ value: type.value, label: type.label }))}
        />
      </div>

      <fieldset data-step-item>
        <legend className="text-sm font-semibold text-[#121418] mb-2">Product</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {productLines.map((line) => {
            const selected = line.value === product.value;
            return (
              <button
                key={line.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setForm((prev) => ({ ...prev, productValue: line.value, specChoices: {} }))}
                className={`flex items-start justify-between gap-3 text-left p-3.5 rounded-md border transition-colors ${
                  selected ? "bg-[#EDF1F6] border-[#B9C3CF]" : "bg-[#FFFFFF] border-[#B9C3CF] hover:border-[#121418]"
                }`}
              >
                <span>
                  <span className="block text-[15px] font-bold text-[#121418]">{line.label}</span>
                  <span className="block text-[13px] text-[#353C45] mt-0.5">{line.detail}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                    selected ? "bg-[#121418] border-[#B9C3CF] text-white" : "border-[#B9C3CF]"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {product.specs.map((spec) => (
        <div data-step-item key={`${product.value}-${spec.label}`}>
          <ChipGroup
            legend={spec.label}
            allowClear
            value={form.specChoices[spec.label] || ""}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, specChoices: { ...prev.specChoices, [spec.label]: value } }))
            }
            options={spec.options.map((option) => ({ value: option, label: option }))}
          />
        </div>
      ))}

      <div data-step-item className="border-t border-[#DFE6EE] pt-6">
        <ChipGroup
          legend="Quantity"
          value={form.quantity}
          onChange={(value) => set("quantity", value)}
          options={QUANTITY_PRESETS.map((preset) => ({
            value: String(preset),
            label: preset.toLocaleString("en-IN"),
          }))}
        />
        <div className="mt-3 max-w-xs">
          <Field
            id="quantity"
            label="Or enter an exact quantity"
            error={quantityError}
            attempt={attempt}
          >
            <input
              id="quantity"
              type="number"
              inputMode="numeric"
              min={MIN_QUANTITY}
              step={50}
              value={form.quantity}
              aria-invalid={!!quantityError}
              aria-describedby={quantityError ? "quantity-error" : undefined}
              onChange={(e) => set("quantity", e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </Field>
        </div>

        {/* Slab track */}
        <div className="mt-5" aria-hidden="true">
          <div className="relative h-1.5 flex gap-px">
            <span className="flex-[52] bg-[#DFE6EE]" />
            <span className="flex-[26] bg-[#121418]" />
            <span className="flex-[22] bg-[#121418]" />
            <span
              ref={markerRef}
              className="absolute -top-1.5 -ml-1.5 w-3 h-[1.125rem] bg-[#121418]"
              style={{ left: "52%" }}
            />
          </div>
          <div className="mt-2 flex text-[12px] text-[#353C45]">
            <span className="flex-[52]">Wholesale rate</span>
            <span className="flex-[26]">Up to 20% off</span>
            <span className="flex-[22]">Contract</span>
          </div>
        </div>
      </div>

      <div data-step-item className="border-t border-[#DFE6EE] pt-6 space-y-5">
        <div className="max-w-xs">
          <Field id="neededBy" label="Needed by" optional>
            <input
              id="neededBy"
              type="date"
              value={form.neededBy}
              onChange={(e) => set("neededBy", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          id="notes"
          label="Anything else we should know?"
          optional
          hint="Pantone colours, printing text, branch-wise delivery, or a reference to a past order."
        >
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            aria-describedby="notes-hint"
            onChange={(e) => set("notes", e.target.value)}
            className={`${inputClass} leading-relaxed resize-y`}
          />
        </Field>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-semibold text-[#121418]">Logo, artwork or spec sheet</span>
            <span className="text-xs text-[#353C45]">Optional</span>
          </div>
          {attachment ? (
            <div className="flex items-center justify-between gap-3 p-3 border border-[#B9C3CF] rounded-md">
              <span className="flex items-center gap-2 min-w-0 text-sm text-[#121418]">
                <Check className="w-4 h-4 text-[#217A4B] shrink-0" />
                <span className="truncate">{attachment.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label={`Remove ${attachment.name}`}
                className="p-1.5 text-[#353C45] hover:text-[#C0392B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                chooseFile(e.dataTransfer.files[0]);
              }}
              className={`flex items-center gap-3 p-4 border border-dashed rounded-md cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#121418]/20 ${
                dragging ? "border-[#B9C3CF] bg-[#EDF1F6]" : "border-[#6C7A89] hover:border-[#121418]"
              }`}
            >
              <FileUp className="w-5 h-5 text-[#2B323B] shrink-0" />
              <span className="text-sm text-[#2B323B]">
                <span className="font-semibold text-[#121418]">Choose a file</span> or drop it here. PDF, PNG, JPG, AI or CDR, up to 15 MB.
              </span>
              <input
                type="file"
                accept={ATTACHMENT_EXTENSIONS.join(",")}
                className="sr-only"
                onChange={(e) => chooseFile(e.target.files?.[0])}
              />
            </label>
          )}
          {attachmentError && (
            <p role="alert" className="mt-1.5 text-[13px] font-medium text-[#C0392B]">
              {attachmentError}
            </p>
          )}
        </div>
      </div>

      <div data-step-item className="flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#F26B1D] hover:bg-[#FF8A3D] text-[#121418] font-bold text-[15px] transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
