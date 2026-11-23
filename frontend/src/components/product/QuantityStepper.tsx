"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { clampQuantity, parseQuantity } from "@/lib/quantity";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max?: number;
  step: number;
  label?: string;
  compact?: boolean;
}

export default function QuantityStepper({ value, onChange, min, max, step, label = "Order quantity", compact = false }: QuantityStepperProps) {
  // Draft text while typing; null means show the committed value.
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  const commit = () => {
    if (draft === null) return;
    const parsed = parseQuantity(draft);
    if (parsed !== null) onChange(clampQuantity(parsed, min, max));
    setInvalid(parsed === null);
    setDraft(null);
  };

  const btn = compact
    ? "w-11 h-11 sm:w-8 sm:h-7 text-xs"
    : "w-11 h-11 sm:w-9 sm:h-9";
  const icon = compact ? "w-3 h-3" : "w-4 h-4";

  return (
    <div>
      <div className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
        <button
          type="button"
          onClick={() => {
            setInvalid(false);
            onChange(clampQuantity(value - step, min, max));
          }}
          disabled={atMin}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className={`${btn} flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Minus className={icon} />
        </button>
        <input
          aria-label={label}
          type="text"
          inputMode="numeric"
          value={draft ?? String(value)}
          onChange={(e) => {
            setDraft(e.target.value);
            setInvalid(false);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          className={`${compact ? "w-12" : "w-16"} text-center text-xs font-bold text-slate-900 bg-transparent outline-none tabular-nums`}
        />
        <button
          type="button"
          onClick={() => {
            setInvalid(false);
            onChange(clampQuantity(value + step, min, max));
          }}
          disabled={atMax}
          aria-label={`Increase ${label.toLowerCase()}`}
          className={`${btn} flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Plus className={icon} />
        </button>
      </div>
      {invalid && (
        <span role="status" className="block text-[10px] text-red-600 mt-1">
          Enter a whole number, at least {min}.
        </span>
      )}
      {atMax && !invalid && <span className="block text-[10px] text-amber-600 mt-1">Max {max} in stock</span>}
    </div>
  );
}
