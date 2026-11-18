import { useState } from "react"
import { useNavigate } from "react-router"
import { EntryBrand } from "../components/EntryBrand"
import { TermsModal } from "../components/TermsModal"
import { LandingFooter } from "../components/landing/LandingFooter"
import { LandingShowcase } from "../components/landing/LandingShowcase"
import { Icon } from "../components/home/icons"
import { useAppStore } from "../store/AppContext"
import type { StartIntent } from "../store/types"

export function LandingPage() {
  const navigate = useNavigate()
  const { setData } = useAppStore()
  const [showTerms, setShowTerms] = useState(false)

  const openTerms = (intent: StartIntent) => {
    setData((current) => ({ ...current, startIntent: intent }))
    setShowTerms(true)
  }

  const agree = () => {
    setData((current) => ({ ...current, termsAgreed: true }))
    setShowTerms(false)
    navigate("/login")
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="landing-page entry-editorial pd-scope relative min-h-screen overflow-hidden bg-[#F4F1EA]">
      <header className="mx-auto flex min-h-[88px] max-w-[1200px] items-center justify-between gap-[24px] border-b border-[rgba(30,30,40,0.10)] px-[24px] py-[20px] max-sm:flex-col max-sm:items-start">
        <EntryBrand />
        <nav className="flex items-center gap-[32px] text-[15px] font-medium text-[#6B6A72] max-sm:w-full max-sm:justify-between max-sm:gap-[12px]">
          <button type="button" onClick={() => scrollTo("showcase")} className="nav-link whitespace-nowrap">기능 소개</button>
          <button type="button" onClick={() => scrollTo("pricing")} className="nav-link whitespace-nowrap">요금제</button>
          <button
            type="button"
            onClick={() => openTerms("start")}
            className="btn-primary h-[44px] rounded-full bg-[#1E1E28] px-[20px] text-[15px] font-semibold whitespace-nowrap text-white max-sm:px-[16px]"
          >
            무료로 시작하기
          </button>
        </nav>
      </header>

      <main className="relative mx-auto flex min-h-[620px] max-w-[1200px] flex-col justify-center px-[24px] py-[96px] text-left max-md:py-[72px] max-sm:min-h-0 max-sm:py-[64px]">
        <div
          aria-hidden="true"
          className="hidden"
        />
        <div aria-hidden="true" className="hidden" />
        <div aria-hidden="true" className="hidden" />
        <div aria-hidden="true" className="hidden" />
        <div aria-hidden="true" className="hidden" />
        <div aria-hidden="true" className="hidden" />

        <div className="flex items-center justify-between gap-[64px]">
          <div className="max-w-[680px]">
            <p className="w-fit rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[14px] py-[8px] text-[13px] font-semibold text-[#6B6A72]">
              소상공인을 위한 AI 마케팅 에이전트
            </p>
            <h1 className="mt-[24px] text-[60px] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#1E1E28] max-md:text-[48px] max-sm:text-[39px]">
              매장 마케팅을, <span className="text-[#1E1E28]">AI</span>가 기획하다
            </h1>
            <p className="mt-[20px] text-[17px] leading-[1.75] font-normal text-[#6B6A72] max-sm:text-[15px]">
              타겟 고객 분석부터 콘텐츠 제작, 게시까지 AI가 한 번에 해결해드립니다.<br className="max-sm:hidden" />
              마케팅 전문가 없어도, 광고 문구 몰라도 BizGent가 함께 하겠습니다.
            </p>
          </div>

          <div aria-hidden="true" className="grid w-[400px] shrink-0 grid-cols-2 gap-[10px] max-lg:hidden">
            <div className="flex h-[168px] flex-col justify-center rounded-tl-[68px] rounded-tr-[22px] rounded-br-[22px] rounded-bl-[22px] bg-[#D9643A] p-[24px] text-white">
              <span className="text-[11px] font-bold tracking-[0.14em]">01 PLAN</span>
              <p className="mt-[9px] text-[18px] leading-[1.35] font-bold">목표만 정하면</p>
            </div>
            <div className="flex h-[168px] flex-col items-center justify-center rounded-[84px] bg-[#8E9BE6] p-[24px] text-center text-[#1E1E28]">
              <span className="text-[11px] font-bold tracking-[0.14em]">02 CREATE</span>
              <p className="mt-[9px] text-[18px] leading-[1.35] font-bold">문구·이미지 시안</p>
            </div>
            <div className="flex h-[168px] flex-col rounded-[22px] bg-[#B9AF7A] p-[24px] text-[#1E1E28]">
              <span className="text-[11px] font-bold tracking-[0.14em]">03 POST</span>
              <p className="mt-[9px] text-[18px] leading-[1.35] font-bold">채널에 바로 게시</p>
            </div>
            <div className="flex h-[168px] flex-col rounded-tl-[22px] rounded-tr-[22px] rounded-br-[68px] rounded-bl-[22px] bg-[#1E1E28] p-[24px] text-white">
              <span className="text-[11px] font-bold tracking-[0.14em]">04 ANALYZE</span>
              <p className="mt-[9px] text-[18px] leading-[1.35] font-bold">매출로 확인하고<br />다음을 개선</p>
            </div>
          </div>
        </div>

        <section
          aria-label="매장 대표 이미지 생성"
          className="mt-[-44px] flex w-[560px] max-w-full items-center gap-[12px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white py-[12px] pr-[12px] pl-[20px] shadow-[0_8px_24px_rgba(30,30,40,0.05)] max-lg:mt-[30px] max-sm:rounded-[24px] max-sm:p-[12px]"
        >
          <span className="flex size-[38px] shrink-0 items-center justify-center text-[#1E1E28]">
            <Icon name="sparkle" size={20} strokeWidth={1.7} />
          </span>
          <p className="min-w-0 flex-1 text-left text-[18px] font-semibold text-[#1E1E28] max-sm:text-[15px]">매장 대표 이미지를 무료로 생성해 보세요!</p>
          <button
            type="button"
            onClick={() => openTerms("heroImage")}
            aria-label="매장 대표 이미지 무료 생성하기"
            className="btn-primary flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#D9643A] text-white max-sm:size-[46px]"
          >
            <Icon name="send" size={23} strokeWidth={1.7} />
          </button>
        </section>
      </main>

      <LandingShowcase onStart={() => openTerms("start")} />
      <LandingFooter onOpenTerms={() => openTerms("start")} />

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} onAgree={agree} />
    </div>
  )
}
