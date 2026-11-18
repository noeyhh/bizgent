import type { Campaign } from "./types"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value))

export function isValidCampaign(value: unknown): value is Campaign {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    (value.status === "draft" || value.status === "published") &&
    typeof value.title === "string" &&
    typeof value.goal === "string" &&
    typeof value.targetMenuId === "string" &&
    isRecord(value.plan) &&
    isRecord(value.contentSettings) &&
    Array.isArray(value.contentSettings.channels) &&
    isRecord(value.imageSettings) &&
    Array.isArray(value.drafts) &&
    isRecord(value.channelResults)
  )
}

export function sanitizeCampaigns(
  campaigns: unknown,
  fallbackTime = new Date().toISOString(),
): Campaign[] {
  if (!Array.isArray(campaigns)) return []

  return campaigns.flatMap((value) => {
    if (!isValidCampaign(value)) return []

    const createdAt = isValidDate(value.createdAt)
      ? value.createdAt
      : isValidDate(value.updatedAt)
        ? value.updatedAt
        : fallbackTime
    const updatedAt = isValidDate(value.updatedAt)
      ? value.updatedAt
      : createdAt

    // Migrate the legacy single selection to the array form.
    const legacy = (value as { selectedDraftKey?: unknown }).selectedDraftKey
    const selectedDraftKeys = Array.isArray(value.selectedDraftKeys)
      ? value.selectedDraftKeys
      : typeof legacy === "string"
        ? [legacy as Campaign["selectedDraftKeys"][number]]
        : []
    const { selectedDraftKey: _legacy, ...rest } = value as Campaign & { selectedDraftKey?: unknown }

    return [{ ...rest, selectedDraftKeys, createdAt, updatedAt }]
  })
}

export const campaignTimestamp = (campaign: Campaign) =>
  campaign.updatedAt ?? campaign.createdAt ?? ""

export function createEmptyCampaign(): Campaign {
  const now = new Date().toISOString()

  return {
    id: `campaign-${crypto.randomUUID()}`,
    createdAt: now,
    title: "새 캠페인",
    thumbnailUrl: "",
    updatedAt: now,
    status: "draft",
    goal: "",
    goalOption: "",
    customGoal: "",
    targetMenuId: "",
    targetMenuIds: [],
    targetCustomers: [],
    toneManners: [],
    extraNote: "",
    plan: { direction: "", targetCustomer: "", strategy: "", expectedEffect: "" },
    contentSettings: { channels: [], hashtagOn: false, imageOn: false },
    imageSettings: { mood: "", composition: "", referenceImageUrl: "" },
    drafts: [],
    selectedDraftKeys: [],
    publishedAt: null,
    channelResults: {},
    reminderAt: null,
  }
}

/** Draft keys recorded as published in channelResults, in draft order. */
export function publishedDraftKeys(campaign: Campaign) {
  const keys = Object.values(campaign.channelResults)
    .filter((r) => r.draftKey && r.status === "success")
    .map((r) => r.draftKey!)
  return Array.from(new Set(keys)).sort()
}

/** Card thumbnail: the first published draft's image, falling back to thumbnailUrl. */
export function campaignThumbnail(campaign: Campaign) {
  const first = publishedDraftKeys(campaign)[0]
  return campaign.drafts.find((d) => d.key === first)?.imageUrl || campaign.thumbnailUrl
}

/** Wizard step path ("1" … "5") where an in-progress campaign should resume. */
export function resumeStep(c: Campaign) {
  if (!c.goal || !c.targetMenuIds?.length) return "1"
  if (!c.plan.direction) return "2"
  if (!c.contentSettings.channels.length) return "3-1"
  if (c.contentSettings.imageOn && c.imageSettings.purpose === undefined) return "3-2"
  if (!c.drafts.length || !c.selectedDraftKeys?.length) return "4"
  return "5"
}

/** Drafts that were published (or selected, for legacy data without per-draft results). */
export function publishedDrafts(c: Campaign) {
  const keys = publishedDraftKeys(c)
  const use = keys.length ? keys : c.status === "published" ? (c.selectedDraftKeys ?? []) : []
  return c.drafts.filter((d) => use.includes(d.key))
}

/** Up to two images for the card collage, first published draft first. */
export function campaignCollage(c: Campaign): { key: string | null; url: string }[] {
  const published = publishedDrafts(c)
  const source = published.length ? published : c.drafts
  const images = source.filter((d) => d.imageUrl).slice(0, 2).map((d) => ({ key: d.key as string | null, url: d.imageUrl }))
  return images.length ? images : c.thumbnailUrl ? [{ key: null, url: c.thumbnailUrl }] : []
}

const pad2 = (n: number) => String(n).padStart(2, "0")
export const monthDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
export const monthDayTime = (iso: string) => {
  const d = new Date(iso)
  const h = d.getHours()
  return `${monthDay(iso)} ${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${pad2(d.getMinutes())}`
}
