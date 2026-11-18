import { useEffect, type ReactNode } from "react"

type Props = {
  title: string
  body: ReactNode
  onCancel: () => void
  onConfirm: () => void
}

/** Shared "move to next step?" confirmation used by every wizard step transition. */
export function ConfirmNextStepDialog({ title, body, onCancel, onConfirm }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E28]/45"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-next-title"
        aria-describedby="confirm-next-body"
        className="relative w-[420px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[28px] shadow-[0_20px_48px_rgba(30,30,40,0.16)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onCancel}
          className="absolute top-[20px] right-[20px] flex size-[32px] items-center justify-center rounded-full text-[#9A989F] hover:bg-[#F4F1EA] hover:text-[#6B6A72]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 id="confirm-next-title" className="f-bold pr-[32px] text-[20px] text-[#1E1E28]">{title}</h2>
        <p id="confirm-next-body" className="f-regular mt-[10px] text-[14px] leading-[1.6] text-[#6B6A72]">
          {body}
        </p>
        <p className="f-medium mt-[8px] text-[12px] text-[#9A989F]">이전 단계로 돌아갈 수 없어요.</p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button type="button" onClick={onCancel} className="f-semibold h-[44px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[18px] text-[15px] text-[#1E1E28]">
            취소
          </button>
          <button type="button" onClick={onConfirm} className="f-semibold h-[44px] rounded-full bg-[#1E1E28] px-[18px] text-[15px] text-white hover:bg-[#31313D]">
            확인하고 다음으로
          </button>
        </div>
      </div>
    </div>
  )
}
