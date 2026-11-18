import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { Area, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, type TooltipContentProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { PageHeader } from "../components/PageHeader"
import { SalesUploadModal } from "../components/performance/SalesUploadModal"
import { useAppStore } from "../store/AppContext"
import { sanitizeCampaigns } from "../store/campaign"
import {
  PERIOD_LABELS,
  campaignRows,
  dailySeries,
  dayKey,
  md,
  menuRows,
  periodRanges,
  summary,
  weekdayRows,
  won,
  type CampaignResult,
  type MenuStatus,
  type Period,
} from "../store/sales"
import type { Sale } from "../store/types"

const a = (f: string) => `/assets/${f}`
const cardShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.05)]"
type TableTab = "menu" | "campaign" | "weekday"
const TABLE_TABS: { id: TableTab; label: string }[] = [
  { id: "menu", label: "상품별" },
  { id: "campaign", label: "캠페인별" },
  { id: "weekday", label: "요일·시간대" },
]

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="f-bold text-[13px] text-[#9A989F]">-</span>
  const up = value >= 0
  return <span className={`f-bold text-[13px] ${up ? "text-[#0e9f6e]" : "text-[#d92d20]"}`}>{up ? "▲" : "▼"} {Math.abs(value)}%</span>
}

const statusStyle: Record<MenuStatus | CampaignResult | "최고 매출" | "-", { bg: string; text: string; dot?: string; css?: string }> = {
  인기: { bg: "bg-[#ddf8ed]", text: "text-[#0e9f6e]", dot: "89a12.svg" },
  보통: { bg: "bg-[#f2f4f7]", text: "text-[#6B6A72]", dot: "a7cf6.svg" },
  비인기: { bg: "bg-[#fff1e8]", text: "text-[#f79009]", dot: "7d469.svg" },
  "재고 많음": { bg: "bg-[#E7EAFB]", text: "text-[#5965A8]", css: "bg-[#8E9BE6]" },
  "효과 좋음": { bg: "bg-[#ddf8ed]", text: "text-[#0e9f6e]", dot: "89a12.svg" },
  "효과 보통": { bg: "bg-[#f2f4f7]", text: "text-[#6B6A72]", dot: "a7cf6.svg" },
  "효과 미미": { bg: "bg-[#fff1e8]", text: "text-[#f79009]", dot: "7d469.svg" },
  "최고 매출": { bg: "bg-[#ddf8ed]", text: "text-[#0e9f6e]", dot: "89a12.svg" },
  "-": { bg: "bg-[#f2f4f7]", text: "text-[#6B6A72]", dot: "a7cf6.svg" },
}

function StatusBadge({ label }: { label: keyof typeof statusStyle }) {
  const s = statusStyle[label]
  return (
    <span className={`flex min-w-[68px] items-center justify-center gap-[6px] rounded-full px-[9px] py-[5px] ${s.bg}`}>
      {s.dot ? <img alt="" src={a(s.dot)} className="size-[6px]" /> : <span className={`size-[6px] rounded-full ${s.css}`} />}
      <span className={`f-bold text-[11px] whitespace-nowrap ${s.text}`}>{label}</span>
    </span>
  )
}

function ShareBar({ share }: { share: number }) {
  return (
    <div className="flex h-[22px] w-[190px] shrink-0 items-center justify-end gap-[10px]">
      <p className="f-medium w-[36px] text-right text-[13px] text-[#6B6A72]">{share}%</p>
      <div className="relative h-[6px] w-[120px] rounded-full bg-[#E5E1DA]">
        <div className="absolute top-0 left-0 h-[6px] rounded-full bg-[#D9643A]" style={{ width: `${Math.min(100, share)}%` }} />
      </div>
    </div>
  )
}

