import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { CampaignDetailPanel } from "../components/campaigns/CampaignDetailPanel"
import { PageHeader } from "../components/PageHeader"
import { useStartNewCampaign } from "../hooks/useStartNewCampaign"
import { useAppStore } from "../store/AppContext"
import {
  campaignCollage,
  campaignTimestamp,
  monthDay,
  publishedDraftKeys,
  resumeStep,
  sanitizeCampaigns,
} from "../store/campaign"
import type { Campaign } from "../store/types"

const a = (f: string) => `/assets/${f}`
const cardShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.05)]"
const CUSTOM_GOAL = "기타 (직접 입력)"
const knownGoals = ["신메뉴/신상품 홍보", "재방문 유도", "매장 인지도 확대", "할인/이벤트 홍보", "신규 고객 유치", "재고 소진 프로모션", "비인기 메뉴 살리기"]

type Status = "all" | "published" | "draft"
type Sort = "newest" | "oldest" | "name"
const statusFilters: { value: Status; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "published", label: "게시 완료" },
  { value: "draft", label: "작성 중" },
]
const sortLabels: Record<Sort, string> = { newest: "최신순", oldest: "오래된순", name: "이름순" }

function StatusTag({ published }: { published: boolean }) {
  return (
    <span className={`f-semibold flex items-start rounded-full px-[9px] py-[5px] text-[11px] whitespace-nowrap ${published ? "bg-[#eef8f6] text-[#477f78]" : "bg-[#f3eee8] text-[#8b735b]"}`}>
      {published ? "게시 완료" : "작성 중"}
    </span>
  )
}

function Collage({ campaign, height }: { campaign: Campaign; height: string }) {
  const images = campaignCollage(campaign)
  const count = publishedDraftKeys(campaign).length
  return (
    <div className={`relative flex w-full shrink-0 gap-[3px] bg-[#eef1f5] ${height}`}>
      {images.map((img) => (
        <div key={img.url + img.key} className="relative h-full min-w-0 flex-1">
          <img alt="" src={img.url} className="absolute inset-0 size-full object-cover" />
          {img.key && (
            <span className="f-semibold absolute bottom-[10px] left-[10px] rounded-[6px] bg-[rgba(23,32,51,0.6)] px-[7px] py-[4px] text-[10px] text-white">
              시안 {img.key}
            </span>
          )}
        </div>
      ))}
      <div className="absolute top-[12px] left-[12px] flex items-center gap-[5px]">
        <StatusTag published={campaign.status === "published"} />
        {count > 1 && (
          <span className="f-semibold rounded-full bg-white px-[9px] py-[5px] text-[11px] whitespace-nowrap text-[#1E1E28]">시안 {count}개 게시</span>
        )}
      </div>
    </div>
  )
}

function Tags({ campaign }: { campaign: Campaign }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-[5px]">
      {campaign.goal && (
        <span className="f-semibold rounded-full bg-[#F1E8DA] px-[9px] py-[5px] text-[11px] whitespace-nowrap text-[#8A6A55]">{campaign.goal}</span>
      )}
      {campaign.contentSettings.channels.map((ch) => (
        <span key={ch} className="f-semibold rounded-full bg-[#E7EAFB] px-[9px] py-[5px] text-[11px] whitespace-nowrap text-[#5965A8]">{ch}</span>
      ))}
    </div>
  )
}

