import type { Campaign, CampaignDraft, CampaignPlan, Menu, Sale, Store } from "../store/types"

const AI_DELAY = 1500
const wait = (ms = AI_DELAY) => new Promise((resolve) => setTimeout(resolve, ms))

export type CampaignPlanInput = {
  storeName: string
  category: string
  goal: string
  targetMenuName: string
  targetCustomer?: string
  toneManner?: string
}

export async function generateCampaignPlan(
  input: CampaignPlanInput,
): Promise<CampaignPlan> {
  await wait()
  const audience =
    input.targetCustomer || `${input.category}에 관심 있는 지역 고객`

  return {
    direction: `${input.targetMenuName}의 매력이 바로 보이는 ${input.goal} 캠페인`,
    targetCustomer: audience,
    strategy: `${input.storeName}만의 분위기와 ${input.targetMenuName}의 특징을 연결해, 고객이 방문할 구체적인 이유를 전달합니다.`,
    expectedEffect: `${input.targetMenuName} 인지도 향상과 매장 방문 전환 증가`,
    ageGroup: input.targetCustomer || "20-30대",
    channels: ["인스타그램", "블로그"],
    tones: input.toneManner ? input.toneManner.split(", ").filter(Boolean) : ["감성적인", "트렌디한"],
    reach: "2,000~3,000명",
    frequency: "주 2-3회",
    duration: "2주",
  }
}

export async function reanalyzePlan(
  input: CampaignPlanInput & { currentPlan: CampaignPlan; feedback?: string },
): Promise<CampaignPlan> {
  await wait()
  const focus = input.feedback || "방문 동기를 더 선명하게 만드는 방향"

  return {
    direction: `${input.goal}에 집중한 ${input.targetMenuName} 제안`,
    targetCustomer: input.targetCustomer || input.currentPlan.targetCustomer,
    strategy: `${focus}으로 재구성했습니다. ${input.storeName}의 강점을 첫 문장에 배치하고 혜택과 방문 시점을 분명하게 안내합니다.`,
    expectedEffect: `콘텐츠 반응률 개선과 ${input.targetMenuName} 구매 전환 증가`,
    ageGroup: input.currentPlan.ageGroup,
    channels: input.currentPlan.channels,
    tones: input.currentPlan.tones,
    reach: "2,500~3,500명",
    frequency: input.currentPlan.frequency,
    duration: input.currentPlan.duration,
  }
}

export type GenerateDraftsInput = {
  storeName: string
  targetMenuName: string
  goal: string
  plan: CampaignPlan
  channels: string[]
  imageSettings?: { mood?: string; composition?: string; purpose?: string }
  imageOn?: boolean
}

export const DRAFT_IMAGES = ["/assets/2d925.png", "/assets/d26d2.png"]

export async function generateDrafts(
  input: GenerateDraftsInput,
): Promise<CampaignDraft[]> {
  await wait()
  const keys = ["A", "B"] as const
  const openings = [
    "오늘, 놓치기 아까운",
    "한 번 맛보면 다시 생각나는",
    "지금 가장 맛있게 즐기는",
  ]

  return keys.map((key, index) => ({
    key,
    channel: input.channels[index % input.channels.length] || "인스타그램",
    text: `${openings[index]} ${input.targetMenuName}. ${input.storeName}에서 ${input.goal}을 위한 특별한 순간을 만나보세요.`,
    hashtags: [
      input.storeName.replace(/ /g, ""),
      input.targetMenuName.replace(/ /g, ""),
      input.goal.replace(/ /g, ""),
    ],
    imageUrl: input.imageOn === false ? "" : DRAFT_IMAGES[index % DRAFT_IMAGES.length],
  }))
}

export async function suggestCopyAlternatives(input: {
  storeName: string
  originalText: string
  channel: string
  toneManner?: string
}): Promise<string[]> {
  await wait()
  const tone = input.toneManner || "친근한"

  return [
    `${input.storeName}이 준비한 오늘의 특별함을 만나보세요. ${input.originalText}`,
    `${tone} 분위기로 전해드려요. 지금 ${input.storeName}에서 직접 경험해 보세요.`,
    `${input.channel}에서 먼저 만나는 소식, ${input.originalText}`,
  ]
}

