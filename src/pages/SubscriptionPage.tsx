import { PageHeader } from "../components/PageHeader"
import { requestSubscribe } from "../services/subscription"
import { useAppStore } from "../store/AppContext"
import { nextMonthStart } from "../store/seed"

const a = (f: string) => `/assets/${f}`
const cardShadow = "shadow-[0_5px_18px_rgba(30,30,40,0.05)]"

const FREE_FEATURES = ["월 3회 캠페인 기획·생성", "시안 비교 A/B 2종", "문구·해시태그 직접 수정", "시안 이미지 다운로드", "SNS 채널 최대 2개 선택"]
const PRO_FEATURES: { label: string; badge?: string }[] = [
  { label: "월 캠페인 이용 횟수 확대" },
  { label: "AI 기획 재분석: 원하는 방향을 적으면 AI가 다시 기획해줘요", badge: "새 기능" },
  { label: "AI 문구 대안 제안" },
  { label: "AI 이미지 수정" },
  { label: "참고 이미지로 더 정확한 이미지 생성" },
]

function Feature({ label, icon, iconBg, badge }: { label: string; icon: string; iconBg: string; badge?: string }) {
  return (
    <li className="flex w-full items-center gap-[10px]">
      <span className={`flex size-[24px] shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <img alt="" src={a(icon)} className="size-[13px]" />
      </span>
      <span className="f-medium min-w-0 flex-1 text-[14px] text-[#1E1E28]">{label}</span>
      {badge && <span className="f-bold shrink-0 rounded-full bg-[#F1E8DA] px-[8px] py-[4px] text-[11px] whitespace-nowrap text-[#8A6A55]">{badge}</span>}
    </li>
  )
}

export function SubscriptionPage() {
  const { data } = useAppStore()
  const { campaignsUsedThisMonth, monthlyCampaignLimit, usageResetAt } = data.user
  const used = Math.min(campaignsUsedThisMonth, monthlyCampaignLimit)
  const percent = Math.round((used / monthlyCampaignLimit) * 100)
  const exhausted = used >= monthlyCampaignLimit
  const reset = new Date(usageResetAt ?? nextMonthStart())

  return (
    <div className="editorial-app-page flex min-h-screen w-full flex-col gap-[20px] bg-[#F4F1EA] px-[36px] pt-[24px] pb-[30px]">
      <div className="flex w-full flex-col gap-[18px]">
        <PageHeader current="이용권" />
        <div className="flex flex-col gap-[4px]">
          <h1 className="f-bold text-[30px] tracking-[-0.03em] text-[#1E1E28]">이용권</h1>
          <p className="f-regular text-[14px] text-[#6B6A72]">캠페인 이용 현황을 확인하고 나에게 맞는 플랜을 선택하세요</p>
        </div>
      </div>

      <section className="flex w-full flex-col gap-[14px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white px-[22px] pt-[20px] pb-[18px]">
        <div className="flex w-full items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[10px]">
            <span className="flex size-[36px] items-center justify-center rounded-[12px] bg-white">
              <img alt="" src={a("1c638.svg")} className="size-[19px]" />
            </span>
            <div className="flex flex-col gap-[3px]">
              <h2 className="f-bold text-[20px] text-[#1E1E28]">이번 달 이용 현황</h2>
              <p className="f-semibold text-[14px] text-[#6B6A72]">이번 달 캠페인 이용 {used}/{monthlyCampaignLimit}회 사용</p>
            </div>
          </div>
          <span className="f-bold rounded-full bg-[#F1E8DA] px-[11px] py-[6px] text-[12px] whitespace-nowrap text-[#8A6A55]">{percent}% 사용</span>
        </div>
        <div className="flex w-full flex-col gap-[8px]">
          <div
            role="progressbar"
            aria-label="이번 달 캠페인 이용"
            aria-valuemin={0}
            aria-valuemax={monthlyCampaignLimit}
            aria-valuenow={used}
            className="h-[10px] w-full overflow-hidden rounded-full bg-[#E5E1DA]"
          >
            <div className="h-[10px] rounded-full bg-[#D9643A] transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          <p className="f-regular text-[13px] text-[#6B6A72]">다음 리셋일: {reset.getMonth() + 1}월 {reset.getDate()}일</p>
        </div>
        {exhausted && (
          <div role="alert" className="flex w-full items-center gap-[8px] rounded-[14px] bg-[#F6DFD6] px-[14px] py-[10px]">
            <img alt="" src={a("5e774.svg")} className="size-[16px] shrink-0" />
            <p className="f-semibold min-w-0 flex-1 text-[13px] text-[#A44629]">무료 이용 횟수를 모두 사용했어요. 구독하면 더 많은 캠페인을 만들 수 있어요</p>
          </div>
        )}
      </section>

      <section className="flex w-full flex-col gap-[14px]">
        <div className="flex w-full flex-wrap items-end justify-between gap-[8px]">
          <div className="flex flex-col gap-[4px]">
            <h2 className="f-bold text-[20px] text-[#1E1E28]">요금제 비교</h2>
            <p className="f-regular text-[14px] text-[#6B6A72]">필요한 기능과 이용량에 맞는 플랜을 선택하세요</p>
          </div>
          <p className="flex items-center gap-[6px]">
            <img alt="" src={a("40516.svg")} className="size-[15px]" />
            <span className="f-semibold text-[13px] whitespace-nowrap text-[#D9643A]">언제든 플랜을 변경할 수 있어요</span>
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-[16px] md:grid-cols-2">
          <div className={`flex min-h-[470px] min-w-0 flex-col gap-[20px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[24px] ${cardShadow}`}>
            <div className="flex w-full items-center justify-between">
              <h3 className="f-bold text-[20px] text-[#1E1E28]">무료 플랜</h3>
              <span className="f-semibold rounded-full border border-[rgba(30,30,40,0.15)] bg-[#f8fafc] px-[10px] py-[6px] text-[12px] whitespace-nowrap text-[#6B6A72]">현재 플랜</span>
            </div>
            <p className="f-bold text-[32px] text-[#1E1E28]">0원</p>
            <div className="h-px w-full bg-[#eef1f5]" />
            <ul className="flex w-full flex-col gap-[16px]">
              {FREE_FEATURES.map((f, i) => <Feature key={f} label={f} icon={i < 3 ? "443d1.svg" : "ac97e.svg"} iconBg="bg-[#F1E8DA]" />)}
            </ul>
            <div className="min-h-px w-full flex-1" />
            <button type="button" disabled className="f-bold flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[rgba(30,30,40,0.15)] bg-[#f8fafc] text-[14px] text-[#9A989F]">
              현재 이용 중
            </button>
          </div>

          <div className={`relative flex min-h-[470px] min-w-0 flex-col gap-[20px] overflow-hidden rounded-[20px] border border-[#1E1E28] bg-white px-[24px] pt-[28px] pb-[24px] ${cardShadow}`}>
            <div className="absolute top-0 right-0 left-0 h-[6px] bg-white" aria-hidden="true" />
            <div className="flex w-full items-center justify-between">
              <h3 className="f-bold text-[20px] text-[#1E1E28]">구독 플랜</h3>
              <span className="f-bold rounded-full bg-[#F1E8DA] px-[10px] py-[6px] text-[12px] whitespace-nowrap text-[#8A6A55]">추천</span>
            </div>
            <p className="f-bold text-[32px] text-[#1E1E28]">월 9,900원</p>
            <div className="h-px w-full bg-[#e8e4ff]" />
            <ul className="flex w-full flex-col gap-[13px]">
              {PRO_FEATURES.map((f, i) => <Feature key={f.label} label={f.label} badge={f.badge} icon={i < 1 ? "758e8.svg" : "02f42.svg"} iconBg="bg-[#F1E8DA]" />)}
            </ul>
            <div className="min-h-px w-full flex-1" />
            <button type="button" onClick={requestSubscribe} className={`f-bold flex h-[48px] w-full items-center justify-center rounded-full bg-[#1E1E28] text-[16px] text-white hover:bg-[#31313D] ${cardShadow}`}>
              구독하기
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