export function CampaignsPage() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const { startNewCampaign, upgradeNotice } = useStartNewCampaign()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<Status>("all")
  const [sort, setSort] = useState<Sort>("newest")
  const [view, setView] = useState<"grid" | "list">("grid")

  const campaigns = useMemo(() => sanitizeCampaigns(data.campaigns), [data.campaigns])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = campaigns.filter(
      (c) => (status === "all" || c.status === status) && (!q || c.title.toLowerCase().includes(q)),
    )
    return list.sort((x, y) =>
      sort === "name"
        ? x.title.localeCompare(y.title, "ko")
        : sort === "oldest"
          ? campaignTimestamp(x).localeCompare(campaignTimestamp(y))
          : campaignTimestamp(y).localeCompare(campaignTimestamp(x)),
    )
  }, [campaigns, query, status, sort])

  const openId = params.get("campaign")
  const opened = campaigns.find((c) => c.id === openId)
  const open = (id: string) => setParams({ campaign: id })
  const close = () => setParams({}, { replace: true })

  const resume = (c: Campaign) => {
    setData((prev) => ({
      ...prev,
      activeDraftId: c.id,
      campaigns: sanitizeCampaigns(prev.campaigns).map((x) => {
        if (x.id !== c.id) return x
        // Older drafts only stored targetMenuId/goal; fill in the step-1 fields.
        const targetMenuIds = x.targetMenuIds?.length ? x.targetMenuIds : x.targetMenuId ? [x.targetMenuId] : []
        const goalOption = x.goalOption || (x.goal ? (knownGoals.includes(x.goal) ? x.goal : CUSTOM_GOAL) : "")
        const customGoal = goalOption === CUSTOM_GOAL ? x.customGoal || x.goal : x.customGoal
        return { ...x, targetMenuIds, goalOption, customGoal }
      }),
    }))
    const targetMenuIds = c.targetMenuIds?.length ? c.targetMenuIds : c.targetMenuId ? [c.targetMenuId] : []
    navigate(`/campaigns/new/${resumeStep({ ...c, targetMenuIds })}`)
  }

  const dateLine = (c: Campaign) =>
    c.status === "published" && c.publishedAt ? `게시일 ${monthDay(c.publishedAt)}` : `마지막 수정 ${monthDay(c.updatedAt ?? c.createdAt)}`

  const action = (c: Campaign) =>
    c.status === "published" ? (
      <button type="button" onClick={() => open(c.id)} className="flex items-center gap-[5px]">
        <span className="f-semibold text-[12px] whitespace-nowrap text-[#D9643A]">상세 보기</span>
        <img alt="" src={a("6b520.svg")} className="size-[14px]" />
      </button>
    ) : (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          resume(c)
        }}
        className="f-semibold flex h-[34px] items-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[16px] text-[14px] whitespace-nowrap text-[#1E1E28] hover:bg-[#F4F1EA]"
      >
        이어서 만들기
      </button>
    )

  return (
    <div className="editorial-app-page flex min-h-screen min-w-0 flex-1 flex-col gap-[20px] bg-[#F4F1EA] px-[36px] pt-[24px] pb-[30px]">
      <PageHeader current="캠페인 보관함" />

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="f-bold text-[30px] tracking-[-0.03em] text-[#1E1E28]">캠페인 보관함</h1>
          <p className="f-regular text-[14px] text-[#6B6A72]">만든 캠페인을 모아보고, 다시 열어 이미지를 내려받을 수 있어요.</p>
        </div>
        <button
          type="button"
          onClick={() => startNewCampaign()}
          className="flex h-[46px] items-center gap-[7px] rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[18px] hover:bg-[#31313D]"
        >
          <img alt="" src={a("20839.svg")} className="size-[17px]" />
          <span className="f-semibold text-[14px] whitespace-nowrap text-white">새 캠페인 만들기</span>
        </button>
      </div>

      <div className="flex h-[48px] w-full items-center gap-[16px]">
        <label className="flex h-[44px] w-[340px] items-center gap-[9px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[16px] focus-within:border-[#D9643A]">
          <img alt="" src={a("abee9.svg")} className="size-[18px]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="캠페인 이름으로 검색"
            aria-label="캠페인 이름으로 검색"
            className="f-regular min-w-0 flex-1 bg-transparent text-[14px] text-[#1E1E28] outline-none placeholder:text-[#9A989F]"
          />
        </label>
        <div className="flex min-w-0 flex-1 items-start gap-[6px]" role="group" aria-label="상태 필터">
          {statusFilters.map((f) => {
            const active = status === f.value
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(f.value)}
                className={`flex h-[36px] items-center rounded-full border px-[15px] text-[13px] whitespace-nowrap ${
                  active ? "f-bold border-[#1E1E28] bg-[#1E1E28] text-white" : "f-medium border-[rgba(30,30,40,0.15)] bg-white text-[#6B6A72] hover:bg-[#F1E8DA]"
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <label className="relative flex h-[42px] w-[116px] items-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="정렬"
            className="f-semibold size-full appearance-none bg-transparent pr-[34px] pl-[16px] text-[14px] text-[#1E1E28] outline-none"
          >
            {(Object.keys(sortLabels) as Sort[]).map((s) => (
              <option key={s} value={s}>{sortLabels[s]}</option>
            ))}
          </select>
          <img alt="" src={a("22c5d.svg")} className="pointer-events-none absolute right-[14px] size-[16px]" />
        </label>
        <div className="flex items-start gap-[2px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white p-[4px]" role="group" aria-label="보기 전환">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === "grid" ? "카드 보기" : "목록 보기"}
              onClick={() => setView(v)}
              className={`flex size-[34px] items-center justify-center rounded-full ${view === v ? "bg-[#F1E8DA]" : "bg-white hover:bg-[#F4F1EA]"}`}
            >
              <img alt="" src={a(v === "grid" ? "41771.svg" : "a6f84.svg")} className="size-[18px]" />
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="f-regular flex h-[240px] w-full items-center justify-center rounded-[20px] border border-dashed border-[rgba(30,30,40,0.22)] bg-white text-[14px] text-[#9A989F]">
          조건에 맞는 캠페인이 없어요.
        </div>
      ) : view === "grid" ? (
        <div className="grid w-full grid-cols-3 gap-[20px]">
          {visible.map((c) => (
            <article
              key={c.id}
              onClick={() => open(c.id)}
              className={`flex h-[335px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white transition-shadow hover:shadow-[0_10px_24px_rgba(30,30,40,0.09)] ${cardShadow}`}
            >
              <Collage campaign={c} height="h-[202px]" />
              <div className="flex w-full flex-col gap-[10px] px-[18px] pt-[18px] pb-[14px]">
                <div className="flex w-full items-center justify-between gap-[8px]">
                  <h2 className="f-bold min-w-0 truncate text-[18px] text-[#1E1E28]">{c.title}</h2>
                  <button
                    type="button"
                    aria-label={`${c.title} 상세 보기`}
                    onClick={(e) => {
                      e.stopPropagation()
                      open(c.id)
                    }}
                    className="shrink-0 rounded-[8px] hover:bg-[#F4F1EA]"
                  >
                    <img alt="" src={a("95137.svg")} className="size-[18px]" />
                  </button>
                </div>
                <Tags campaign={c} />
                <div className="flex h-[36px] w-full items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <p className="f-regular text-[12px] text-[#9A989F]">{dateLine(c)}</p>
                  {action(c)}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-[12px]">
          {visible.map((c) => (
            <article
              key={c.id}
              onClick={() => open(c.id)}
              className={`flex h-[112px] w-full cursor-pointer items-center gap-[18px] overflow-hidden rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white pr-[18px] hover:shadow-[0_10px_24px_rgba(30,30,40,0.09)] ${cardShadow}`}
            >
              <div className="h-full w-[220px] shrink-0">
                <Collage campaign={c} height="h-full" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
                <h2 className="f-bold truncate text-[18px] text-[#1E1E28]">{c.title}</h2>
                <Tags campaign={c} />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-[8px]" onClick={(e) => e.stopPropagation()}>
                <p className="f-regular text-[12px] text-[#9A989F]">{dateLine(c)}</p>
                {action(c)}
              </div>
            </article>
          ))}
        </div>
      )}

      {opened && <CampaignDetailPanel campaign={opened} menus={data.store.menus} onClose={close} onResume={() => resume(opened)} />}
      {upgradeNotice}
    </div>
  )
}
