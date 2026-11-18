import { useState } from "react"
import { editImageWithAI, suggestCopyAlternatives } from "../../services/ai"
import type { CampaignDraft } from "../../store/types"
import { openUpgradeModal } from "../../services/upgrade"
import { downloadImage } from "./WizardParts"

const a = (f: string) => `/assets/${f}`

function LockedCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-[10px] rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] px-[14px] py-[12px] text-left"
    >
      <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white">
        <img alt="" src={a("d3905.svg")} className="size-[16px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="flex w-full items-center gap-[8px]">
          <span className="f-bold text-[14px] whitespace-nowrap text-[#1E1E28]">{title}</span>
          <span className="f-bold rounded-full bg-[#F1E8DA] px-[10px] py-[4px] text-[12px] whitespace-nowrap text-[#D9643A]">구독 전용</span>
        </span>
        <span className="f-regular w-full text-[13px] leading-[1.4] text-[#6B6A72]">{desc}</span>
      </span>
    </button>
  )
}

export function DraftEditModal({
  draft,
  isPro,
  storeName,
  toneManner,
  mood,
  onSave,
  onClose,
}: {
  draft: CampaignDraft
  isPro: boolean
  storeName: string
  toneManner?: string
  mood?: string
  onSave: (next: CampaignDraft) => void
  onClose: () => void
}) {
  const [text, setText] = useState(draft.text)
  const [tags, setTags] = useState(draft.hashtags)
  const [imageUrl, setImageUrl] = useState(draft.imageUrl)
  const [tagInput, setTagInput] = useState<string | null>(null)
  const [alternatives, setAlternatives] = useState<string[] | null>(null)
  const [busy, setBusy] = useState<"image" | "copy" | null>(null)
  const [instruction, setInstruction] = useState("")

  const addTag = () => {
    const v = tagInput?.trim().replace(/^#/, "")
    if (v && !tags.includes(v)) setTags([...tags, v])
    setTagInput(null)
  }
  const loadAlternatives = async () => {
    if (!isPro) return openUpgradeModal("AI 문구 대안")
    setBusy("copy")
    try {
      setAlternatives(await suggestCopyAlternatives({ storeName, originalText: text, channel: draft.channel, toneManner }))
    } finally {
      setBusy(null)
    }
  }
  const editImage = async () => {
    if (!instruction.trim()) return
    setBusy("image")
    try {
      const res = await editImageWithAI({ imageUrl, instruction: instruction.trim(), mood })
      setImageUrl(res.imageUrl)
      setInstruction("")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,32,51,0.4)]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-edit-title"
        className="flex h-[720px] max-h-[calc(100vh-32px)] w-[960px] max-w-[calc(100vw-32px)] flex-col gap-[20px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[24px] drop-shadow-[0px_18px_20px_rgba(16,24,40,0.1)]"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <h2 id="draft-edit-title" className="f-bold text-[28px] text-[#1E1E28]">시안 {draft.key} 수정</h2>
            <p className="f-regular text-[15px] leading-[1.5] text-[#6B6A72]">문구와 이미지를 직접 고칠 수 있어요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-[36px] shrink-0 items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] hover:bg-[#eef1f5]"
          >
            <img alt="" src={a("d0027.svg")} className="size-[18px]" />
          </button>
        </div>

        <div className="flex min-h-0 w-full flex-1 items-start gap-[24px] overflow-y-auto">
          <div className="flex w-[420px] shrink-0 flex-col gap-[12px]">
            <div className="relative h-[320px] w-full overflow-hidden rounded-[16px] bg-[#eef1f5]">
              {imageUrl && <img alt={`시안 ${draft.key} 이미지`} src={imageUrl} className="size-full rounded-[16px] object-cover" />}
              {busy === "image" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <span className="size-[32px] animate-spin rounded-full border-4 border-[#F1E8DA] border-t-[#1E1E28]" />
                </div>
              )}
              <button
                type="button"
                aria-label="이미지 다운로드"
                onClick={() => downloadImage(imageUrl, `bizgent_시안${draft.key}.png`)}
                className="absolute top-[12px] right-[12px] flex size-[36px] items-center justify-center rounded-full bg-white drop-shadow-[0px_4px_6px_rgba(16,24,40,0.1)]"
              >
                <img alt="" src={a("9fa09.svg")} className="size-[18px]" />
              </button>
            </div>
            {isPro ? (
              <div className="flex w-full flex-col gap-[8px] rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] px-[14px] py-[12px]">
                <p className="f-bold text-[14px] text-[#1E1E28]">AI로 이미지 수정하기</p>
                <div className="flex gap-[8px]">
                  <input
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && editImage()}
                    placeholder="예: 배경을 더 밝게 해주세요"
                    aria-label="이미지 수정 방향"
                    className="f-regular h-[40px] min-w-0 flex-1 rounded-[10px] border border-[#d0d7e2] bg-white px-[12px] text-[14px] outline-none focus:border-[#1E1E28]"
                  />
                  <button
                    type="button"
                    onClick={editImage}
                    disabled={!instruction.trim() || busy !== null}
                    className="f-bold h-[40px] shrink-0 rounded-full bg-[#1E1E28] px-[14px] text-[13px] text-white disabled:opacity-60"
                  >
                    수정하기
                  </button>
                </div>
              </div>
            ) : (
              <LockedCard title="AI로 이미지 수정하기" desc="수정하고 싶은 방향을 적으면 AI가 이미지를 다시 만들어줘요." onClick={() => openUpgradeModal("AI 이미지 수정")} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
            <div className="flex w-full flex-col gap-[8px]">
              <label htmlFor="draft-text" className="f-bold text-[14px] text-[#1E1E28]">홍보 문구</label>
              <textarea
                id="draft-text"
                value={text}
                maxLength={300}
                onChange={(e) => setText(e.target.value)}
                className="f-regular h-[140px] w-full resize-none rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-white p-[16px] text-[15px] leading-[1.55] text-[#1E1E28] outline-none focus:border-[#1E1E28]"
              />
              <div className="flex w-full items-center justify-between text-[13px]">
                <p className="f-regular text-[#6B6A72]">문구를 수정해 보세요</p>
                <p className="f-bold text-[#1E1E28]">{text.length}/300</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-[10px]">
              <p className="f-bold text-[14px] text-[#1E1E28]">해시태그</p>
              <div className="flex w-full flex-wrap items-start gap-[8px]">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-[6px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white py-[8px] pr-[10px] pl-[12px]">
                    <span className="f-semibold text-[13px] whitespace-nowrap text-[#1E1E28]">#{t}</span>
                    <button type="button" aria-label={`#${t} 삭제`} onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <img alt="" src={a("537c6.svg")} className="size-[14px]" />
                    </button>
                  </span>
                ))}
                {tagInput === null ? (
                  <button
                    type="button"
                    onClick={() => setTagInput("")}
                    className="f-bold flex items-center rounded-full border border-[#1E1E28] bg-[#F1E8DA] px-[12px] py-[8px] text-[13px] whitespace-nowrap text-[#1E1E28]"
                  >
                    + 해시태그 추가
                  </button>
                ) : (
                  <input
                    autoFocus
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onBlur={addTag}
                    onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && addTag()}
                    placeholder="#해시태그"
                    aria-label="해시태그 입력"
                    className="f-semibold h-[35px] w-[140px] rounded-full border border-[#1E1E28] bg-white px-[12px] text-[13px] outline-none"
                  />
                )}
              </div>
            </div>
            {isPro ? (
              <div className="flex w-full flex-col gap-[8px] rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] px-[14px] py-[12px]">
                <div className="flex items-center justify-between">
                  <p className="f-bold text-[14px] text-[#1E1E28]">AI 문구 대안 보기</p>
                  <button
                    type="button"
                    onClick={loadAlternatives}
                    disabled={busy !== null}
                    className="f-bold rounded-full bg-[#1E1E28] px-[12px] py-[6px] text-[12px] text-white disabled:opacity-60"
                  >
                    {busy === "copy" ? "제안 중..." : alternatives ? "다시 제안받기" : "제안받기"}
                  </button>
                </div>
                {alternatives?.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => setText(alt.slice(0, 300))}
                    className={`f-regular w-full rounded-[10px] border bg-white px-[12px] py-[10px] text-left text-[13px] leading-[1.5] text-[#1E1E28] ${text === alt ? "border-[#1E1E28]" : "border-[rgba(30,30,40,0.15)] hover:border-[#c7d2e2]"}`}
                  >
                    {alt}
                  </button>
                )) ?? <p className="f-regular text-[13px] text-[#6B6A72]">AI가 다른 표현을 3가지 제안해줘요.</p>}
              </div>
            ) : (
              <LockedCard title="AI 문구 대안 보기" desc="AI가 다른 표현을 3가지 제안해줘요." onClick={loadAlternatives} />
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-t border-[rgba(30,30,40,0.15)] pt-[16px]">
          <button type="button" onClick={onClose} className="f-bold flex h-[44px] items-center rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#6B6A72]">
            취소
          </button>
          <button
            type="button"
            onClick={() => onSave({ ...draft, text, hashtags: tags, imageUrl })}
            disabled={busy !== null}
            className="f-bold flex h-[44px] items-center rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[24px] text-[15px] text-white drop-shadow-[0px_10px_12px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28] disabled:opacity-60"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
