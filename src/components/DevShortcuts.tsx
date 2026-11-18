import { useState } from "react"
import { useNavigate } from "react-router"
import { useAppStore } from "../store/AppContext"

const links = [
  ["홈", "/"],
  ["캠페인 보관함", "/campaigns"],
  ["AI 캠페인 개선 방향", "/insights"],
  ["이용권", "/subscription"],
  ["새 캠페인 1단계", "/campaigns/new/1"],
] as const

// Dev-only helper: switches the insights view without touching campaign or sales seed data.
export function DevShortcuts() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [open, setOpen] = useState(false)
  const view = data.insightsView ?? "early"
  const setView = (v: "early" | "enough") => setData((prev) => ({ ...prev, insightsView: v }))
  // Only touches free usage; campaigns and sales stay untouched.
  const setUsage = (used: number) => setData((prev) => ({ ...prev, user: { ...prev.user, campaignsUsedThisMonth: used } }))
  const used = data.user.campaignsUsedThisMonth
  const limit = data.user.monthlyCampaignLimit

  return (
    <div className="fixed right-[20px] bottom-[20px] z-30 flex flex-col items-end gap-[8px]">
      {open && (
        <div className="flex w-[240px] flex-col gap-[12px] rounded-[14px] border border-[#e5eaf1] bg-white p-[14px] shadow-[0px_10px_24px_0px_rgba(16,24,40,0.12)]">
          <p className="f-bold text-[13px] text-[#172033]">개발 바로가기</p>
          <div className="flex flex-col gap-[4px]">
            {links.map(([label, to]) => (
              <button key={to} type="button" onClick={() => navigate(to)} className="f-medium rounded-[8px] px-[8px] py-[6px] text-left text-[13px] text-[#667085] hover:bg-[#f4f6f9]">
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-[6px]">
            <p className="f-semibold text-[12px] text-[#98a2b3]">무료 이용 횟수 · {used}/{limit}</p>
            <div className="flex gap-[4px]">
              <button type="button" onClick={() => setUsage(limit)} className="f-semibold flex-1 rounded-[8px] border border-[#e5eaf1] py-[6px] text-[12px] text-[#667085] hover:bg-[#f4f6f9]">
                무료 횟수 소진
              </button>
              <button type="button" onClick={() => setUsage(0)} className="f-semibold flex-1 rounded-[8px] border border-[#e5eaf1] py-[6px] text-[12px] text-[#667085] hover:bg-[#f4f6f9]">
                무료 횟수 초기화
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-[6px]">
            <p className="f-semibold text-[12px] text-[#98a2b3]">AI 개선 방향 데이터</p>
            <div className="flex gap-[4px] rounded-[10px] bg-[#f4f6f9] p-[3px]" role="group" aria-label="데이터 양 전환">
              {([["early", "data-small"], ["enough", "data-large"]] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`f-semibold flex-1 rounded-[8px] py-[6px] text-[12px] ${view === v ? "bg-white text-[#2563eb] shadow-sm" : "text-[#667085]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="f-semibold rounded-full bg-[#172033] px-[14px] py-[8px] text-[12px] text-white shadow-lg">
        {open ? "닫기" : "개발 바로가기"}
      </button>
    </div>
  )
}
