import { useEffect, useRef, useState, type ReactNode } from "react"
import { Navigate, useNavigate } from "react-router"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"
import { ConfirmNextStepDialog } from "../../components/wizard/ConfirmNextStepDialog"
import { generateCampaignPlan, reanalyzePlan, type CampaignPlanInput } from "../../services/ai"
import { openUpgradeModal } from "../../services/upgrade"
import type { CampaignPlan } from "../../store/types"
import { cardShadow, LoadingState, StepBadge, WizardFooter } from "../../components/wizard/WizardParts"

const a = (f: string) => `/assets/${f}`

function CardHeader({ icon, title, right }: { icon: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-[12px]">
        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-white">
          <img alt="" src={a(icon)} className="size-[21px]" />
        </span>
        <h2 className="f-bold text-[21px] text-[#1E1E28]">{title}</h2>
      </div>
      {right}
    </div>
  )
}

function EditButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex h-[32px] shrink-0 items-center gap-[6px] rounded-full border border-[#d9d2ff] bg-white px-[10px] hover:bg-[#f2f6ff]"
    >
      <img alt="" src={a("3ec72.svg")} className="size-[16px]" />
      <span className="f-semibold text-[14px] whitespace-nowrap text-[#1E1E28]">{active ? "완료" : "수정"}</span>
    </button>
  )
}

function TagList({
  tags,
  tone,
  onChange,
}: {
  tags: string[]
  tone: "blue" | "mint"
  onChange: (next: string[]) => void
}) {
  const [text, setText] = useState<string | null>(null)
  const tag =
    tone === "blue"
      ? "border-[#d9d2ff] text-[#1E1E28]"
      : "border-[#d9d2ff] text-[#D9643A]"
  const commit = () => {
    const v = text?.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setText(null)
  }
  return (
    <div className="flex min-w-0 flex-wrap items-start gap-[8px]">
      {tags.map((t) => (
        <button
          key={t}
          type="button"
          title="클릭하면 삭제돼요"
          onClick={() => onChange(tags.filter((x) => x !== t))}
          className={`f-semibold flex items-center rounded-full border bg-white px-[13px] py-[7px] text-[15px] whitespace-nowrap ${tag}`}
        >
          {t}
        </button>
      ))}
      {text === null ? (
        <button
          type="button"
          onClick={() => setText("")}
          className={`f-semibold flex items-center gap-[6px] rounded-full border border-[#d9d2ff] bg-white px-[13px] py-[7px] text-[15px] whitespace-nowrap ${tone === "blue" ? "text-[#1E1E28]" : "text-[#D9643A]"}`}
        >
          <span>+</span>
          <span>추가</span>
        </button>
      ) : (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && commit()}
          aria-label="태그 추가"
          className="f-semibold h-[37px] w-[120px] rounded-full border border-[#1E1E28] bg-white px-[13px] text-[15px] text-[#1E1E28] outline-none"
        />
      )}
    </div>
  )
}

