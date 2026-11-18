import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { ConfirmDialog } from "./ConfirmDialog"
import { useAppStore } from "../store/AppContext"
import { nextMonthStart } from "../store/seed"

type Placement = "above" | "below"
type Anchor = { el: HTMLElement; placement: Placement }

// Single menu instance shared by the sidebar "설정" item and the header avatar.
const listeners = new Set<(a: Anchor | null) => void>()
let current: Anchor | null = null
export function toggleSettingsMenu(el: HTMLElement, placement: Placement) {
  current = current?.el === el ? null : { el, placement }
  listeners.forEach((l) => l(current))
}

const MENU_W = 240
const SUB_W = 240

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-[14px] text-white/60" aria-hidden>
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
const Divider = () => <div role="separator" className="mx-[-6px] my-[6px] h-px bg-white/10" />
const itemCls =
  "f-medium flex h-[36px] w-full items-center justify-between rounded-[8px] px-[12px] text-left text-[14px] text-white hover:bg-white/10 focus-visible:bg-white/10 outline-none"

export function SettingsMenuHost() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [subOpen, setSubOpen] = useState(false)
  const [account, setAccount] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const l = (a: Anchor | null) => (setAnchor(a), setSubOpen(false))
    listeners.add(l)
    return () => void listeners.delete(l)
  }, [])

  const close = () => {
    current = null
    setAnchor(null)
    setSubOpen(false)
  }

  useEffect(() => {
    if (!anchor) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t) || anchor.el.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    const onResize = () => close()
    document.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [anchor])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const { user } = data
  const limit = user.monthlyCampaignLimit
  const used = Math.min(user.campaignsUsedThisMonth, limit)
  const reset = new Date(user.usageResetAt ?? nextMonthStart())
  const resetLabel = `${reset.getFullYear()}.${String(reset.getMonth() + 1).padStart(2, "0")}.${String(reset.getDate()).padStart(2, "0")}`

  let pos: React.CSSProperties = {}
  let subLeft = true
  if (anchor) {
    const r = anchor.el.getBoundingClientRect()
    if (anchor.placement === "above") {
      pos = { left: r.left, bottom: window.innerHeight - r.top + 8 }
      subLeft = r.left + MENU_W + SUB_W + 8 > window.innerWidth
    } else {
      const left = Math.max(8, r.right - MENU_W)
      pos = { left, top: r.bottom + 8 }
      subLeft = left + MENU_W + SUB_W + 8 > window.innerWidth
    }
  }

  return (
    <>
      {anchor && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="설정 메뉴"
          style={{ ...pos, width: MENU_W }}
          className="fixed z-[55] flex flex-col rounded-[12px] bg-[#1f2937] p-[6px] shadow-[0px_12px_32px_0px_rgba(16,24,40,0.28)]"
        >
          <div className="flex h-[36px] items-center justify-between gap-[8px] px-[12px]">
            <span className="f-bold truncate text-[14px] text-white">{user.name}님</span>
            <span
              className={`f-semibold shrink-0 rounded-full px-[8px] py-[2px] text-[11px] ${
                user.plan === "pro" ? "bg-[#2563eb] text-white" : "bg-[#6d4aff]/20 text-white"
              }`}
            >
              {user.plan === "pro" ? "구독 플랜" : "무료 플랜"}
            </span>
          </div>
          <Divider />
          <button
            type="button"
            role="menuitem"
            className={itemCls}
            onMouseEnter={() => setSubOpen(false)}
            onClick={() => (close(), setAccount(true))}
          >
            계정 관리
          </button>
          <div className="relative" onMouseEnter={() => setSubOpen(true)} onMouseLeave={() => setSubOpen(false)}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={subOpen}
              className={`${itemCls} ${subOpen ? "bg-white/10" : ""}`}
              onClick={() => setSubOpen((v) => !v)}
            >
              크레딧 및 이용 현황
              <Chevron />
            </button>
            {subOpen && (
              // Padding bridges the gap so the pointer can travel into the submenu.
              <div className={`absolute top-[-6px] ${subLeft ? "right-full pr-[8px]" : "left-full pl-[8px]"}`}>
                <div
                  role="menu"
                  aria-label="크레딧 및 이용 현황"
                  style={{ width: SUB_W }}
                  className="flex flex-col rounded-[12px] bg-[#1f2937] p-[6px] shadow-[0px_12px_32px_0px_rgba(16,24,40,0.28)]"
                >
                  <div className="flex flex-col gap-[8px] px-[12px] py-[10px]">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="f-medium text-white">이번 달 캠페인 이용</span>
                      <span className="f-bold text-white">
                        {used}/{limit}회
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={limit}
                      aria-valuenow={used}
                      className="h-[4px] w-full overflow-hidden rounded-full bg-white/15"
                    >
                      <div className="h-full rounded-full bg-[#6d4aff]" style={{ width: `${(used / limit) * 100}%` }} />
                    </div>
                  </div>
                  <p className="f-regular px-[12px] pb-[8px] text-[12px] text-white/60">다음 리셋일: {resetLabel}</p>
                  <Divider />
                  <button
                    type="button"
                    role="menuitem"
                    className={itemCls}
                    onClick={() => (close(), navigate("/subscription"))}
                  >
                    이용권 자세히 보기
                    <Chevron />
                  </button>
                </div>
              </div>
            )}
          </div>
          <Divider />
          <button
            type="button"
            role="menuitem"
            className={itemCls}
            onMouseEnter={() => setSubOpen(false)}
            onClick={() => (close(), setConfirmLogout(true))}
          >
            로그아웃
          </button>
        </div>
      )}

      {account && (
        <AccountModal
          onClose={() => setAccount(false)}
          onSaved={() => (setAccount(false), setToast("계정 정보가 저장되었어요"))}
        />
      )}

      <ConfirmDialog
        open={confirmLogout}
        message="로그아웃하시겠어요?"
        confirmLabel="로그아웃"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false)
          setData((prev) => ({ ...prev, loggedIn: false }))
          navigate("/landing")
        }}
      />

      {toast && (
        <div role="status" className="fixed bottom-[40px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[8px] rounded-full bg-[#172033] px-[18px] py-[11px] shadow-[0px_10px_24px_0px_rgba(16,24,40,0.18)]">
          <span className="flex size-[18px] items-center justify-center rounded-full bg-[#2563eb]">
            <img alt="" src="/assets/a244b.svg" className="size-[11px]" />
          </span>
          <p className="f-semibold text-[14px] whitespace-nowrap text-white">{toast}</p>
        </div>
      )}
    </>
  )
}

