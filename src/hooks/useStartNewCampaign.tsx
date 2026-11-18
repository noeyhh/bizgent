import { useState } from "react"
import { useNavigate } from "react-router"
import { UpgradeNoticeDialog } from "../components/UpgradeNoticeDialog"
import { useAppStore } from "../store/AppContext"
import { createEmptyCampaign, sanitizeCampaigns } from "../store/campaign"
import type { Campaign } from "../store/types"

/** Optional pre-selection, e.g. from an AI 캠페인 개선 방향 suggestion or a home quick action. */
export type CampaignPrefill = {
  /** One of the step-1 goal options. */
  goal?: string
  menuId?: string
  /** Channels pre-selected for step 3-1. */
  channels?: string[]
  /** Which banner step 1 shows. Defaults to the insights banner. */
  source?: "insight" | "quick"
}

export function useStartNewCampaign() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false)

  const startNewCampaign = (prefill?: CampaignPrefill) => {
    // Free plan: each new campaign uses 1 of the monthly free uses.
    const isFree = data.user.plan === "free"
    if (isFree && data.user.campaignsUsedThisMonth >= data.user.monthlyCampaignLimit) {
      setShowUpgradeNotice(true)
      return
    }

    const empty = createEmptyCampaign()
    const goal = prefill?.goal ?? ""
    const nextDraft: Campaign = prefill
      ? {
          ...empty,
          goalOption: goal,
          goal,
          title: goal || empty.title,
          targetMenuIds: prefill.menuId ? [prefill.menuId] : [],
          targetMenuId: prefill.menuId ?? "",
          contentSettings: prefill.channels ? { ...empty.contentSettings, channels: prefill.channels } : empty.contentSettings,
          insightPrefill: (prefill.source ?? "insight") === "insight",
        }
      : empty
    setData((previous) => ({
      ...previous,
      user: isFree
        ? { ...previous.user, campaignsUsedThisMonth: Math.min(previous.user.monthlyCampaignLimit, previous.user.campaignsUsedThisMonth + 1) }
        : previous.user,
      campaigns: [
        ...sanitizeCampaigns(previous.campaigns).filter(
          (campaign) => campaign.id !== previous.activeDraftId,
        ),
        nextDraft,
      ],
      activeDraftId: nextDraft.id,
    }))
    navigate("/campaigns/new/1")
  }

  const upgradeNotice = (
    <UpgradeNoticeDialog
      open={showUpgradeNotice}
      onClose={() => setShowUpgradeNotice(false)}
      onUpgrade={() => {
        setShowUpgradeNotice(false)
        navigate("/subscription")
      }}
    />
  )

  return { startNewCampaign, upgradeNotice }
}
