import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"
import { ConfirmNextStepDialog } from "../../components/wizard/ConfirmNextStepDialog"
import { openUpgradeModal } from "../../services/upgrade"
import type { ContentSettings } from "../../store/types"
import { cardShadow, StepBadge, WizardFooter } from "../../components/wizard/WizardParts"

const a = (f: string) => `/assets/${f}`
const CHANNELS = ["인스타그램", "기타", "카카오톡 채널", "블로그", "당근마켓"]
const FREE_LIMIT = 2

function Check({ checked, label, onChange, disabled }: { checked: boolean; label: string; onChange?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="flex h-[42px] w-full items-center gap-[12px] text-left disabled:cursor-default"
    >
      <span
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] ${checked ? "bg-[#1E1E28]" : "border border-[#d0d7e2] bg-white"}`}
      >
        {checked && <img alt="" src={a("f29f1.svg")} className="size-[14px]" />}
      </span>
      <span className="f-semibold text-[16px] whitespace-nowrap text-[#1E1E28]">{label}</span>
    </button>
  )
}

export function ContentStepPage() {
  const navigate = useNavigate()
  const { data, draft, update, lockStep } = useDraftCampaign()
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState(false)
  const isFree = data.user.plan === "free"
  const limit = isFree ? FREE_LIMIT : 3

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(false), 2500)
    return () => clearTimeout(t)
  }, [notice])

  if (!draft) return <Navigate to="/campaigns/new/1" replace />
  if (!draft.plan.direction) return <Navigate to="/campaigns/new/2" replace />

  const cs = draft.contentSettings
  const set = (patch: Partial<ContentSettings>) =>
    update((c) => ({ contentSettings: { ...c.contentSettings, ...patch } }))

  const toggleChannel = (ch: string) => {
    if (cs.channels.includes(ch)) return set({ channels: cs.channels.filter((c) => c !== ch) })
    if (cs.channels.length >= limit) {
      setNotice(true)
      if (isFree) openUpgradeModal("채널 추가")
      return
    }
    set({ channels: [...cs.channels, ch] })
  }
  const full = cs.channels.length >= limit

  return (
    <>
      <div className="flex flex-1 justify-center px-[70px]">
        <div className="flex w-full max-w-[1000px] flex-col gap-[18px] px-[24px] pt-[28px] pb-[24px]">
          <div className="flex w-full flex-col items-center gap-[8px] text-center">
            <StepBadge icon={a("eebbb.svg")} size="text-[14px]">{`3-1  단계`}</StepBadge>
            <h1 className="f-bold text-[36px] text-[#1E1E28]">콘텐츠 설정</h1>
            <p className="f-regular text-[18px] leading-[1.6] text-[#6B6A72]">어떤 내용을 어느 채널에 올릴지 정해주세요.</p>
          </div>

          <section className={`flex w-full flex-col gap-[8px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white px-[22px] pt-[18px] pb-[16px] ${cardShadow}`}>
            <h2 className="f-bold w-full text-[20px] text-[#1E1E28]">생성할 콘텐츠 유형</h2>
            <div className="flex w-full flex-col gap-[2px]">
              <Check checked label="홍보 문구" disabled />
              <Check checked={cs.hashtagOn} label="해시태그" onChange={() => set({ hashtagOn: !cs.hashtagOn })} />
              <Check checked={cs.captionOn ?? true} label="SNS 게시물용 캡션" onChange={() => set({ captionOn: !(cs.captionOn ?? true) })} />
            </div>
          </section>

          <section className={`flex w-full flex-col gap-[12px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white px-[22px] pt-[18px] pb-[16px] ${cardShadow}`}>
            <h2 className="f-bold w-full text-[20px] text-[#1E1E28]">게시할 SNS 채널을 선택해주세요 (최대 {limit}개)</h2>
            <div className="flex w-full flex-wrap items-start gap-[10px]">
              {CHANNELS.map((ch) => {
                const idx = cs.channels.indexOf(ch)
                return idx >= 0 ? (
                  <button
                    key={ch}
                    type="button"
                    aria-pressed
                    onClick={() => toggleChannel(ch)}
                    className="flex items-center gap-[8px] rounded-full bg-[#1E1E28] px-[14px] py-[10px]"
                  >
                    <span className="f-bold flex size-[20px] items-center justify-center rounded-full bg-white text-[12px] text-[#1E1E28]">
                      {"①②③"[idx]}
                    </span>
                    <span className="f-semibold text-[15px] whitespace-nowrap text-white">{ch}</span>
                  </button>
                ) : (
                  <button
                    key={ch}
                    type="button"
                    aria-pressed={false}
                    onClick={() => toggleChannel(ch)}
                    className={`f-semibold flex items-center rounded-full bg-[#f2f4f7] px-[14px] py-[10px] text-[15px] whitespace-nowrap ${full ? "text-[#9A989F]" : "text-[#6B6A72] hover:bg-[#e9edf2]"}`}
                  >
                    {ch}
                  </button>
                )
              })}
            </div>
            <input
              value={cs.customChannelNote ?? ""}
              onChange={(e) => set({ customChannelNote: e.target.value })}
              disabled={!cs.channels.includes("기타")}
              placeholder="기타 선택시 예 : 캐주얼하고 유쾌한 분위기로 작성해주세요"
              aria-label="기타 채널 요청 사항"
              className="f-regular w-full rounded-[12px] border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] px-[16px] py-[14px] text-[15px] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#1E1E28] disabled:cursor-not-allowed"
            />
            <p className={`f-regular w-full text-[13px] leading-[1.5] ${notice ? "text-[#1E1E28]" : "text-[#9A989F]"}`} role="status">
              {notice
                ? `채널은 최대 ${limit}개까지 선택할 수 있어요. 다른 채널을 해제한 뒤 선택해주세요.`
                : isFree
                  ? "무료 플랜은 최대 2개 채널까지 선택 가능해요"
                  : "구독 플랜은 최대 3개 채널까지 선택 가능해요"}
            </p>
          </section>

          <section className={`flex w-full flex-col gap-[12px] rounded-[18px] border border-[#cdefe9] bg-[#eefbf8] p-[20px] ${cardShadow}`}>
            <h2 className="f-bold w-full text-[20px] text-[#1E1E28]">광고 이미지도 함께 만들까요? (선택)</h2>
            <div className="flex w-full flex-col gap-[5px]">
              <p className="f-bold text-[16px] text-[#1E1E28]">AI 광고 이미지 생성</p>
              <p className="f-regular text-[14px] leading-[1.5] text-[#6B6A72]">브랜드 톤앤매너를 반영한 이미지 시안을 함께 생성해요</p>
              <p className="f-regular text-[14px] leading-[1.5] text-[#6B6A72]">다음 단계에서 이미지 스타일과 분위기를 자세히 정할 수 있어요</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={cs.imageOn}
              aria-label="AI 광고 이미지 생성"
              onClick={() => set({ imageOn: !cs.imageOn })}
              className="h-[28px] w-[50px]"
            >
              {cs.imageOn ? (
                <img alt="" src={a("50633.svg")} width={50} height={28} />
              ) : (
                <span className="relative block h-[28px] w-[50px] rounded-full bg-[#d0d7e2]">
                  <span className="absolute top-[3px] left-[3px] size-[22px] rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.15)]" />
                </span>
              )}
            </button>
          </section>

          <div className="flex min-h-[62px] w-full items-center gap-[12px] rounded-[14px] bg-[#f2f4f7] px-[18px] py-[14px]">
            <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white">
              <img alt="" src={a("fbb56.svg")} className="size-[18px]" />
            </span>
            <p className="f-medium min-w-0 flex-1 text-[15px] leading-[1.5] text-[#6B6A72]">
              채널을 1개 선택하면 해당 채널의 시안 2가지를, 2개 선택하면 채널별로 시안 A·B를 각각 보여드려요
            </p>
          </div>
        </div>
      </div>
      <WizardFooter
        label={cs.imageOn ? "다음: 이미지 설정" : "다음: 시안 비교"}
        icon={a("21c0f.svg")}
        disabled={cs.channels.length === 0}
        onNext={() => setConfirming(true)}
      />
      {confirming && (
        <ConfirmNextStepDialog
          title={cs.imageOn ? "이미지 설정으로 넘어갈까요?" : "시안을 만들까요?"}
          body={
            cs.imageOn
              ? "선택한 채널과 콘텐츠 설정이 확정돼요. 다음 단계로 넘어가면 3-1단계 내용은 다시 수정할 수 없어요."
              : "광고 이미지 없이 문구 시안을 만들어요. 다음 단계로 넘어가면 3-1단계 내용은 다시 수정할 수 없어요."
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            lockStep("3-1")
            navigate(cs.imageOn ? "/campaigns/new/3-2" : "/campaigns/new/4")
          }}
        />
      )}
    </>
  )
}
