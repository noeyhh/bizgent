import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useBlocker, useNavigate, useSearchParams } from "react-router"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { PageHeader } from "../components/PageHeader"
import { StoreImageModal } from "../components/store/StoreImageModal"
import { useAppStore } from "../store/AppContext"
import type { Menu, Store } from "../store/types"

const a = (f: string) => `/assets/${f}`
const cardCls = "flex w-full flex-col gap-[22px] rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white p-[28px]"
const inputCls =
  "f-regular h-[46px] w-full rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-white px-[14px] text-[15px] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#D9643A]"
const textareaCls =
  "f-regular h-[96px] w-full resize-none rounded-[14px] border border-[rgba(30,30,40,0.15)] bg-white p-[14px] text-[15px] leading-[1.45] text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#D9643A]"
const primaryCls = "f-bold flex h-[46px] items-center justify-center rounded-full border border-[#1E1E28] bg-[#1E1E28] text-white hover:bg-[#31313D]"

const CATEGORIES = ["카페/베이커리", "카페·디저트", "한식", "양식", "일식", "중식", "분식", "주점/바", "기타"]
const TARGET_PRESETS = ["10대", "20대", "30대", "40대 이상", "직장인", "학생", "가족 단위", "1인 가구"]
const TONE_PRESETS = ["친근한", "전문적인", "트렌디한", "감성적인", "신뢰감있는", "유쾌한"]

const splitTags = (v: string) => v.split(/[,·/]/).map((s) => s.trim()).filter(Boolean)
const joinTags = (v: string[]) => v.join(", ")
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
const newMenu = (): Menu => ({ id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "", price: 0, description: "" })
const readFile = (file: File) =>
  new Promise<string>((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.readAsDataURL(file)
  })

