"use client";

import React, { useRef } from "react";
import { AlertCircle, Check } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export const inputClass =
  "w-full bg-white border border-[#C9D1DA] hover:border-[#8896A5] focus:border-[#16324F] focus:ring-2 focus:ring-[#16324F]/15 aria-[invalid=true]:border-[#C0392B] aria-[invalid=true]:focus:ring-[#C0392B]/15 rounded-md px-3.5 py-3 text-[15px] text-[#1C2733] placeholder:text-[#8896A5] outline-none transition-colors";

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
        <label htmlFor={id} className="text-sm font-semibold text-[#1C2733]">
          {label}
        </label>
        {optional && <span className="text-xs text-[#566373]">Optional</span>}
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
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#566373]">
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
      <legend className="text-sm font-semibold text-[#1C2733] mb-2">{legend}</legend>
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
                  ? "bg-[#16324F] border-[#16324F] text-white"
                  : "bg-white border-[#C9D1DA] text-[#1C2733] hover:border-[#16324F]"
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