export async function editImageWithAI(input: {
  imageUrl: string
  instruction: string
  mood?: string
}): Promise<{ imageUrl: string; description: string }> {
  await wait()
  const next = DRAFT_IMAGES.find((url) => url !== input.imageUrl) ?? input.imageUrl
  return {
    imageUrl: next,
    description: `${input.mood || "브랜드에 어울리는 분위기"}를 살려 “${input.instruction}” 요청을 반영한 이미지입니다.`,
  }
}

export async function generateStoreHeroImage(input: {
  storeName: string
  category: string
  description: string
  mood?: string
}): Promise<{ imageUrl: string; alt: string }> {
  await wait()
  return {
    imageUrl: `https://placehold.co/1600x900/eff6ff/2563eb?text=${encodeURIComponent(input.storeName)}`,
    alt: `${input.mood || "따뜻한"} 분위기로 표현한 ${input.category} 매장 ${input.storeName}의 대표 이미지`,
  }
}

export type SalesAnalysis = {
  summary: string
  totalRevenue: number
  topMenuName: string
  recommendations: string[]
}

export async function analyzeSales(input: {
  sales: Sale[]
  menus: Menu[]
}): Promise<SalesAnalysis> {
  await wait()
  const totals = input.sales.reduce<Record<string, number>>((result, sale) => {
    result[sale.menuId] = (result[sale.menuId] || 0) + sale.amount
    return result
  }, {})
  const topMenuId = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topMenuName =
    input.menus.find((menu) => menu.id === topMenuId)?.name || "판매 메뉴"
  const totalRevenue = input.sales.reduce((sum, sale) => sum + sale.amount, 0)

  return {
    summary: `최근 판매 데이터에서는 ${topMenuName}의 매출 기여도가 가장 높습니다.`,
    totalRevenue,
    topMenuName,
    recommendations: [
      `${topMenuName}을 중심으로 연관 메뉴를 함께 제안해 보세요.`,
      "판매가 낮은 시간대에 한정 혜택 캠페인을 운영해 보세요.",
    ],
  }
}

export type InsightSuggestion = {
  id: string
  title: string
  desc: string
  /** Goal option to pre-select in step 1. */
  goal: string
  menuId?: string
}

export type CampaignComparison = {
  campaignId: string
  title: string
  channel: string
  views: number
  clicks: number
  conversions: number
  conversionRate: number
  reason: string
}

export type InsightsResult = {
  view: "early" | "enough"
  headline: string
  summary: string
  strengths: InsightSuggestion[]
  improvements: InsightSuggestion[]
  slowMenus: InsightSuggestion[]
  stockPromotions: InsightSuggestion[]
  good?: CampaignComparison
  bad?: CampaignComparison
}

