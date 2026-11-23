"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CategoryMenu from "./CategoryMenu";
import { isActivePath, LINK_UNDERLINE, NAV_ITEMS, type CategoryGroup } from "./shared";

export default function DesktopNav({ groups, total, onMenuOpen }: { groups: CategoryGroup[]; total: number; onMenuOpen: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:flex items-center gap-0.5 shrink-0">
      <CategoryMenu groups={groups} total={total} onOpen={onMenuOpen} />
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${LINK_UNDERLINE} inline-flex items-center h-10 ${active ? "text-[#121418] font-bold after:scale-x-100" : "text-slate-700 hover:text-[#121418]"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
