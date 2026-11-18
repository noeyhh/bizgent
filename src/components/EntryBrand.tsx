export function BrandMark({ className = "size-[32px]" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 overflow-hidden rounded-full ${className}`} aria-hidden="true">
      <span className="h-full w-1/2 bg-[#1E1E28]" />
      <span className="h-full w-1/2 bg-[#D9643A]" />
    </span>
  )
}

export function EntryBrand({
  light = false,
  large = false,
}: {
  light?: boolean
  large?: boolean
}) {
  return (
    <div className="flex items-center gap-[12px]">
      <BrandMark />
      <span
        className={`${large ? "text-[28px]" : "text-[20px]"} font-bold tracking-[-0.04em] whitespace-nowrap ${light ? "text-[#1E1E28]" : "text-[#1E1E28]"}`}
      >
        bizgent
      </span>
    </div>
  )
}
