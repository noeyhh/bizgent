import { useEffect, useState } from "react"
import { onSubscribeNotice } from "../services/subscription"

/** Shows the toast requested via requestSubscribe(). */
export function SubscribeToastHost() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => onSubscribeNotice(setMessage), [])
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null
  return (
    <div role="status" className="fixed bottom-[40px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[8px] rounded-full bg-[#172033] px-[18px] py-[11px] shadow-[0px_10px_24px_0px_rgba(16,24,40,0.18)]">
      <span className="flex size-[18px] items-center justify-center rounded-full bg-[#2563eb]">
        <img alt="" src="/assets/a244b.svg" className="size-[11px]" />
      </span>
      <p className="f-semibold text-[14px] whitespace-nowrap text-white">{message}</p>
    </div>
  )
}
