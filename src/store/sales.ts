import type { Campaign, Menu, Sale } from "./types"

const DAY = 864e5
export type Period = "7" | "30" | "all"
export const PERIOD_LABELS: Record<Period, string> = { "7": "최근 7일", "30": "최근 30일", all: "전체 기간" }

/** Local yyyy-mm-dd key. */
export const dayKey = (d: Date | string) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}
const startOfDay = (d: Date | string) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
export const md = (d: Date | string) => {
  const x = new Date(d)
  return `${x.getMonth() + 1}월 ${x.getDate()}일`
}
export const won = (n: number) => `${Math.round(n).toLocaleString()}원`
export const pct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null)

export type Range = { start: Date; end: Date } // inclusive days

/** Period is anchored on the latest sales date so demo data always has a full window. */
export function periodRanges(sales: Sale[], period: Period): { current: Range; previous: Range | null } | null {
  if (!sales.length) return null
  const times = sales.map((s) => startOfDay(s.date).getTime())
  const last = new Date(Math.max(...times))
  const first = new Date(Math.min(...times))
  if (period === "all") return { current: { start: first, end: last }, previous: null }
  const days = Number(period)
  const start = new Date(last.getTime() - (days - 1) * DAY)
  const current = { start: start < first ? first : start, end: last }
  const prevEnd = new Date(start.getTime() - DAY)
  const previous = prevEnd >= first ? { start: new Date(Math.max(first.getTime(), start.getTime() - days * DAY)), end: prevEnd } : null
  return { current, previous }
}

export const inRange = (s: Sale, r: Range) => {
  const t = startOfDay(s.date).getTime()
  return t >= r.start.getTime() && t <= r.end.getTime()
}
const sum = (list: Sale[], f: (s: Sale) => number) => list.reduce((n, s) => n + f(s), 0)

export function dailySeries(sales: Sale[], r: Range) {
  const byDay = new Map<string, number>()
  sales.filter((s) => inRange(s, r)).forEach((s) => byDay.set(dayKey(s.date), (byDay.get(dayKey(s.date)) ?? 0) + s.amount))
  const out: { key: string; label: string; amount: number }[] = []
  for (let t = r.start.getTime(); t <= r.end.getTime(); t += DAY) {
    const d = new Date(t)
    out.push({ key: dayKey(d), label: md(d), amount: byDay.get(dayKey(d)) ?? 0 })
  }
  return out
}

export function summary(sales: Sale[], campaigns: Campaign[], ranges: { current: Range; previous: Range | null }) {
  const cur = sales.filter((s) => inRange(s, ranges.current))
  const prev = ranges.previous ? sales.filter((s) => inRange(s, ranges.previous!)) : []
  const revenue = sum(cur, (s) => s.amount)
  const count = sum(cur, (s) => s.quantity)
  const linked = campaigns.reduce((n, c) => {
    if (!c.publishedAt) return n
    const win = { start: startOfDay(c.publishedAt), end: new Date(startOfDay(c.publishedAt).getTime() + 6 * DAY) }
    const ids = campaignMenuIds(c)
    return n + sum(cur.filter((s) => ids.includes(s.menuId) && inRange(s, win)), (s) => s.amount)
  }, 0)
  return {
    revenue,
    revenueChange: ranges.previous ? pct(revenue, sum(prev, (s) => s.amount)) : null,
    count,
    avg: count ? revenue / count : 0,
    linked,
    linkedShare: revenue ? Math.round((linked / revenue) * 100) : 0,
  }
}

export const campaignMenuIds = (c: Campaign) => (c.targetMenuIds?.length ? c.targetMenuIds : [c.targetMenuId]).filter(Boolean)

export type MenuStatus = "인기" | "보통" | "비인기" | "재고 많음"
export function menuRows(sales: Sale[], menus: Menu[], ranges: { current: Range; previous: Range | null }) {
  const days = Math.round((ranges.current.end.getTime() - ranges.current.start.getTime()) / DAY) + 1
  const cur = sales.filter((s) => inRange(s, ranges.current))
  const prev = ranges.previous ? sales.filter((s) => inRange(s, ranges.previous!)) : []
  const total = sum(cur, (s) => s.amount)
  const rows = menus.map((m) => {
    const mine = cur.filter((s) => s.menuId === m.id)
    const amount = sum(mine, (s) => s.amount)
    const quantity = sum(mine, (s) => s.quantity)
    return {
      menu: m,
      amount,
      quantity,
      share: total ? Math.round((amount / total) * 100) : 0,
      change: ranges.previous ? pct(amount, sum(prev.filter((s) => s.menuId === m.id), (s) => s.amount)) : null,
      status: "보통" as MenuStatus,
    }
  })
  const sorted = [...rows].sort((a, b) => b.amount - a.amount)
  const popular = new Set(sorted.slice(0, sorted.length >= 5 ? 2 : 1).filter((r) => r.amount > 0).map((r) => r.menu.id))
  const lowest = sorted.length > 2 ? sorted[sorted.length - 1].menu.id : null
  rows.forEach((r) => {
    const dailyQty = r.quantity / days
    // "재고 많음": stock covers more than 10 days of current sales pace.
    const highStock = r.menu.stock !== undefined && r.menu.stock > 0 && r.menu.stock > Math.max(dailyQty * 10, 10)
    r.status = popular.has(r.menu.id) ? "인기" : r.menu.id === lowest ? "비인기" : highStock ? "재고 많음" : "보통"
  })
  return sorted.map((s) => rows.find((r) => r.menu.id === s.menu.id)!)
}

export type CampaignResult = "효과 좋음" | "효과 보통" | "효과 미미"
export function campaignRows(sales: Sale[], menus: Menu[], campaigns: Campaign[]) {
  return campaigns
    .filter((c) => c.status === "published" && c.publishedAt)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
    .map((c) => {
      const p = startOfDay(c.publishedAt!)
      const ids = campaignMenuIds(c)
      const mine = sales.filter((s) => ids.includes(s.menuId))
      const before = sum(mine.filter((s) => inRange(s, { start: new Date(p.getTime() - 7 * DAY), end: new Date(p.getTime() - DAY) })), (s) => s.amount)
      const after = sum(mine.filter((s) => inRange(s, { start: p, end: new Date(p.getTime() + 6 * DAY) })), (s) => s.amount)
      const change = pct(after, before)
      const result: CampaignResult = change === null ? "효과 보통" : change >= 20 ? "효과 좋음" : change >= 5 ? "효과 보통" : "효과 미미"
      return {
        campaign: c,
        menuNames: ids.map((id) => menus.find((m) => m.id === id)?.name).filter(Boolean).join(", ") || "-",
        before,
        after,
        change,
        result,
      }
    })
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]
export function weekdayRows(sales: Sale[], r: Range) {
  const cur = sales.filter((s) => inRange(s, r))
  const total = sum(cur, (s) => s.amount)
  const dayCounts = Array(7).fill(0)
  for (let t = r.start.getTime(); t <= r.end.getTime(); t += DAY) dayCounts[new Date(t).getDay()]++
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const mine = cur.filter((s) => new Date(s.date).getDay() === d)
    const amount = sum(mine, (s) => s.amount)
    return {
      label: `${WEEKDAYS[d]}요일`,
      quantity: sum(mine, (s) => s.quantity),
      amount,
      share: total ? Math.round((amount / total) * 100) : 0,
      dailyAvg: dayCounts[d] ? amount / dayCounts[d] : 0,
      top: false,
    }
  })
  const max = Math.max(...rows.map((x) => x.amount))
  rows.forEach((x) => (x.top = max > 0 && x.amount === max))
  return rows
}