export function PlanStepPage() {
  const navigate = useNavigate()
  const { data, draft, update, lockStep, menuNames } = useDraftCampaign()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<"target" | "strategy" | null>(null)
  const [feedback, setFeedback] = useState("")
  const requested = useRef(false)
  const isPro = data.user.plan === "pro"
  const hasPlan = Boolean(draft?.plan.direction)

  const input: CampaignPlanInput | null = draft
    ? {
        storeName: data.store.name,
        category: data.store.category,
        goal: draft.goal,
        targetMenuName: menuNames.join(", "),
        targetCustomer: (draft.targetCustomers ?? []).join(", "),
        toneManner: (draft.toneManners ?? []).join(", "),
      }
    : null

  // Generate the plan once; skip when the draft already has one.
  useEffect(() => {
    if (!input || hasPlan || requested.current) return
    requested.current = true
    setLoading(true)
    generateCampaignPlan(input)
      .then((plan) => update(() => ({ plan })))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlan, Boolean(input)])

  if (!draft) return <Navigate to="/campaigns/new/1" replace />
  if (!draft.goal || !draft.targetMenuIds?.length) return <Navigate to="/campaigns/new/1" replace />

  const plan = draft.plan
  const setPlan = (patch: Partial<CampaignPlan>) => update((c) => ({ plan: { ...c.plan, ...patch } }))

  const reanalyze = async () => {
    if (!input || !feedback.trim()) return
    setLoading(true)
    try {
      const next = await reanalyzePlan({ ...input, currentPlan: plan, feedback: feedback.trim() })
      update(() => ({ plan: next }))
      setFeedback("")
    } finally {
      setLoading(false)
    }
  }

  const field = "f-medium w-full min-w-0 flex-1 rounded-[12px] border border-[#d0d7e2] bg-white px-[14px] py-[10px] text-[16px] leading-[1.5] text-[#1E1E28] outline-none focus:border-[#1E1E28] read-only:cursor-default read-only:focus:border-[#d0d7e2]"

  return (
    <>
      <div className="flex flex-1 justify-center px-[70px]">
        <div className="flex w-full max-w-[1000px] flex-col gap-[16px] px-[24px] py-[25px]">
          <div className="flex w-full flex-col items-center gap-[8px] text-center">
            <StepBadge icon={a("eebbb.svg")}>2 단계</StepBadge>
            <h1 className="f-bold text-[38px] text-[#1E1E28]">AI가 이번 캠페인의 방향을 제안해드려요</h1>
            <p className="f-regular text-[18px] leading-[1.6] text-[#6B6A72]">‘{draft.goal}’ 목표를 기반으로 분석한 결과예요</p>
            <p className="f-regular text-[14px] leading-[1.5] text-[#9A989F]">AI가 제안한 내용을 직접 고쳐서 다음 단계로 넘어갈 수 있어요</p>
          </div>

          {loading || !hasPlan ? (
            <LoadingState title="AI가 캠페인 방향을 분석하고 있어요" desc="목표와 매장 정보를 바탕으로 타겟과 전략을 정리 중이에요" />
          ) : (
            <>
              <section className={`flex w-full flex-col gap-[15px] rounded-[18px] border border-[#d9e6ff] bg-[#f2f6ff] p-[20px] ${cardShadow}`}>
                <CardHeader
                  icon="83a9f.svg"
                  title="추천 타깃 고객"
                  right={<EditButton active={editing === "target"} onClick={() => setEditing(editing === "target" ? null : "target")} />}
                />
                <div className="flex w-full items-center gap-[18px]">
                  <span className="flex size-[74px] shrink-0 items-center justify-center rounded-[18px] bg-[#F1E8DA]">
                    <img alt="" src={a("74ed8.svg")} className="size-[34px]" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
                    <div className="flex w-full items-start gap-[16px]">
                      <p className="f-semibold w-[92px] shrink-0 pt-[11px] text-[15px] leading-[1.5] text-[#6B6A72]">연령대</p>
                      <input
                        readOnly={editing !== "target"}
                        value={plan.ageGroup ?? ""}
                        onChange={(e) => setPlan({ ageGroup: e.target.value })}
                        aria-label="연령대"
                        className={`${field} f-bold`}
                      />
                    </div>
                    <div className="flex w-full items-start gap-[16px]">
                      <p className="f-semibold w-[92px] shrink-0 pt-[11px] text-[15px] leading-[1.5] text-[#6B6A72]">특징</p>
                      <input
                        readOnly={editing !== "target"}
                        value={plan.targetCustomer}
                        onChange={(e) => setPlan({ targetCustomer: e.target.value })}
                        aria-label="특징"
                        className={field}
                      />
                    </div>
                    <div className="flex w-full items-center gap-[16px]">
                      <p className="f-semibold w-[92px] shrink-0 text-[15px] text-[#6B6A72]">주요 활동 채널</p>
                      <TagList tags={plan.channels ?? []} tone="blue" onChange={(channels) => setPlan({ channels })} />
                    </div>
                  </div>
                </div>
              </section>

              <section className={`flex w-full flex-col gap-[14px] rounded-[18px] border border-[#cdefe9] bg-[#F1E8DA] p-[20px] ${cardShadow}`}>
                <CardHeader
                  icon="fe9f3.svg"
                  title="추천 캠페인 전략"
                  right={<EditButton active={editing === "strategy"} onClick={() => setEditing(editing === "strategy" ? null : "strategy")} />}
                />
                <div className="flex w-full pl-[54px]">
                  {editing === "strategy" ? (
                    <textarea
                      value={plan.strategy}
                      onChange={(e) => setPlan({ strategy: e.target.value })}
                      aria-label="추천 캠페인 전략"
                      className="f-medium h-[84px] w-full resize-none rounded-[12px] border border-[#1E1E28] bg-white px-[14px] py-[10px] text-[16px] leading-[1.65] text-[#1E1E28] outline-none"
                    />
                  ) : (
                    <p className="f-medium flex-1 text-[16px] leading-[1.65] text-balance text-[#1E1E28]">{plan.strategy}</p>
                  )}
                </div>
                <div className="flex w-full flex-col gap-[9px]">
                  <div className="flex w-full items-center gap-[16px]">
                    <p className="f-semibold w-[126px] shrink-0 text-[15px] text-[#6B6A72]">추천 콘텐츠 톤</p>
                    <TagList tags={plan.tones ?? []} tone="mint" onChange={(tones) => setPlan({ tones })} />
                  </div>
                  <div className="flex w-full items-center gap-[16px]">
                    <p className="f-semibold w-[126px] shrink-0 text-[15px] text-[#6B6A72]">추천 채널</p>
                    <TagList tags={plan.channels ?? []} tone="mint" onChange={(channels) => setPlan({ channels })} />
                  </div>
                </div>
              </section>

              <section className={`flex w-full flex-col gap-[12px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white p-[20px] ${cardShadow}`}>
                <CardHeader
                  icon="686d3.svg"
                  title="방향을 직접 알려주고 다시 분석받기"
                  right={
                    !isPro && (
                      <button
                        type="button"
                        onClick={() => openUpgradeModal("AI 기획 재분석")}
                        className="f-bold rounded-full bg-[#F1E8DA] px-[11px] py-[6px] text-[14px] whitespace-nowrap text-[#D9643A]"
                      >
                        구독 전용
                      </button>
                    )
                  }
                />
                <p className="f-regular w-full text-[15px] leading-[1.6] text-[#6B6A72]">원하는 방향을 적으면 AI가 그에 맞게 다시 분석해드려요.</p>
                {isPro && (
                  <div className="flex w-full gap-[8px]">
                    <input
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && reanalyze()}
                      placeholder="예: 직장인 점심 시간대 방문을 늘리고 싶어요"
                      aria-label="원하는 방향 입력"
                      className="f-regular h-[46px] min-w-0 flex-1 rounded-[12px] border border-[#d0d7e2] bg-white px-[14px] text-[15px] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#1E1E28]"
                    />
                    <button
                      type="button"
                      onClick={reanalyze}
                      disabled={!feedback.trim()}
                      className="f-semibold h-[46px] shrink-0 rounded-full bg-[#1E1E28] px-[18px] text-[15px] text-white hover:bg-[#1E1E28] disabled:opacity-60"
                    >
                      다시 분석하기
                    </button>
                  </div>
                )}
              </section>

              <section className={`flex w-full flex-col gap-[5px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white px-[20px] pt-[16px] pb-[12px] ${cardShadow}`}>
                <h2 className="f-bold text-[18px] text-[#1E1E28]">예상 기대 효과</h2>
                <div className="flex w-full items-center">
                  {[
                    { icon: "a56a6.svg", label: "예상 도달", value: plan.reach },
                    { icon: "8bcef.svg", label: "추천 게시 빈도", value: plan.frequency },
                    { icon: "33c78.svg", label: "추천 진행 기간", value: plan.duration },
                  ].map((s, i) => (
                    <div key={s.label} className="contents">
                      {i > 0 && <div className="h-[52px] w-px shrink-0 bg-[#e5eaf1]" />}
                      <div className="flex h-[92px] min-w-0 flex-1 items-center justify-center gap-[13px]">
                        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#F1E8DA]">
                          <img alt="" src={a(s.icon)} className="size-[20px]" />
                        </span>
                        <div className="flex w-[150px] flex-col gap-[4px] whitespace-nowrap">
                          <p className="f-medium text-[14px] text-[#6B6A72]">{s.label}</p>
                          <p className="f-bold text-[20px] text-[#1E1E28]">{s.value ?? "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <WizardFooter
        label="다음: 콘텐츠 생성하기"
        icon={a("effb2.svg")}
        disabled={loading || !hasPlan}
        onNext={() => setConfirming(true)}
      />
      {confirming && (
        <ConfirmNextStepDialog
          title="콘텐츠 설정으로 넘어갈까요?"
          body="AI가 제안한 타겟 고객과 캠페인 방향이 확정돼요. 다음 단계로 넘어가면 2단계 내용은 다시 수정할 수 없어요."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            lockStep("2")
            navigate("/campaigns/new/3-1")
          }}
        />
      )}
    </>
  )
}
