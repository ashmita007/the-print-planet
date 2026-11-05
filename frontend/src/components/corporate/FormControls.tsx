"use client";

import React, { useRef } from "react";
import { AlertCircle, Check } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export const inputClass =
  "w-full bg-[#FFFFFF] border border-[#B9C3CF] hover:border-[#6C7A89] focus:border-[#22272E] focus:ring-2 focus:ring-[#22272E]/15 aria-[invalid=true]:border-[#C0392B] aria-[invalid=true]:focus:ring-[#C0392B]/15 rounded-md px-3.5 py-3 text-[15px] text-[#22272E] placeholder:text-[#4A5562] outline-none transition-colors";

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  valid?: boolean;
  /** Bumped on each failed Continue, so a repeat attempt shakes the field again. */
  attempt?: number;
  children: React.ReactNode;
}

export function Field({ id, label, optional, hint, error, valid, attempt = 0, children }: FieldProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!error || !attempt || prefersReducedMotion()) return;
      gsap.fromTo(root.current, { x: -5 }, { x: 0, duration: 0.45, ease: "elastic.out(1.2, 0.3)", clearProps: "transform" });
    },
    { dependencies: [attempt] }
  );

  return (
    <div ref={root}>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-[#22272E]">
          {label}
        </label>
        {optional && <span className="text-xs text-[#3F4A56]">Optional</span>}
      </div>
      <div className="relative">
        {children}
        {valid && !error && (
          <Check aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#217A4B] pointer-events-none" />
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#C0392B]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#3F4A56]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface ChipGroupProps {
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  /** Clicking the selected chip clears it, for optional choices. */
  allowClear?: boolean;
}

export function ChipGroup({ legend, options, value, onChange, allowClear }: ChipGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#22272E] mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected && allowClear ? "" : option.value)}
              className={`min-h-11 px-3.5 py-2 rounded-md border text-sm font-semibold tabular-nums transition-colors ${
                selected
                  ? "bg-[#22272E] border-[#22272E] text-white"
                  : "bg-[#FFFFFF] border-[#B9C3CF] text-[#22272E] hover:border-[#22272E]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
