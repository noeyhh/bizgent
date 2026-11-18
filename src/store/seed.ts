import type { AppData, Campaign, Menu, Sale } from "./types"

export const CURRENT_STORE_VERSION = 3

const menus: Menu[] = [
  { id: "menu-1", name: "아메리카노", price: 4500, stock: 48 },
  { id: "menu-2", name: "크루아상", price: 4200, stock: 40 },
  { id: "menu-3", name: "시그니처 케이크", price: 7800, stock: 80 },
  { id: "menu-4", name: "브런치 세트", price: 15800, stock: 12 },
]

const dateBefore = (days: number, hour = 9) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const campaigns: Campaign[] = [
  {
    id: "campaign-1",
    createdAt: "2025-10-05T09:00:00+09:00",
    title: "10월 신메뉴 프로모션",
    thumbnailUrl: "/assets/2cbe7.png",
    updatedAt: "2025-10-05T09:00:00+09:00",
    status: "published",
    goal: "봄 시즌 신메뉴 알리기",
    targetMenuId: "menu-1",
    plan: {
      direction: "부드러운 봄날의 한 잔",
      targetCustomer: "감성적인 카페를 찾는 20~30대 직장인",
      strategy:
        "시그니처 크림의 질감과 여유로운 오후를 연결해 신메뉴 호기심을 높입니다.",
      expectedEffect: "신메뉴 인지도와 평일 오후 방문 증가",
    },
    contentSettings: {
      channels: ["인스타그램", "네이버 플레이스"],
      hashtagOn: true,
      imageOn: true,
    },
    imageSettings: {
      mood: "따뜻하고 화사한 봄",
      composition: "음료 중심의 테이블 컷",
      referenceImageUrl: "",
    },
    drafts: [
      {
        key: "A",
        channel: "인스타그램",
        text: "봄처럼 부드러운 오늘의 한 잔, 모먼트 카페 시그니처 크림 라떼를 만나보세요.",
        hashtags: ["모먼트카페", "성수카페", "크림라떼"],
        imageUrl:
          "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=1200&q=80",
      },
      {
        key: "B",
        channel: "네이버 플레이스",
        text: "고소한 에스프레소와 부드러운 수제 크림이 어우러진 봄 시즌 라떼입니다.",
        hashtags: ["성수동카페", "신메뉴"],
        imageUrl:
          "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    selectedDraftKeys: ["A"],
    publishedAt: "2025-10-05T09:00:00+09:00",
    channelResults: {
      인스타그램: { views: 4820, clicks: 386, conversions: 74 },
      "네이버 플레이스": { views: 2110, clicks: 241, conversions: 51 },
    },
    reminderAt: null,
  },
  {
    id: "campaign-2",
    createdAt: "2025-09-18T09:00:00+09:00",
    title: "9월 신메뉴 프로모션",
    thumbnailUrl: "/assets/eece9.png",
    updatedAt: "2025-09-18T09:00:00+09:00",
    status: "published",
    goal: "평일 오후 방문 늘리기",
    targetMenuId: "menu-3",
    plan: {
      direction: "오후 세 시, 달콤한 쉼표",
      targetCustomer: "성수동 인근 직장인과 프리랜서",
      strategy: "커피와 스콘 세트의 합리적인 가격을 강조합니다.",
      expectedEffect: "평일 14~17시 매출 증가",
    },
    contentSettings: {
      channels: ["인스타그램", "카카오톡 채널"],
      hashtagOn: false,
      imageOn: true,
    },
    imageSettings: {
      mood: "포근하고 차분한 분위기",
      composition: "커피와 스콘 세트",
      referenceImageUrl: "",
    },
    drafts: [
      {
        key: "A",
        channel: "카카오톡 채널",
        text: "오후 2시부터 5시까지, 커피와 바닐라빈 스콘 세트로 잠깐의 여유를 즐겨보세요.",
        hashtags: [],
        imageUrl:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    selectedDraftKeys: ["A"],
    publishedAt: "2025-09-18T09:00:00+09:00",
    channelResults: {
      "카카오톡 채널": { views: 1890, clicks: 304, conversions: 92 },
    },
    reminderAt: null,
  },
  {
    id: "campaign-3",
    createdAt: "2025-09-12T09:00:00+09:00",
    title: "추석 할인 이벤트",
    thumbnailUrl: "/assets/afdbb.png",
    updatedAt: "2025-09-12T09:00:00+09:00",
    status: "published",
    goal: "주말 디저트 판매 늘리기",
    targetMenuId: "menu-4",
    plan: {
      direction: "주말을 위한 작은 축하",
      targetCustomer: "주말 데이트를 즐기는 20~30대 고객",
      strategy: "딸기와 생크림의 신선함을 시각적으로 강조합니다.",
      expectedEffect: "주말 디저트 주문과 동반 방문 증가",
    },
    contentSettings: {
      channels: ["인스타그램"],
      hashtagOn: true,
      imageOn: true,
    },
    imageSettings: {
      mood: "생기 있고 사랑스러운 분위기",
      composition: "케이크 클로즈업",
      referenceImageUrl: "",
    },
    drafts: [
      {
        key: "A",
        channel: "인스타그램",
        text: "이번 주말에는 제철 딸기를 가득 올린 생크림 케이크로 달콤하게 쉬어가세요.",
        hashtags: ["딸기케이크", "성수데이트", "모먼트카페"],
        imageUrl:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    selectedDraftKeys: ["A"],
    publishedAt: "2025-09-12T09:00:00+09:00",
    channelResults: {
      인스타그램: { views: 3240, clicks: 278, conversions: 63 },
    },
    reminderAt: dateBefore(-1, 10),
  },
  {
    id: "campaign-4",
    createdAt: "2025-10-03T09:00:00+09:00",
    title: "가을 시즌 메뉴 소개",
    thumbnailUrl: "/assets/a299e.png",
    updatedAt: "2025-10-03T09:00:00+09:00",
    status: "draft",
    goal: "가을 시즌 메뉴 알리기",
    targetMenuId: "menu-1",
    plan: { direction: "", targetCustomer: "", strategy: "", expectedEffect: "" },
    contentSettings: { channels: ["인스타그램"], hashtagOn: true, imageOn: true },
    imageSettings: { mood: "", composition: "", referenceImageUrl: "" },
    drafts: [],
    selectedDraftKeys: [],
    publishedAt: null,
    channelResults: {},
    reminderAt: null,
  }
]

// Daily sales per menu, 2025-09-01 ~ 2025-10-12 (42 days), aligned with the published campaigns:
// 추석 할인 이벤트 (9/12, 브런치 세트) and 9월 신메뉴 프로모션 (9/18, 시그니처 케이크) show a clear lift,
// 10월 신메뉴 프로모션 (10/5, 아메리카노) shows almost no effect.
const SALES_START = new Date(2025, 8, 1)
const SALES_DAYS = 42
const baseQty: Record<string, number> = { "menu-1": 14, "menu-2": 6, "menu-3": 4, "menu-4": 2 }
const lifts: { menuId: string; from: number; days: number; factor: number }[] = [
  { menuId: "menu-4", from: 11, days: 8, factor: 2.1 },
  { menuId: "menu-3", from: 17, days: 10, factor: 1.8 },
  { menuId: "menu-1", from: 34, days: 8, factor: 1.02 },
]

const createSales = (): Sale[] => {
  const sources = ["excel", "receipt", "manual"] as const
  const sales: Sale[] = []
  for (let day = 0; day < SALES_DAYS; day++) {
    const date = new Date(SALES_START)
    date.setDate(date.getDate() + day)
    date.setHours(12, 0, 0, 0)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    menus.forEach((menu, m) => {
      const noise = ((day * 7 + m * 13) % 5) - 2
      const lift = lifts.find((l) => l.menuId === menu.id && day >= l.from && day < l.from + l.days)
      const quantity = Math.max(1, Math.round((baseQty[menu.id] * (weekend ? 1.3 : 1) + noise * 0.6) * (lift?.factor ?? 1)))
      sales.push({
        id: `sale-${day + 1}-${m + 1}`,
        date: date.toISOString(),
        menuId: menu.id,
        quantity,
        amount: menu.price * quantity,
        source: sources[(day + m) % sources.length],
      })
    })
  }
  return sales
}

/** Free usage resets on the 1st of next month. */
export const nextMonthStart = (from = new Date()) => new Date(from.getFullYear(), from.getMonth() + 1, 1).toISOString()

export function createSeedData(): AppData {
  return {
    storeVersion: CURRENT_STORE_VERSION,
    enforceCampaignLimit: false,
    insightsView: "early",
    loggedIn: false,
    termsAgreed: false,
    startIntent: null,
    user: {
      name: "김사장",
      email: "jieun@example.com",
      plan: "free",
      credits: 12,
      campaignsUsedThisMonth: 1,
      usageResetAt: nextMonthStart(),
      monthlyCampaignLimit: 3,
    },
    store: {
      name: "모먼트 카페",
      category: "카페·디저트",
      description:
        "성수동 골목에서 제철 재료로 만든 음료와 디저트를 선보이는 작은 카페입니다.",
      menus,
      targetCustomer: "20대, 30대, 직장인",
      toneManner: "친근한, 감성적인",
      heroImageUrl:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80",
    },
    campaigns,
    sales: createSales(),
    notifications: [
      {
        id: "notification-1",
        campaignId: "campaign-3",
        message:
          "주말 디저트 캠페인의 성과를 확인하고 다음 개선 방향을 살펴보세요.",
        dueAt: dateBefore(-1, 10),
        read: false,
      },
    ],
  }
}
