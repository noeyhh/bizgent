type UpgradeNoticeDialogProps = {
  open: boolean
  onUpgrade: () => void
  onClose: () => void
}

export function UpgradeNoticeDialog({
  open,
  onUpgrade,
  onClose,
}: UpgradeNoticeDialogProps) {
  if (!open) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E28]/45"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-limit-title"
        className="w-[400px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[28px] shadow-[0_20px_48px_rgba(30,30,40,0.16)]"
      >
        <h2 id="campaign-limit-title" className="f-bold text-[20px] text-[#1E1E28]">
          이번 달 무료 캠페인 3회를 모두 사용했어요
        </h2>
        <p className="f-regular mt-[10px] text-[14px] leading-[1.6] text-[#6B6A72]">
          캠페인을 더 만들려면 구독 플랜을 확인해주세요.
        </p>
        <div className="mt-[24px] flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="f-semibold h-[44px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[18px] text-[15px] text-[#1E1E28]"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="f-semibold h-[44px] rounded-full bg-[#1E1E28] px-[18px] text-[15px] text-white hover:bg-[#31313D]"
          >
            구독하기
          </button>
        </div>
      </div>
    </div>
  )
}
