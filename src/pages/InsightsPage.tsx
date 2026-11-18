import { useEffect, useMemo, useState, type ReactNode } from "react"
import { PageHeader } from "../components/PageHeader"
import { LoadingState } from "../components/wizard/WizardParts"
import { useStartNewCampaign } from "../hooks/useStartNewCampaign"
import { generateInsights, type CampaignComparison, type InsightSuggestion, type InsightsResult } from "../services/ai"
import { useAppStore } from "../store/AppContext"
import { sanitizeCampaigns } from "../store/campaign"

const a = (f: string) => `/assets/${f}`
const cardShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.05)]"
const TITLE = "AI 캠페인 개선 방향"

// Cache results across visits until the underlying data or view changes.
const cache = new Map<string, InsightsResult>()

function MakeCampaignButton({ item }: { item: InsightSuggestion }) {
  const { startNewCampaign, upgradeNotice } = useStartNewCampaign()
  return (
    <>
      <button
        type="button"
        onClick={() => startNewCampaign({ goal: item.goal, menuId: item.menuId })}
        className="f-semibold flex h-[32px] w-fit shrink-0 items-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[12px] text-[13px] whitespace-nowrap text-[#1E1E28] hover:border-[#D9643A] hover:text-[#D9643A]"
      >
        캠페인으로 만들기
      </button>
      {upgradeNotice}
    </>
  )
}

function SuggestionCard({ item, tone }: { item: InsightSuggestion; tone: "good" | "bad" | "neutral" }) {
  const dot = tone === "good" ? "bg-[#6F8B65]" : tone === "bad" ? "bg-[#D9643A]" : "bg-[#8E9BE6]"
  return (
    <div className="flex w-full flex-col gap-[10px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white p-[16px]">
      <div className="flex items-start gap-[8px]">
        <span className={`mt-[7px] size-[6px] shrink-0 rounded-full ${dot}`} />
        <p className="f-bold text-[15px] leading-[1.45] text-[#1E1E28]">{item.title}</p>
      </div>
      <p className="f-regular pl-[14px] text-[13px] leading-[1.55] text-[#6B6A72]">{item.desc}</p>
      <div className="pl-[14px]"><MakeCampaignButton item={item} /></div>
    </div>
  )
}

function Panel({ title, badge, badgeTone, children }: { title: string; badge?: string; badgeTone?: "mint" | "amber" | "blue"; children: ReactNode }) {
  const badgeCls =
    badgeTone === "amber" ? "bg-[#F6DFD6] text-[#A44629]" : badgeTone === "blue" ? "bg-[#E7EAFB] text-[#5965A8]" : "bg-[#E5EFE2] text-[#55704C]"
  return (
    <section className={`flex w-full min-w-0 flex-col gap-[14px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[20px] ${cardShadow}`}>
      <div className="flex items-center gap-[8px]">
        <h2 className="f-bold text-[18px] text-[#1E1E28]">{title}</h2>
        {badge && <span className={`f-semibold rounded-full px-[9px] py-[4px] text-[11px] ${badgeCls}`}>{badge}</span>}
      </div>
      {children}
    </section>
  )
}

function CompareCard({ data, tone }: { data?: CampaignComparison; tone: "good" | "bad" }) {
  const good = tone === "good"
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-[14px] rounded-[18px] border p-[20px] ${good ? "border-[#B9CEB2] bg-[#EEF4EC]" : "border-[#E8B9A8] bg-[#FAECE7]"}`}>
      <span className={`f-bold w-fit rounded-full px-[10px] py-[4px] text-[12px] ${good ? "bg-[#6F8B65] text-white" : "bg-[#D9643A] text-white"}`}>
        {good ? "Good · 잘된 캠페인" : "Bad · 아쉬운 캠페인"}
      </span>
      {data ? (
        <>
          <div className="flex flex-col gap-[4px]">
            <p className="f-bold text-[18px] text-[#1E1E28]">{data.title}</p>
            <p className="f-regular text-[13px] text-[#6B6A72]">{data.channel}</p>
          </div>
          <div className="grid grid-cols-4 gap-[8px]">
            {[
              ["조회", data.views.toLocaleString()],
              ["클릭", data.clicks.toLocaleString()],
              ["방문 전환", data.conversions.toLocaleString()],
              ["전환율", `${data.conversionRate}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-[2px] rounded-[12px] bg-white px-[12px] py-[10px]">
                <p className="f-regular text-[11px] text-[#9A989F]">{k}</p>
                <p className="f-bold text-[16px] text-[#1E1E28]">{v}</p>
              </div>
            ))}
          </div>
          <p className="f-medium text-[13px] leading-[1.55] text-[#1E1E28]">{data.reason}</p>
        </>
      ) : (
        <p className="f-regular text-[13px] text-[#6B6A72]">비교할 캠페인이 아직 부족해요.</p>
      )}
    </div>
  )
}

