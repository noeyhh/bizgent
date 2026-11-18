import type { MouseEvent } from "react"
import { EntryBrand } from "../EntryBrand"

type FooterLink = { label: string; action?: "pricing" | "terms" }
const columns: { title: string; links: FooterLink[] }[] = [
  { title: "서비스", links: [{ label: "기능 소개" }, { label: "AI 캠페인 기획" }, { label: "매출 분석" }, { label: "요금제", action: "pricing" }] },
  { title: "고객지원", links: [{ label: "도움말" }, { label: "자주 묻는 질문" }, { label: "문의하기" }] },
  { title: "회사", links: [{ label: "팀 사계절 소개" }, { label: "공지사항" }] },
]

export function LandingFooter({ onOpenTerms }: { onOpenTerms: () => void }) {
  const handle = (action?: FooterLink["action"]) => (e: MouseEvent) => {
    if (action === "terms") {
      e.preventDefault()
      onOpenTerms()
    } else if (action === "pricing") {
      e.preventDefault()
      // Scroll to the pricing section once it exists on the page.
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-[rgba(30,30,40,0.12)] bg-[#F4F1EA]">
      <div className="mx-auto flex max-w-[1200px] justify-between gap-[48px] px-[24px] pt-[64px] pb-[48px] max-md:flex-col">
        <div className="flex max-w-[320px] flex-col gap-[14px]">
          <EntryBrand />
          <p className="font-normal text-[14px] leading-[1.6] text-[#6B6A72]">소상공인을 위한 AI 마케팅 에이전트</p>
        </div>
        <nav aria-label="사이트 링크" className="flex gap-[80px] max-sm:flex-wrap max-sm:gap-x-[40px] max-sm:gap-y-[32px]">
          {columns.map((col) => (
            <div key={col.title} className="flex min-w-[120px] flex-col gap-[14px]">
              <p className="font-semibold text-[14px] text-[#1E1E28]">{col.title}</p>
              <ul className="flex flex-col gap-[10px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.action === "pricing" ? "#pricing" : "#"} onClick={handle(l.action)} className="link-hover font-normal text-[14px] text-[#6B6A72]">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-[rgba(30,30,40,0.12)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-[16px] px-[24px] py-[20px] text-[13px] max-sm:flex-col max-sm:items-start">
          <p className="font-medium text-[#6B6A72]">
            <a href="#" onClick={handle("terms")} className="link-hover">이용약관</a>
            <span className="mx-[8px] text-[#B9AF7A]">·</span>
            <a href="#" className="link-hover font-medium text-[#1E1E28]">개인정보처리방침</a>
          </p>
          <p className="font-normal text-[#6B6A72]">© 2026 BizGent · 팀 사계절 (한남대학교 캡스톤디자인)</p>
        </div>
      </div>
    </footer>
  )
}
