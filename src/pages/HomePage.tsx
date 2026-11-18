import { useMemo } from "react"
import { Link, useNavigate } from "react-router"
import { Icon, type IconName } from "../components/home/icons"
import { useStartNewCampaign, type CampaignPrefill } from "../hooks/useStartNewCampaign"
import { useAppStore } from "../store/AppContext"
import { campaignTimestamp, sanitizeCampaigns, campaignThumbnail, publishedDraftKeys } from "../store/campaign"
import { requestSubscribe } from "../services/subscription"
import type { Campaign } from "../store/types"

const a = (file: string) => `/assets/${file}`
const softShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.06)]"
const brandGradient = "#1E1E28"

type QuickAction = { label: string; icon: IconName; color: string } & (
  | { to: string }
  | { prefill?: CampaignPrefill }
)
const quickActions: QuickAction[] = [
  { label: "새 캠페인", icon: "plus", color: "#FFFFFF" },
  { label: "대표 이미지", icon: "image", color: "#D9643A", to: "/store?imageCard=open" },
  { label: "인스타 게시물", icon: "instagram", color: "#8E9BE6", prefill: { channels: ["인스타그램"], source: "quick" } },
  { label: "블로그 글", icon: "blog", color: "#777044", prefill: { channels: ["블로그"], source: "quick" } },
  { label: "당근 홍보", icon: "carrot", color: "#D9643A", prefill: { channels: ["당근마켓"], source: "quick" } },
  { label: "매출 올리기", icon: "upload", color: "#8E9BE6", to: "/performance?upload=open" },
  { label: "성과 보기", icon: "chart", color: "#1E1E28", to: "/performance" },
  { label: "개선 방향", icon: "bulb", color: "#777044", to: "/insights" },
]

type Mock = { image?: string; lines?: number; tags?: boolean }
const contentTiles: { title: string; bg: string; ink: string; mock: Mock }[] = [
  { title: "SNS 게시물 캡션", bg: "#F1E8DA", ink: "#D9643A", mock: { image: "93c88.png", lines: 2 } },
  { title: "홍보 문구", bg: "#E7EAFB", ink: "#6572C6", mock: { lines: 4 } },
  { title: "해시태그 세트", bg: "#ECE8D3", ink: "#777044", mock: { tags: true } },
  { title: "AI 광고 이미지", bg: "#FFFFFF", ink: "#1E1E28", mock: { image: "77d12.png" } },
  { title: "블로그 포스팅", bg: "#F1E8DA", ink: "#D9643A", mock: { image: "afdbb.png", lines: 3 } },
  { title: "당근 소식", bg: "#E7EAFB", ink: "#6572C6", mock: { image: "a299e.png", lines: 1 } },
  { title: "카카오톡 채널 공지", bg: "#ECE8D3", ink: "#777044", mock: { lines: 3 } },
  { title: "이벤트 포스터", bg: "#FFFFFF", ink: "#1E1E28", mock: { image: "2cbe7.png", lines: 1 } },
]

const monthDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

const campaignMeta = (c: Campaign) =>
  c.status === "published" && c.publishedAt
    ? `${c.contentSettings.channels[0] ?? ""} · ${monthDay(c.publishedAt)} 게시`
    : `마지막 수정 ${monthDay(c.updatedAt ?? c.createdAt)}`

function SectionTitle({ title, link }: { title: string; link?: { label: string; to: string } }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#1E1E28]">{title}</h2>
      {link && (
        <Link to={link.to} className="flex items-center gap-[2px] text-[14px] font-semibold text-[#D9643A] transition-colors hover:text-[#C4552E]">
          {link.label}
          <Icon name="chevron" size={16} strokeWidth={2} />
        </Link>
      )}
    </div>
  )
}

