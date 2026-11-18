export type Plan = "free" | "pro"
export type CampaignStatus = "draft" | "published"
/** Step 4 always compares exactly two drafts. */
export type CampaignDraftKey = "A" | "B"
export type SalesSource = "excel" | "receipt" | "manual"
export type StartIntent = "start" | "heroImage"

export type User = {
  name: string
  email: string
  /** Optional contact number set in 계정 관리. */
  phone?: string
  plan: Plan
  credits: number
  campaignsUsedThisMonth: number
  /** ISO date when free usage resets (1st of next month). */
  usageResetAt?: string
  monthlyCampaignLimit: 3
}

export type Menu = {
  id: string
  name: string
  price: number
  /** Optional inventory quantity; undefined when the owner didn't enter it. */
  stock?: number
  description?: string
  imageUrl?: string
}

export type Store = {
  name: string
  category: string
  description: string
  menus: Menu[]
  targetCustomer: string
  toneManner: string
  heroImageUrl: string
  phone?: string
  targetDescription?: string
  toneDescription?: string
}

export type CampaignPlan = {
  direction: string
  targetCustomer: string
  strategy: string
  expectedEffect: string
  ageGroup?: string
  channels?: string[]
  tones?: string[]
  reach?: string
  frequency?: string
  duration?: string
}

export type ContentSettings = {
  channels: string[]
  hashtagOn: boolean
  imageOn: boolean
  captionOn?: boolean
  customChannelNote?: string
}

export type ImageSettings = {
  mood: string
  composition: string
  referenceImageUrl: string
  purpose?: string
  product?: string
  brandColorOn?: boolean
  ratios?: Record<string, string>
  extraRequest?: string
}

export type CampaignDraft = {
  key: CampaignDraftKey
  channel: string
  text: string
  hashtags: string[]
  imageUrl: string
}

export type ChannelResult = {
  views: number
  clicks: number
  conversions: number
  /** Set for results recorded per published draft. */
  draftKey?: CampaignDraftKey
  channel?: string
  status?: "success" | "failed"
}

export type Campaign = {
  id: string
  createdAt: string
  status: CampaignStatus
  goal: string
  targetMenuId: string
  plan: CampaignPlan
  contentSettings: ContentSettings
  imageSettings: ImageSettings
  drafts: CampaignDraft[]
  selectedDraftKeys: CampaignDraftKey[]
  publishedAt: string | null
  channelResults: Record<string, ChannelResult>
  reminderAt: string | null
  title: string
  thumbnailUrl: string
  updatedAt: string
  goalOption?: string
  customGoal?: string
  targetMenuIds?: string[]
  targetCustomers?: string[]
  toneManners?: string[]
  extraNote?: string
  /** Goal/menu were pre-selected from an AI 캠페인 개선 방향 suggestion. */
  insightPrefill?: boolean
  /** Furthest wizard step path the user confirmed; that step and earlier ones are read-only. */
  lockedStep?: string
}

export type Sale = {
  id: string
  date: string
  menuId: string
  quantity: number
  amount: number
  source: SalesSource
}

export type Notification = {
  id: string
  campaignId: string
  message: string
  dueAt: string
  read: boolean
}

export type AppData = {
  storeVersion: number
  enforceCampaignLimit: boolean
  loggedIn: boolean
  termsAgreed: boolean
  startIntent: StartIntent | null
  user: User
  store: Store
  campaigns: Campaign[]
  sales: Sale[]
  notifications: Notification[]
  activeDraftId?: string | null
  insightsView: InsightsView
}

export type InsightsView = "early" | "enough"
