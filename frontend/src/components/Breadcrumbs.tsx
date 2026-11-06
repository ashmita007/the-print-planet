import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  items: {
    label: string;
    href?: string;
  }[];
  tone?: "light" | "dark";
}

export default function Breadcrumbs({ items, tone = "light" }: BreadcrumbsProps) {
  const dark = tone === "dark";
  const link = dark ? "hover:text-white" : "hover:text-[#121418]";

  return (
    <nav aria-label="Breadcrumb" className={`py-3 text-xs ${dark ? "text-slate-400" : "text-[#353C45]"}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center">
          <Link href="/" className={`${link} flex items-center gap-1`}>
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className={`${link} truncate max-w-[200px]`}>
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold truncate max-w-[250px] ${dark ? "text-slate-200" : "text-[#121418]"}`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
