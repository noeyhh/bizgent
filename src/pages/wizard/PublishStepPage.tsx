import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { channelLabel, downloadImage, StepBadge } from "../../components/wizard/WizardParts"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"
import { useStartNewCampaign } from "../../hooks/useStartNewCampaign"
import { useAppStore } from "../../store/AppContext"
import { publishedDraftKeys, sanitizeCampaigns } from "../../store/campaign"
import type { Campaign, CampaignDraft } from "../../store/types"

const a = (f: string) => `/assets/${f}`
const PUBLISH_MS = 2000
const REMINDER_MESSAGE = "캠페인 성과와 매출을 입력할 시간이에요"
const circled = (i: number) => "①②③"[i] ?? `${i + 1}`
const pad = (n: number) => String(n).padStart(2, "0")
const longDate = (d: Date) => {
  const h = d.getHours()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${pad(d.getMinutes())}`
}
const stamp = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
const splitCopy = (text: string) => {
  const m = text.match(/^(.+?[.!?,](?:\s|$))(.*)$/)
  return m ? [m[1].trim(), m[2].trim() || text] : [text, ""]
}

function ChannelCheck({ src }: { src: string }) {
  return (
    <span className="relative size-[13px] shrink-0">
      <span className="absolute inset-[-7.69%_-7.69%_-13.58%_-7.69%]">
        <img alt="" src={src} className="block size-full max-w-none" />
      </span>
    </span>
  )
}

function Thumbnail({ draft, label }: { draft: CampaignDraft; label: string }) {
  const [title, body] = splitCopy(draft.text)
  return (
    <div className="flex h-[156px] min-w-0 flex-1 flex-col gap-[8px] rounded-[12px] border border-[rgba(30,30,40,0.15)] bg-white p-[12px]">
      <p className="f-bold text-[10px] text-[#477f78]">{label}</p>
      <div className="flex min-h-0 w-full flex-1 items-start gap-[8px]">
        <div className="relative h-full w-[96px] shrink-0 overflow-hidden rounded-[8px] bg-[#eef1f5]">
          {draft.imageUrl && <img alt="" src={draft.imageUrl} className="absolute inset-0 size-full rounded-[8px] object-cover" />}
        </div>
        <div className="flex h-full min-w-0 flex-1 flex-col gap-[6px] overflow-hidden">
          <p className="f-bold text-[12px] leading-[1.35] text-[#1E1E28]">{title}</p>
          {body && <p className="f-regular line-clamp-3 text-[9px] leading-[1.45] text-[#6B6A72]">{body}</p>}
          <div className="flex flex-wrap items-start gap-[4px]">
            {draft.hashtags.slice(0, 2).map((t) => (
              <span key={t} className="f-regular rounded-full bg-[#F1E8DA] px-[6px] py-[3px] text-[8px] text-[#1E1E28]">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletionLayer({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate()
  const { setData } = useAppStore()
  const { startNewCampaign, upgradeNotice } = useStartNewCampaign()
  const [copied, setCopied] = useState<string | null>(null)
  const keys = publishedDraftKeys(campaign)
  const drafts = campaign.drafts.filter((d) => keys.includes(d.key))
  const publishedAt = new Date(campaign.publishedAt ?? Date.now())
  const remindAt = new Date(publishedAt.getTime() + 7 * 864e5)
  const reminderOn = Boolean(campaign.reminderAt)
  const note = campaign.contentSettings.customChannelNote

  const toggleReminder = () =>
    setData((prev) => ({
      ...prev,
      campaigns: sanitizeCampaigns(prev.campaigns).map((c) =>
        c.id === campaign.id ? { ...c, reminderAt: reminderOn ? null : remindAt.toISOString() } : c,
      ),
      notifications: reminderOn
        ? prev.notifications.filter((n) => n.campaignId !== campaign.id)
        : [...prev.notifications, { id: `noti-${campaign.id}`, campaignId: campaign.id, message: REMINDER_MESSAGE, dueAt: remindAt.toISOString(), read: false }],
    }))

  const copy = async (draft: CampaignDraft) => {
    await navigator.clipboard?.writeText([draft.text, draft.hashtags.map((t) => `#${t}`).join(" ")].filter(Boolean).join("\n\n"))
    setCopied(draft.key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,32,51,0.4)]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-done-title"
        className="flex h-[720px] max-h-[calc(100vh-32px)] w-[1000px] max-w-[calc(100vw-32px)] flex-col gap-[20px] rounded-[24px] border border-[rgba(30,30,40,0.15)] bg-white p-[24px] drop-shadow-[0px_18px_20px_rgba(16,24,40,0.1)]"
      >
        <div className="flex w-full flex-col gap-[6px]">
          <img alt="" src={a("d20f4.svg")} className="size-[48px]" />
          <h2 id="publish-done-title" className="f-bold text-[28px] text-[#1E1E28]">게시가 완료됐어요</h2>
          <p className="f-regular text-[15px] leading-[1.5] text-[#6B6A72]">{longDate(publishedAt)}에 게시됐어요</p>
        </div>

        <div className="flex min-h-0 w-full flex-1 items-start gap-[24px] overflow-y-auto">
          <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
            <h3 className="f-bold text-[18px] text-[#1E1E28]">채널별 게시 결과</h3>
            {drafts.map((draft, i) => (
              <div key={draft.key} className="flex w-full flex-col gap-[12px] rounded-[16px] border border-[rgba(30,30,40,0.15)] bg-white p-[16px]">
                <div className="flex w-full items-center justify-between">
                  <span className="f-bold rounded-full bg-[#F1E8DA] px-[8px] py-[4px] text-[12px] text-[#1E1E28]">
                    {circled(i)} 시안 {draft.key} · {channelLabel(draft.channel, note, "")}
                  </span>
                  <span className="f-bold rounded-full bg-[#eef8f6] px-[10px] py-[4px] text-[12px] text-[#5fa99e]">게시 완료</span>
                </div>
                <div className="flex w-full items-start gap-[12px]">
                  <div className="relative h-[80px] w-[120px] shrink-0 overflow-hidden rounded-[8px] bg-[#eef1f5]">
                    {draft.imageUrl && <img alt="" src={draft.imageUrl} className="absolute inset-0 size-full object-cover" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                    <p className="f-regular text-[12px] text-[#9A989F]">{stamp(publishedAt)}</p>
                    <p className="f-semibold text-[14px] leading-[1.4] text-[#1E1E28]">{splitCopy(draft.text)[0]}</p>
                    <div className="flex w-full flex-wrap items-start gap-[6px]">
                      {draft.hashtags.slice(0, 2).map((t) => (
                        <span key={t} className="f-semibold rounded-full bg-[#F1E8DA] px-[8px] py-[4px] text-[11px] text-[#1E1E28]">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-start gap-[8px]">
                  <button type="button" onClick={() => copy(draft)} className="flex items-center gap-[6px] rounded-full border border-[#d0d7e2] px-[12px] py-[8px] hover:bg-[#F4F1EA]">
                    <img alt="" src={a("54f74.svg")} className="size-[14px]" />
                    <span className="f-semibold text-[13px] whitespace-nowrap text-[#6B6A72]">{copied === draft.key ? "복사됐어요" : "문구 복사"}</span>
                  </button>
                  {draft.imageUrl && (
                    <button
                      type="button"
                      onClick={() => downloadImage(draft.imageUrl, `bizgent_시안${draft.key}.png`)}
                      className="flex items-center gap-[6px] rounded-full border border-[#d0d7e2] px-[12px] py-[8px] hover:bg-[#F4F1EA]"
                    >
                      <img alt="" src={a("14ed2.svg")} className="size-[14px]" />
                      <span className="f-semibold text-[13px] whitespace-nowrap text-[#6B6A72]">이미지 다운로드</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <p className="f-regular text-[12px] leading-[1.5] text-[#9A989F]">
              실제 채널 연동은 추후 업데이트 예정이에요. 지금은 게시 상태로 기록되고, 문구와 이미지를 직접 올릴 수도 있어요.
            </p>
          </div>

          <div className="flex w-[320px] shrink-0 flex-col gap-[16px]">
            <h3 className="f-bold text-[18px] text-[#1E1E28]">다음 할 일</h3>
            <ol className="flex w-full flex-col gap-[12px]">
              <li className="flex w-full items-center gap-[12px]">
                <img alt="" src={a("f65d5.svg")} className="size-[24px] shrink-0" />
                <p className="f-bold text-[14px] text-[#1E1E28]">오늘 · 게시 완료</p>
              </li>
              <li className="flex w-full items-center gap-[12px]">
                <span className="f-bold flex size-[24px] shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[#1E1E28] bg-white text-[12px] text-[#9A989F]">2</span>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <p className="f-bold text-[14px] text-[#1E1E28]">7일 뒤 ({remindAt.getMonth() + 1}월 {remindAt.getDate()}일) · 성과·매출 정보 입력</p>
                  <p className="f-regular text-[12px] leading-[1.4] text-[#6B6A72]">영수증이나 엑셀 파일로 매출 정보를 올리면 돼요.</p>
                </div>
              </li>
              <li className="flex w-full items-center gap-[12px]">
                <span className="f-bold flex size-[24px] shrink-0 items-center justify-center rounded-[12px] border border-[#d0d7e2] bg-white text-[12px] text-[#9A989F]">3</span>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <p className="f-bold text-[14px] text-[#1E1E28]">AI 성과 리포트 확인</p>
                  <p className="f-regular text-[12px] leading-[1.4] text-[#6B6A72]">평균 대비 잘된 점과 아쉬운 점을 분석해드려요.</p>
                </div>
              </li>
            </ol>
            <button
              type="button"
              role="switch"
              aria-checked={reminderOn}
              onClick={toggleReminder}
              className="flex w-full items-center gap-[12px] rounded-[12px] bg-[#F4F1EA] p-[12px] text-left"
            >
              {reminderOn ? (
                <img alt="" src={a("95850.svg")} width={40} height={24} className="shrink-0" />
              ) : (
                <span className="relative block h-[24px] w-[40px] shrink-0 rounded-full bg-[#d0d7e2]">
                  <span className="absolute top-[2px] left-[2px] size-[20px] rounded-full bg-white" />
                </span>
              )}
              <span className="f-bold text-[14px] text-[#1E1E28]">7일 뒤 알림 받기</span>
            </button>
            <p className="f-regular text-[12px] text-[#9A989F]">입력 시기가 되면 알림으로 알려드려요.</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-t border-[rgba(30,30,40,0.15)] pt-[16px]">
          <button type="button" onClick={() => navigate("/")} className="f-semibold text-[14px] text-[#6B6A72] hover:text-[#1E1E28]">
            홈으로
          </button>
          <div className="flex items-center gap-[12px]">
            <button type="button" onClick={() => startNewCampaign()} className="f-bold flex h-[44px] items-center rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#6B6A72] hover:bg-[#F4F1EA]">
              새 캠페인 만들기
            </button>
            <button
              type="button"
              onClick={() => navigate(`/campaigns?campaign=${campaign.id}`)}
              className="f-bold flex h-[44px] items-center rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[24px] text-[15px] text-white drop-shadow-[0px_10px_12px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28]"
            >
              캠페인 보관함 바로가기
            </button>
          </div>
        </div>
      </div>
      {upgradeNotice}
    </div>
  )
}

export function PublishStepPage() {
  const { data, setData } = useAppStore()
  const { draft } = useDraftCampaign()
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const published = publishedId ? sanitizeCampaigns(data.campaigns).find((c) => c.id === publishedId) : undefined
  const campaign = published ?? draft
  if (!campaign) return <Navigate to="/" replace />
  const selectedKeys = campaign.selectedDraftKeys ?? []
  const selectedDrafts = campaign.drafts.filter((d) => selectedKeys.includes(d.key))
  if (!selectedDrafts.length) return <Navigate to="/campaigns/new/4" replace />

  const channels = campaign.contentSettings.channels
  const note = campaign.contentSettings.customChannelNote
  const publishing = progress !== null && !published

  const publish = () => {
    if (progress !== null) return
    const start = Date.now()
    setProgress(0)
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / PUBLISH_MS)
      setProgress(p)
      if (p < 1) return
      if (timer.current) clearInterval(timer.current)
      const now = new Date()
      const remind = new Date(now.getTime() + 7 * 864e5).toISOString()
      const id = campaign.id
      setData((prev) => ({
        ...prev,
        activeDraftId: null,
        campaigns: sanitizeCampaigns(prev.campaigns).map((c) =>
          c.id === id
            ? {
                ...c,
                status: "published",
                publishedAt: now.toISOString(),
                updatedAt: now.toISOString(),
                reminderAt: remind,
                thumbnailUrl: selectedDrafts.find((d) => d.imageUrl)?.imageUrl ?? c.thumbnailUrl,
                // One result per published draft.
                channelResults: Object.fromEntries(
                  selectedDrafts.map((d) => [
                    `${d.key}:${d.channel}`,
                    { views: 0, clicks: 0, conversions: 0, draftKey: d.key, channel: d.channel, status: "success" as const },
                  ]),
                ),
              }
            : c,
        ),
        notifications: [
          ...prev.notifications.filter((n) => n.campaignId !== id),
          { id: `noti-${id}`, campaignId: id, message: REMINDER_MESSAGE, dueAt: remind, read: false },
        ],
      }))
      setPublishedId(id)
    }, 50)
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center px-[48px] pt-[22px] pb-[18px]">
        <div className="flex w-full max-w-[700px] flex-col gap-[18px]">
          <div className="flex w-full flex-col items-center gap-[7px] text-center">
            <StepBadge icon={a("02c79.svg")} size="text-[14px]">5 단계</StepBadge>
            <h1 className="f-bold text-[36px] text-[#1E1E28]">게시 준비가 완료됐어요</h1>
            <p className="f-regular text-[17px] leading-[1.5] text-[#6B6A72]">실제 채널 연동은 추후 업데이트 예정이며, 지금은 게시 상태로 등록돼요</p>
          </div>

          <section className="flex w-full flex-col gap-[14px] rounded-[16px] border border-[rgba(30,30,40,0.15)] bg-[#f2f4f7] p-[20px] shadow-[0px_5px_16px_0px_rgba(16,24,40,0.05)]">
            <div className="flex w-full items-center justify-between">
              <h2 className="f-bold text-[20px] text-[#1E1E28]">캠페인 요약</h2>
              <span className="flex items-center gap-[5px] rounded-full bg-[#eef8f6] px-[10px] py-[5px]">
                <span className="relative size-[12px]">
                  <span className="absolute inset-[-8.33%_-8.33%_-14.71%_-8.33%]">
                    <img alt="" src={a("6aba5.svg")} className="block size-full max-w-none" />
                  </span>
                </span>
                <span className="f-bold text-[12px] text-[#477f78]">게시 준비 완료</span>
              </span>
            </div>
            <div className="flex w-full items-center gap-[18px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <p className="f-semibold text-[12px] text-[#6B6A72]">캠페인명</p>
                <p className="f-bold text-[16px] text-[#1E1E28]">{campaign.title}</p>
              </div>
              <div className="h-[34px] w-px shrink-0 bg-[#d0d7e2]" />
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <p className="f-semibold text-[12px] text-[#6B6A72]">목표</p>
                <p className="f-bold text-[16px] text-[#1E1E28]">{campaign.goal}</p>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-[8px]">
              <p className="f-semibold text-[12px] text-[#6B6A72]">선택된 채널</p>
              {channels.map((ch, i) => (
                <span key={ch} className="flex items-center gap-[6px] rounded-full border border-[#cfe8e3] bg-white px-[12px] py-[7px]">
                  <ChannelCheck src={a(i === 0 ? "0bc7c.svg" : "11111.svg")} />
                  <span className="f-semibold text-[14px] whitespace-nowrap text-[#477f78]">
                    {circled(i)} {channelLabel(ch, note, "")}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex w-full items-start gap-[12px]">
              {selectedDrafts.map((d) => (
                <Thumbnail key={d.key} draft={d} label={channelLabel(d.channel, note)} />
              ))}
            </div>
            {progress !== null && (
              <div className="flex w-full flex-col gap-[10px] rounded-[12px] bg-white p-[14px]" role="status" aria-live="polite">
                {selectedDrafts.map((d, i) => {
                  // Stagger channels slightly so progress reads per channel.
                  const p = Math.min(1, Math.max(0, progress * (1 + i * 0.15) - i * 0.1))
                  return (
                    <div key={d.key} className="flex w-full items-center gap-[12px]">
                      <p className="f-semibold w-[220px] shrink-0 truncate text-[13px] text-[#1E1E28]">시안 {d.key} · {channelLabel(d.channel, note, "")}</p>
                      <div className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#eef1f5]">
                        <div className="h-full rounded-full bg-[#1E1E28] transition-[width]" style={{ width: `${p * 100}%` }} />
                      </div>
                      <p className={`f-bold w-[56px] shrink-0 text-right text-[12px] ${p >= 1 ? "text-[#5fa99e]" : "text-[#6B6A72]"}`}>
                        {p >= 1 ? "게시 완료" : "게시 중"}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 flex h-[88px] shrink-0 items-center justify-center border-t border-[rgba(30,30,40,0.15)] bg-white px-[48px]">
        <div className="flex w-full max-w-[700px] items-center justify-between">
          <button
            type="button"
            onClick={publish}
            disabled={progress !== null}
            className="flex h-[56px] items-center rounded-full border border-[#1E1E28] bg-[#1E1E28] px-[24px] shadow-[0px_10px_24px_0px_rgba(30,30,40,0.10)] hover:bg-[#1E1E28] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="f-bold text-[16px] whitespace-nowrap text-white">{publishing ? "게시 중..." : "게시하기"}</span>
          </button>
        </div>
      </footer>

      {published && <CompletionLayer campaign={published} />}
    </>
  )
}
