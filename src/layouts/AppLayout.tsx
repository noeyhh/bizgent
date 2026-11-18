import { DevShortcuts } from "../components/DevShortcuts"
import { SubscribeToastHost } from "../components/SubscribeToastHost"
import { NavLink, Outlet } from "react-router"
import { SettingsMenuHost, toggleSettingsMenu } from "../components/SettingsMenu"
import { useStartNewCampaign } from "../hooks/useStartNewCampaign"
import { Icon, type IconName } from "../components/home/icons"
import { useAppStore } from "../store/AppContext"
import { BrandMark } from "../components/EntryBrand"

const navigation: { to: string; label: string; short: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "홈", short: "홈", icon: "home", end: true },
  { to: "/store", label: "매장 정보 관리", short: "매장 정보", icon: "store" },
  { to: "/campaigns", label: "캠페인 보관함", short: "보관함", icon: "archive" },
  { to: "/performance", label: "성과분석", short: "성과분석", icon: "chart" },
  { to: "/insights", label: "AI 캠페인 개선 방향", short: "개선 방향", icon: "bulb" },
  { to: "/subscription", label: "구독 관리 및 크레딧", short: "이용권", icon: "ticket" },
]

/** Hover/focus tooltip shown to the right of a rail item. */
function RailTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-1/2 left-[calc(100%+10px)] z-30 -translate-y-1/2 translate-x-[-4px] rounded-[8px] bg-[#1E1E28] px-[10px] py-[6px] text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-[0_6px_16px_rgba(30,30,40,0.14)] transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  )
}

export function AppLayout() {
  const { startNewCampaign, upgradeNotice } = useStartNewCampaign()
  const { data } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <aside className="pd-scope fixed inset-y-0 left-0 z-20 flex w-[76px] flex-col items-center border-r border-[rgba(30,30,40,0.12)] bg-white pt-[20px] pb-[18px]">
        <NavLink to="/" aria-label="BizGent 홈" className="group relative">
          <BrandMark className="size-[36px]" />
          <RailTooltip label="BizGent" />
        </NavLink>

        <button
          type="button"
          onClick={() => startNewCampaign()}
          aria-label="새로운 캠페인 생성"
          className="group relative mt-[22px] flex flex-col items-center gap-[5px] outline-none"
        >
          <span className="flex size-[44px] items-center justify-center rounded-full bg-[#1E1E28] text-white transition duration-150 group-hover:-translate-y-[1px] group-hover:bg-[#31313D] group-focus-visible:ring-2 group-focus-visible:ring-[#D9643A] group-focus-visible:ring-offset-2">
            <Icon name="plus" size={22} strokeWidth={1.7} />
          </span>
          <span className="text-[11px] font-semibold text-[#1E1E28]">만들기</span>
          <RailTooltip label="새로운 캠페인 생성" />
        </button>

        <nav className="mt-[22px] flex min-h-0 flex-1 flex-col items-center gap-[6px]" aria-label="주요 메뉴">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className="group relative flex w-[68px] flex-col items-center gap-[4px] py-[4px] outline-none"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex size-[40px] items-center justify-center rounded-[12px] transition-colors duration-150 group-focus-visible:ring-2 group-focus-visible:ring-[#D9643A] ${
                      isActive ? "bg-[#1E1E28] text-white" : "text-[#6B6A72] group-hover:bg-[#F1E8DA] group-hover:text-[#1E1E28]"
                    }`}
                  >
                    <Icon name={item.icon} size={22} strokeWidth={1.7} />
                  </span>
                  <span className={`text-[11px] whitespace-nowrap ${isActive ? "font-semibold text-[#1E1E28]" : "font-medium text-[#6B6A72]"}`}>
                    {item.short}
                  </span>
                  <RailTooltip label={item.label} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-[12px]">
          <button type="button" aria-label="알림" className="group relative flex size-[40px] items-center justify-center rounded-[12px] text-[#6B6A72] transition-colors duration-150 hover:bg-[#F1E8DA] hover:text-[#1E1E28]">
            <Icon name="bell" size={22} strokeWidth={1.7} />
            <RailTooltip label="알림" />
          </button>
          <button
            type="button"
            aria-haspopup="menu"
            aria-label="설정 및 계정 메뉴"
            onClick={(e) => toggleSettingsMenu(e.currentTarget, "above")}
            className="group relative flex size-[38px] items-center justify-center rounded-full bg-[#F1E8DA] text-[14px] font-bold text-[#1E1E28] ring-2 ring-white transition-colors duration-150 hover:bg-[#E7D9C5]"
          >
            {data.user.name.charAt(0)}
            <RailTooltip label="설정" />
          </button>
        </div>
      </aside>

      <main className="min-h-screen pl-[76px]">
        <Outlet />
      </main>
      <DevShortcuts />
      <SubscribeToastHost />
      <SettingsMenuHost />
      {upgradeNotice}
    </div>
  )
}
