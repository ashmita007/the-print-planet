"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Package, User } from "lucide-react";
import { clientLogout } from "@/lib/api";
import type { ClientProfile } from "@/lib/types";
import { displayName } from "./shared";
import { useDropdown } from "./useDropdown";

const ITEM = "flex w-full items-center gap-2 px-3.5 py-2.5 text-left hover:bg-[#EDF1F6] text-slate-700 hover:text-[#121418] font-medium transition-colors focus-visible:bg-[#EDF1F6] outline-none";

/** Desktop account control: a Sign In link, or a menu once the buyer is logged in. */
export default function AccountMenu({ loggedIn, user }: { loggedIn: boolean; user: ClientProfile | null }) {
  const router = useRouter();
  const name = user?.first_name || user?.username || "Account";
  const { open, setOpen, wrapRef, buttonRef, onButtonClick, onKeyDown, onBlur } = useDropdown();

  if (!loggedIn) {
    return (
      <Link
        href="/account/login"
        className="hidden xl:flex items-center gap-1.5 h-10 px-2.5 2xl:px-3 rounded-md border border-slate-200 hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-[#121418] text-sm font-semibold transition-colors"
      >
        <User className="w-4 h-4 text-[#353C45]" aria-hidden />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative hidden xl:block" ref={wrapRef} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        onClick={onButtonClick}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="account-menu"
        aria-label={`Account menu, ${name}`}
        className="flex items-center gap-1.5 h-10 px-2.5 2xl:px-3 rounded-md border border-slate-200 hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-[#121418] text-sm font-semibold transition-colors"
      >
        <User className="w-4 h-4 text-[#353C45]" aria-hidden />
        {/* Between 1536 and 1700px the search field takes the room, so only the icon shows. */}
        <span className="max-w-[8rem] truncate 2xl:hidden min-[1700px]:inline">{name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div id="account-menu" data-menu className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#DFE6EE] rounded-lg shadow-xl py-1.5 z-50 text-sm">
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-[#EDF1F6] -mt-1.5 rounded-t-lg">
            <p className="font-bold text-[#121418] truncate">{displayName(user)}</p>
            <p className="text-[11px] text-[#353C45] truncate">{user?.email || ""}</p>
          </div>
          <Link href="/orders" onClick={() => setOpen(false)} className={ITEM}>
            <Package className="w-4 h-4 text-[#353C45]" aria-hidden />
            <span>My Orders &amp; Chats</span>
          </Link>
          <Link href="/account" onClick={() => setOpen(false)} className={ITEM}>
            <User className="w-4 h-4 text-[#353C45]" aria-hidden />
            <span>Profile &amp; Settings</span>
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await clientLogout();
              router.push("/account/login");
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-red-600 hover:bg-red-50 font-bold transition-colors focus-visible:bg-red-50 outline-none"
          >
            <LogOut className="w-4 h-4" aria-hidden />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
