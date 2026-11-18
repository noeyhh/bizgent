import { useEffect, useState } from "react"
import { Navigate, NavLink, Outlet, useBlocker, useLocation } from "react-router"
import { resumeStep } from "../store/campaign"
import { UpgradeHintHost } from "../components/UpgradeHintHost"
import { CampaignSummaryPanel } from "../components/wizard/CampaignSummaryPanel"
import { useDraftCampaign } from "../hooks/useDraftCampaign"
import { WizardStepper, wizardSteps } from "../components/WizardStepper"
import { BrandMark } from "../components/EntryBrand"

export function WizardLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split("/").at(-1) ?? "1"
  const currentStep = Math.max(0, wizardSteps.findIndex((s) => s.path === currentPath))
  const showSummary = ["2", "3-1", "3-2", "4"].includes(currentPath)
  const { draft } = useDraftCampaign()
  const [collapsed, setCollapsed] = useState(false)

  // Steps can't be revisited: ignore browser back/forward while in the wizard.
  // The X button and in-app links use PUSH navigation, so they keep working.
  const blocker = useBlocker(({ historyAction }) => historyAction === "POP")
  useEffect(() => {
    if (blocker.state === "blocked") blocker.reset()
  }, [blocker])

  // A confirmed (locked) step can't be reopened via URL; jump to the step after it.
  const order = wizardSteps.map((s) => s.path as string)
  const lockedIndex = draft?.lockedStep ? order.indexOf(draft.lockedStep) : -1
  let lockRedirect: string | null = null
  if (draft && lockedIndex >= 0 && currentStep <= lockedIndex) {
    let next = lockedIndex + 1
    if (order[next] === "3-2" && !draft.contentSettings.imageOn) next += 1
    // Only redirect when the data actually supports the next step (avoids redirect loops).
    if (next < order.length && order.indexOf(resumeStep(draft)) >= next) lockRedirect = order[next]
  }

  return (
    <div className="editorial-wizard flex min-h-screen flex-col bg-[#F4F1EA]">
      <header className="sticky top-0 z-20 flex h-[104px] shrink-0 items-center justify-between border-b border-[rgba(30,30,40,0.15)] bg-white px-[40px]">
        <div className="flex h-[42px] w-[147px] items-center gap-[10px]">
          <NavLink
            to="/"
            aria-label="캠페인 만들기 닫기"
            className="flex size-[42px] shrink-0 items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white hover:bg-[#F4F1EA]"
          >
            <img alt="" src="/assets/ee41f.svg" className="size-[20px]" />
          </NavLink>
          <NavLink to="/" className="flex items-center gap-[7px]">
            <BrandMark className="size-[26px]" />
            <span className="f-bold text-[16px] tracking-[-0.04em] text-[#1E1E28]">bizgent</span>
          </NavLink>
        </div>
        <WizardStepper currentStep={currentStep} imageEnabled={draft?.contentSettings.imageOn ?? true} />
        <div className="h-[42px] w-[147px]" aria-hidden="true" />
      </header>

      <main className={`flex flex-1 flex-col ${showSummary ? (collapsed ? "pr-[68px]" : "pr-[300px]") : ""}`}>
        {lockRedirect ? <Navigate to={`/campaigns/new/${lockRedirect}`} replace /> : <Outlet />}
      </main>

      <UpgradeHintHost />
      {showSummary && (
        <CampaignSummaryPanel
          variant={currentPath === "2" ? "goal" : currentPath === "3-2" || currentPath === "4" ? "content" : "plan"}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      )}
    </div>
  )
}
