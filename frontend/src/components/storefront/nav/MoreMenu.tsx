"use client";

import Link from "next/link";
import { Building2, FileText, Mail, MessageCircle, MoreVertical, Phone } from "lucide-react";
import HeaderDropdown, { MENU_ITEM } from "./HeaderDropdown";

const ICON = "w-4 h-4 text-[#353C45] shrink-0";

/** Flipkart-style overflow menu: the business links that do not get their own header slot. */
export default function MoreMenu({ phone }: { phone: string }) {
  const digits = phone.replace(/[^0-9]/g, "");
  return (
    <HeaderDropdown
      id="more-menu"
      ariaLabel="More: corporate, tariff, contact"
      icon={<MoreVertical className="w-5 h-5" aria-hidden />}
      label="More"
      chevron={false}
    >
      {(close) => (
        <>
          <Link href="/corporate" onClick={close} className={MENU_ITEM}>
            <Building2 className={ICON} aria-hidden />
            <span>Corporate &amp; Bulk</span>
          </Link>
          <Link href="/pricing" onClick={close} className={MENU_ITEM}>
            <FileText className={ICON} aria-hidden />
            <span>Wholesale Tariff</span>
          </Link>
          <Link href="/contact" onClick={close} className={MENU_ITEM}>
            <Mail className={ICON} aria-hidden />
            <span>Contact</span>
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <a href={`tel:+${digits}`} onClick={close} className={MENU_ITEM}>
            <Phone className={ICON} aria-hidden />
            <span className="tabular-nums">Call {phone}</span>
          </a>
          <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" onClick={close} className={MENU_ITEM}>
            <MessageCircle className={ICON} aria-hidden />
            <span>WhatsApp</span>
          </a>
        </>
      )}
    </HeaderDropdown>
  );
}
