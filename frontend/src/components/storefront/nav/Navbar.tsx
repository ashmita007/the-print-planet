"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileText, Menu, Phone, ShoppingCart } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { catalogueTotal } from "@/lib/catalogueTotal";
import TopBar from "./TopBar";
import CategoryStrip from "./CategoryStrip";
import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";
import MoreMenu from "./MoreMenu";
import MobileDrawer from "./MobileDrawer";
import { CDN_LOGO_URL, groupCategories, useClientAuth, useLiveCategories } from "./shared";

interface NavbarProps {
  categories?: Category[];
  settings?: SiteSettings;
  productTotal?: number;
}

const CONTAINER = "max-w-7xl 2xl:max-w-[1440px] min-[1700px]:max-w-[1600px] mx-auto px-4 sm:px-6";

export default function Navbar({ categories = [], settings, productTotal = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const { categories: live, refresh } = useLiveCategories(categories);
  const { loggedIn, user } = useClientAuth();
  const groups = useMemo(() => groupCategories(live), [live]);
  // Prefer the live catalogue size; fall back to the top-level counts if the API gave none.
  const total = catalogueTotal(productTotal, groups.map((g) => g.main.products_count ?? 0));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // One flag flips past the first pixel; the shadow fades with a plain CSS transition.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setDrawerOpen(false), [pathname]);

  // Growing the window to desktop hides the drawer; drop its open state with it.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setDrawerOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const phone = settings?.phone || "+91 97418 08034";
  const home = pathname === "/";
  const cartLabel = mounted && totalItems > 0 ? `View cart, ${totalItems} items` : "View cart";

  return (
    <>
      <TopBar phone={phone} />

      <header
        className={`w-full sticky top-0 z-40 bg-white border-b border-slate-200 transition-shadow duration-200 motion-reduce:transition-none ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className={CONTAINER}>
          <div className="flex flex-wrap items-center lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-5 xl:gap-x-8 lg:h-16">
            <div className="flex items-center h-14 lg:h-auto -ml-2.5 lg:ml-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-md text-[#121418] hover:bg-[#EDF1F6] active:bg-slate-200 transition-colors motion-reduce:transition-none"
              >
                <Menu className="w-6 h-6" aria-hidden />
              </button>
              <Link href="/" className="flex items-center shrink-0 py-1" title="The Print Planet Home">
                <Image
                  src={CDN_LOGO_URL}
                  alt="The Print Planet — Premium Custom Printing & Merchandise"
                  width={240}
                  height={70}
                  className="h-9 lg:h-10 w-auto object-contain"
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* One search field for every width: its own row on phones, centred in row 1 on desktop. */}
            <div className="order-last basis-full w-full pb-2.5 lg:order-none lg:basis-auto lg:pb-0 lg:max-w-3xl lg:mx-auto">
              <SearchBox />
            </div>

            <div className="ml-auto lg:ml-0 flex items-center gap-0.5 lg:gap-1 h-14 lg:h-auto -mr-2.5 lg:mr-0">
              {/* Phones: Account and Cart live in the bottom bar, so the header offers Call instead. */}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${phone}`}
                className="lg:hidden flex flex-col items-center justify-center w-12 h-11 rounded-md text-[#121418] hover:bg-[#EDF1F6] active:bg-slate-200"
              >
                <Phone className="w-5 h-5" aria-hidden />
                <span className="text-[10px] font-semibold leading-none mt-1">Call</span>
              </a>

              <div className="hidden lg:flex items-center gap-1">
                <AccountMenu loggedIn={loggedIn} user={user} />
                <button
                  type="button"
                  onClick={toggleCart}
                  aria-label={cartLabel}
                  title="Cart & quote list"
                  className="flex items-center gap-2 h-10 px-2.5 rounded-md text-sm font-semibold text-[#121418] hover:bg-[#EDF1F6] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[#121418]"
                >
                  <span className="relative">
                    <ShoppingCart className="w-5 h-5" aria-hidden />
                    {mounted && totalItems > 0 && (
                      <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#121418] text-white text-[10px] font-extrabold flex items-center justify-center">
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </span>
                  <span>Cart</span>
                </button>
                <MoreMenu phone={phone} />
                <Link
                  href="/quote"
                  className="ml-1 inline-flex items-center gap-1.5 h-10 bg-[#F26B1D] hover:bg-[#FF8A3D] active:scale-95 text-[#121418] px-4 rounded-md text-sm font-bold transition motion-reduce:transition-none motion-reduce:active:scale-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121418]"
                >
                  <FileText className="w-4 h-4" aria-hidden />
                  <span>Request Quote</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slim text bar under the sticky row on every page except Home. */}
        {!home && (
          <div className="hidden lg:block border-t border-slate-200 bg-[#F7F9FC]">
            <CategoryStrip groups={groups} total={total} onMenuOpen={refresh} tiles={false} />
          </div>
        )}
      </header>

      {/* Home: photo tiles that scroll away with the page. */}
      {home && (
        <div className="hidden lg:block bg-white border-b border-slate-200">
          <CategoryStrip groups={groups} total={total} onMenuOpen={refresh} tiles />
        </div>
      )}

      <MobileDrawer open={drawerOpen} onClose={closeDrawer} groups={groups} loggedIn={loggedIn} user={user} phone={phone} />
    </>
  );
}
