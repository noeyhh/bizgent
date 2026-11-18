import { useEffect, useState, type ReactNode } from "react"
import { channelLabel, downloadImage } from "../wizard/WizardParts"
import { monthDay, monthDayTime, publishedDrafts } from "../../store/campaign"
import type { Campaign, CampaignDraft, Menu } from "../../store/types"

const a = (f: string) => `/assets/${f}`
const circled = (i: number) => "①②③"[i] ?? `${i + 1}`

function Tag({ tone = "blue", children }: { tone?: "blue" | "mint" | "draft"; children: ReactNode }) {
  const cls =
    tone === "mint" ? "bg-[#E5EFE2] text-[#55704C]" : tone === "draft" ? "bg-[#F1E8DA] text-[#8A6A55]" : "bg-[#E7EAFB] text-[#5965A8]"
  return <span className={`f-semibold flex items-start rounded-full px-[9px] py-[5px] text-[11px] whitespace-nowrap ${cls}`}>{children}</span>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-[10px]">
      <h3 className="f-bold text-[18px] tracking-[-0.02em] text-[#1E1E28]">{title}</h3>
      {children}
    </section>
  )
}

function InfoRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="flex w-full flex-col gap-[10px] rounded-[16px] border border-[rgba(30,30,40,0.15)] px-[14px] py-[12px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex w-full items-start gap-[12px]">
          <dt className="f-regular w-[72px] shrink-0 text-[12px] leading-[1.5] text-[#9A989F]">{k}</dt>
          <dd className="f-semibold min-w-0 flex-1 text-[13px] leading-[1.5] text-[#1E1E28]">{v || "-"}</dd>
        </div>
      ))}
    </dl>
  )
}