export async function generateInsights(input: {
  storeName: string
  view: "early" | "enough"
  campaigns: Campaign[]
  menus: Menu[]
  sales: Sale[]
}): Promise<InsightsResult> {
  await wait()
  const qty = input.menus.map((m) => ({
    menu: m,
    sold: input.sales.filter((s) => s.menuId === m.id).reduce((n, s) => n + s.quantity, 0),
  }))
  const byQty = [...qty].sort((x, y) => y.sold - x.sold)
  const top = byQty[0]?.menu
  const slow = byQty[byQty.length - 1]?.menu
  const stock = input.menus
    .filter((m) => (m.stock ?? 0) > 0)
    .sort((x, y) => (y.stock ?? 0) - (x.stock ?? 0))[0]

  const base = {
    view: input.view,
    slowMenus: slow
      ? [
          {
            id: "slow-1",
            title: `${slow.name}, 함께 먹기 좋은 조합으로 소개해 보세요`,
            desc: `최근 판매가 가장 적은 메뉴예요. ${top?.name ?? "인기 메뉴"}와 세트로 묶거나 시식 이벤트로 첫 구매 장벽을 낮춰보세요.`,
            goal: "비인기 메뉴 살리기",
            menuId: slow.id,
          },
        ]
      : [],
    stockPromotions: stock
      ? [
          {
            id: "stock-1",
            title: `${stock.name} 재고 ${stock.stock}개, 마감 전 타임세일 추천`,
            desc: "재고가 많이 남아 있어요. 오후 4시 이후 한정 할인이나 1+1 쿠폰으로 빠르게 소진해 보세요.",
            goal: "재고 소진 프로모션",
            menuId: stock.id,
          },
        ]
      : [],
  }

  if (input.view === "early") {
    return {
      ...base,
      headline: `${input.storeName}, 첫 캠페인 결과를 살펴봤어요`,
      summary: "아직 캠페인과 매출 기록이 많지 않아 간단한 분석만 보여드려요. 캠페인을 2~3개 더 진행하면 잘된 캠페인과 아쉬운 캠페인을 비교해드려요.",
      strengths: [
        {
          id: "s-1",
          title: "사진이 있는 게시물의 반응이 좋았어요",
          desc: `${top?.name ?? "대표 메뉴"} 사진을 크게 보여준 게시물에서 저장과 문의가 많았어요. 다음 캠페인에도 메뉴 사진을 첫 장에 배치해 보세요.`,
          goal: "신메뉴/신상품 홍보",
          menuId: top?.id,
        },
        {
          id: "s-2",
          title: "평일 오후 방문이 늘었어요",
          desc: "게시 직후 평일 오후 매출이 조금 올랐어요. 같은 시간대에 재방문 쿠폰을 함께 안내하면 효과가 더 커질 수 있어요.",
          goal: "재방문 유도",
          menuId: top?.id,
        },
      ],
      improvements: [
        {
          id: "i-1",
          title: "게시 횟수가 적어 노출이 금방 줄었어요",
          desc: "한 번 게시한 뒤 추가 게시가 없어 3일 차부터 조회수가 줄었어요. 주 2회 정도 꾸준히 올려보세요.",
          goal: "매장 인지도 확대",
        },
        {
          id: "i-2",
          title: "혜택 문구가 눈에 잘 띄지 않았어요",
          desc: "할인 정보가 본문 끝에 있어 놓치기 쉬웠어요. 첫 문장에 가격이나 혜택을 먼저 적어보세요.",
          goal: "할인/이벤트 홍보",
          menuId: top?.id,
        },
      ],
    }
  }

  const compared = input.campaigns
    .filter((c) => c.status === "published")
    .flatMap((c) =>
      Object.entries(c.channelResults).map(([key, r]) => ({
        campaignId: c.id,
        title: c.title,
        channel: r.channel ?? key,
        views: r.views,
        clicks: r.clicks,
        conversions: r.conversions,
        conversionRate: r.clicks ? Math.round((r.conversions / r.clicks) * 1000) / 10 : 0,
      })),
    )
    .sort((x, y) => y.conversionRate - x.conversionRate)
  const goodRaw = compared[0]
  const badRaw = compared.length > 1 ? compared[compared.length - 1] : undefined

  return {
    ...base,
    headline: `${input.storeName}의 잘된 캠페인과 아쉬운 캠페인을 비교했어요`,
    summary: "게시한 캠페인의 조회·클릭·방문 전환을 비교해 다음 캠페인에 적용할 점을 정리했어요.",
    good: goodRaw && { ...goodRaw, reason: "메뉴 사진과 기간 한정 혜택을 첫 문장에 배치해 클릭 후 방문 전환이 높았어요." },
    bad: badRaw && { ...badRaw, reason: "정보는 충분했지만 행동을 유도하는 문구가 없어 클릭 대비 방문이 적었어요." },
    strengths: [
      {
        id: "g-1",
        title: "기간 한정 문구가 방문을 이끌었어요",
        desc: `잘된 캠페인은 '이번 주만' 같은 기간 한정 표현을 사용했어요. 다음 ${top?.name ?? "메뉴"} 캠페인에도 적용해 보세요.`,
        goal: "할인/이벤트 홍보",
        menuId: top?.id,
      },
    ],
    improvements: [
      {
        id: "b-1",
        title: "행동 유도 문구를 추가해 보세요",
        desc: "아쉬운 캠페인은 마지막에 '지금 방문하기' 같은 안내가 없었어요. 쿠폰이나 예약 링크를 함께 넣어보세요.",
        goal: "재방문 유도",
      },
      {
        id: "b-2",
        title: "채널에 맞는 이미지 비율을 사용하세요",
        desc: "가로 이미지는 SNS 피드에서 작게 보여 조회 대비 클릭이 낮았어요. 4:5 세로 이미지를 추천해요.",
        goal: "매장 인지도 확대",
      },
    ],
  }
}

export type StoreImageSettings = {
  mood: string
  scene: string
  menuId?: string
  extraRequest?: string
}

export type GeneratedStoreImage = { id: string; imageUrl: string; alt: string }

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

