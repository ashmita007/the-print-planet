"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileText, Menu, Search, ShoppingBag, X } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { useCart } from "@/lib/cart";
import TopBar from "./TopBar";
import DesktopNav from "./DesktopNav";
import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";
import MobileDrawer from "./MobileDrawer";
import { CDN_LOGO_URL, groupCategories, useClientAuth, useLiveCategories } from "./shared";

interface NavbarProps {
  categories?: Category[];
  settings?: SiteSettings;
}

const ICON_BTN =
  "relative h-11 w-11 xl:h-10 xl:w-10 flex items-center justify-center rounded-md border border-slate-200 hover:border-[#B9C3CF] hover:bg-[#EDF1F6] text-slate-700 hover:text-[#121418] active:scale-95 transition motion-reduce:transition-none motion-reduce:active:scale-100";

export default function Navbar({ categories = [], settings }: NavbarProps) {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const { categories: live, refresh } = useLiveCategories(categories);
  const { loggedIn, user } = useClientAuth();
  const groups = useMemo(() => groupCategories(live), [live]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // One flag flips past the first pixel; the shadow fades with a plain CSS transition.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  // Growing the window past a breakpoint hides the drawer and the search bar; drop their open state with it.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const wide = window.matchMedia("(min-width: 1536px)");
    const onDesktop = () => desktop.matches && setDrawerOpen(false);
    const onWide = () => wide.matches && setSearchOpen(false);
    desktop.addEventListener("change", onDesktop);
    wide.addEventListener("change", onWide);
    return () => {
      desktop.removeEventListener("change", onDesktop);
      wide.removeEventListener("change", onWide);
    };
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  }, []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  const phone = settings?.phone || "+91 97418 08034";
  const email = settings?.email || "theprintplanet01@gmail.com";
  const cartLabel = mounted && totalItems > 0 ? `View cart, ${totalItems} items` : "View cart";

  return (
    <>
      <TopBar phone={phone} email={email} />

      <header
        className={`w-full sticky top-0 z-40 bg-white border-b border-slate-200 transition-shadow duration-200 motion-reduce:transition-none ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] min-[1700px]:max-w-[1600px] mx-auto px-3.5 sm:px-6">
          <div className="flex items-center h-16 xl:h-[4.5rem] gap-2 2xl:gap-3">
            <Link href="/" className="flex items-center shrink-0 py-1 mr-auto xl:mr-0" title="The Print Planet Home">
              <Image
                src={CDN_LOGO_URL}
                alt="The Print Planet — Premium Custom Printing & Merchandise"
                width={240}
                height={70}
                className="h-10 sm:h-12 xl:h-10 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>

            <DesktopNav groups={groups} onMenuOpen={refresh} />

            {/* Pushes the search field and actions to the right edge on desktop. */}
            <div className="hidden 2xl:flex flex-1 justify-end min-w-0">
              <SearchBox variant="field" onShortcutWhenHidden={openSearch} />
            </div>

            {/* Spacer: keeps the actions on the right edge when the search field is not shown. */}
            <div className="hidden xl:block 2xl:hidden flex-1 min-w-0" aria-hidden="true" />

            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              <button
                ref={searchButtonRef}
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label={searchOpen ? "Close search" : "Search products"}
                aria-expanded={searchOpen}
                aria-controls="mobile-search"
                className={`${ICON_BTN} 2xl:hidden`}
              >
                {searchOpen ? <X className="w-5 h-5" aria-hidden /> : <Search className="w-5 h-5" aria-hidden />}
              </button>

              <button type="button" onClick={toggleCart} aria-label={cartLabel} title="Cart & quote list" className={ICON_BTN}>
                <ShoppingBag className="w-5 h-5" aria-hidden />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#121418] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <AccountMenu loggedIn={loggedIn} user={user} />

              <Link
                href="/quote"
                className="hidden xl:inline-flex items-center gap-1.5 h-10 bg-[#F26B1D] hover:bg-[#FF8A3D] active:scale-95 text-[#121418] px-3 2xl:px-4 rounded-md text-sm font-bold transition motion-reduce:transition-none motion-reduce:active:scale-100 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" aria-hidden />
                <span>Request Quote</span>
              </Link>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                className={`${ICON_BTN} xl:hidden`}
              >
                <Menu className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width search below 2xl (the inline field needs the room); overlays the page so nothing shifts. */}
        {searchOpen && (
          <div id="mobile-search" className="2xl:hidden absolute inset-x-0 top-full bg-white border-b border-slate-200 shadow-md px-3.5 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto">
              <SearchBox variant="panel" onDone={() => setSearchOpen(false)} onClose={closeSearch} />
            </div>
          </div>
        )}
      </header>

      <MobileDrawer open={drawerOpen} onClose={closeDrawer} groups={groups} loggedIn={loggedIn} user={user} phone={phone} />
    </>
  );
}