function DraftCard({ draft, index, note }: { draft: CampaignDraft; index: number; note?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard?.writeText([draft.text, draft.hashtags.map((t) => `#${t}`).join(" ")].filter(Boolean).join("\n\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white">
      {draft.imageUrl && (
        <div className="relative h-[144px] w-full">
          <img alt={`시안 ${draft.key} 이미지`} src={draft.imageUrl} className="absolute inset-0 size-full object-cover" />
          <button
            type="button"
            aria-label={`시안 ${draft.key} 이미지 다운로드`}
            onClick={() => downloadImage(draft.imageUrl, `bizgent_시안${draft.key}.png`)}
            className="absolute top-[12px] right-[12px] flex size-[34px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white"
          >
            <img alt="" src={a("49184.svg")} className="size-[18px]" />
          </button>
        </div>
      )}
      <div className="flex w-full flex-col gap-[8px] px-[14px] py-[12px]">
        <div className="flex"><Tag>{circled(index)} {channelLabel(draft.channel, note, "")}</Tag></div>
        <p className="f-regular text-[13px] leading-[1.45] text-[#1E1E28]">{draft.text}</p>
        <div className="flex w-full items-center justify-between gap-[8px]">
          <div className="flex min-w-0 flex-wrap items-start gap-[4px]">
            {draft.hashtags.slice(0, 3).map((t) => <Tag key={t}>#{t}</Tag>)}
          </div>
          <button type="button" onClick={copy} className="flex h-[30px] shrink-0 items-center gap-[7px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[16px] hover:bg-[#F4F1EA]">
            <img alt="" src={a("18989.svg")} className="size-[17px]" />
            <span className="f-semibold text-[14px] whitespace-nowrap text-[#1E1E28]">{copied ? "복사됐어요" : "문구 복사"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function CampaignDetailPanel({
  campaign,
  menus,
  onClose,
  onResume,
}: {
  campaign: Campaign
  menus: Menu[]
  onClose: () => void
  onResume: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const published = campaign.status === "published"
  const note = campaign.contentSettings.customChannelNote
  const drafts = published ? publishedDrafts(campaign) : campaign.drafts
  const menuNames = (campaign.targetMenuIds?.length ? campaign.targetMenuIds : [campaign.targetMenuId])
    .map((id) => menus.find((m) => m.id === id)?.name)
    .filter(Boolean)
    .join(" · ")
  const results = Object.entries(campaign.channelResults).map(([key, r]) => ({
    key,
    label: r.draftKey ? `시안 ${r.draftKey} · ${channelLabel(r.channel ?? key, note, "")}` : channelLabel(key, note, ""),
    ok: r.status !== "failed",
  }))
  const plan = campaign.plan

  return (
    <div className="fixed inset-0 z-40 bg-[rgba(30,30,40,0.48)]" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-detail-title"
        className="absolute inset-y-0 right-0 flex w-[520px] max-w-full flex-col border-l border-[rgba(30,30,40,0.15)] bg-white shadow-[-8px_0_28px_rgba(30,30,40,0.10)]"
      >
        <div className="flex w-full flex-col gap-[10px] border-b border-[rgba(30,30,40,0.15)] px-[24px] pt-[24px] pb-[18px]">
          <div className="flex w-full items-center justify-between gap-[12px]">
            <h2 id="campaign-detail-title" className="f-bold min-w-0 truncate text-[22px] tracking-[-0.02em] text-[#1E1E28]">{campaign.title}</h2>
            <button type="button" onClick={onClose} aria-label="패널 닫기" className="flex size-[30px] shrink-0 items-center justify-center rounded-full hover:bg-[#F4F1EA]">
              <img alt="" src={a("e5875.svg")} className="size-[20px]" />
            </button>
          </div>
          <div className="flex items-center gap-[10px]">
            <Tag tone={published ? "mint" : "draft"}>{published ? "게시 완료" : "작성 중"}</Tag>
            <p className="f-regular text-[12px] text-[#6B6A72]">
              {published && campaign.publishedAt
                ? `${monthDayTime(campaign.publishedAt)} 게시`
                : `마지막 수정 ${monthDay(campaign.updatedAt ?? campaign.createdAt)}`}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-[16px] overflow-y-auto px-[24px] py-[18px]">
          <Section title="캠페인 정보">
            <InfoRows rows={[["목표", campaign.goal], ["대상 메뉴", menuNames]]} />
          </Section>

          <Section title="AI 기획">
            <InfoRows
              rows={[
                ["방향", plan.direction],
                ["타겟", plan.targetCustomer],
                ["전략", plan.strategy],
                ["기대효과", plan.expectedEffect],
              ]}
            />
          </Section>

          {drafts.length > 0 && (
            <Section title="시안">
              {drafts.map((d, i) => <DraftCard key={d.key} draft={d} index={i} note={note} />)}
            </Section>
          )}

          {published && (
            <Section title="채널별 게시 결과">
              <div className="flex w-full flex-col gap-[10px] rounded-[16px] border border-[rgba(30,30,40,0.15)] px-[14px] py-[10px]">
                {results.map((r) => (
                  <div key={r.key} className="flex w-full items-center justify-between">
                    <div className="flex flex-col gap-[3px]">
                      <p className="f-semibold text-[13px] text-[#1E1E28]">{r.label}</p>
                      {campaign.publishedAt && <p className="f-regular text-[11px] text-[#9A989F]">{monthDayTime(campaign.publishedAt)}</p>}
                    </div>
                    <Tag tone="mint">{r.ok ? "게시 완료" : "게시 실패"}</Tag>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {published && (
            <Section title="성과·매출 입력">
              <div className="flex w-full flex-col gap-[9px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-[#F1E8DA] p-[16px]">
                <div className="flex items-center gap-[9px]">
                  <img alt="" src={a("bb11b.svg")} className="size-[18px]" />
                  <p className="f-bold text-[14px] text-[#8A6A55]">
                    {campaign.reminderAt ? `${monthDay(campaign.reminderAt)}에 입력 알림이 가요` : "입력 알림이 꺼져 있어요"}
                  </p>
                </div>
                <p className="f-regular text-[13px] leading-[1.5] text-[#6B6A72]">게시 후 1주일 뒤에 영수증이나 엑셀로 매출 정보를 올려주세요.</p>
                <button type="button" disabled className="f-semibold flex h-[36px] w-full items-center justify-center rounded-full border border-[#D4D0C9] bg-[#E4E0D9] px-[16px] text-[14px] text-[#8E8B85]">
                  성과 입력하기
                </button>
              </div>
            </Section>
          )}
        </div>

        <div className="flex h-[68px] w-full shrink-0 items-center justify-end gap-[8px] border-t border-[rgba(30,30,40,0.15)] px-[24px]">
          {!published && (
            <button type="button" onClick={onResume} className="f-semibold flex h-[40px] items-center rounded-full bg-[#1E1E28] px-[18px] text-[14px] text-white hover:bg-[#31313D]">
              이어서 작성하기
            </button>
          )}
          <button type="button" onClick={onClose} className="f-semibold flex h-[40px] w-[96px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white text-[14px] text-[#1E1E28] hover:bg-[#F4F1EA]">
            닫기
          </button>
        </div>
      </aside>
    </div>
  )
}
