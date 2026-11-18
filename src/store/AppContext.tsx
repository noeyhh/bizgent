import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { sanitizeCampaigns } from "./campaign"
import { createSeedData, CURRENT_STORE_VERSION } from "./seed"
import type { AppData } from "./types"

const STORAGE_KEY = "bizgent-demo-data-v3"

type AppContextValue = {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  resetDemoData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadInitialData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return createSeedData()

    const parsed: unknown = JSON.parse(saved)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("storeVersion" in parsed) ||
      parsed.storeVersion !== CURRENT_STORE_VERSION ||
      !("enforceCampaignLimit" in parsed) ||
      typeof parsed.enforceCampaignLimit !== "boolean" ||
      !("user" in parsed) ||
      typeof parsed.user !== "object" ||
      parsed.user === null ||
      !("store" in parsed) ||
      typeof parsed.store !== "object" ||
      parsed.store === null ||
      !("campaigns" in parsed) ||
      !Array.isArray(parsed.campaigns) ||
      !("sales" in parsed) ||
      !Array.isArray(parsed.sales) ||
      !("notifications" in parsed) ||
      !Array.isArray(parsed.notifications)
    ) {
      return createSeedData()
    }

    const data = parsed as AppData
    const campaigns = sanitizeCampaigns(data.campaigns)
    const activeDraftId = campaigns.some(
      (campaign) => campaign.id === data.activeDraftId && campaign.status === "draft",
    )
      ? data.activeDraftId
      : null

    const insightsView = data.insightsView === "enough" ? "enough" : "early"

    return { ...data, campaigns, activeDraftId, insightsView }
  } catch {
    return createSeedData()
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitialData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const resetDemoData = useCallback(() => {
    const seed = createSeedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    setData(seed)
  }, [])

  const value = useMemo(
    () => ({ data, setData, resetDemoData }),
    [data, resetDemoData],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("useAppStore는 AppProvider 안에서 사용해야 합니다.")
  }

  return context
}