function Label({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="f-semibold text-[14px] whitespace-nowrap text-[#1E1E28]">{children}</span>
      {optional && <span className="f-regular text-[12px] text-[#9A989F]">선택</span>}
    </div>
  )
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex w-full flex-col gap-[6px]">
      <h2 className="f-bold text-[20px] tracking-[-0.02em] text-[#1E1E28]">{title}</h2>
      {desc && <p className="f-regular text-[14px] leading-[1.45] text-[#6B6A72]">{desc}</p>}
    </div>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-[38px] items-center gap-[7px] rounded-full border px-[16px] text-[14px] whitespace-nowrap ${
        selected ? "f-semibold border-[#1E1E28] bg-[#1E1E28] text-white" : "f-medium border-[rgba(30,30,40,0.15)] bg-white text-[#6B6A72] hover:bg-[#F4F1EA]"
      }`}
    >
      {selected && <img alt="" src={a("a244b.svg")} className="size-[14px]" />}
      {children}
    </button>
  )
}

/** Multi-select chips + custom entry + free description (타겟 / 톤앤매너 sections). */
function TagSection({
  title,
  desc,
  presets,
  selected,
  onChange,
  inputPlaceholder,
  description,
  onDescription,
  descPlaceholder,
}: {
  title: string
  desc: string
  presets: string[]
  selected: string[]
  onChange: (v: string[]) => void
  inputPlaceholder: string
  description: string
  onDescription: (v: string) => void
  descPlaceholder: string
}) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const custom = selected.filter((s) => !presets.includes(s))
  const add = () => {
    const v = text.trim()
    if (v && !selected.includes(v)) onChange([...selected, v])
    setText("")
  }
  return (
    <section className={cardCls}>
      <SectionTitle title={title} desc={desc} />
      <div className="flex w-full flex-wrap gap-[10px]">
        {presets.map((p) => <Chip key={p} selected={selected.includes(p)} onClick={() => onChange(toggle(selected, p))}>{p}</Chip>)}
        <Chip selected={false} onClick={() => inputRef.current?.focus()}>+ 기타</Chip>
      </div>
      <div className="flex w-full flex-col gap-[10px]">
        <div className="flex w-full items-center gap-[10px]">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && add()}
            placeholder={inputPlaceholder}
            aria-label={`${title} 직접 추가`}
            className={`${inputCls} min-w-0 flex-1`}
          />
          <button type="button" onClick={add} className={`${primaryCls} w-[72px] shrink-0 text-[14px]`}>추가</button>
        </div>
        {custom.length > 0 && (
          <div className="flex w-full flex-wrap gap-[10px]">
            {custom.map((c) => (
              <Chip key={c} selected onClick={() => onChange(selected.filter((s) => s !== c))}>{c}</Chip>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-[8px]">
        <p className="f-semibold text-[14px] text-[#1E1E28]">직접 설명하기 (선택)</p>
        <textarea value={description} onChange={(e) => onDescription(e.target.value)} placeholder={descPlaceholder} aria-label={`${title} 직접 설명`} className={textareaCls} />
        <div className="flex items-center gap-[6px]">
          <img alt="" src={a("c920c.svg")} className="size-[14px]" />
          <p className="f-regular text-[12px] text-[#9A989F]">입력한 내용은 캠페인 생성 시 AI가 자동으로 참고해요</p>
        </div>
      </div>
    </section>
  )
}

function MenuCard({ menu, index, onChange, onRemove }: { menu: Menu; index: number; onChange: (m: Menu) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex w-full flex-col gap-[16px] rounded-[18px] border border-[rgba(30,30,40,0.15)] bg-[#F9F7F2] p-[18px]">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <span className="f-bold flex size-[26px] items-center justify-center rounded-[8px] bg-[#F1E8DA] text-[13px] text-[#1E1E28]">{index + 1}</span>
          <p className="f-bold text-[14px] text-[#1E1E28]">등록 상품</p>
        </div>
        <button type="button" onClick={onRemove} className="flex items-center gap-[5px] rounded-[6px] hover:opacity-70" aria-label={`등록 상품 ${index + 1} 삭제`}>
          <img alt="" src={a("b3b18.svg")} className="size-[16px]" />
          <span className="f-regular text-[13px] text-[#9A989F]">삭제</span>
        </button>
      </div>
      <div className="flex w-full items-start gap-[16px]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex h-[136px] w-[118px] shrink-0 flex-col items-center justify-center gap-[8px] overflow-hidden rounded-[16px] border border-dashed border-[rgba(30,30,40,0.22)] bg-white hover:bg-[#F4F1EA]"
        >
          {menu.imageUrl ? (
            <img alt={`${menu.name} 사진`} src={menu.imageUrl} className="absolute inset-0 size-full object-cover" />
          ) : (
            <>
              <span className="flex size-[34px] items-center justify-center rounded-full bg-[#F1E8DA]">
                <img alt="" src={a("cc636.svg")} className="size-[17px]" />
              </span>
              <span className="f-semibold text-[12px] text-[#6B6A72]">사진 업로드</span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f) onChange({ ...menu, imageUrl: await readFile(f) })
            e.target.value = ""
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
          <div className="flex w-full items-start gap-[14px]">
            <label className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <Label>상품/메뉴명</Label>
              <input value={menu.name} onChange={(e) => onChange({ ...menu, name: e.target.value })} placeholder="예: 시그니처 크림 라떼" className={inputCls} />
            </label>
            <label className="flex w-[190px] shrink-0 flex-col gap-[8px]">
              <Label>가격</Label>
              <input
                inputMode="numeric"
                value={menu.price ? `${menu.price.toLocaleString()}원` : ""}
                onChange={(e) => onChange({ ...menu, price: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                placeholder="예: 6,500원"
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex w-full items-start gap-[14px]">
            <label className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <Label>간단 설명</Label>
              <input value={menu.description ?? ""} onChange={(e) => onChange({ ...menu, description: e.target.value })} placeholder="예: 부드러운 바닐라 크림을 올린 대표 라떼" className={inputCls} />
            </label>
            <label className="flex w-[190px] shrink-0 flex-col gap-[8px]">
              <Label optional>재고 수량</Label>
              <input
                inputMode="numeric"
                value={menu.stock ?? ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "")
                  onChange({ ...menu, stock: digits === "" ? undefined : Number(digits) })
                }}
                placeholder="예: 30"
                className={inputCls}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StorePage() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState<Store>(data.store)
  const [saved, setSaved] = useState<Store>(data.store)
  const [toast, setToast] = useState<string | null>(null)
  // The AI image card is driven by ?imageCard=open so Home (and auth redirects) can deep-link into it.
  const imageModal = params.get("imageCard") === "open"
  const setImageModal = (open: boolean) =>
    setParams((p) => {
      const next = new URLSearchParams(p)
      if (open) next.set("imageCard", "open")
      else next.delete("imageCard")
      return next
    }, { replace: true })
  const heroRef = useRef<HTMLInputElement>(null)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved])
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [dirty])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const update = (patch: Partial<Store>) => setForm((f) => ({ ...f, ...patch }))
  const updateMenu = (m: Menu) => update({ menus: form.menus.map((x) => (x.id === m.id ? m : x)) })

  const persist = (next: Store) => {
    setData((prev) => ({ ...prev, store: next }))
    setSaved(next)
  }
  const save = () => {
    const cleaned = { ...form, name: form.name.trim(), menus: form.menus.filter((m) => m.name.trim()).map((m) => ({ ...m, name: m.name.trim() })) }
    setForm(cleaned)
    persist(cleaned)
    setToast("매장 정보가 저장되었어요")
  }
  const applyHero = (url: string) => {
    // The representative image is saved immediately; other unsaved edits stay pending.
    setForm((f) => ({ ...f, heroImageUrl: url }))
    persist({ ...saved, heroImageUrl: url })
    setImageModal(false)
    setToast("대표 이미지가 설정되었어요")
  }

  const targets = splitTags(form.targetCustomer)
  const tones = splitTags(form.toneManner)
  const categories = CATEGORIES.includes(form.category) || !form.category ? CATEGORIES : [form.category, ...CATEGORIES]

  return (
    <div className="editorial-app-page flex min-h-screen w-full flex-col bg-[#F4F1EA]">
      <div className="flex w-full flex-col gap-[18px] px-[36px] pt-[24px]">
        <PageHeader parent="매장 정보 관리" current="등록" />
        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col gap-[7px]">
            <h1 className="f-bold text-[28px] tracking-[-0.03em] text-[#1E1E28]">매장/상품 정보 등록</h1>
            <p className="f-regular text-[14px] text-[#6B6A72]">홍보 콘텐츠 제작에 활용할 매장 정보를 입력해주세요.</p>
          </div>
          <span className="flex items-center gap-[6px] rounded-full bg-[#F1E8DA] px-[11px] py-[7px]">
            <img alt="" src={a("09e00.svg")} className="size-[14px]" />
            <span className="f-semibold text-[12px] whitespace-nowrap text-[#8A6A55]">기본 정보부터 차근차근</span>
          </span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col items-center px-[36px] pt-[26px] pb-[34px]">
        <div className="flex w-full max-w-[800px] flex-col gap-[20px]">
          <section className={cardCls}>
            <SectionTitle title="기본 정보" />
            <div className="flex w-full flex-wrap items-start gap-[22px]">
              <div className="flex w-[259px] shrink-0 flex-col items-center gap-[23px]">
                <button
                  type="button"
                  onClick={() => heroRef.current?.click()}
                  className="relative flex h-[210px] w-full flex-col items-center justify-center gap-[13px] overflow-hidden rounded-[18px] border border-dashed border-[rgba(30,30,40,0.22)] bg-[#F9F7F2] hover:bg-[#F4F1EA]"
                >
                  {form.heroImageUrl ? (
                    <img alt={`${form.name} 대표 이미지`} src={form.heroImageUrl} className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <>
                      <span className="flex size-[48px] items-center justify-center rounded-full bg-[#F1E8DA]">
                        <img alt="" src={a("ba22e.svg")} className="size-[22px]" />
                      </span>
                      <span className="flex flex-col items-center gap-[5px]">
                        <span className="f-bold text-[14px] text-[#1E1E28]">매장 대표 이미지 등록</span>
                        <span className="f-regular text-[12px] text-[#9A989F]">권장 크기 1200 × 800</span>
                      </span>
                    </>
                  )}
                </button>
                <input
                  ref={heroRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f) update({ heroImageUrl: await readFile(f) })
                    e.target.value = ""
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageModal(true)}
                  className="flex h-[36px] items-center gap-[4px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[12px] hover:border-[#D9643A] hover:bg-[#F9F7F2]"
                >
                  <img alt="" src={a("16f99.svg")} className="size-[14px]" />
                  <span className="f-bold text-[14px] whitespace-nowrap text-[#1E1E28]">AI로 대표 이미지 무료 생성</span>
                </button>
              </div>
              <div className="flex min-w-[240px] flex-1 flex-col gap-[14px] px-[clamp(0px,8vw,125px)] pt-[0px]">
                <label className="flex w-full flex-col gap-[8px]">
                  <Label>매장명</Label>
                  <input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="매장명을 입력해주세요" className={inputCls} />
                </label>
                <label className="flex w-full flex-col gap-[8px]">
                  <Label>업종</Label>
                  <span className="relative flex w-full items-center">
                    <select value={form.category} onChange={(e) => update({ category: e.target.value })} className={`${inputCls} appearance-none pr-[40px]`}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <img alt="" src={a("73ce0.svg")} className="pointer-events-none absolute right-[14px] size-[17px]" />
                  </span>
                </label>
                <label className="flex w-full flex-col gap-[8px]">
                  <Label optional>연락처</Label>
                  <input value={form.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} placeholder="연락처를 입력해주세요" inputMode="tel" className={inputCls} />
                </label>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <SectionTitle title="주요 상품·메뉴" desc="대표 상품이나 메뉴를 등록하면 더 구체적인 홍보 콘텐츠를 만들 수 있어요." />
            <div className="flex w-full flex-col gap-[14px]">
              {form.menus.map((m, i) => (
                <MenuCard key={m.id} menu={m} index={i} onChange={updateMenu} onRemove={() => update({ menus: form.menus.filter((x) => x.id !== m.id) })} />
              ))}
              <button
                type="button"
                onClick={() => update({ menus: [...form.menus, newMenu()] })}
                className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-full border border-dashed border-[#D9643A] bg-white hover:bg-[#F9F7F2]"
              >
                <img alt="" src={a("9872e.svg")} className="size-[17px]" />
                <span className="f-bold text-[14px] text-[#D9643A]">상품/메뉴 추가</span>
              </button>
            </div>
          </section>

          <TagSection
            title="마케팅 홍보 주요 타켓"
            desc="누구에게 홍보하고 싶으신가요? (복수 선택 가능)"
            presets={TARGET_PRESETS}
            selected={targets}
            onChange={(v) => update({ targetCustomer: joinTags(v) })}
            inputPlaceholder="예: 퇴근 후 조용히 커피를 즐기는 30대 직장인 여성 고객"
            description={form.targetDescription ?? ""}
            onDescription={(v) => update({ targetDescription: v })}
            descPlaceholder="예: 퇴근 후 조용히 커피를 즐기는 30대 직장인 여성 고객이 많아요"
          />

          <TagSection
            title="브랜드 톤앤매너"
            desc="브랜드가 어떤 느낌으로 보이길 원하시나요? (복수 선택 가능)"
            presets={TONE_PRESETS}
            selected={tones}
            onChange={(v) => update({ toneManner: joinTags(v) })}
            inputPlaceholder="예: 따뜻하고 편안한 동네 카페 느낌으로, 존댓말을 사용해요"
            description={form.toneDescription ?? ""}
            onDescription={(v) => update({ toneDescription: v })}
            descPlaceholder="예: 따뜻하고 편안한 동네 카페 느낌으로, 존댓말을 사용해요"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex h-[86px] w-full items-center justify-center border-t border-[rgba(30,30,40,0.15)] bg-white px-[36px] shadow-[0_-4px_14px_rgba(30,30,40,0.04)]">
        <div className="flex w-full max-w-[800px] items-center justify-between">
          <p className="f-regular text-[13px] text-[#9A989F]">입력한 정보는 언제든 수정할 수 있어요.</p>
          <div className="flex items-start gap-[10px]">
            <button
              type="button"
              onClick={() => (dirty ? setForm(saved) : navigate("/"))}
              className="f-bold flex h-[46px] w-[92px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white text-[15px] text-[#1E1E28] hover:bg-[#F4F1EA]"
            >
              취소
            </button>
            <button type="button" onClick={save} className={`${primaryCls} w-[118px] text-[15px]`}>저장하기</button>
          </div>
        </div>
      </div>

      {imageModal && <StoreImageModal store={form} plan={data.user.plan} onApply={applyHero} onClose={() => setImageModal(false)} />}

      <ConfirmDialog
        open={blocker.state === "blocked"}
        message="저장하지 않은 변경 사항이 있어요. 나가시겠어요?"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      {toast && (
        <div role="status" className="fixed bottom-[108px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[8px] rounded-full bg-[#1E1E28] px-[18px] py-[11px] shadow-[0_8px_20px_rgba(30,30,40,0.14)]">
          <span className="flex size-[18px] items-center justify-center rounded-full bg-[#D9643A]">
            <img alt="" src={a("a244b.svg")} className="size-[11px]" />
          </span>
          <p className="f-semibold text-[14px] whitespace-nowrap text-white">{toast}</p>
        </div>
      )}
    </div>
  )
}