function SummaryCard({ icon, iconBg, label, value, children }: { icon: string; iconBg: string; label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className={`flex h-[112px] min-w-0 flex-1 items-center gap-[14px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[18px] ${cardShadow}`}>
      <span className={`flex size-[46px] shrink-0 items-center justify-center rounded-[14px] ${iconBg}`}>
        <img alt="" src={a(icon)} className="size-[22px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <p className="f-medium text-[13px] text-[#6B6A72]">{label}</p>
        <div className="flex flex-col items-start">
          <p className="f-bold truncate text-[24px] text-[#1E1E28]">{value}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as { label: string; amount: number }
  return (
    <div className="rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-white px-[12px] py-[8px] shadow-[0_8px_20px_rgba(30,30,40,0.10)]">
      <p className="f-regular text-[11px] text-[#9A989F]">{p.label}</p>
      <p className="f-bold text-[13px] text-[#1E1E28]">{won(p.amount)}</p>
    </div>
  )
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-[16px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white px-[24px] py-[96px] text-center ${cardShadow}`}>
      <span className="flex size-[64px] items-center justify-center rounded-[16px] bg-[#F1E8DA]">
        <img alt="" src={a("ce93d.svg")} className="size-[32px]" />
      </span>
      <div className="flex flex-col gap-[6px]">
        <p className="f-bold text-[20px] text-[#1E1E28]">아직 매출 데이터가 없어요</p>
        <p className="f-regular text-[14px] text-[#6B6A72]">영수증, 엑셀 파일을 올리면 AI가 상품과 캠페인의 효과를 분석해요.</p>
      </div>
      <button type="button" onClick={onUpload} className={`flex h-[42px] items-center gap-[8px] rounded-full bg-[#1E1E28] px-[18px] hover:bg-[#31313D] ${cardShadow}`}>
        <img alt="" src={a("833eb.svg")} className="size-[20px]" />
        <span className="f-bold text-[14px] whitespace-nowrap text-white">매출 데이터 올리기</span>
      </button>
    </div>
  )
}

export function PerformancePage() {
  const { data, setData } = useAppStore()
  const [period, setPeriod] = useState<Period>("30")
  const [tab, setTab] = useState<TableTab>("menu")
  const [searchParams, setSearchParams] = useSearchParams()
  // `/performance?upload=open` (home quick action "매출 올리기") opens the sales upload modal.
  const [upload, setUpload] = useState(() => searchParams.get("upload") === "open")
  useEffect(() => {
    if (searchParams.has("upload")) setSearchParams((p) => { p.delete("upload"); return p }, { replace: true })
  }, [searchParams, setSearchParams])
  const [toast, setToast] = useState<string | null>(null)

  const sales = data.sales
  const menus = data.store.menus
  const campaigns = useMemo(() => sanitizeCampaigns(data.campaigns).filter((c) => c.status === "published" && c.publishedAt), [data.campaigns])
  const ranges = useMemo(() => periodRanges(sales, period), [sales, period])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const view = useMemo(() => {
    if (!ranges) return null
    const series = dailySeries(sales, ranges.current)
    const keys = series.map((p) => p.key)
    const tickCount = Math.min(7, series.length)
    const ticks = tickCount > 1 ? Array.from({ length: tickCount }, (_, i) => keys[Math.round((i * (keys.length - 1)) / (tickCount - 1))]) : keys
    const bands = campaigns
      .map((c) => {
        const start = new Date(c.publishedAt!)
        const end = new Date(start.getTime() + 6 * 864e5)
        const x1 = dayKey(start)
        const x2 = dayKey(end)
        if (x2 < keys[0] || x1 > keys[keys.length - 1]) return null
        return { id: c.id, title: c.title, x1: x1 < keys[0] ? keys[0] : x1, x2: x2 > keys[keys.length - 1] ? keys[keys.length - 1] : x2 }
      })
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((x, y) => x.x1.localeCompare(y.x1))
    const filtered = campaigns.filter((c) => ranges.current && new Date(c.publishedAt!) <= new Date(ranges.current.end.getTime() + 864e5))
    return {
      series,
      ticks,
      bands,
      summary: summary(sales, filtered, ranges),
      menuRows: menuRows(sales, menus, ranges),
      campaignRows: campaignRows(
        sales,
        menus,
        campaigns.filter((c) => {
          const t = new Date(c.publishedAt!).getTime()
          return t >= ranges.current.start.getTime() - 864e5 && t <= ranges.current.end.getTime() + 864e5
        }),
      ),
      weekdayRows: weekdayRows(sales, ranges.current),
      lastUpload: md(new Date(Math.max(...sales.map((s) => new Date(s.date).getTime())))),
    }
  }, [ranges, sales, menus, campaigns])

  const commit = (rows: Sale[]) => setData((prev) => ({ ...prev, sales: [...prev.sales, ...rows] }))
  const closeUpload = (committed: boolean) => {
    setUpload(false)
    if (committed) setToast("매출 데이터가 반영되었어요")
  }

  const head = "f-semibold flex h-[42px] w-full items-center gap-[14px] border-y border-[rgba(30,30,40,0.10)] bg-[#F4F1EA] px-[16px] text-[12px] text-[#6B6A72]"
  const row = "flex h-[48px] w-full items-center gap-[14px] border-b border-[#eef1f5] bg-white px-[16px] last:border-b-0"
  const cell = "f-medium w-[125px] shrink-0 truncate text-[13px] text-[#6B6A72]"
  const nameCell = "f-semibold min-w-0 flex-1 truncate text-[13px] text-[#1E1E28]"

  return (
    <div className="editorial-app-page flex min-h-screen w-full flex-col gap-[16px] bg-[#F4F1EA] px-[36px] pt-[24px] pb-[30px]">
      <div className="flex w-full flex-col gap-[18px]">
        <PageHeader current="성과분석" />
        <div className="flex w-full flex-wrap items-end justify-between gap-[12px]">
          <div className="flex flex-col gap-[4px]">
            <h1 className="f-bold text-[30px] tracking-[-0.03em] text-[#1E1E28]">성과 분석</h1>
            <p className="f-regular text-[14px] text-[#6B6A72]">매장 매출을 중심으로 상품과 캠페인의 효과를 한눈에 확인해보세요.</p>
          </div>
          <div className="flex items-center gap-[12px]">
            {view && (
              <label className="relative flex h-[42px] w-[154px] items-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white">
                <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="기간 선택" className="f-semibold size-full appearance-none bg-transparent pr-[36px] pl-[16px] text-[14px] text-[#1E1E28] outline-none">
                  {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
                </select>
                <img alt="" src={a("22c5d.svg")} className="pointer-events-none absolute right-[14px] size-[16px]" />
              </label>
            )}
            <button type="button" onClick={() => setUpload(true)} className={`flex h-[42px] items-center gap-[8px] rounded-full bg-[#1E1E28] px-[18px] hover:bg-[#31313D] ${cardShadow}`}>
              <img alt="" src={a("833eb.svg")} className="size-[20px]" />
              <span className="f-bold text-[14px] whitespace-nowrap text-white">매출 데이터 올리기</span>
            </button>
          </div>
        </div>
      </div>

      {!view ? (
        <EmptyState onUpload={() => setUpload(true)} />
      ) : (
        <>
          <div className="flex w-full items-center justify-between gap-[12px] rounded-[16px] border border-[rgba(30,30,40,0.15)] bg-[#F1E8DA] px-[14px] py-[10px]">
            <p className="f-semibold min-w-0 truncate text-[13px] text-[#1E1E28]">
              마지막 매출 데이터 업로드: {view.lastUpload} · 영수증, 엑셀 파일을 올리면 AI가 분석해요
            </p>
            <Link to="/insights" className="f-bold shrink-0 text-[12px] text-[#D9643A] hover:underline" aria-label="AI 캠페인 개선 방향 자세히 보기">
              자세히
            </Link>
          </div>

          <div className="flex w-full flex-wrap gap-[16px] [&>*]:min-w-[220px]">
            <SummaryCard icon="712cd.svg" iconBg="bg-[#F1E8DA]" label="총 매출" value={won(view.summary.revenue)}>
              {view.summary.revenueChange !== null && (
                <span className={`f-bold rounded-full px-[8px] py-[5px] text-[11px] ${view.summary.revenueChange >= 0 ? "bg-[#ddf8ed] text-[#0e9f6e]" : "bg-[#fdecea] text-[#d92d20]"}`}>
                  {view.summary.revenueChange >= 0 ? "▲" : "▼"} {Math.abs(view.summary.revenueChange)}%
                </span>
              )}
            </SummaryCard>
            <SummaryCard icon="c1c35.svg" iconBg="bg-[#eef8f6]" label="판매 건수" value={`${view.summary.count.toLocaleString()}건`} />
            <SummaryCard icon="2c577.svg" iconBg="bg-[#eef8f6]" label="객단가" value={won(view.summary.avg)} />
            <SummaryCard icon="d13db.svg" iconBg="bg-[#eef8f6]" label="캠페인 연계 매출" value={won(view.summary.linked)}>
              <p className="f-bold text-[11px] text-[#667080]">전체 매출의 {view.summary.linkedShare}%</p>
            </SummaryCard>
          </div>

          <section className={`flex h-[340px] w-full flex-col gap-[12px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white px-[20px] pt-[18px] pb-[16px] ${cardShadow}`}>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-[3px]">
                <h2 className="f-bold text-[20px] text-[#1E1E28]">일별 매출 추이</h2>
                <p className="f-regular text-[12px] text-[#6B6A72]">캠페인 진행 기간을 함께 표시했어요</p>
              </div>
              <div className="flex items-center gap-[18px]">
                <span className="flex items-center gap-[7px]">
                  <img alt="" src={a("dd7f5.svg")} className="size-[8px]" />
                  <span className="f-semibold text-[12px] text-[#6B6A72]">매출</span>
                </span>
                <span className="flex items-center gap-[7px]">
                  <span className="size-[8px] rounded-full bg-[#5fa99e] opacity-18" />
                  <span className="f-semibold text-[13px] text-[#6B6A72]">캠페인 진행 기간</span>
                </span>
              </div>
            </div>
            <div className="min-h-0 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={view.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D9643A" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#D9643A" stopOpacity={0.12} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef1f5" />
                  {view.bands.map((b, i) => (
                    <ReferenceArea
                      key={b.id}
                      x1={b.x1}
                      x2={b.x2}
                      fill="#8E9BE6"
                      fillOpacity={0.08}
                      stroke="none"
                      ifOverflow="hidden"
                      label={{ value: b.title, position: "insideTopLeft", offset: 6, dy: i % 2 ? 20 : 0, fill: "#5965A8", fontSize: 11, fontWeight: 700, className: "f-bold" }}
                    />
                  ))}
                  <XAxis dataKey="key" ticks={view.ticks} tickFormatter={(k: string) => md(k)} axisLine={false} tickLine={false} tick={{ fill: "#9A989F", fontSize: 11 }} interval={0} dy={6} />
                  <YAxis tickCount={5} axisLine={false} tickLine={false} width={50} tick={{ fill: "#9A989F", fontSize: 11 }} tickFormatter={(v: number) => (v === 0 ? "0" : `${Math.round(v / 10000)}만`)} />
                  <Tooltip content={ChartTooltip} cursor={{ stroke: "#d5dce7" }} />
                  <Area type="monotone" dataKey="amount" stroke="none" fill="#D9643A" fillOpacity={0.12} isAnimationActive={false} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#D9643A"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    dot={(p: { cx?: number; cy?: number; index?: number }) =>
                      p.index === view.series.length - 1 && p.cx !== undefined && p.cy !== undefined ? (
                        <circle key="last" cx={p.cx} cy={p.cy} r={5} fill="white" stroke="#D9643A" strokeWidth={2.5} />
                      ) : (
                        <g key={p.index} />
                      )
                    }
                    activeDot={{ r: 5, fill: "white", stroke: "#D9643A", strokeWidth: 2.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={`flex w-full flex-col overflow-hidden rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white ${cardShadow}`}>
            <div role="tablist" aria-label="분석 기준" className="flex h-[48px] w-full items-center gap-[8px] px-[20px]">
              {TABLE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex h-[36px] items-center rounded-full px-[14px] text-[13px] whitespace-nowrap ${tab === t.id ? "f-bold bg-[#1E1E28] text-white" : "f-semibold border border-[rgba(30,30,40,0.15)] bg-white text-[#6B6A72] hover:bg-[#F4F1EA]"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1040px]">
                {tab === "menu" && (
                  <>
                    <div className={head}>
                      <p className="min-w-0 flex-1">상품명</p>
                      <p className="w-[125px] shrink-0">판매 수량</p>
                      <p className="w-[160px] shrink-0">매출</p>
                      <p className="w-[190px] shrink-0 text-right">매출 비중</p>
                      <p className="w-[150px] shrink-0 text-right">전 기간 대비</p>
                      <p className="w-[121px] shrink-0 text-right">판매 상태</p>
                    </div>
                    {view.menuRows.map((r) => (
                      <div key={r.menu.id} className={row}>
                        <p className={nameCell}>{r.menu.name}</p>
                        <p className={cell}>{r.quantity.toLocaleString()}개</p>
                        <p className={`${cell} w-[160px]`}>{won(r.amount)}</p>
                        <ShareBar share={r.share} />
                        <p className="w-[150px] shrink-0 text-right"><Change value={r.change} /></p>
                        <div className="flex w-[121px] shrink-0 justify-center"><StatusBadge label={r.status} /></div>
                      </div>
                    ))}
                  </>
                )}
                {tab === "campaign" && (
                  <>
                    <div className={head}>
                      <p className="min-w-0 flex-1">캠페인명</p>
                      <p className="w-[125px] shrink-0">대상 상품</p>
                      <p className="w-[100px] shrink-0">게시일</p>
                      <p className="w-[140px] shrink-0 text-right">게시 전 7일 매출</p>
                      <p className="w-[140px] shrink-0 text-right">게시 후 7일 매출</p>
                      <p className="w-[100px] shrink-0 text-right">변화율</p>
                      <p className="w-[121px] shrink-0 text-right">결과</p>
                    </div>
                    {view.campaignRows.length === 0 && <p className="f-regular px-[16px] py-[28px] text-center text-[13px] text-[#9A989F]">선택한 기간에 게시한 캠페인이 없어요.</p>}
                    {view.campaignRows.map((r) => (
                      <div key={r.campaign.id} className={row}>
                        <p className={nameCell}>{r.campaign.title}</p>
                        <p className={cell}>{r.menuNames}</p>
                        <p className={`${cell} w-[100px]`}>{md(r.campaign.publishedAt!)}</p>
                        <p className={`${cell} w-[140px] text-right`}>{won(r.before)}</p>
                        <p className={`${cell} w-[140px] text-right`}>{won(r.after)}</p>
                        <p className="w-[100px] shrink-0 text-right"><Change value={r.change} /></p>
                        <div className="flex w-[121px] shrink-0 justify-center"><StatusBadge label={r.result} /></div>
                      </div>
                    ))}
                  </>
                )}
                {tab === "weekday" && (
                  <>
                    <div className={head}>
                      <p className="min-w-0 flex-1">요일</p>
                      <p className="w-[125px] shrink-0">판매 수량</p>
                      <p className="w-[160px] shrink-0">매출</p>
                      <p className="w-[190px] shrink-0 text-right">매출 비중</p>
                      <p className="w-[150px] shrink-0 text-right">일평균 매출</p>
                      <p className="w-[121px] shrink-0 text-right">판매 상태</p>
                    </div>
                    {view.weekdayRows.map((r) => (
                      <div key={r.label} className={row}>
                        <p className={nameCell}>{r.label}</p>
                        <p className={cell}>{r.quantity.toLocaleString()}개</p>
                        <p className={`${cell} w-[160px]`}>{won(r.amount)}</p>
                        <ShareBar share={r.share} />
                        <p className="f-medium w-[150px] shrink-0 text-right text-[13px] text-[#6B6A72]">{won(r.dailyAvg)}</p>
                        <div className="flex w-[121px] shrink-0 justify-center">{r.top ? <StatusBadge label="최고 매출" /> : <StatusBadge label="보통" />}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {upload && <SalesUploadModal menus={menus} onCommit={commit} onClose={closeUpload} />}

      {toast && (
        <div role="status" className="fixed bottom-[40px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[8px] rounded-full bg-[#1E1E28] px-[18px] py-[11px] shadow-[0_8px_20px_rgba(30,30,40,0.14)]">
          <span className="flex size-[18px] items-center justify-center rounded-full bg-[#5fa99e]">
            <img alt="" src={a("a244b.svg")} className="size-[11px]" />
          </span>
          <p className="f-semibold text-[14px] whitespace-nowrap text-white">{toast}</p>
        </div>
      )}
    </div>
  )
}
