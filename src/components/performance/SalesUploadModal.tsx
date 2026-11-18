import { useEffect, useRef, useState, type ReactNode } from "react"
import { LoadingState } from "../wizard/WizardParts"
import { parseSalesFile, recognizeReceipt, type RawSaleRow } from "../../services/ai"
import type { Menu, Sale, SalesSource } from "../../store/types"

const a = (f: string) => `/assets/${f}`
type Step = 1 | 2 | 3
type Tab = "excel" | "receipt" | "manual"
const TABS: { id: Tab; label: string }[] = [
  { id: "excel", label: "엑셀/CSV" },
  { id: "receipt", label: "영수증 사진" },
  { id: "manual", label: "직접 입력" },
]

type CheckRow = { id: string; date: string; menuName: string; menuId: string | null; quantity: number | null; amount: number | null; editing: boolean }
type ManualRow = { id: string; date: string; menuId: string; quantity: string; amount: string; amountTouched: boolean }

const uid = () => Math.random().toString(36).slice(2, 9)
const norm = (s: string) => s.replace(/\s/g, "").toLowerCase()
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const validDate = (s: string) => !Number.isNaN(new Date(s).getTime()) && /\d{4}-\d{1,2}-\d{1,2}/.test(s)
const shortDate = (s: string) => (validDate(s) ? `${new Date(s).getMonth() + 1}/${new Date(s).getDate()}` : s || "-")
const longDate = (s: string) => `${new Date(s).getMonth() + 1}월 ${new Date(s).getDate()}일`
const digits = (v: string) => (v.replace(/[^0-9]/g, "") ? Number(v.replace(/[^0-9]/g, "")) : null)

function issueOf(r: CheckRow): string | null {
  if (!validDate(r.date)) return "날짜 확인 필요"
  if (!r.menuId) return "상품 확인 필요"
  if (!r.quantity) return "수량 확인 필요"
  if (r.amount === null) return "금액 확인 필요"
  return null
}

const toCheckRows = (raw: RawSaleRow[], menus: Menu[]): CheckRow[] =>
  raw.map((r) => ({
    id: uid(),
    date: r.date,
    menuName: r.menuName,
    menuId: menus.find((m) => norm(m.name) === norm(r.menuName))?.id ?? null,
    quantity: r.quantity,
    amount: r.amount,
    editing: false,
  }))

function downloadTemplate() {
  const csv = "\uFEFFdate,menu,quantity,amount\n2025-10-13,아메리카노,3,13500\n2025-10-13,크루아상,2,8400\n"
  const href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = href
  link.download = "bizgent_매출_양식.csv"
  link.click()
  URL.revokeObjectURL(href)
}

