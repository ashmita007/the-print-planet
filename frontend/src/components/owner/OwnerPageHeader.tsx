import type { ReactNode } from "react";

interface OwnerPageHeaderProps {
  eyebrow: string;
  title: string;
  count?: number;
  /** Optional description paragraph rendered under the title. */
  children?: ReactNode;
}

export default function OwnerPageHeader({ eyebrow, title, count, children }: OwnerPageHeaderProps) {
  return (
    <div>
      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">{eyebrow}</span>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121418] mt-1">
        {title}
        {count !== undefined && (
          <span className="ml-2.5 text-sm font-medium text-slate-400 tabular-nums">{count}</span>
        )}
      </h1>
      {children}
    </div>
  );
}
