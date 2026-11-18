import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { DraftEditModal } from "../../components/wizard/DraftEditModal"
import { channelLabel, downloadImage, LoadingState, StepBadge } from "../../components/wizard/WizardParts"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"
import { ConfirmNextStepDialog } from "../../components/wizard/ConfirmNextStepDialog"
import { generateDrafts } from "../../services/ai"
import type { CampaignDraft, CampaignDraftKey } from "../../store/types"

const a = (f: string) => `/assets/${f}`

export function CompareStepPage() {
  const navigate = useNavigate()
  const { data, draft, update, lockStep, menuNames } = useDraftCampaign()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<CampaignDraftKey | null>(null)
  const [confirming, setConfirming] = useState(false)
  const requested = useRef(false)
  const isPro = data.user.plan === "pro"
  const hasDrafts = Boolean(draft?.drafts.length)

  // Generate drafts once; skip when the draft already has them.
  useEffect(() => {
    if (!draft || hasDrafts || requested.current) return
    requested.current = true
    setLoading(true)
    generateDrafts({
      storeName: data.store.name,
      targetMenuName: menuNames.join(", "),
      goal: draft.goal,
      plan: draft.plan,
      channels: draft.contentSettings.channels,
      imageOn: draft.contentSettings.imageOn,
      imageSettings: draft.imageSettings,
    })
      .then((drafts) =>
        update((c) => ({
          drafts: drafts.map((d) => (c.contentSettings.hashtagOn ? d : { ...d, hashtags: [] })),
          selectedDraftKeys: [],
        })),
      )
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDrafts, Boolean(draft)])

  if (!draft) return <Navigate to="/campaigns/new/1" replace />
  if (!draft.contentSettings.channels.length) return <Navigate to="/campaigns/new/3-1" replace />

  const selected = draft.selectedDraftKeys ?? []
  const selectionLabel =
    selected.length > 1 ? `시안 ${selected.join(", ")} 선택됨 (${selected.length}개 게시)` : `시안 ${selected[0]} 선택됨`
  const toggleSelect = (key: CampaignDraftKey) =>
    update((c) => {
      const keys = c.selectedDraftKeys ?? []
      const next = keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
      // Keep keys in draft order (A, B, C).
      return { selectedDraftKeys: c.drafts.map((d) => d.key).filter((k) => next.includes(k)) }
    })
  const note = draft.contentSettings.customChannelNote
  const editingDraft = draft.drafts.find((d) => d.key === editing)
  const saveDraft = (next: CampaignDraft) => {
    update((c) => ({ drafts: c.drafts.map((d) => (d.key === next.key ? next : d)) }))
    setEditing(null)
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center gap-[18px] px-[70px] pt-[26px] pb-[20px]">
        <div className="flex w-full max-w-[1000px] flex-col items-center gap-[8px] text-center">
          <StepBadge icon={a("831ac.svg")} size="text-[14px]">4 단계</StepBadge>
          <h1 className="f-bold text-[34px] text-[#1E1E28]">마음에 드는 시안을 선택해주세요</h1>
          <p className="f-regular text-[18px] leading-[1.5] text-[#6B6A72]">무료 플랜에서는 2가지 시안을 비교할 수 있어요 (구독 시 3가지)</p>
        </div>

        {loading || !hasDrafts ? (
          <div className="w-full max-w-[1000px]">
            <LoadingState title="AI가 시안을 만들고 있어요" desc="기획 내용과 채널에 맞춰 문구와 이미지를 준비 중이에요" />
          </div>
        ) : (
          <div className="flex w-full max-w-[1000px] items-start gap-[24px]">
            {draft.drafts.map((d) => {
              const isSelected = selected.includes(d.key)
              return (
                <article
                  key={d.key}
                  className={`flex h-[536px] min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-white ${
                    isSelected
                      ? "border-2 border-[#1E1E28] shadow-[0px_10px_28px_0px_rgba(30,30,40,0.10)]"
                      : "border-2 border-[rgba(30,30,40,0.15)] shadow-[0px_5px_16px_0px_rgba(16,24,40,0.05)]"
                  }`}
                >
                  <div className="relative h-[228px] w-full shrink-0 bg-[#eef1f5]">
                    {d.imageUrl && <img alt={`시안 ${d.key} 광고 이미지`} src={d.imageUrl} className="absolute inset-0 size-full object-cover" />}
                    <div className="absolute inset-0 bg-[rgba(30,30,40,0.18)]" />
                    <span className="f-bold absolute top-[16px] left-[16px] rounded-full bg-white px-[12px] py-[7px] text-[14px] text-[#1E1E28] shadow-[0px_3px_10px_0px_rgba(16,24,40,0.1)]">
                      시안 {d.key}
                    </span>
                    {isSelected && (
                      <span className="absolute top-[16px] right-[60px] size-[30px]" aria-label="선택됨">
                        <span className="absolute inset-[-16.67%_-26.67%_-36.67%_-26.67%]">
                          <img alt="" src={a("80cca.svg")} className="block size-full max-w-none" />
                        </span>
                      </span>
                    )}
                    {d.imageUrl && (
                      <button
                        type="button"
                        aria-label={`시안 ${d.key} 이미지 다운로드`}
                        onClick={() => downloadImage(d.imageUrl, `bizgent_시안${d.key}.png`)}
                        className="absolute top-[12px] right-[12px] size-[36px]"
                      >
                        <span className="absolute inset-[-22.22%_-33.33%_-44.44%_-33.33%]">
                          <img alt="" src={a("9a7d7.svg")} className="block size-full max-w-none" />
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="flex min-h-0 w-full flex-1 flex-col gap-[12px] px-[20px] py-[18px]">
                    <div className="f-semibold flex w-full flex-col gap-[12px]">
                      <p className="w-full text-[13px] text-[#6B6A72]">{channelLabel(d.channel, note)}</p>
                      <p className="w-full text-[16px] leading-[1.55] text-[#1E1E28]">{d.text}</p>
                      {d.hashtags.length > 0 && (
                        <p className="w-full text-[14px] leading-[1.5] text-[#1E1E28]">{d.hashtags.map((t) => `#${t}`).join(" ")}</p>
                      )}
                    </div>
                    <div className="min-h-0 w-full flex-1" />
                    <div className="flex w-full flex-wrap items-center gap-[10px]">
                      <button
                        type="button"
                        onClick={() => setEditing(d.key)}
                        className="flex h-[44px] items-center gap-[8px] rounded-full border border-[#d0d7e2] bg-white px-[16px] hover:bg-[#F4F1EA]"
                      >
                        <img alt="" src={a("3179d.svg")} className="size-[18px]" />
                        <span className="f-semibold text-[16px] whitespace-nowrap text-[#6B6A72]">수정하기</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSelect(d.key)}
                        className="flex h-[44px] items-center gap-[8px] rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[16px] shadow-[0px_10px_24px_0px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28]"
                      >
                        <span className="relative size-[16px]">
                          <span className="absolute inset-[-6.88%_-6.88%_-12.14%_-6.88%]">
                            <img alt="" src={a("c167f.svg")} className="block size-full max-w-none" />
                          </span>
                        </span>
                        <span className="f-bold text-[16px] whitespace-nowrap text-white">{isSelected ? "선택됨" : "게시할 시안으로 선택"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 z-10 flex h-[88px] shrink-0 items-center justify-center border-t border-[rgba(30,30,40,0.15)] bg-white px-[70px]">
        <div className="flex w-full max-w-[1000px] items-center justify-between">
          <div className="flex items-center gap-[12px]">
            {selected.length > 0 && (
              <span className="flex items-center gap-[6px] rounded-full bg-[#F1E8DA] px-[12px] py-[7px]">
                <img alt="" src={a("df502.svg")} className="size-[16px]" />
                <span className="f-semibold text-[14px] whitespace-nowrap text-[#1E1E28]">{selectionLabel}</span>
              </span>
            )}
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => setConfirming(true)}
              className="flex h-[56px] items-center rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[24px] shadow-[0px_10px_24px_0px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="f-bold text-[16px] whitespace-nowrap text-white">다음: 게시하기</span>
            </button>
          </div>
        </div>
      </footer>

      {editingDraft && (
        <DraftEditModal
          draft={editingDraft}
          isPro={isPro}
          storeName={data.store.name}
          toneManner={(draft.toneManners ?? []).join(", ")}
          mood={draft.imageSettings.mood}
          onSave={saveDraft}
          onClose={() => setEditing(null)}
        />
      )}
      {confirming && (
        <ConfirmNextStepDialog
          title="게시 단계로 넘어갈까요?"
          body={`선택한 시안 ${selected.length}개로 게시 단계로 넘어가요. 시안 선택과 수정 내용은 이후 변경할 수 없어요.`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            lockStep("4")
            navigate("/campaigns/new/5")
          }}
        />
      )}
    </>
  )
}
