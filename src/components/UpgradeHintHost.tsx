import { useEffect, useState } from "react"
import { Link } from "react-router"
import { onUpgradeRequest } from "../services/upgrade"

/** Renders the small upgrade hint requested via openUpgradeModal(). */
export function UpgradeHintHost() {
  const [feature, setFeature] = useState<string | null>(null)

  useEffect(() => onUpgradeRequest(setFeature), [])
  useEffect(() => {
    if (!feature) return
    const t = setTimeout(() => setFeature(null), 3000)
    return () => clearTimeout(t)
  }, [feature])

  if (!feature) return null
  return (
    <div
      role="status"
      className="fixed bottom-[108px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[10px] rounded-full border border-[#e5eaf1] bg-white px-[18px] py-[10px] shadow-[0px_10px_24px_0px_rgba(16,24,40,0.12)]"
    >
      <span className="f-bold rounded-full bg-[#f0edff] px-[8px] py-[3px] text-[11px] text-[#6d4aff]">구독 전용</span>
      <p className="f-regular text-[13px] whitespace-nowrap text-[#667085]">
        {feature}은(는) 구독 플랜에서 사용할 수 있어요 ·{" "}
        <Link to="/subscription" className="f-bold text-[#2563eb] hover:underline">요금제 보기</Link>
      </p>
    </div>
  )
}
