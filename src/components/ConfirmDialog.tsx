type ConfirmDialogProps = {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Small confirm popup in the same style as the other app dialogs. */
export function ConfirmDialog({ open, message, confirmLabel = "나가기", cancelLabel = "취소", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E1E28]/45"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        className="flex w-[400px] flex-col gap-[24px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[28px] shadow-[0_20px_48px_rgba(30,30,40,0.16)]"
      >
        <p id="confirm-dialog-message" className="f-bold text-[18px] leading-[1.45] text-[#1E1E28]">{message}</p>
        <div className="flex justify-end gap-[10px]">
          <button type="button" onClick={onCancel} className="f-bold flex h-[44px] items-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[20px] text-[15px] text-[#1E1E28] hover:bg-[#F4F1EA]">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="f-bold flex h-[44px] items-center rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[24px] text-[15px] text-white hover:bg-[#31313D]">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
