import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { ConfirmNextStepDialog } from "../../components/wizard/ConfirmNextStepDialog"
import { useAppStore } from "../../store/AppContext"
import { createEmptyCampaign, sanitizeCampaigns } from "../../store/campaign"
import type { Campaign } from "../../store/types"

const a = (file: string) => `/assets/${file}`
const cardShadow = "shadow-[0px_5px_16px_0px_rgba(16,24,40,0.05)]"
const CUSTOM_GOAL = "기타 (직접 입력)"

const goalOptions = [
  [
    { label: "신메뉴/신상품 홍보", icon: "3697b.svg" },
    { label: "재방문 유도", icon: "50f8b.svg" },
    { label: "매장 인지도 확대", icon: "0c8e7.svg" },
  ],
  [
    { label: "할인/이벤트 홍보", icon: "3ee8c.svg" },
    { label: "신규 고객 유치", icon: "28b03.svg" },
    { label: "재고 소진 프로모션", icon: "3ee8c.svg" },
  ],
  [{ label: "비인기 메뉴 살리기", icon: "3697b.svg" }],
]
const targetPresets = ["20대", "30대", "직장인", "10대", "40대 이상", "학생", "가족 단위", "1인 가구"]
const tonePresets = ["친근한", "감성적인", "전문적인", "트렌디한", "신뢰감있는", "유쾌한"]

const splitTags = (value: string) =>
  value.split(/[,·/]/).map((s) => s.trim()).filter(Boolean)
const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-[36px] items-center rounded-full border px-[12px] text-[14px] whitespace-nowrap ${
        selected
          ? "f-semibold border-[#1E1E28] bg-[#F1E8DA] text-[#1E1E28]"
          : "f-medium border-[#d0d7e2] bg-white text-[#6B6A72]"
      }`}
    >
      {children}
    </button>
  )
}

function TagGroup({
  label,
  presets,
  selected,
  placeholder,
  onChange,
  onLoad,
  loadButtonClassName = "rounded-[998px] border",
}: {
  label: string
  presets: string[]
  selected: string[]
  placeholder: string
  onChange: (next: string[]) => void
  onLoad: () => void
  loadButtonClassName?: string
}) {
  const [text, setText] = useState("")
  const options = [...presets, ...selected.filter((s) => !presets.includes(s))]
  const add = () => {
    const v = text.trim()
    if (v && !selected.includes(v)) onChange([...selected, v])
    setText("")
  }

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <p className="f-semibold text-[14px] whitespace-nowrap text-[#6B6A72]">{label}</p>
        <button
          type="button"
          onClick={onLoad}
          className={`f-medium flex h-[19px] w-[117px] items-center justify-center ${loadButtonClassName} border-[#d0d7e2] bg-[#c3ddef] text-[12px] whitespace-nowrap text-[#6B6A72]`}
        >
          등록 정보 불러오기
        </button>
      </div>
      <div className="flex w-full flex-wrap gap-[8px]">
        {options.map((o) => (
          <Chip key={o} selected={selected.includes(o)} onClick={() => onChange(toggle(selected, o))}>
            {o}
          </Chip>
        ))}
        <div className="flex w-[220px] items-center gap-[8px]">
          <Chip selected={false} onClick={add}>+ 기타</Chip>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && add()}
            placeholder={placeholder}
            aria-label={`${label} 기타 입력`}
            className="f-regular h-[36px] w-[120px] shrink-0 rounded-full border border-[#d0d7e2] bg-white px-[12px] text-[14px] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#1E1E28]"
          />
          <button
            type="button"
            onClick={add}
            className="f-semibold flex h-[36px] shrink-0 items-center rounded-full border border-[#d0d7e2] bg-white px-[12px] text-[14px] whitespace-nowrap text-[#6B6A72]"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  )
}