function CampaignCard({ c }: { c: Campaign }) {
  const published = c.status === "published"
  const thumbnail = campaignThumbnail(c)
  const draftCount = publishedDraftKeys(c).length
  return (
    <article className={`relative h-[260px] w-[200px] shrink-0 snap-start overflow-hidden rounded-[20px] ${softShadow}`}>
      {thumbnail ? (
        <img alt="" src={thumbnail} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: brandGradient }}>
          <span className="flex size-[56px] items-center justify-center text-white">
            <Icon name="pencil" size={26} strokeWidth={1.7} />
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-[rgba(30,30,40,0.66)]" />
      <span className="absolute top-[12px] left-[12px] flex items-center gap-[5px] rounded-full border border-white/30 bg-[#1E1E28] px-[9px] py-[4px] text-[11px] font-semibold text-white">
        <span className={`size-[6px] rounded-full ${published ? "bg-[#8BAE79]" : "bg-[#D9A441]"}`} />
        {published ? "게시 완료" : "작성 중"}
      </span>
      {draftCount > 1 && (
        <span className="absolute top-[12px] right-[12px] rounded-full bg-white px-[8px] py-[4px] text-[11px] font-semibold text-[#1E1E28]">
          시안 {draftCount}개
        </span>
      )}
      <div className="absolute inset-x-[14px] bottom-[14px] flex flex-col gap-[4px]">
        <p className="line-clamp-2 text-[15px] leading-[1.35] font-bold text-white">{c.title}</p>
        <p className="truncate text-[12px] text-white/75">{campaignMeta(c)}</p>
      </div>
    </article>
  )
}

