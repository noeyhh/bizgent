import { Link } from "react-router"
import { requestSubscribe } from "../services/subscription"
import { useAppStore } from "../store/AppContext"
import { toggleSettingsMenu } from "./SettingsMenu"

/** Breadcrumb + account tools row used at the top of app pages. */
export function PageHeader({ current, parent }: { current: string; parent?: string }) {
  const { data } = useAppStore()
  return (
    <div className="flex h-[38px] w-full items-center justify-between">
      <nav aria-label="현재 위치" className="flex items-start gap-[8px] text-[13px]">
        <Link to="/" className="f-regular text-[#667085] hover:text-[#172033]">홈</Link>
        <span className="f-regular text-[#98a2b3]">›</span>
        {parent && (
          <>
            <span className="f-regular text-[#667085]">{parent}</span>
            <span className="f-regular text-[#98a2b3]">›</span>
          </>
        )}
        <span className="f-semibold text-[#2563eb]">{current}</span>
      </nav>
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={requestSubscribe}
          className="f-bold flex h-[38px] items-center rounded-full bg-white px-[16px] text-[14px] whitespace-nowrap text-[#2563eb] shadow-[0px_5px_16px_0px_rgba(16,24,40,0.05)]"
        >
          플랜 업그레이드
        </button>
        <button type="button" aria-label="알림" className="size-[38px]">
          <img alt="" src="/assets/c0a13.svg" className="size-[38px]" />
        </button>
        <button type="button" aria-haspopup="menu" aria-label="계정 메뉴" onClick={(e) => toggleSettingsMenu(e.currentTarget, "below")} className="f-bold flex size-[38px] items-center justify-center rounded-full border-2 border-white bg-[#f1efff] text-[13px] text-[#2563eb] hover:bg-[#dbe8ff]">
          {data.user.name.charAt(0)}
        </button>
      </div>
    </div>
  )
}
