import { formatInr } from "@/lib/formatters";

type Breakdown = {
  subtotal?: string | null;
  shipping?: string | null;
  gst_rate?: string | null;
  cgst?: string | null;
  sgst?: string | null;
  igst?: string | null;
  tax?: string | null;
  total: string | number | null | undefined;
};

const isPositive = (value: string | null | undefined) => Number(value) > 0;

/** Subtotal, shipping, GST split and total, exactly as computed by the server. */
export default function QuoteBreakdown({ data, className = "" }: { data: Breakdown; className?: string }) {
  const rate = data.gst_rate ? `${Number(data.gst_rate)}%` : "";
  const split = isPositive(data.igst)
    ? [{ label: `IGST ${rate}`.trim(), value: data.igst }]
    : [
        { label: `CGST ${rate ? `${Number(data.gst_rate) / 2}%` : ""}`.trim(), value: data.cgst },
        { label: `SGST ${rate ? `${Number(data.gst_rate) / 2}%` : ""}`.trim(), value: data.sgst },
      ];
  const rows = [
    { label: "Goods subtotal", value: data.subtotal },
    { label: "Shipping", value: data.shipping },
    ...(data.tax ? split : []),
  ].filter((row) => row.value !== null && row.value !== undefined);

  return (
    <dl className={`text-xs space-y-1.5 ${className}`}>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4">
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="font-semibold text-[#121418] tabular-nums">{formatInr(row.value)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-[#DFE6EE] pt-2 text-sm">
        <dt className="font-bold text-[#121418]">Total</dt>
        <dd className="font-extrabold text-[#121418] tabular-nums">{formatInr(data.total)}</dd>
      </div>
    </dl>
  );
}
