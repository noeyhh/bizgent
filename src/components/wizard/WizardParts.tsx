import type { ReactNode } from "react"

export const cardShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.05)]"

export function StepBadge({ icon, children, size = "text-[12px]" }: { icon: string; children: ReactNode; size?: string }) {
  return (
    <span className="flex items-center gap-[6px] rounded-full bg-[#F1E8DA] px-[11px] py-[6px]">
      <img alt="" src={icon} className="size-[14px]" />
      <span className={`f-bold whitespace-pre text-[#8A6A55] ${size}`}>{children}</span>
    </span>
  )
}

export function WizardFooter({
  label,
  icon,
  disabled,
  onNext,
  compact,
}: {
  label: string
  icon: string
  disabled?: boolean
  onNext: () => void
  compact?: boolean
}) {
  return (
    <footer
      className={`sticky bottom-0 z-10 flex shrink-0 items-center justify-center border-t border-[rgba(30,30,40,0.15)] bg-white px-[70px] ${compact ? "h-[92px]" : "h-[88px]"}`}
    >
      <div className="flex w-full max-w-[1000px] items-center justify-end">
        <button
          type="button"
          disabled={disabled}
          onClick={onNext}
          className={`flex items-center gap-[8px] rounded-full border border-[#1E1E28] bg-[#1E1E28] hover:bg-[#31313D] disabled:cursor-not-allowed disabled:opacity-60 ${
            compact ? "h-[54px] px-[28px]" : "h-[56px] px-[24px]"
          }`}
        >
          <span className={`f-bold whitespace-nowrap text-white ${compact ? "text-[17px]" : "text-[18px]"}`}>{label}</span>
          <img alt="" src={icon} className={compact ? "size-[17px]" : "size-[18px]"} />
        </button>
      </div>
    </footer>
  )
}

export function AiBadge() {
  return (
    <span className="flex items-center gap-[4px] rounded-full bg-[#F1E8DA] px-[9px] py-[5px]">
      <img alt="" src="/assets/7b537.svg" className="size-[12px]" />
      <span className="f-bold text-[11px] text-[#8A6A55]">AI 추천</span>
    </span>
  )
}

export function LoadingState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-[16px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white px-[20px] py-[64px]" role="status">
      <span className="size-[40px] animate-spin rounded-full border-4 border-[#F1E8DA] border-t-[#D9643A]" />
      <p className="f-bold text-[18px] text-[#1E1E28]">{title}</p>
      <p className="f-regular text-[15px] text-[#6B6A72]">{desc}</p>
    </div>
  )
}

/** Downloads an image URL as a file (e.g. bizgent_시안A.png). */
export async function downloadImage(url: string, filename: string) {
  if (!url) return
  const blob = await fetch(url).then((r) => r.blob())
  const href = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}


/** Channel label used on draft cards: "인스타그램용" or "기타 · 직접 입력한 분위기". */
export const channelLabel = (channel: string, note?: string, suffix = "용") =>
  channel === "기타" ? `기타 · ${note?.trim() || "직접 입력한 분위기"}` : `${channel}${suffix}`
