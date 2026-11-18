import { useAppStore } from "../store/AppContext"
import { sanitizeCampaigns } from "../store/campaign"
import type { Campaign } from "../store/types"

/** Reads and updates the active draft campaign in the global store. */
export function useDraftCampaign() {
  const { data, setData } = useAppStore()
  const draft = sanitizeCampaigns(data.campaigns).find(
    (c) => c.id === data.activeDraftId && c.status === "draft",
  )

  const update = (patch: (c: Campaign) => Partial<Campaign>) =>
    setData((prev) => ({
      ...prev,
      campaigns: sanitizeCampaigns(prev.campaigns).map((c) =>
        c.id === prev.activeDraftId ? { ...c, ...patch(c), updatedAt: new Date().toISOString() } : c,
      ),
    }))

  const menuNames = (draft?.targetMenuIds ?? [])
    .map((id) => data.store.menus.find((m) => m.id === id)?.name)
    .filter((n): n is string => Boolean(n))

  /** Marks a step as confirmed so it can no longer be revisited or edited. */
  const lockStep = (path: string) => update(() => ({ lockedStep: path }))

  return { data, draft, update, lockStep, menuNames }
}
