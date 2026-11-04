/** Mirrors ProductCard's box model, so nothing jumps when real products arrive. */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#DFE6EE] rounded-lg overflow-hidden flex flex-col h-full">
      <div className="w-full aspect-square skeleton !rounded-none" />
      <div className="p-3 sm:p-3.5 min-h-[153px] sm:min-h-[160px] flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="h-3 w-20 skeleton mb-1.5" />
          <div className="min-h-[2.5rem] space-y-1.5 pt-0.5">
            <div className="h-3.5 w-11/12 skeleton" />
            <div className="h-3.5 w-3/5 skeleton" />
          </div>
          <div className="h-3 w-24 skeleton mt-1.5" />
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-20 skeleton" />
            <div className="h-2.5 w-12 skeleton" />
          </div>
          <div className="w-9 h-9 skeleton rounded-md shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count, className }: { count: number; className: string }) {
  return (
    <div aria-hidden="true" className={`grid gap-2 sm:gap-4 md:gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
