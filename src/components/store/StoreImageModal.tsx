import { useEffect, useState, type ReactNode } from "react"
import { ConfirmDialog } from "../ConfirmDialog"
import { downloadImage } from "../wizard/WizardParts"
import { generateStoreImage, type GeneratedStoreImage } from "../../services/ai"
import { openUpgradeModal } from "../../services/upgrade"
import type { Plan, Store } from "../../store/types"

const a = (f: string) => `/assets/${f}`
const MOODS = ["따뜻한 감성", "깔끔한 모던", "빈티지", "밝고 경쾌한"]
const SCENES = ["매장 외관", "매장 내부", "대표 메뉴", "메뉴와 공간 함께"]
const MENU_SCENES = ["대표 메뉴", "메뉴와 공간 함께"]

type Phase = "settings" | "generating" | "result"

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex h-[38px] items-center gap-[7px] rounded-full border px-[16px] text-[14px] whitespace-nowrap ${
        selected
          ? "f-semibold border-[#2563eb] bg-[#2563eb] text-white"
          : "f-medium border-[#d5dce7] bg-white text-[#667085] hover:bg-[#f7f9fc]"
      }`}
    >
      {selected && <img alt="" src={a("a244b.svg")} className="size-[14px]" />}
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      <p className="f-semibold text-[14px] text-[#172033]">{label}</p>
      {children}
    </div>
  )
}

export function StoreImageModal({
  store,
  plan,
  onApply,
  onClose,
  /** Current (possibly unsaved) store form values. */
}: {
  store: Store
  plan: Plan
  onApply: (imageUrl: string) => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<Phase>("settings")
  const [mood, setMood] = useState("")
  const [scene, setScene] = useState("")
  const [menuId, setMenuId] = useState(store.menus[0]?.id ?? "")
  const [extra, setExtra] = useState("")
  const [images, setImages] = useState<GeneratedStoreImage[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmClose, setConfirmClose] = useState(false)

  const needsMenu = MENU_SCENES.includes(scene)
  const canGenerate = Boolean(mood && scene)

  const generate = async () => {
    setPhase("generating")
    setSelected(null)
    const result = await generateStoreImage(
      {
        mood,
        scene,
        menuId: needsMenu ? menuId : undefined,
        extraRequest: extra.trim(),
      },
      store,
    )
    setImages(result)
    setPhase("result")
  }

  const requestClose = () => {
    if (phase === "result") setConfirmClose(true)
    else if (phase === "settings") onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !confirmClose && requestClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const summary = [
    store.name || "매장명 미입력",
    store.category,
    store.toneManner,
  ].filter(Boolean)
  const chosen = images.find((img) => img.id === selected)

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,32,51,0.4)]"
      onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-image-title"
        className="flex max-h-[calc(100vh-32px)] w-[640px] max-w-[calc(100vw-32px)] flex-col gap-[20px] rounded-[20px] border border-[#e5eaf1] bg-white p-[24px] drop-shadow-[0px_18px_20px_rgba(16,24,40,0.1)]"
      >
        <div className="flex w-full items-start justify-between gap-[12px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <h2
              id="store-image-title"
              className="f-bold text-[28px] text-[#172033]"
            >
              AI로 매장 대표 이미지 만들기
            </h2>
            <p className="f-regular text-[15px] leading-[1.5] text-[#667085]">
              매장 정보를 바탕으로 대표 이미지 3장을 만들어 드려요
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={phase === "generating"}
            aria-label="닫기"
            className="flex size-[36px] shrink-0 items-center justify-center rounded-full border border-[#e5eaf1] bg-[#f7f9fc] hover:bg-[#eef1f5] disabled:opacity-40"
          >
            <img alt="" src={a("d0027.svg")} className="size-[18px]" />
          </button>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-[20px] overflow-y-auto">
          {phase === "settings" && (
            <>
              <div
                className="flex w-full flex-wrap items-center gap-[8px]"
                aria-label="매장 정보 요약"
              >
                {summary.map((s, i) => (
                  <span
                    key={i}
                    className="f-semibold rounded-full bg-[#f0edff] px-[12px] py-[6px] text-[13px] text-[#5b3fd1]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <Field label="이미지 분위기">
                <div
                  role="radiogroup"
                  aria-label="이미지 분위기"
                  className="flex flex-wrap gap-[10px]"
                >
                  {MOODS.map((m) => (
                    <Chip
                      key={m}
                      selected={mood === m}
                      onClick={() => setMood(m)}
                    >
                      {m}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="담고 싶은 장면">
                <div
                  role="radiogroup"
                  aria-label="담고 싶은 장면"
                  className="flex flex-wrap gap-[10px]"
                >
                  {SCENES.map((s) => (
                    <Chip
                      key={s}
                      selected={scene === s}
                      onClick={() => setScene(s)}
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
              </Field>
              {needsMenu && (
                <Field label="메뉴 선택">
                  <label className="relative flex h-[46px] w-full items-center rounded-[12px] border border-[#d5dce7] bg-white focus-within:border-[#2563eb]">
                    <select
                      value={menuId}
                      onChange={(e) => setMenuId(e.target.value)}
                      aria-label="메뉴 선택"
                      className="f-regular size-full appearance-none bg-transparent pr-[40px] pl-[14px] text-[15px] text-[#172033] outline-none"
                    >
                      {store.menus.map((m, i) => (
                        <option key={m.id} value={m.id}>
                          {m.name || `등록 상품 ${i + 1}`}
                          {i === 0 ? " (대표 메뉴)" : ""}
                        </option>
                      ))}
                    </select>
                    <img
                      alt=""
                      src={a("73ce0.svg")}
                      className="pointer-events-none absolute right-[14px] size-[17px]"
                    />
                  </label>
                </Field>
              )}
              <Field label="추가 요청 (선택)">
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="예: 창가 자리에 햇살이 들어오는 느낌"
                  className="f-regular h-[96px] w-full resize-none rounded-[12px] border border-[#d5dce7] bg-white p-[14px] text-[15px] leading-[1.45] text-[#172033] outline-none placeholder:text-[#98a2b3] focus:border-[#2563eb]"
                />
              </Field>
            </>
          )}

          {phase === "generating" && (
            <div className="flex w-full flex-col gap-[20px]" role="status">
              <div className="flex w-full flex-col items-center gap-[16px] rounded-[18px] border border-[#e5eaf1] bg-white px-[20px] py-[32px]">
                <span className="size-[40px] animate-spin rounded-full border-4 border-[#f1efff] border-t-[#2563eb]" />
                <p className="f-bold text-[18px] text-[#172033]">
                  대표 이미지를 만들고 있어요
                </p>
                <p className="f-regular text-[15px] text-[#667085]">
                  {mood} · {scene}
                </p>
              </div>
              <div className="grid w-full grid-cols-3 gap-[14px]">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square w-full animate-pulse rounded-[16px] bg-[#eef1f5]"
                  />
                ))}
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="flex w-full flex-col gap-[12px]">
              <div className="flex w-full items-center justify-between">
                <p className="f-semibold text-[14px] text-[#172033]">
                  마음에 드는 이미지를 골라주세요
                </p>
                <button
                  type="button"
                  onClick={() =>
                    plan === "pro"
                      ? generate()
                      : openUpgradeModal("대표 이미지 다시 만들기")
                  }
                  className="f-semibold flex items-center gap-[6px] text-[14px] text-[#2563eb] hover:underline"
                >
                  {plan !== "pro" && (
                    <span className="f-bold rounded-full bg-[#f0edff] px-[8px] py-[3px] text-[11px] text-[#6d4aff]">
                      구독 전용
                    </span>
                  )}
                  다시 만들기
                </button>
              </div>
              <div
                role="radiogroup"
                aria-label="생성된 대표 이미지"
                className="grid w-full grid-cols-3 gap-[14px]"
              >
                {images.map((img, i) => {
                  const on = img.id === selected
                  return (
                    <div
                      key={img.id}
                      role="radio"
                      aria-checked={on}
                      aria-label={`이미지 ${i + 1}`}
                      tabIndex={0}
                      onClick={() => setSelected(img.id)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        (e.preventDefault(), setSelected(img.id))
                      }
                      className={`relative aspect-square w-full cursor-pointer overflow-hidden rounded-[16px] border-2 ${
                        on
                          ? "border-[#2563eb]"
                          : "border-transparent hover:border-[#ded8ff]"
                      }`}
                    >
                      <img
                        alt={img.alt}
                        src={img.imageUrl}
                        className="absolute inset-0 size-full object-cover"
                      />
                      {on && (
                        <span className="absolute top-[10px] right-[10px] flex size-[26px] items-center justify-center rounded-full bg-[#2563eb] shadow-[0px_4px_10px_0px_rgba(37,99,235,0.3)]">
                          <img
                            alt=""
                            src={a("a244b.svg")}
                            className="size-[14px]"
                          />
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`이미지 ${i + 1} 다운로드`}
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(
                            img.imageUrl,
                            `bizgent_대표이미지${i + 1}.jpg`,
                          )
                        }}
                        className="absolute right-[10px] bottom-[10px] flex size-[32px] items-center justify-center rounded-[10px] bg-white shadow-[0px_5px_16px_0px_rgba(16,24,40,0.12)] hover:bg-[#f7f9fc]"
                      >
                        <img
                          alt=""
                          src={a("49184.svg")}
                          className="size-[17px]"
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-between border-t border-[#e5eaf1] pt-[16px]">
          {phase === "result" ? (
            <>
              <button
                type="button"
                onClick={() => setPhase("settings")}
                className="f-bold flex h-[44px] items-center rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#667085] hover:bg-[#f7f9fc]"
              >
                설정 다시 하기
              </button>
              <button
                type="button"
                disabled={!chosen}
                onClick={() => chosen && onApply(chosen.imageUrl)}
                className="f-bold flex h-[44px] items-center rounded-full border border-[#2563eb] bg-[#2563eb] px-[24px] text-[15px] text-white drop-shadow-[0px_10px_12px_rgba(37,99,235,0.14)] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:hover:bg-[#2563eb]"
              >
                이 이미지로 설정
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={requestClose}
                disabled={phase === "generating"}
                className="f-bold flex h-[44px] items-center rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#667085] hover:bg-[#f7f9fc] disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!canGenerate || phase === "generating"}
                onClick={generate}
                className="f-bold flex h-[44px] items-center rounded-full border border-[#2563eb] bg-[#2563eb] px-[24px] text-[15px] text-white drop-shadow-[0px_10px_12px_rgba(37,99,235,0.14)] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:hover:bg-[#2563eb]"
              >
                이미지 만들기
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmClose}
        message="만든 이미지가 저장되지 않아요. 닫으시겠어요?"
        confirmLabel="닫기"
        onConfirm={onClose}
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  )
}
