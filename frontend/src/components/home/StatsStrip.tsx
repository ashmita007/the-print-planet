import React from "react";
import { BadgeCheck, Factory, MapPinned, FileText } from "lucide-react";

const BADGES = [
  { icon: Factory, label: "Factory direct" },
  { icon: FileText, label: "GST invoice" },
  { icon: MapPinned, label: "Pan-India delivery" },
  { icon: BadgeCheck, label: "Proof before print" },
];

/** Live product count and service facts, each topped with a palette-shade bar. */
export default function StatsStrip({ productCount }: { productCount: number }) {
  const stats = [
    { value: `${productCount}+`, label: "Products in the catalogue", ink: "#F26B1D", count: true },
    { value: "36", label: "States and union territories served", ink: "#353C45", count: true },
    { value: "24–48h", label: "Dispatch time across India", ink: "#6C7A89", count: false },
    { value: "100", label: "Pieces minimum for bulk orders", ink: "#B9C3CF", count: true },
  ];

  return (
    <section aria-label="The Print Planet in numbers" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-20">
      <div className="bg-white rounded-2xl border border-[#DFE6EE] shadow-[0_24px_50px_-28px_rgba(34,39,46,0.35)] overflow-hidden">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`relative p-5 sm:p-7 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} lg:border-l lg:first:border-l-0 border-[#DFE6EE]`}
            >
              <span aria-hidden="true" className="absolute top-0 left-5 sm:left-7 w-10 h-1 rounded-b" style={{ background: stat.ink }} />
              <dd className="font-heading text-3xl sm:text-4xl font-extrabold text-[#121418] tabular-nums">
                {stat.count ? <span data-count>{stat.value}</span> : stat.value}
              </dd>
              <dt className="mt-1 text-sm text-[#353C45]">{stat.label}</dt>
            </div>
          ))}
        </dl>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-4 bg-[#EDF1F6] border-t border-[#DFE6EE]">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <li key={badge.label} className="flex items-center gap-2 text-sm font-semibold text-[#121418]">
                <Icon className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                {badge.label}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
