import { useEffect, useState } from "react"

const items = [
  { key: "age", label: "만 14세 이상입니다 (필수)" },
  { key: "terms", label: "이용약관에 동의합니다 (필수)" },
  { key: "privacy", label: "개인정보 수집 및 이용에 동의합니다 (필수)" },
] as const

type AgreementKey = (typeof items)[number]["key"]

export function TermsModal({
  open,
  onClose,
  onAgree,
}: {
  open: boolean
  onClose: () => void
  onAgree: () => void
}) {
  const [checked, setChecked] = useState<Record<AgreementKey, boolean>>({
    age: false,
    terms: false,
    privacy: false,
  })
  const allChecked = items.every((item) => checked[item.key])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  const setAll = (value: boolean) =>
    setChecked({ age: value, terms: value, privacy: value })

  return (
    <div className="entry-editorial pd-scope fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,30,40,0.56)] p-[24px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="relative flex h-[580px] max-h-[calc(100vh-48px)] w-[900px] max-w-full overflow-hidden rounded-[22px] border border-[rgba(30,30,40,0.15)] bg-white shadow-[0_20px_48px_rgba(30,30,40,0.18)] max-md:w-[495px]"
      >
        <button
          type="button"
          aria-label="취소"
          onClick={onClose}
          className="absolute top-[24px] right-[24px] z-10 flex size-[40px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white transition-colors duration-150 hover:bg-[#F4F1EA]"
        >
          <img alt="" src="/assets/9c9d5.svg" className="size-[16px]" />
        </button>

        <div className="flex h-full w-[495px] max-w-full flex-col justify-between overflow-y-auto p-[40px] max-sm:p-[28px]">
          <div className="flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[8px]">
              <h2 id="terms-title" className="text-[28px] font-extrabold tracking-[-0.03em] text-[#1E1E28]">
                이용약관
              </h2>
              <p className="text-[14px] font-medium text-[#6B6A72]">
                서비스 이용을 위해 아래 약관에 동의해 주세요.
              </p>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-[12px] border-b-2 border-[rgba(30,30,40,0.15)] py-[16px]">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(event) => setAll(event.target.checked)}
                  className="sr-only"
                />
                <CheckBox checked={allChecked} />
                <span className="text-[18px] font-bold text-[#1E1E28]">전체 동의</span>
              </label>
              {items.map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-[12px] border-b border-[rgba(30,30,40,0.10)] py-[14px]"
                >
                  <input
                    type="checkbox"
                    checked={checked[item.key]}
                    onChange={(event) =>
                      setChecked((current) => ({
                        ...current,
                        [item.key]: event.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <CheckBox checked={checked[item.key]} />
                  <span className="flex-1 text-[15px] font-medium text-[#6B6A72]">
                    {item.key === "terms" ? (
                      <>
                        <span className="text-[#D9643A] underline">이용약관</span>에 동의합니다 (필수)
                      </>
                    ) : (
                      item.label
                    )}
                  </span>
                  {item.key === "privacy" && (
                    <span className="text-[13px] font-bold text-[#6B6A72] underline">
                      더보기
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!allChecked}
            onClick={onAgree}
            className="btn-primary flex h-[54px] w-full items-center justify-center rounded-full bg-[#1E1E28] text-[18px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#C8C5BF]"
          >
            동의 및 계속하기
          </button>
        </div>

        <div className="flex h-full w-[405px] flex-col items-center justify-center bg-[#1E1E28] max-md:hidden">
          <div className="relative size-[320px]">
            <img alt="" src="/assets/d1f73.svg" className="absolute top-1/2 left-1/2 size-[200px] -translate-x-1/2 -translate-y-1/2" />
            <img alt="" src="/assets/d2552.svg" className="absolute top-1/2 left-1/2 size-[140px] -translate-x-1/2 -translate-y-1/2" />
            <span className="absolute top-1/2 left-1/2 flex size-[90px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
              <span className="flex size-[48px] items-center justify-center rounded-[14px] bg-[#D9643A]">
                <img alt="" src="/assets/ea787.svg" className="size-[24px]" />
              </span>
            </span>
            <FloatingIcon className="top-[45px] left-[45px]" src="/assets/8e2d4.svg" />
            <FloatingIcon className="top-[50px] left-[235px]" src="/assets/e5e9d.svg" />
            <FloatingIcon className="top-[170px] left-[20px]" src="/assets/ccd45.svg" />
            <FloatingIcon className="top-[190px] left-[245px]" src="/assets/1216c.svg" />
            <FloatingIcon className="top-[255px] left-[138px]" src="/assets/4228c.svg" />
          </div>
          <div className="mt-[-18px] text-center">
            <p className="text-[20px] font-extrabold text-white">AI 기반 매장 자동 성장의 힘</p>
            <p className="mt-[8px] text-[14px] leading-[20px] font-medium text-[#D8D4CC]">
              기획, 광고, 분석까지 AI 에이전트<br />BizGent가 알아서 관리해 드립니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function CheckBox({ checked }: { checked: boolean }) {
  return checked ? (
    <span className="flex size-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#D9643A] transition-colors">
      <svg viewBox="0 0 24 24" fill="none" className="size-[16px]" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : (
    <span className="size-[24px] shrink-0 rounded-[6px] border-2 border-[#B9B5AE] bg-white" />
  )
}

function FloatingIcon({ className, src }: { className: string; src: string }) {
  return (
    <span className={`absolute flex size-[44px] items-center justify-center rounded-full border border-white/20 bg-white ${className}`}>
      <img alt="" src={src} className="size-[22px]" />
    </span>
  )
}
