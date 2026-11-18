import { useEffect, useRef, useState, type ReactNode } from "react"
import { Navigate, useNavigate } from "react-router"
import { useDraftCampaign } from "../../hooks/useDraftCampaign"
import { ConfirmNextStepDialog } from "../../components/wizard/ConfirmNextStepDialog"
import { openUpgradeModal } from "../../services/upgrade"
import type { ImageSettings } from "../../store/types"
import { AiBadge, cardShadow, StepBadge, WizardFooter } from "../../components/wizard/WizardParts"

const a = (f: string) => `/assets/${f}`
const CUSTOM = "직접 입력"
const PURPOSES = ["신메뉴 홍보", "할인·이벤트", "매장 분위기", "시즌·기념일"]
const MOODS = ["따뜻한", "청량한", "고급스러운", "발랄한", "차분한"]
const STYLES = [
  { label: "사진 느낌", icon: "ce4c2.svg" },
  { label: "일러스트", icon: "b7865.svg" },
  { label: "미니멀", icon: "ab212.svg" },
  { label: "3D 렌더", icon: "0b08d.svg" },
]
const RATIOS = ["4:5 세로 (추천)", "1:1 정사각", "9:16 세로", "16:9 가로"]
const goalToPurpose: Record<string, string> = {
  "신메뉴/신상품 홍보": "신메뉴 홍보",
  "할인/이벤트 홍보": "할인·이벤트",
  "매장 인지도 확대": "매장 분위기",
}
const defaultRatio = (channel: string) => (channel === "인스타그램" ? RATIOS[0] : RATIOS[1])
const ratioShort = (r: string) => r.split(" ")[0]

function Card({ title, ai, children }: { title: string; ai?: boolean; children: ReactNode }) {
  return (
    <section className={`flex w-full flex-col gap-[14px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white px-[22px] py-[20px] ${cardShadow}`}>
      <div className="flex w-full items-center justify-between">
        <h2 className="f-bold text-[20px] text-[#1E1E28]">{title}</h2>
        {ai && <AiBadge />}
      </div>
      {children}
    </section>
  )
}

