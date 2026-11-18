import type { ReactNode } from "react"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"

export type SummaryVariant = "goal" | "plan" | "content"

const join = (list: string[] | undefined, fallback = "-") =>
  list && list.length ? list.join(" · ") : fallback

function Card({ title, children, gap = "gap-[12px]" }: { title: string; children: ReactNode; gap?: string }) {
  return (
    <div className={`flex w-full flex-col ${gap} rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white p-[16px]`}>
      <p className="f-bold w-full text-[12px] text-[#D9643A]">{title}</p>
      {children}
    </div>
  )
}

function Lines({ lines, gap = "gap-[6px]" }: { lines: string[]; gap?: string }) {
  return (
    <div className={`f-medium flex w-full flex-col ${gap} text-[13px] leading-[21px] text-[#1E1E28]`}>
      {lines.map((l, i) => (
        <p key={i} className="w-full whitespace-pre-wrap">{l}</p>
      ))}
    </div>
  )
}

export function CampaignSummaryPanel({
  variant,
  collapsed,
  onToggle,
}: {
  variant: SummaryVariant
  collapsed: boolean
  onToggle: () => void
}) {
  const { draft, menuNames } = useDraftCampaign()
  if (!draft) return null
  const goal = draft.goal || draft.goalOption || "-"
  const plan = draft.plan
  const cs = draft.contentSettings
  const menuLine = menuNames.length > 1 ? `${menuNames[0]} 외 ${menuNames.length - 1}개` : (menuNames[0] ?? "-")

  return (
    <aside
      className={`fixed top-[104px] right-[12px] bottom-[12px] overflow-y-auto rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white ${collapsed ? "w-[68px]" : "w-[300px]"}`}
      aria-label="확정된 캠페인 내용"
    >
      <div className="flex w-full flex-col gap-[10px] px-[20px] pt-[24px] pb-[20px]">
        <div className="flex w-full items-center gap-[8px]">
          {!collapsed && (
            <>
              <img alt="" src="/assets/1d326.svg" className="size-[16px] shrink-0" />
              <p className="f-bold min-w-0 flex-1 text-[15px] text-[#1E1E28]">확정된 캠페인 내용</p>
            </>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "패널 펼치기" : "패널 접기"}
            className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[#F4F1EA] hover:bg-[#E9E4DA]"
          >
            <img alt="" src="/assets/79845.svg" className={`size-[15px] ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!collapsed && (
          <p className="f-regular w-full text-[11px] leading-[18px] text-[#6B6A72]">이전 단계에서 확정되어 수정할 수 없어요</p>
        )}
      </div>

      {!collapsed && (
        <div className="flex w-full flex-col gap-[16px] px-[20px] pt-[4px] pb-[24px]">
          {variant === "goal" ? (
            <div className="flex w-full flex-col gap-[12px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white p-[16px]">
              <p className="f-bold w-full text-[12px] text-[#D9643A]">1단계 목표 설정</p>
              <div className="flex w-full flex-col gap-[20px]">
                {[
                  ["마케팅 목표", goal],
                  ["대상 상품·메뉴", join(menuNames)],
                  ["타겟 고객", join(draft.targetCustomers)],
                  ["톤앤매너", join(draft.toneManners)],
                ].map(([label, value]) => (
                  <div key={label} className="flex w-full flex-col gap-[6px]">
                    <p className="f-regular w-full text-[12px] leading-[18px] text-[#6B6A72]">{label}</p>
                    <p className="f-semibold w-full text-[13px] leading-[22px] text-[#1E1E28]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col gap-[5px] border-b border-[#e5e7eb] pt-[2px] pb-[16px]">
                <p className="f-bold w-full text-[13px] leading-[21px] text-[#1E1E28]">
                  {draft.goalOption === "기타 (직접 입력)" ? "기타" : goal} · {menuLine}
                </p>
              </div>
              <Card title="캠페인 방향">
                <Lines
                  lines={[
                    plan.direction || goal,
                    `콘텐츠 톤  ${join(plan.tones ?? draft.toneManners)}`,
                    `추천 채널  ${join(plan.channels)}`,
                  ]}
                />
              </Card>
              <Card title="타겟 고객">
                <Lines lines={[plan.ageGroup || join(draft.targetCustomers), plan.targetCustomer || "-"]} />
              </Card>
              <Card title="전략 · 기대효과">
                <Lines
                  lines={[
                    plan.expectedEffect || "-",
                    `예상 도달  ${plan.reach ?? "-"}`,
                    `${plan.frequency ?? "-"} 게시 · ${plan.duration ?? "-"} 진행`,
                  ]}
                />
              </Card>
              {variant === "content" && (
                <Card title="콘텐츠 설정">
                  <Lines
                    gap="gap-[7px]"
                    lines={cs.channels.map(
                      (c, i) =>
                        `${"①②③"[i]} ${c}${c === "기타" && cs.customChannelNote ? ` · ${cs.customChannelNote}` : ""}`,
                    )}
                  />
                  <div className="flex w-full flex-col gap-[8px] border-t border-[rgba(30,30,40,0.15)] pt-[12px]">
                    <p className="f-regular w-full text-[12px] text-[#6B6A72]">광고 이미지 사용</p>
                    {cs.imageOn && (
                      <span className="flex w-fit items-start gap-[6px] rounded-full bg-[#F1E8DA] px-[9px] py-[5px]">
                        <img alt="" src="/assets/28281.svg" className="size-[14px]" />
                        <span className="f-semibold text-[12px] text-[#8A6A55]">광고 이미지 켜짐</span>
                      </span>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  )
}