export function GoalStepPage() {
  const { data, setData } = useAppStore()
  const { store } = data
  const campaigns = sanitizeCampaigns(data.campaigns)
  const draft = campaigns.find((c) => c.id === data.activeDraftId && c.status === "draft")
  const [menuInput, setMenuInput] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const navigate = useNavigate()

  // Start a new draft campaign the first time the wizard opens.
  useEffect(() => {
    if (draft) return
    setData((prev) => {
      const validCampaigns = sanitizeCampaigns(prev.campaigns)
      if (validCampaigns.some((c) => c.id === prev.activeDraftId && c.status === "draft")) {
        return validCampaigns.length === prev.campaigns.length
          ? prev
          : { ...prev, campaigns: validCampaigns }
      }
      const next = createEmptyCampaign()
      return { ...prev, campaigns: [...validCampaigns, next], activeDraftId: next.id }
    })
  }, [draft, setData])

  if (!draft) return null

  const update = (patch: Partial<Campaign>) =>
    setData((prev) => ({
      ...prev,
      campaigns: sanitizeCampaigns(prev.campaigns).map((c) => {
        if (c.id !== draft.id) return c
        const merged = { ...c, ...patch, updatedAt: new Date().toISOString() }
        const inputsChanged = ["goalOption", "customGoal", "targetMenuIds", "targetCustomers", "toneManners"].some(
          (k) => k in patch,
        )
        const goal = merged.goalOption === CUSTOM_GOAL ? (merged.customGoal ?? "") : (merged.goalOption ?? "")
        return {
          ...merged,
          goal,
          title: goal || "새 캠페인",
          targetMenuId: merged.targetMenuIds?.[0] ?? "",
          // Step 1 changes invalidate the AI plan so step 2 regenerates it.
          plan: inputsChanged
            ? { direction: "", strategy: "", expectedEffect: "", targetCustomer: (merged.targetCustomers ?? []).join(", ") }
            : merged.plan,
        }
      }),
    }))

  const goalOption = draft.goalOption ?? ""
  const menuIds = draft.targetMenuIds ?? []
  const customSelected = goalOption === CUSTOM_GOAL
  const canNext = Boolean(draft.goal.trim()) && menuIds.length > 0

  const addCustomMenu = () => {
    const name = menuInput?.trim()
    setMenuInput(null)
    if (!name) return
    const existing = store.menus.find((m) => m.name === name)
    const id = existing?.id ?? `menu-${Date.now()}`
    if (!existing) {
      setData((prev) => ({
        ...prev,
        store: { ...prev.store, menus: [...prev.store.menus, { id, name, price: 0, stock: 0 }] },
      }))
    }
    if (!menuIds.includes(id)) update({ targetMenuIds: [...menuIds, id] })
  }

  const goalCard = (opt: { label: string; icon: string }) => {
    const selected = goalOption === opt.label
    return (
      <button
        key={opt.label}
        type="button"
        aria-pressed={selected}
        onClick={() => update({ goalOption: opt.label })}
        className={`flex h-[112px] w-full min-w-0 flex-1 items-center gap-[12px] rounded-[16px] p-[18px] text-left ${cardShadow} ${
          selected ? "border-[1.5px] border-[#1E1E28] bg-[#F1E8DA]" : "border border-[rgba(30,30,40,0.15)] bg-white hover:border-[#c7d2e2]"
        }`}
      >
        <span className={`flex size-[40px] shrink-0 items-center justify-center rounded-[14px] ${selected ? "bg-white" : "bg-[#F1E8DA]"}`}>
          <img alt="" src={a(opt.icon)} className="size-[20px]" />
        </span>
        <span className={`f-semibold min-w-0 flex-1 text-[17px] leading-[1.4] ${selected ? "text-[#1E1E28]" : "text-[#1E1E28]"}`}>
          {opt.label}
        </span>
      </button>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center pt-[32px] pb-[28px]">
        <div className="flex w-[700px] flex-col gap-[28px]">
          <div className="flex w-full flex-col items-center gap-[8px] text-center">
            <span className="flex items-center gap-[6px] rounded-full bg-[#F1E8DA] px-[11px] py-[6px]">
              <img alt="" src={a("eebbb.svg")} className="size-[14px]" />
              <span className="f-bold text-[12px] text-[#D9643A]">1 단계</span>
            </span>
            <h1 className="f-bold text-[40px] text-[#1E1E28]">이번 캠페인의 목표를 알려주세요</h1>
            <p className="f-regular text-[18px] leading-[1.6] text-[#6B6A72]">
              선택한 목표에 맞춰 AI가 타겟 고객과 전략을 분석해드려요
            </p>
          </div>

          {draft.insightPrefill && (
            <div role="status" className="flex w-full items-center gap-[10px] rounded-[14px] border border-[#d9d2ff] bg-[#F1E8DA] px-[16px] py-[12px]">
              <img alt="" src={a("eebbb.svg")} className="size-[16px] shrink-0" />
              <p className="f-medium min-w-0 flex-1 text-[14px] leading-[1.5] text-[#D9643A]">
                AI 캠페인 개선 방향에서 가져온 제안이에요. 목표와 대상 메뉴가 자동으로 선택되었어요.
              </p>
              <button
                type="button"
                onClick={() => update({ goalOption: "", customGoal: "", targetMenuIds: [], insightPrefill: false })}
                className="f-bold shrink-0 text-[14px] text-[#D9643A] underline underline-offset-2 hover:text-[#D9643A]"
              >
                직접 바꾸기
              </button>
            </div>
          )}

          <section className="flex w-full flex-col gap-[12px]">
            <h2 className="f-bold text-[20px] text-[#1E1E28]">캠페인 목표를 선택해주세요 (택 1)</h2>
            <div className="flex w-full gap-[12px]">{goalOptions[0].map(goalCard)}</div>
            <div className="flex w-full gap-[12px]">{goalOptions[1].map(goalCard)}</div>
            <div className="flex w-full items-start gap-[12px]">
              {goalOptions[2].map(goalCard)}
              <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
                {goalCard({ label: CUSTOM_GOAL, icon: "50ab4.svg" })}
                {customSelected && (
                  <input
                    value={draft.customGoal ?? ""}
                    onChange={(e) => update({ customGoal: e.target.value })}
                    placeholder="예: 지역 축제와 연계한 홍보"
                    aria-label="목표 직접 입력"
                    className="f-regular h-[48px] w-full rounded-[10px] border border-[#1E1E28] bg-white px-[14px] text-[15px] text-[#1E1E28] outline-none placeholder:text-[#9A989F]"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1" aria-hidden="true" />
            </div>
          </section>

          <section className="flex w-full flex-col gap-[12px]">
            <h2 className="f-bold text-[20px] text-[#1E1E28]">어떤 상품·메뉴를 홍보하고 싶으신가요?</h2>
            <div className="flex w-full flex-wrap gap-[8px]">
              {store.menus.map((m) => {
                const selected = menuIds.includes(m.id)
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update({ targetMenuIds: toggle(menuIds, m.id) })}
                    className={`flex h-[46px] items-center gap-[6px] rounded-full border px-[16px] text-[17px] whitespace-nowrap ${
                      selected
                        ? "f-semibold border-[#1E1E28] bg-[#F1E8DA] text-[#1E1E28]"
                        : "f-medium border-[#d0d7e2] bg-white text-[#6B6A72]"
                    }`}
                  >
                    {selected && <img alt="" src={a("66d83.svg")} className="size-[15px]" />}
                    {m.name}
                  </button>
                )
              })}
              {menuInput === null ? (
                <button
                  type="button"
                  onClick={() => setMenuInput("")}
                  className="f-medium flex h-[46px] items-center gap-[6px] rounded-full border border-[#d0d7e2] bg-white px-[16px] text-[17px] whitespace-nowrap text-[#6B6A72]"
                >
                  <img alt="" src={a("b9a06.svg")} className="size-[15px]" />
                  직접 입력
                </button>
              ) : (
                <input
                  autoFocus
                  value={menuInput}
                  onChange={(e) => setMenuInput(e.target.value)}
                  onBlur={addCustomMenu}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && addCustomMenu()}
                  placeholder="상품·메뉴 이름"
                  aria-label="상품·메뉴 직접 입력"
                  className="f-medium h-[46px] w-[180px] rounded-full border border-[#1E1E28] bg-white px-[16px] text-[17px] text-[#1E1E28] outline-none placeholder:text-[#9A989F]"
                />
              )}
            </div>
          </section>

          <section className="flex w-full flex-col gap-[12px]">
            <h2 className="f-bold text-[20px] text-[#1E1E28]">이번 캠페인의 타겟과 분위기</h2>
            <TagGroup
              label="마케팅 홍보 주요 타겟 (복수 선택 가능)"
              presets={targetPresets}
              selected={draft.targetCustomers ?? []}
              placeholder="예: 주변 직장인"
              loadButtonClassName="gap-x-[9px] gap-y-0 rounded-[1007px] border-4 opacity-100 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              onChange={(v) => update({ targetCustomers: v })}
              onLoad={() => update({ targetCustomers: splitTags(store.targetCustomer) })}
            />
            <TagGroup
              label="브랜드 톤앤매너 (복수 선택 가능)"
              presets={tonePresets}
              selected={draft.toneManners ?? []}
              placeholder="예: 따뜻한"
              onChange={(v) => update({ toneManners: v })}
              onLoad={() => update({ toneManners: splitTags(store.toneManner) })}
            />
          </section>

          <section className="flex w-full flex-col gap-[12px]">
            <h2 className="f-bold text-[20px] text-[#1E1E28]">추가로 전달하고 싶은 내용이 있다면 적어주세요 (선택)</h2>
            <textarea
              value={draft.extraNote ?? ""}
              onChange={(e) => update({ extraNote: e.target.value })}
              placeholder="예: 20-30대 여성 고객을 타겟으로 하고 싶어요"
              aria-label="추가 내용 입력"
              className="f-regular h-[108px] w-full resize-none rounded-[14px] border border-[#d0d7e2] bg-white p-[18px] text-[17px] leading-[1.6] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#1E1E28]"
            />
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 flex h-[88px] shrink-0 items-center justify-center border-t border-[rgba(30,30,40,0.15)] bg-white px-[48px]">
        <div className="flex w-[700px] items-center justify-between">
          <button type="button" className="f-semibold flex h-[52px] items-center px-[18px] text-[18px] text-[#6B6A72]">
            취소
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setConfirming(true)}
            className="flex h-[56px] items-center gap-[8px] rounded-full bg-[#1E1E28] disabled:cursor-not-allowed disabled:opacity-60 px-[24px] shadow-[0px_10px_24px_0px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28]"
          >
            <span className="f-bold text-[18px] whitespace-nowrap text-white">다음: AI 기획 보기</span>
            <img alt="" src={a("effb2.svg")} className="size-[18px]" />
          </button>
        </div>
      </footer>
      {confirming && (
        <ConfirmNextStepDialog
          title="AI 기획 단계로 넘어갈까요?"
          body="선택한 목표와 대상 메뉴로 AI가 캠페인을 기획해요. 다음 단계로 넘어가면 1단계 내용은 다시 수정할 수 없어요."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            update({ lockedStep: "1" })
            navigate("/campaigns/new/2")
          }}
        />
      )}
    </>
  )
}