function TileMock({ mock, ink }: { mock: Mock; ink: string }) {
  return (
    <div className="absolute right-[-14px] bottom-[-34px] flex w-[92px] rotate-[10deg] flex-col gap-[5px] rounded-[10px] bg-white p-[7px] shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition-transform duration-200 ease-out group-hover:-translate-y-[8px] group-hover:rotate-[4deg] motion-reduce:transition-none">
      {mock.image && <img alt="" src={a(mock.image)} className="h-[52px] w-full rounded-[6px] object-cover" />}
      {mock.tags && (
        <div className="flex flex-wrap gap-[3px] pb-[30px]">
          {["#카페", "#신메뉴", "#라떼", "#데일리"].map((t) => (
            <span key={t} className="rounded-full px-[5px] py-[1px] text-[8px] font-semibold" style={{ color: ink, backgroundColor: `${ink}14` }}>
              {t}
            </span>
          ))}
        </div>
      )}
      {Array.from({ length: mock.lines ?? 0 }, (_, i) => (
        <span key={i} className="h-[5px] rounded-full bg-[#e2e8f0]" style={{ width: `${i % 2 ? 62 : 100}%`, backgroundColor: i === 0 ? `${ink}40` : undefined }} />
      ))}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data } = useAppStore()
  const { startNewCampaign, upgradeNotice } = useStartNewCampaign()
  const recent = useMemo(
    () =>
      sanitizeCampaigns(data.campaigns)
        .sort((x, y) => campaignTimestamp(y).localeCompare(campaignTimestamp(x)))
        .slice(0, 10),
    [data.campaigns],
  )

  const isFree = data.user.plan === "free"
  const remaining = Math.max(0, data.user.monthlyCampaignLimit - data.user.campaignsUsedThisMonth)

  return (
    <div className="pd-scope relative min-h-screen bg-[#F4F1EA]">
      {/* Keeps the hero background layer in place without decorative effects. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[#F4F1EA]" />

      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[48px] px-[40px] pt-[24px] pb-[64px]">
        <section className="relative flex flex-col items-center pt-[28px]">
          <button
            type="button"
            onClick={requestSubscribe}
            className={`absolute top-0 right-0 flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[14px] text-[13px] font-semibold text-[#1E1E28] transition duration-150 hover:-translate-y-[1px] hover:text-[#D9643A] ${softShadow}`}
          >
            <Icon name="crown" size={15} strokeWidth={1.7} className="text-[#D9643A]" />
            플랜 업그레이드
          </button>

          <p className="text-[14px] font-medium text-[#6B6A72]">
            {data.user.name}님의 마케팅 작업실 · {data.store.name}
          </p>
          <h1 className="mt-[10px] pb-[4px] text-center text-[40px] leading-[1.25] font-extrabold tracking-[-0.035em] text-[#1E1E28]">
            오늘은 어떤 마케팅을 해볼까요?
          </h1>
          <p className="mt-[8px] text-[14px] text-[#6B6A72]">매장 정보와 목표만 알려주면 AI가 홍보 캠페인을 기획하고 콘텐츠까지 만들어 드려요.</p>

          <div className="mt-[28px] flex justify-center gap-[12px]">
            <button
              type="button"
              onClick={() => startNewCampaign()}
              className="flex h-[56px] items-center gap-[8px] rounded-full bg-[#1E1E28] px-[28px] text-[16px] font-bold text-white transition duration-150 ease-in-out hover:-translate-y-[2px] hover:bg-[#31313D] active:scale-[0.98] motion-reduce:hover:translate-y-0"
            >
              <Icon name="plus" size={20} strokeWidth={1.7} />
              새로운 캠페인 생성하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/store?imageCard=open")}
              className="flex h-[56px] items-center gap-[8px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[28px] text-[16px] font-bold text-[#1E1E28] transition duration-150 ease-in-out hover:-translate-y-[2px] hover:border-[#D9643A] hover:text-[#D9643A] active:scale-[0.98] motion-reduce:hover:translate-y-0"
            >
              <Icon name="sparkle" size={20} strokeWidth={1.7} />
              AI로 매장 대표 이미지 생성하기
            </button>
          </div>
          {/* Keeps the hero at its previous height so the quick actions row doesn't move. */}
          <p className="mt-[16px] h-[20px] text-[13px] leading-[20px] text-[#6B6A72]">
            {isFree && `무료 플랜 · 이번 달 캠페인 ${data.user.monthlyCampaignLimit}회 중 ${remaining}회 남음`}
          </p>
          <div aria-hidden="true" className="h-[12px]" />
        </section>

        <nav aria-label="빠른 작업" className="flex justify-center gap-[18px] [&>button:first-child>span:first-child]:!bg-[#1E1E28]">
          {quickActions.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => ("to" in q ? navigate(q.to) : startNewCampaign(q.prefill))}
              className="group flex w-[92px] flex-col items-center gap-[10px]"
            >
              <span
                className="flex size-[64px] items-center justify-center rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white transition-transform duration-200 ease-out group-hover:-translate-y-[3px] motion-reduce:transition-none"
                style={{ color: q.color }}
              >
                <Icon name={q.icon} size={24} strokeWidth={1.7} />
              </span>
              <span className="text-[13px] font-medium whitespace-nowrap text-[#1E1E28]">{q.label}</span>
            </button>
          ))}
        </nav>

        <section className="flex flex-col gap-[16px]">
          <SectionTitle title="최근 캠페인" link={{ label: "모두 보기", to: "/campaigns" }} />
          <div className="-mx-[8px] flex snap-x gap-[16px] overflow-x-auto px-[8px] pt-[4px] pb-[16px] [scrollbar-width:thin]">
            <button
              type="button"
              onClick={() => startNewCampaign()}
              className="flex h-[260px] w-[200px] shrink-0 snap-start flex-col items-center justify-center gap-[10px] rounded-[20px] border border-[#1E1E28] bg-[#1E1E28] text-white transition-colors duration-150 hover:bg-[#31313D]"
            >
              <span className="flex size-[44px] items-center justify-center rounded-full border border-white/25">
                <Icon name="plus" size={22} strokeWidth={1.7} />
              </span>
              <span className="text-[15px] font-bold">새 캠페인</span>
            </button>
            {recent.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-[16px]">
          <SectionTitle title="추천 콘텐츠 유형" />
          <div className="grid grid-cols-4 gap-[16px]">
            {contentTiles.map((t) => (
              <article
                key={t.title}
                className="group relative h-[96px] overflow-hidden rounded-[20px] border border-[rgba(30,30,40,0.15)] px-[18px] py-[16px]"
                style={{ backgroundColor: t.bg }}
              >
                <span className="absolute top-[18px] left-[18px] size-[7px] rounded-full" style={{ backgroundColor: t.ink }} />
                <p className="relative z-10 mt-[16px] max-w-[130px] text-[15px] leading-[1.35] font-bold text-[#1E1E28]">{t.title}</p>
                <TileMock mock={t.mock} ink={t.ink} />
              </article>
            ))}
          </div>
        </section>
      </div>
      {upgradeNotice}
    </div>
  )
}
