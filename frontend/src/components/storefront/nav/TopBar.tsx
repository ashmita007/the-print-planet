import { Phone } from "lucide-react";
import { ANNOUNCEMENT } from "./shared";

/** Dark strip above the desktop header. Not sticky, so it scrolls away. Phones skip it: the drawer has Call. */
export default function TopBar({ phone }: { phone: string }) {
  return (
    <div className="hidden lg:flex h-9 items-center bg-[#121418] text-white text-xs px-6">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] min-[1700px]:max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        <p className="text-slate-200 font-medium">{ANNOUNCEMENT}</p>
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="flex items-center gap-1.5 font-semibold tabular-nums text-white whitespace-nowrap hover:text-[#B9C3CF] transition-colors motion-reduce:transition-none"
        >
          <Phone className="w-3.5 h-3.5 text-slate-300" aria-hidden />
          <span>{phone}</span>
        </a>
      </div>
    </div>
  );
}
