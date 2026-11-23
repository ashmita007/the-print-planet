import React from "react";
import Navbar from "@/components/storefront/nav/Navbar";
import Footer from "@/components/storefront/Footer";
import MobileBottomBar from "@/components/storefront/MobileBottomBar";
import LeadPopup from "@/components/LeadPopup";
import { getCategories, getSiteSettings } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar categories={categories} settings={settings} />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer categories={categories} settings={settings} />
      <MobileBottomBar settings={settings} />
      <LeadPopup />
    </div>
  );
}