const inputCls =
  "f-regular h-[46px] w-full rounded-[12px] border border-[#d5dce7] bg-white px-[14px] text-[15px] text-[#172033] outline-none placeholder:text-[#98a2b3] focus:border-[#2563eb] read-only:bg-[#f7f9fc] read-only:text-[#667085]"

function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="flex w-full flex-col gap-[8px]">
      <span className="flex items-center gap-[6px]">
        <span className="f-semibold text-[14px] text-[#172033]">{label}</span>
        {optional && <span className="f-regular text-[12px] text-[#98a2b3]">선택</span>}
      </span>
      {children}
    </label>
  )
}

function AccountModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { data, setData } = useAppStore()
  const [name, setName] = useState(data.user.name)
  const [phone, setPhone] = useState(data.user.phone ?? "")
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)

  const pwMismatch = pwOpen && pw.confirm !== "" && pw.next !== pw.confirm
  const pwIncomplete = pwOpen && (pw.current || pw.next || pw.confirm) && (!pw.current || !pw.next || pw.next !== pw.confirm)
  const canSave = name.trim() !== "" && !pwIncomplete

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !confirmWithdraw && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const save = () => {
    setData((prev) => ({ ...prev, user: { ...prev.user, name: name.trim(), phone: phone.trim() || undefined } }))
    onSaved()
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,32,51,0.4)]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        className="flex max-h-[calc(100vh-32px)] w-[480px] max-w-[calc(100vw-32px)] flex-col gap-[20px] rounded-[20px] border border-[#e5eaf1] bg-white p-[24px] drop-shadow-[0px_18px_20px_rgba(16,24,40,0.1)]"
      >
        <div className="flex w-full items-center justify-between">
          <h2 id="account-title" className="f-bold text-[24px] text-[#172033]">계정 관리</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-[36px] items-center justify-center rounded-full border border-[#e5eaf1] bg-[#f7f9fc] hover:bg-[#eef1f5]"
          >
            <img alt="" src="/assets/d0027.svg" className="size-[18px]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto">
          <Field label="이름">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해주세요" className={inputCls} />
          </Field>
          <Field label="이메일">
            <input value={data.user.email} readOnly className={inputCls} />
          </Field>
          <Field label="연락처" optional>
            <input
              value={phone}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9-]/g, ""))}
              placeholder="예: 010-1234-5678"
              className={inputCls}
            />
          </Field>

          {!pwOpen ? (
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="f-bold flex h-[44px] w-fit items-center rounded-full border border-[#2563eb] bg-white px-[20px] text-[15px] text-[#2563eb] hover:bg-[#f1efff]"
            >
              비밀번호 변경
            </button>
          ) : (
            <div className="flex flex-col gap-[12px] rounded-[16px] border border-[#e5eaf1] bg-[#fbfcfe] p-[16px]">
              <div className="flex items-center justify-between">
                <p className="f-bold text-[15px] text-[#172033]">비밀번호 변경</p>
                <button
                  type="button"
                  onClick={() => (setPwOpen(false), setPw({ current: "", next: "", confirm: "" }))}
                  className="f-semibold text-[13px] text-[#667085] hover:underline"
                >
                  접기
                </button>
              </div>
              <Field label="현재 비밀번호">
                <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inputCls} />
              </Field>
              <Field label="새 비밀번호">
                <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputCls} />
              </Field>
              <Field label="새 비밀번호 확인">
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  aria-invalid={pwMismatch}
                  className={`${inputCls} ${pwMismatch ? "border-[#ef4444] focus:border-[#ef4444]" : ""}`}
                />
              </Field>
              {pwMismatch && <p className="f-medium text-[13px] text-[#ef4444]">새 비밀번호가 일치하지 않아요</p>}
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-between border-t border-[#e5eaf1] pt-[16px]">
          <button type="button" onClick={() => setConfirmWithdraw(true)} className="f-regular text-[13px] text-[#98a2b3] underline-offset-2 hover:underline">
            회원 탈퇴
          </button>
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="f-bold flex h-[44px] items-center rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#667085] hover:bg-[#f7f9fc]"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={save}
              className="f-bold flex h-[44px] items-center rounded-full border border-[#2563eb] bg-[#2563eb] px-[24px] text-[15px] text-white hover:bg-[#1d4ed8] disabled:opacity-40 disabled:hover:bg-[#2563eb]"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmWithdraw}
        message="정말 탈퇴하시겠어요? 탈퇴하면 매장 정보와 캠페인 기록을 다시 볼 수 없어요."
        confirmLabel="탈퇴하기"
        onCancel={() => setConfirmWithdraw(false)}
        onConfirm={() => setConfirmWithdraw(false)}
      />
    </div>
  )
}