const STORE_IMAGE_POOLS: Record<string, string[]> = {
  "매장 외관": ["1616141037618-d671075fd1a1", "1785508145318-a42f8fe67eb7", "1596517447156-4408f27791ae", "1735917567827-8fabd79877a9", "1596104514460-3f3aa35a5776"],
  "매장 내부": ["1521017432531-fbd92d768814", "1511081692775-05d0f180a065", "1648462908676-8305f0eff8e0", "1579341560277-4dfaddaf6e98", "1613274554329-70f997f5789f", "1583354608715-177553a4035e"],
  "대표 메뉴:cafe": ["1529942458412-eda69f76291d", "1611916656173-875e4277bea6", "1562931976-76211df16534", "1769775529747-107551aec610", "1562931964-fb8897dbb0f8"],
  "대표 메뉴:food": ["1663530761401-15eefb544889", "1564759296729-771e78c26df7", "1625862692743-3f57873bb37c", "1579631542761-d7c4e913f8d4", "1625861910621-e9385ba1d993"],
  "메뉴와 공간 함께": ["1769775529747-107551aec610", "1759912256095-72174d9e88d7", "1565895405140-6b9830a88c19", "1529942458412-eda69f76291d", "1521017432531-fbd92d768814"],
}

let storeImageRound = 0

/** Mock: returns 3 placeholder photos that fit the store category and chosen scene. */
export async function generateStoreImage(settings: StoreImageSettings, store: Store): Promise<GeneratedStoreImage[]> {
  await wait(2000)
  const cafe = /카페|커피|디저트|베이커리/.test(store.category)
  const key = settings.scene === "대표 메뉴" ? `대표 메뉴:${cafe ? "cafe" : "food"}` : settings.scene
  const pool = STORE_IMAGE_POOLS[key] ?? STORE_IMAGE_POOLS["매장 내부"]
  const offset = (storeImageRound++ * 3) % pool.length
  const menuName = store.menus.find((m) => m.id === settings.menuId)?.name
  return [0, 1, 2].map((i) => ({
    id: `${Date.now()}-${i}`,
    imageUrl: unsplash(pool[(offset + i) % pool.length]),
    alt: `${store.name} ${settings.mood} ${menuName ?? settings.scene} 이미지 ${i + 1}`,
  }))
}

/** A sales row as read from an upload, before it is matched to store menus. */
export type RawSaleRow = { date: string; menuName: string; quantity: number | null; amount: number | null }

const sampleRows = (menus: Menu[], count: number, unknown: string[]): RawSaleRow[] => {
  const base = new Date(2025, 9, 13)
  const rows: RawSaleRow[] = []
  for (let i = 0; i < count; i++) {
    const menu = menus[i % Math.max(1, menus.length)]
    const d = new Date(base)
    d.setDate(base.getDate() + Math.floor(i / Math.max(1, menus.length)))
    const quantity = 1 + ((i * 3) % 5)
    rows.push({ date: dayString(d), menuName: menu?.name ?? "메뉴", quantity, amount: (menu?.price ?? 5000) * quantity })
  }
  // A few rows that need checking: unknown menu names and a missing amount.
  unknown.forEach((name, i) => rows.splice(4 + i * 2, 0, { date: rows[Math.min(rows.length - 1, 4 + i)]?.date ?? dayString(base), menuName: name, quantity: 1 + i, amount: 5500 * (1 + i) }))
  if (rows[1]) rows[1] = { ...rows[1], amount: null }
  return rows
}
const dayString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** Parses a CSV (date,menu,quantity,amount). Excel files are mocked with sample rows. */
export async function parseSalesFile(file: File, menus: Menu[]): Promise<RawSaleRow[]> {
  if (/\.csv$/i.test(file.name)) {
    const text = await file.text()
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const body = /date|날짜/i.test(lines[0] ?? "") ? lines.slice(1) : lines
    const rows = body.map((line) => {
      const [date = "", menuName = "", q = "", a = ""] = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      const num = (v: string) => (v.replace(/[^0-9]/g, "") ? Number(v.replace(/[^0-9]/g, "")) : null)
      return { date, menuName, quantity: num(q), amount: num(a) }
    })
    if (rows.length) return rows
  }
  await wait(600)
  return sampleRows(menus, 20, ["말차라떼", "레몬에이드"])
}

/** Mock receipt OCR: waits 2 seconds and returns recognized rows. */
export async function recognizeReceipt(_image: File, menus: Menu[]): Promise<RawSaleRow[]> {
  await wait(2000)
  return sampleRows(menus, 6, ["딸기케잌"])
}
