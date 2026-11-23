"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, Truck, User, UserPlus } from "lucide-react";
import { clientLogout } from "@/lib/api";
import type { ClientProfile } from "@/lib/types";
import { displayName } from "./shared";
import HeaderDropdown, { MENU_ITEM } from "./HeaderDropdown";

const ICON = "w-4 h-4 text-[#353C45] shrink-0";

/** Desktop account action: "Sign in" before login, the buyer's first name after. */
export default function AccountMenu({ loggedIn, user }: { loggedIn: boolean; user: ClientProfile | null }) {
  const router = useRouter();
  const name = user?.first_name || user?.username || "Account";

  return (
    <HeaderDropdown
      id="account-menu"
      ariaLabel={loggedIn ? `Account menu, ${name}` : "Sign in or register"}
      icon={<User className="w-5 h-5" aria-hidden />}
      label={loggedIn ? <span className="inline-block max-w-[6.5rem] truncate align-bottom">{name}</span> : "Sign in"}
    >
      {(close) => (
        <>
          {loggedIn ? (
            <div className="px-4 py-2.5 mb-1 border-b border-slate-100 bg-[#EDF1F6] -mt-1.5">
              <p className="text-sm font-bold text-[#121418] truncate">{displayName(user)}</p>
              <p className="text-xs text-[#353C45] truncate">{user?.email || ""}</p>
            </div>
          ) : (
            <>
              <Link href="/account/login" onClick={close} className={MENU_ITEM}>
                <User className={ICON} aria-hidden />
                <span>Sign in</span>
              </Link>
              <Link href="/account/register" onClick={close} className={MENU_ITEM}>
                <UserPlus className={ICON} aria-hidden />
                <span>Create account</span>
              </Link>
              <div className="border-t border-slate-100 my-1" />
            </>
          )}
          <Link href="/orders" onClick={close} className={MENU_ITEM}>
            <Package className={ICON} aria-hidden />
            <span>My orders</span>
          </Link>
          {loggedIn && (
            <>
              <Link href="/account/addresses" onClick={close} className={MENU_ITEM}>
                <MapPin className={ICON} aria-hidden />
                <span>Addresses</span>
              </Link>
              <Link href="/account" onClick={close} className={MENU_ITEM}>
                <User className={ICON} aria-hidden />
                <span>Profile &amp; settings</span>
              </Link>
            </>
          )}
          <Link href="/orders" onClick={close} className={MENU_ITEM}>
            <Truck className={ICON} aria-hidden />
            <span>Track order</span>
          </Link>
          {loggedIn && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                type="button"
                onClick={async () => {
                  close();
                  await clientLogout();
                  router.push("/account/login");
                }}
                className={`${MENU_ITEM} text-red-600 hover:text-red-700 hover:bg-red-50 focus-visible:bg-red-50`}
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden />
                <span>Sign out</span>
              </button>
            </>
          )}
        </>
      )}
    </HeaderDropdown>
  );
}