function ChipSelect({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  const isCustom = Boolean(value) && !options.includes(value)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(isCustom ? value : "")
  const chip = (selected: boolean, content: ReactNode, onClick: () => void, key: string) => (
    <button
      key={key}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-[7px] rounded-full border px-[14px] py-[10px] text-[14px] whitespace-nowrap ${
        selected ? "f-bold border-[#1E1E28] bg-[#1E1E28] text-white" : "f-semibold border-[rgba(30,30,40,0.15)] bg-[#f2f4f7] text-[#6B6A72] hover:bg-[#e9edf2]"
      }`}
    >
      {selected && <img alt="" src={a("dcaf8.svg")} className="size-[13px]" />}
      {content}
    </button>
  )
  const commit = () => {
    setEditing(false)
    if (text.trim()) onChange(text.trim())
  }
  return (
    <div className="flex w-full flex-wrap items-start gap-[8px]">
      {options.map((o) => chip(value === o, o, () => onChange(o), o))}
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && commit()}
          aria-label={`${label} 직접 입력`}
          className="f-semibold h-[41px] w-[160px] rounded-full border border-[#1E1E28] bg-white px-[14px] text-[14px] text-[#1E1E28] outline-none"
        />
      ) : (
        chip(isCustom, isCustom ? value : CUSTOM, () => setEditing(true), CUSTOM)
      )}
    </div>
  )
}

export function ImageStepPage() {
  const navigate = useNavigate()
  const { data, draft, update, lockStep, menuNames } = useDraftCampaign()
  const [confirming, setConfirming] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isPro = data.user.plan === "pro"
  const channels = draft?.contentSettings.channels ?? []

  // Prefill AI-recommended defaults from step 1/2 data the first time.
  useEffect(() => {
    if (!draft || !draft.contentSettings.imageOn) return
    const s = draft.imageSettings
    if (s.purpose !== undefined) return
    update((c) => ({
      imageSettings: {
        ...c.imageSettings,
        purpose: goalToPurpose[c.goalOption ?? ""] ?? PURPOSES[0],
        product: menuNames[0] ?? "",
        composition: c.imageSettings.composition || STYLES[0].label,
        mood: c.imageSettings.mood || MOODS[0],
        brandColorOn: true,
        ratios: Object.fromEntries(c.contentSettings.channels.map((ch) => [ch, defaultRatio(ch)])),
        extraRequest: "",
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.id])

  if (!draft) return <Navigate to="/campaigns/new/1" replace />
  if (!draft.contentSettings.imageOn) return <Navigate to="/campaigns/new/3-1" replace />

  const s = draft.imageSettings
  const set = (patch: Partial<ImageSettings>) => update((c) => ({ imageSettings: { ...c.imageSettings, ...patch } }))
  const ratios = channels.map((ch) => s.ratios?.[ch] ?? defaultRatio(ch))
  const ratioText = ratios.map(ratioShort).join(", ")
  const productOptions = Array.from(new Set([...menuNames, ...data.store.menus.map((m) => m.name)])).slice(0, 3)
  const extra = s.extraRequest ?? ""

  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set({ referenceImageUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="flex flex-1 justify-center px-[70px]">
        <div className="flex w-full max-w-[1000px] flex-col gap-[24px] px-[24px] pt-[34px] pb-[40px]">
          <div className="flex w-full flex-col items-center gap-[10px] text-center">
            <StepBadge icon={a("e7abe.svg")} size="text-[13px]">3-2 단계 · 이미지</StepBadge>
            <h1 className="f-bold text-[36px] text-[#1E1E28]">이미지 설정</h1>
            <p className="f-regular text-[18px] leading-[1.55] text-[#6B6A72]">
              광고 이미지를 어떻게 만들지 알려주세요. 매장 정보를 바탕으로 AI가 미리 채워뒀어요.
            </p>
          </div>

          <div className="flex w-full flex-col gap-[16px]">
            <Card title="이미지 목적">
              <ChipSelect label="이미지 목적" options={PURPOSES} value={s.purpose ?? ""} onChange={(purpose) => set({ purpose })} />
            </Card>
            <Card title="주인공 상품">
              <ChipSelect label="주인공 상품" options={productOptions} value={s.product ?? ""} onChange={(product) => set({ product })} />
            </Card>
            <Card title="이미지 스타일" ai>
              <div className="flex w-full items-start gap-[10px]">
                {STYLES.map((st) => {
                  const selected = s.composition === st.label
                  return (
                    <button
                      key={st.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set({ composition: st.label })}
                      className={`flex min-w-0 flex-1 flex-col gap-[9px] rounded-[12px] bg-white text-left ${selected ? "border-2 border-[#1E1E28] p-[7px]" : "border border-[rgba(30,30,40,0.15)] p-[8px] hover:border-[#c7d2e2]"}`}
                    >
                      <span
                        className={`flex h-[94px] w-full items-center justify-center rounded-[8px] ${selected ? "bg-[#F1E8DA]" : "bg-[#F4F1EA]"}`}
                      >
                        <img alt="" src={a(st.icon)} className="size-[30px]" />
                      </span>
                      <span className="flex h-[20px] w-full items-center justify-between">
                        <span className={`text-[14px] ${selected ? "f-bold text-[#1E1E28]" : "f-semibold text-[#1E1E28]"}`}>{st.label}</span>
                        {selected && (
                          <span className="flex size-[20px] items-center justify-center rounded-full bg-[#1E1E28]">
                            <img alt="" src={a("82aad.svg")} className="size-[12px]" />
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
            <Card title="분위기와 색감" ai>
              <ChipSelect label="분위기" options={MOODS} value={s.mood} onChange={(mood) => set({ mood })} />
              <button
                type="button"
                role="checkbox"
                aria-checked={s.brandColorOn ?? true}
                onClick={() => set({ brandColorOn: !(s.brandColorOn ?? true) })}
                className="flex w-full items-center gap-[10px] rounded-[12px] bg-[#F1E8DA] px-[14px] py-[12px] text-left"
              >
                <span className={`flex size-[21px] shrink-0 items-center justify-center rounded-[6px] ${(s.brandColorOn ?? true) ? "bg-[#1E1E28]" : "border border-[#d0d7e2] bg-white"}`}>
                  {(s.brandColorOn ?? true) && <img alt="" src={a("dcaf8.svg")} className="size-[13px]" />}
                </span>
                <span className="f-bold min-w-0 flex-1 text-[14px] text-[#1E1E28]">우리 브랜드 컬러 반영하기</span>
                <span className="flex items-start">
                  <span className="mr-[-4px] size-[20px] rounded-full border-2 border-white bg-[#1E1E28]" />
                  <span className="size-[20px] rounded-full border-2 border-white bg-[#D9643A]" />
                </span>
              </button>
            </Card>
            <Card title="이미지 비율" ai>
              <div className="flex w-full flex-col gap-[9px]">
                {channels.map((ch, i) => (
                  <div key={ch} className="flex w-full items-center gap-[10px] rounded-[12px] border border-[rgba(30,30,40,0.15)] bg-[#F4F1EA] px-[14px] py-[12px]">
                    <p className="f-bold min-w-0 flex-1 text-[14px] text-[#1E1E28]">{"①②③"[i]} {ch}</p>
                    <label className="relative flex items-center">
                      <select
                        value={ratios[i]}
                        onChange={(e) => set({ ratios: { ...s.ratios, [ch]: e.target.value } })}
                        aria-label={`${ch} 이미지 비율`}
                        className="f-semibold appearance-none rounded-[8px] border border-[#d0d7e2] bg-white py-[9px] pr-[34px] pl-[12px] text-[13px] text-[#6B6A72] outline-none focus:border-[#1E1E28]"
                      >
                        {RATIOS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <img alt="" src={a("aa826.svg")} className="pointer-events-none absolute right-[12px] size-[14px]" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex w-full items-center gap-[6px]">
                <img alt="" src={a("337b9.svg")} className="size-[14px]" />
                <p className="f-regular min-w-0 flex-1 text-[13px] text-[#6B6A72]">선택한 채널에 맞춰 자동으로 추천했어요.</p>
              </div>
            </Card>
            <Card title="참고 이미지 (선택)" ai>
              <div className="relative flex h-[174px] w-full flex-col items-center justify-center gap-[9px] rounded-[12px] border border-dashed border-[#d0d7e2] bg-[#F4F1EA]">
                {isPro ? (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex size-full flex-col items-center justify-center gap-[9px]">
                    {s.referenceImageUrl ? (
                      <img alt="참고 이미지" src={s.referenceImageUrl} className="h-[140px] rounded-[8px] object-cover" />
                    ) : (
                      <>
                        <p className="f-semibold text-[14px] text-[#9A989F]">참고할 이미지를 올려보세요</p>
                        <img alt="" src={a("6b624.svg")} className="size-[28px]" />
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                  </button>
                ) : (
                  <>
                    <p className="f-semibold absolute top-[40px] text-[14px] text-[#9A989F]">참고할 이미지를 올려보세요</p>
                    <img alt="" src={a("6b624.svg")} className="size-[28px]" />
                    <div className={`absolute right-[11px] bottom-[5px] left-[11px] flex items-center gap-[11px] rounded-[12px] border border-[rgba(30,30,40,0.15)] bg-white px-[14px] py-[12px] ${cardShadow}`}>
                      <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#f2f4f7]">
                        <img alt="" src={a("1de58.svg")} className="size-[16px]" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-[3px]">
                        <span className="f-bold rounded-full bg-[#F1E8DA] px-[7px] py-[3px] text-[10px] text-[#D9643A]">구독 전용</span>
                        <p className="f-regular text-[12px] leading-[1.4] text-[#6B6A72]">구독하면 참고 이미지를 활용해 더 정확하게 만들 수 있어요.</p>
                      </div>
                      <button type="button" onClick={() => openUpgradeModal("참고 이미지")} className="f-bold shrink-0 text-[12px] text-[#1E1E28] hover:underline">
                        요금제 보기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
            <Card title="추가로 요청할 내용 (선택)" ai>
              <div className="flex h-[132px] w-full flex-col justify-between rounded-[12px] border border-[#d0d7e2] bg-[#F4F1EA] p-[14px] focus-within:border-[#1E1E28]">
                <textarea
                  value={extra}
                  maxLength={300}
                  onChange={(e) => set({ extraRequest: e.target.value })}
                  placeholder="예) 창가 자리에서 햇살이 비치는 느낌으로, 글씨는 넣지 말아주세요"
                  aria-label="추가 요청 내용"
                  className="f-regular w-full flex-1 resize-none bg-transparent text-[14px] leading-[1.5] text-[#1E1E28] outline-none placeholder:text-[#9A989F]"
                />
                <p className="f-regular w-full text-right text-[12px] text-[#9A989F]">{extra.length}/300</p>
              </div>
            </Card>
          </div>

          <section className={`flex w-full flex-col gap-[18px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-white p-[22px] ${cardShadow}`}>
            <div className="flex w-full items-center gap-[8px]">
              <span className="flex size-[34px] items-center justify-center rounded-[8px] bg-[#F1E8DA]">
                <img alt="" src={a("0a558.svg")} className="size-[18px]" />
              </span>
              <h2 className="f-bold text-[20px] text-[#1E1E28]">이렇게 만들어요</h2>
            </div>
            <div className="flex h-[214px] w-full flex-col items-center justify-center gap-[12px] rounded-[18px] bg-[#F1E8DA]">
              <span className="flex size-[52px] items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.8)]">
                <img alt="" src={a("2388d.svg")} className="size-[26px]" />
              </span>
              <p className="f-semibold w-[240px] text-center text-[13px] leading-[1.45] text-[#6B6A72]">미리보기는 생성 후 확인할 수 있어요</p>
            </div>
            <div className="flex w-full flex-col gap-[10px] text-[13px]">
              {[
                ["목적", s.purpose],
                ["상품", s.product],
                ["스타일", s.composition],
                ["분위기", s.mood],
                ["비율", ratioText],
              ].map(([k, v]) => (
                <div key={k} className="flex w-full items-start justify-between">
                  <p className="f-regular text-[#9A989F]">{k}</p>
                  <p className="f-bold text-[#1E1E28]">{v || "-"}</p>
                </div>
              ))}
            </div>
            <div className="flex w-full rounded-[12px] bg-[#F1E8DA] p-[12px]">
              <p className="f-semibold min-w-0 flex-1 text-[13px] leading-[1.5] text-[#1E1E28]">
                {[s.purpose, s.product, s.composition, s.mood, ratioText].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex w-full items-start gap-[7px] border-t border-[rgba(30,30,40,0.15)] pt-[14px]">
              <img alt="" src={a("de8b5.svg")} className="size-[15px]" />
              <p className="f-regular min-w-0 flex-1 text-[12px] leading-[1.5] text-[#6B6A72]">설정한 내용은 A/B 시안 이미지에 반영돼요.</p>
            </div>
          </section>
        </div>
      </div>
      <WizardFooter
        compact
        label="콘텐츠 생성 시작"
        icon={a("0ca09.svg")}
        disabled={!s.composition || !s.mood}
        onNext={() => setConfirming(true)}
      />
      {confirming && (
        <ConfirmNextStepDialog
          title="시안을 만들까요?"
          body="설정한 내용으로 AI가 시안을 만들어요. 다음 단계로 넘어가면 이미지 설정은 다시 수정할 수 없어요."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            lockStep("3-2")
            navigate("/campaigns/new/4")
          }}
        />
      )}
    </>
  )
}