function Stepper({ step }: { step: Step }) {
  const done = (n: number) => step > n
  const active = (n: number) => step >= n
  const labels = ["1 올리기", "2 결과 확인", "3 분석 완료"]
  return (
    <div className="flex w-full justify-center pt-[10px]" aria-label={`3단계 중 ${step}단계`}>
      <div className="relative h-[72px] w-[438px]">
        <div className={`absolute top-[15px] left-[81px] h-[2px] w-[122px] ${step > 1 ? "bg-[#1E1E28]" : "bg-[#e5eaf1]"}`} />
        <div className={`absolute top-[15px] left-[235px] h-[2px] w-[116px] ${step > 2 ? "bg-[#1E1E28]" : "bg-[#e5eaf1]"}`} />
        {labels.map((label, i) => {
          const n = i + 1
          const on = active(n)
          const current = step === n
          return (
            <div key={label} className="absolute top-0 h-[72px] w-[130px]" style={{ left: i * 154 }}>
              <div
                className={`absolute top-0 flex h-[32px] items-center justify-center rounded-full border ${n === 3 ? "left-[43px] w-[44px]" : "left-[49px] w-[32px]"} ${
                  on ? "border-[#1E1E28] bg-[#1E1E28]" : "border-[rgba(30,30,40,0.15)] bg-[#f0f3f8]"
                }`}
              >
                <span className={`f-bold text-[11px] ${on ? "text-white" : "text-[#9A989F]"}`}>{done(n) ? "✓" : n}</span>
              </div>
              <p className={`absolute top-[44px] left-1/2 -translate-x-1/2 text-center text-[13px] whitespace-nowrap ${current ? "f-bold text-[#1E1E28]" : on ? "f-medium text-[#1E1E28]" : "f-medium text-[#9A989F]"}`}>
                {label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DropZone({ accept, title, hint, onFile, children }: { accept: string; title: string; hint: string; onFile: (f: File) => void; children?: ReactNode }) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ref.current?.click())}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      className={`flex h-[296px] w-full cursor-pointer flex-col items-center justify-center gap-[12px] rounded-[16px] border-[1.5px] border-dashed ${over ? "border-[#1E1E28] bg-[#F1E8DA]" : "border-[#b8c9e8] bg-[#fafcff] hover:bg-[#f5f8fe]"}`}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ""
        }}
      />
      {children ?? (
        <>
          <span className="flex size-[64px] items-center justify-center rounded-[16px] bg-[#F1E8DA]">
            <img alt="" src={a("ce93d.svg")} className="size-[32px]" />
          </span>
          <p className="f-semibold text-[17px] text-[#1E1E28]">{title}</p>
          <p className="f-regular text-[13px] text-[#9A989F]">{hint}</p>
        </>
      )}
    </div>
  )
}

function SelectedFile({ name, meta, preview }: { name: string; meta: string; preview?: string }) {
  return (
    <>
      {preview ? (
        <img alt="올린 영수증" src={preview} className="h-[120px] w-[96px] rounded-[12px] border border-[rgba(30,30,40,0.15)] object-cover" />
      ) : (
        <span className="flex size-[64px] items-center justify-center rounded-[16px] bg-[#eef8f6]">
          <img alt="" src={a("32c90.svg")} className="size-[28px]" />
        </span>
      )}
      <p className="f-semibold max-w-[600px] truncate text-[17px] text-[#1E1E28]">{name}</p>
      <p className="f-regular text-[13px] text-[#9A989F]">{meta}</p>
      <span className="f-semibold text-[13px] text-[#1E1E28] underline">다른 파일 선택</span>
    </>
  )
}

const cellInput =
  "f-regular h-[28px] w-full min-w-0 rounded-[6px] border bg-white px-[8px] text-[13px] text-[#1E1E28] outline-none focus:border-[#1E1E28]"

function CheckTableRow({ row, menus, onChange }: { row: CheckRow; menus: Menu[]; onChange: (r: CheckRow) => void }) {
  const issue = issueOf(row)
  const warn = "border-[#eacba5]"
  const ok = "border-[#d5dce7]"
  const edit = row.editing || Boolean(issue)
  const pencil = (label: string) =>
    !edit && (
      <button type="button" aria-label={`${label} 수정`} onClick={() => onChange({ ...row, editing: true })} className="shrink-0 rounded-[4px] hover:opacity-60">
        <img alt="" src={a("29167.svg")} className="size-[12px]" />
      </button>
    )
  return (
    <div className={`flex h-[46px] w-full items-center gap-[16px] border-b border-[#eef1f5] px-[16px] ${issue ? "bg-[#fff5e9]" : "bg-white"}`}>
      <div className="flex w-[86px] shrink-0 items-center gap-[8px]">
        {edit && (row.editing || issue === "날짜 확인 필요") ? (
          <input type="date" value={validDate(row.date) ? row.date : ""} onChange={(e) => onChange({ ...row, date: e.target.value })} aria-label="날짜" className={`${cellInput} px-[4px] ${validDate(row.date) ? ok : warn}`} />
        ) : (
          <>
            <p className="f-regular text-[13px] whitespace-nowrap text-[#6B6A72]">{shortDate(row.date)}</p>
            {pencil("날짜")}
          </>
        )}
      </div>
      <div className="flex w-[320px] shrink-0 items-center justify-between gap-[8px]">
        <p className="f-medium min-w-0 truncate text-[14px] text-[#1E1E28]">{menus.find((m) => m.id === row.menuId)?.name ?? row.menuName}</p>
        {edit && (row.editing || !row.menuId) ? (
          <label className={`relative flex h-[28px] shrink-0 items-center gap-[6px] rounded-[6px] border bg-white px-[8px] ${row.menuId ? ok : warn}`}>
            <span className={`f-semibold text-[11px] whitespace-nowrap ${row.menuId ? "text-[#6B6A72]" : "text-[#c46b12]"}`}>상품 선택</span>
            <img alt="" src={a("a50d1.svg")} className="size-[12px]" />
            <select
              value={row.menuId ?? ""}
              onChange={(e) => onChange({ ...row, menuId: e.target.value || null })}
              aria-label={`${row.menuName} 상품 선택`}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="">상품 선택</option>
              {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
        ) : (
          pencil("상품명")
        )}
      </div>
      <div className="flex w-[80px] shrink-0 items-center gap-[8px]">
        {edit && (row.editing || !row.quantity) ? (
          <input inputMode="numeric" value={row.quantity ?? ""} onChange={(e) => onChange({ ...row, quantity: digits(e.target.value) })} placeholder="수량" aria-label="수량" className={`${cellInput} ${row.quantity ? ok : warn}`} />
        ) : (
          <>
            <p className="f-regular text-[13px] whitespace-nowrap text-[#1E1E28]">{row.quantity}</p>
            {pencil("수량")}
          </>
        )}
      </div>
      <div className="flex w-[150px] shrink-0 items-center justify-between gap-[8px]">
        {edit && (row.editing || row.amount === null) ? (
          <input inputMode="numeric" value={row.amount ?? ""} onChange={(e) => onChange({ ...row, amount: digits(e.target.value) })} placeholder="금액" aria-label="금액" className={`${cellInput} ${row.amount !== null ? ok : warn}`} />
        ) : (
          <>
            <p className="f-regular text-[13px] whitespace-nowrap text-[#1E1E28]">{row.amount?.toLocaleString()}원</p>
            {pencil("금액")}
          </>
        )}
      </div>
      <div className="flex w-[132px] shrink-0 items-center gap-[6px]">
        {issue ? (
          <span className="f-semibold rounded-full bg-[#ffedd4] px-[9px] py-[5px] text-[11px] whitespace-nowrap text-[#c46b12]">{issue}</span>
        ) : (
          <span className="flex items-center gap-[4px] rounded-full bg-[#eef8f6] px-[9px] py-[5px]">
            <img alt="" src={a("32c90.svg")} className="size-[12px]" />
            <span className="f-semibold text-[11px] whitespace-nowrap text-[#477f78]">확인됨</span>
          </span>
        )}
        {row.editing && !issue && (
          <button type="button" onClick={() => onChange({ ...row, editing: false })} className="f-semibold text-[11px] text-[#1E1E28] hover:underline">완료</button>
        )}
      </div>
    </div>
  )
}

export function SalesUploadModal({ menus, onCommit, onClose }: { menus: Menu[]; onCommit: (sales: Sale[]) => void; onClose: (committed: boolean) => void }) {
  const [step, setStep] = useState<Step>(1)
  const [tab, setTab] = useState<Tab>("excel")
  const [file, setFile] = useState<File | null>(null)
  const [receipt, setReceipt] = useState<{ file: File; preview: string; rows: RawSaleRow[] | null } | null>(null)
  const [manual, setManual] = useState<ManualRow[]>([])
  const [rows, setRows] = useState<CheckRow[]>([])
  const [rowsSource, setRowsSource] = useState<string>("")
  const [busy, setBusy] = useState<"parse" | "analyze" | null>(null)
  const [committed, setCommitted] = useState(0)
  const [scroll, setScroll] = useState(0)

  const manualValid = manual.filter((r) => r.menuId && Number(r.quantity) > 0)
  const canNext =
    busy === null && (tab === "excel" ? Boolean(file) : tab === "receipt" ? Boolean(receipt?.rows) : manualValid.length > 0)

  const sourceKey = tab === "excel" ? `excel:${file?.name}:${file?.size}:${file?.lastModified}` : tab === "receipt" ? `receipt:${receipt?.preview}` : `manual:${JSON.stringify(manualValid)}`

  const issues = rows.filter((r) => issueOf(r)).length
  const validDates = rows.filter((r) => validDate(r.date)).map((r) => new Date(r.date).getTime())
  const periodText = validDates.length ? `분석 기간 ${longDate(new Date(Math.min(...validDates)).toISOString())} ~ ${longDate(new Date(Math.max(...validDates)).toISOString())}` : "분석 기간 -"

  const close = () => {
    if (busy) return
    onClose(step === 3)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const onReceipt = async (f: File) => {
    const preview = URL.createObjectURL(f)
    setReceipt({ file: f, preview, rows: null })
    const recognized = await recognizeReceipt(f, menus)
    setReceipt((cur) => (cur?.preview === preview ? { ...cur, rows: recognized } : cur))
  }

  const next = async () => {
    // Keep step-2 edits when the user comes back without changing the upload.
    if (rowsSource === sourceKey && rows.length) return setStep(2)
    let raw: RawSaleRow[] = []
    if (tab === "excel" && file) {
      setBusy("parse")
      raw = await parseSalesFile(file, menus)
      setBusy(null)
    } else if (tab === "receipt" && receipt?.rows) raw = receipt.rows
    else raw = manualValid.map((r) => ({ date: r.date, menuName: menus.find((m) => m.id === r.menuId)?.name ?? "", quantity: Number(r.quantity), amount: digits(r.amount) }))
    setRows(toCheckRows(raw, menus))
    setRowsSource(sourceKey)
    setScroll(0)
    setStep(2)
  }

  const analyze = async () => {
    setBusy("analyze")
    await new Promise((r) => setTimeout(r, 1500))
    const source: SalesSource = tab === "excel" ? "excel" : tab === "receipt" ? "receipt" : "manual"
    const sales: Sale[] = rows.map((r) => {
      const d = new Date(r.date)
      d.setHours(12, 0, 0, 0)
      return { id: `upload-${Date.now()}-${r.id}`, date: d.toISOString(), menuId: r.menuId!, quantity: r.quantity!, amount: r.amount!, source }
    })
    onCommit(sales)
    setCommitted(sales.length)
    setBusy(null)
    setStep(3)
  }

  const ROW_H = 46
  const VISIBLE = 7
  const firstVisible = rows.length ? Math.min(rows.length, Math.floor(scroll / ROW_H) + 1) : 0
  const lastVisible = Math.min(rows.length, firstVisible + VISIBLE - 1)

  const addManual = () =>
    setManual((m) => [...m, { id: uid(), date: m[m.length - 1]?.date ?? todayStr(), menuId: menus[0]?.id ?? "", quantity: "1", amount: menus[0] ? String(menus[0].price) : "", amountTouched: false }])
  const updateManual = (id: string, patch: Partial<ManualRow>) =>
    setManual((list) =>
      list.map((r) => {
        if (r.id !== id) return r
        const nextRow = { ...r, ...patch }
        if (!nextRow.amountTouched && ("menuId" in patch || "quantity" in patch)) {
          const price = menus.find((m) => m.id === nextRow.menuId)?.price ?? 0
          nextRow.amount = price && Number(nextRow.quantity) ? String(price * Number(nextRow.quantity)) : ""
        }
        return nextRow
      }),
    )

  const manualInput = "f-regular h-[40px] w-full min-w-0 rounded-[10px] border border-[#d5dce7] bg-white px-[10px] text-[14px] text-[#1E1E28] outline-none focus:border-[#1E1E28]"
  const ghostBtn = "f-bold flex h-[44px] min-w-[92px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[20px] text-[14px] text-[#1E1E28] hover:bg-[#F4F1EA] disabled:opacity-40"
  const primaryBtn = "f-bold flex h-[44px] min-w-[92px] items-center justify-center rounded-full bg-[#1E1E28] px-[20px] text-[14px] text-white hover:bg-[#31313D] disabled:bg-[#D4D0C9] disabled:text-[#8E8B85]"

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,30,40,0.48)]" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sales-upload-title"
        className="flex h-[780px] max-h-[calc(100vh-32px)] w-[960px] max-w-[calc(100vw-32px)] flex-col rounded-[20px] border border-[rgba(30,30,40,0.15)] bg-white shadow-[0_24px_64px_rgba(30,30,40,0.18)]"
      >
        <div className="flex w-full shrink-0 flex-col gap-[8px] px-[32px] pt-[28px] pb-[16px]">
          <div className="flex w-full items-center justify-between">
            <h2 id="sales-upload-title" className="f-bold text-[28px] leading-[36px] text-[#1E1E28]">매출 데이터 올리기</h2>
            <button type="button" onClick={close} aria-label="닫기" disabled={busy !== null} className="flex size-[32px] items-center justify-center rounded-[8px] hover:bg-[#F4F1EA] disabled:opacity-40">
              <img alt="" src={a("e5875.svg")} className="size-[20px]" />
            </button>
          </div>
          <p className="f-regular text-[14px] leading-[22px] text-[#6B6A72]">영수증이나 엑셀 파일을 올리면 AI가 매출을 분석해요.</p>
          <Stepper step={step} />
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col border-t border-[rgba(30,30,40,0.15)] px-[32px] py-[24px]">
          {step === 1 && (
            <div className="flex min-h-0 w-full flex-1 flex-col gap-[20px]">
              <div role="tablist" aria-label="올리는 방식" className="flex h-[44px] w-full shrink-0 gap-[4px] rounded-[12px] bg-[#F4F1EA] p-[4px]">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex h-[36px] min-w-0 flex-1 items-center justify-center rounded-[8px] text-[14px] whitespace-nowrap ${tab === t.id ? "f-bold border border-[rgba(30,30,40,0.15)] bg-white text-[#1E1E28]" : "f-medium text-[#6B6A72] hover:text-[#1E1E28]"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "excel" && (
                <>
                  <DropZone accept=".xlsx,.xls,.csv" title="파일을 끌어다 놓거나 클릭해서 선택하세요" hint="xlsx, xls, csv · 최대 10MB" onFile={setFile}>
                    {file && <SelectedFile name={file.name} meta={`${(file.size / 1024).toFixed(1)}KB · 다음을 누르면 내용을 확인해요`} />}
                  </DropZone>
                  <button type="button" onClick={downloadTemplate} className="flex w-full items-center justify-center gap-[6px]">
                    <img alt="" src={a("9b8cd.svg")} className="size-[16px]" />
                    <span className="f-semibold text-[13px] text-[#1E1E28] underline">양식 파일 내려받기</span>
                  </button>
                </>
              )}

              {tab === "receipt" &&
                (receipt && !receipt.rows ? (
                  <LoadingState title="영수증을 인식하고 있어요" desc="잠시만 기다려 주세요" />
                ) : (
                  <DropZone accept="image/*" title="영수증 사진을 끌어다 놓거나 클릭해서 선택하세요" hint="jpg, png · 최대 10MB" onFile={onReceipt}>
                    {receipt?.rows && <SelectedFile name={receipt.file.name} meta={`${receipt.rows.length}건 인식했어요 · 다음을 누르면 내용을 확인해요`} preview={receipt.preview} />}
                  </DropZone>
                ))}

              {tab === "manual" && (
                <div className="flex min-h-0 w-full flex-1 flex-col gap-[12px]">
                  <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[12px] border border-[rgba(30,30,40,0.15)]">
                    <div className="f-semibold flex h-[40px] w-full shrink-0 items-center gap-[12px] bg-[#F4F1EA] px-[16px] text-[12px] text-[#6B6A72]">
                      <p className="w-[160px]">날짜</p>
                      <p className="min-w-0 flex-1">상품명</p>
                      <p className="w-[90px]">수량</p>
                      <p className="w-[150px]">금액</p>
                      <p className="w-[40px]" />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {manual.length === 0 && <p className="f-regular px-[16px] py-[28px] text-center text-[13px] text-[#9A989F]">아래 버튼으로 매출을 한 줄씩 추가해 주세요.</p>}
                      {manual.map((r) => (
                        <div key={r.id} className="flex h-[56px] w-full items-center gap-[12px] border-b border-[#eef1f5] px-[16px]">
                          <input type="date" value={r.date} onChange={(e) => updateManual(r.id, { date: e.target.value })} aria-label="날짜" className={`${manualInput} w-[160px] shrink-0`} />
                          <span className="relative flex min-w-0 flex-1 items-center">
                            <select value={r.menuId} onChange={(e) => updateManual(r.id, { menuId: e.target.value })} aria-label="상품명" className={`${manualInput} appearance-none pr-[32px]`}>
                              {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <img alt="" src={a("22c5d.svg")} className="pointer-events-none absolute right-[10px] size-[16px]" />
                          </span>
                          <input inputMode="numeric" value={r.quantity} onChange={(e) => updateManual(r.id, { quantity: e.target.value.replace(/[^0-9]/g, "") })} aria-label="수량" className={`${manualInput} w-[90px] shrink-0`} />
                          <input inputMode="numeric" value={r.amount} onChange={(e) => updateManual(r.id, { amount: e.target.value.replace(/[^0-9]/g, ""), amountTouched: true })} aria-label="금액" placeholder="금액" className={`${manualInput} w-[150px] shrink-0`} />
                          <button type="button" onClick={() => setManual((m) => m.filter((x) => x.id !== r.id))} aria-label="행 삭제" className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] hover:bg-[#F4F1EA]">
                            <img alt="" src={a("b3b18.svg")} className="size-[16px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={addManual} className="flex h-[44px] w-full shrink-0 items-center justify-center gap-[8px] rounded-[12px] border border-dashed border-[#1E1E28] bg-white hover:bg-[#F1E8DA]">
                    <img alt="" src={a("9872e.svg")} className="size-[17px]" />
                    <span className="f-bold text-[14px] text-[#1E1E28]">행 추가</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 &&
            (busy === "analyze" ? (
              <div className="flex w-full flex-1 items-center">
                <LoadingState title="매출을 분석하고 있어요" desc="잠시만 기다려 주세요" />
              </div>
            ) : (
              <div className="flex min-h-0 w-full flex-1 flex-col gap-[16px]">
                <div className="flex w-full flex-wrap items-start gap-[8px]" aria-live="polite">
                  <span className="f-semibold rounded-full bg-[#F1E8DA] px-[12px] py-[7px] text-[13px] text-[#1E1E28]">총 {rows.length}건 인식</span>
                  <span className={`f-semibold rounded-full px-[12px] py-[7px] text-[13px] ${issues ? "bg-[#fff5e9] text-[#c46b12]" : "bg-[#eef8f6] text-[#477f78]"}`}>확인 필요 {issues}건</span>
                  <span className="f-semibold rounded-full bg-[#F4F1EA] px-[12px] py-[7px] text-[13px] text-[#6B6A72]">{periodText}</span>
                </div>
                <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[12px] border border-[rgba(30,30,40,0.15)]">
                  <div className="f-semibold flex h-[40px] w-full shrink-0 items-center gap-[16px] bg-[#F4F1EA] px-[16px] text-[12px] text-[#6B6A72]">
                    <p className="w-[86px]">날짜</p>
                    <p className="w-[320px]">상품명</p>
                    <p className="w-[80px]">수량</p>
                    <p className="w-[150px]">금액</p>
                    <p className="w-[132px]">상태</p>
                  </div>
                  <div className="max-h-[322px] overflow-y-auto [scrollbar-color:#b3bdcb_#eaeff5] [scrollbar-width:thin]" onScroll={(e) => setScroll(e.currentTarget.scrollTop)}>
                    {rows.map((r) => (
                      <CheckTableRow key={r.id} row={r} menus={menus} onChange={(nr) => setRows((list) => list.map((x) => (x.id === nr.id ? nr : x)))} />
                    ))}
                  </div>
                </div>
                <div className="f-regular flex w-full items-center justify-between text-[12px] whitespace-nowrap">
                  <p className="text-[#6B6A72]">상품을 확인하고, 필요한 항목은 직접 수정할 수 있어요.</p>
                  <p className="text-[#9A989F]">{rows.length}건 중 {firstVisible}–{lastVisible}건 표시</p>
                </div>
              </div>
            ))}

          {step === 3 && (
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-[20px]">
              <span className="flex size-[96px] items-center justify-center rounded-full bg-[#eef8f6]">
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#5fa99e]">
                  <img alt="" src={a("40de3.svg")} className="size-[36px]" />
                </span>
              </span>
              <div className="flex w-full flex-col items-center gap-[10px] text-center">
                <p className="f-bold text-[30px] leading-[40px] text-[#1E1E28]">분석이 끝났어요</p>
                <p className="f-regular text-[16px] text-[#6B6A72]">{committed}건의 매출 데이터를 반영했어요.</p>
              </div>
              <span className="f-semibold rounded-full bg-[#F4F1EA] px-[12px] py-[7px] text-[13px] text-[#6B6A72]">{periodText}</span>
            </div>
          )}
        </div>

        <div className="flex h-[100px] w-full shrink-0 items-center justify-between border-t border-[rgba(30,30,40,0.15)] px-[32px] py-[28px]">
          {step === 1 && (
            <>
              <button type="button" onClick={close} className={ghostBtn}>취소</button>
              <button type="button" onClick={next} disabled={!canNext} className={primaryBtn}>{busy === "parse" ? "불러오는 중..." : "다음"}</button>
            </>
          )}
          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)} disabled={busy !== null} className={ghostBtn}>이전</button>
              <button type="button" onClick={analyze} disabled={busy !== null || issues > 0 || rows.length === 0} className={primaryBtn}>분석 시작</button>
            </>
          )}
          {step === 3 && (
            <>
              <button type="button" onClick={close} className={ghostBtn}>닫기</button>
              <button type="button" onClick={close} className={primaryBtn}>성과 분석 보기</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
