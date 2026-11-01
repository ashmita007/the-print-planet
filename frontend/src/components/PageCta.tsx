import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

interface PageCtaProps {
  title: string;
  whatsappText?: string;
}

/** The single closing action on inner pages: ask for a price, or message the desk. */
export default function PageCta({ title, whatsappText = "Hi, I would like a quote." }: PageCtaProps) {
  return (
    <section data-reveal className="bg-[#F3F5F7] border-t border-[#D8DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16324F] max-w-xl">{title}</h2>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/quote"
            data-magnetic
            className="inline-flex items-center gap-2 bg-[#D9601A] hover:bg-[#B94E12] text-white px-5 py-3 rounded-lg text-sm font-bold transition-colors"
          >
            Get a quote
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`https://wa.me/919741808034?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-[#D8DEE5] hover:border-[#16324F] text-[#16324F] px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#217A4B]" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