function EarlyView({ result }: { result: InsightsResult }) {
  return (
    <>
      <div className="grid w-full grid-cols-2 gap-[20px]">
        <Panel title="잘된 점" badge={`${result.strengths.length}개`} badgeTone="mint">
          {result.strengths.map((s) => <SuggestionCard key={s.id} item={s} tone="good" />)}
        </Panel>
        <Panel title="개선이 필요한 점" badge={`${result.improvements.length}개`} badgeTone="amber">
          {result.improvements.map((s) => <SuggestionCard key={s.id} item={s} tone="bad" />)}
        </Panel>
      </div>
      <div className="grid w-full grid-cols-2 gap-[20px]">
        <Panel title="비인기 메뉴 조언" badge="매출 기반" badgeTone="blue">
          {result.slowMenus.map((s) => <SuggestionCard key={s.id} item={s} tone="neutral" />)}
        </Panel>
        <Panel title="재고 소진 프로모션 제안" badge="재고 기반" badgeTone="blue">
          {result.stockPromotions.map((s) => <SuggestionCard key={s.id} item={s} tone="neutral" />)}
        </Panel>
      </div>
    </>
  )
}

function EnoughView({ result }: { result: InsightsResult }) {
  return (
    <>
      <section className={`flex w-full flex-col gap-[14px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[20px] ${cardShadow}`}>
        <h2 className="f-bold text-[18px] text-[#1E1E28]">Good / Bad 캠페인 비교</h2>
        <div className="flex w-full gap-[16px]">
          <CompareCard data={result.good} tone="good" />
          <CompareCard data={result.bad} tone="bad" />
        </div>
      </section>
      <div className="grid w-full grid-cols-2 gap-[20px]">
        <Panel title="잘된 점에서 배울 것" badge="Good" badgeTone="mint">
          {result.strengths.map((s) => <SuggestionCard key={s.id} item={s} tone="good" />)}
        </Panel>
        <Panel title="개선 항목" badge="Bad" badgeTone="amber">
          {result.improvements.map((s) => <SuggestionCard key={s.id} item={s} tone="bad" />)}
        </Panel>
      </div>
      <div className="grid w-full grid-cols-2 gap-[20px]">
        <Panel title="비인기 메뉴 조언" badge="매출 기반" badgeTone="blue">
          {result.slowMenus.map((s) => <SuggestionCard key={s.id} item={s} tone="neutral" />)}
        </Panel>
        <Panel title="재고 소진 프로모션 제안" badge="재고 기반" badgeTone="blue">
          {result.stockPromotions.map((s) => <SuggestionCard key={s.id} item={s} tone="neutral" />)}
        </Panel>
      </div>
    </>
  )
}

export function InsightsPage() {
  const { data } = useAppStore()
  const view = data.insightsView ?? "early"
  const campaigns = useMemo(() => sanitizeCampaigns(data.campaigns), [data.campaigns])
  const cacheKey = useMemo(
    () =>
      JSON.stringify([
        view,
        campaigns.map((c) => [c.id, c.status, c.updatedAt]),
        data.store.menus.map((m) => [m.id, m.stock]),
        data.sales.map((s) => [s.id, s.quantity]),
      ]),
    [view, campaigns, data.store.menus, data.sales],
  )
  const [result, setResult] = useState<InsightsResult | undefined>(() => cache.get(cacheKey))

  useEffect(() => {
    const cached = cache.get(cacheKey)
    if (cached) return setResult(cached)
    setResult(undefined)
    let alive = true
    generateInsights({ storeName: data.store.name, view, campaigns, menus: data.store.menus, sales: data.sales }).then((r) => {
      cache.set(cacheKey, r)
      if (alive) setResult(r)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  return (
    <div className="editorial-app-page flex min-h-screen min-w-0 flex-1 flex-col gap-[20px] bg-[#F4F1EA] px-[36px] pt-[24px] pb-[30px]">
      <PageHeader current={TITLE} />
      <div className="flex flex-col gap-[4px]">
        <h1 className="f-bold text-[30px] tracking-[-0.03em] text-[#1E1E28]">{TITLE}</h1>
        <p className="f-regular text-[14px] text-[#6B6A72]">캠페인 성과와 매출 데이터를 바탕으로 다음 캠페인 방향을 제안해요.</p>
      </div>

      {!result || result.view !== view ? (
        <LoadingState title="AI가 캠페인과 매출 데이터를 분석하고 있어요" desc="잘된 점과 개선할 점을 정리 중이에요" />
      ) : (
        <>
          <section className="flex w-full items-start gap-[14px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-[#F1E8DA] p-[20px]">
            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[12px] bg-white">
              <img alt="" src={a("c5dac.svg")} className="size-[20px]" />
            </span>
            <div className="flex min-w-0 flex-col gap-[4px]">
              <p className="f-bold text-[18px] text-[#1E1E28]">{result.headline}</p>
              <p className="f-regular text-[14px] leading-[1.55] text-[#6B6A72]">{result.summary}</p>
            </div>
          </section>
          {view === "early" ? <EarlyView result={result} /> : <EnoughView result={result} />}
        </>
      )}
    </div>
  )
}
