export const wizardSteps = [
  { path: "1", code: "1", label: "목표 설정" },
  { path: "2", code: "2", label: "AI 기획" },
  { path: "3-1", code: "3-1", label: "콘텐츠 설정" },
  { path: "3-2", code: "3-2", label: "이미지 설정" },
  { path: "4", code: "4", label: "시안 비교" },
  { path: "5", code: "5", label: "게시" },
] as const

// Connector geometry from the design (900px wide stepper).
const connectors = [
  { left: 81, width: 122 },
  { left: 235, width: 116 },
  { left: 395, width: 110 },
  { left: 549, width: 116 },
  { left: 697, width: 122 },
]

type WizardStepperProps = {
  /** Index (0-5) of the current step. */
  currentStep: number
  /** When false, the 이미지 설정 step is shown as skipped. */
  imageEnabled?: boolean
  className?: string
}

export function WizardStepper({ currentStep, imageEnabled = true, className = "" }: WizardStepperProps) {
  return (
    <ol className={`relative h-[72px] w-[900px] shrink-0 ${className}`} aria-label="캠페인 생성 단계">
      {connectors.map((c, i) => (
        <li
          key={i}
          aria-hidden="true"
          className={`absolute top-[15px] h-[2px] ${i < currentStep ? "bg-[#1E1E28]" : "bg-[#D4D0C9]"}`}
          style={{ left: c.left, width: c.width }}
        />
      ))}
      {wizardSteps.map((step, i) => {
        const state = i === currentStep ? "current" : i < currentStep ? "done" : "upcoming"
        const skipped = step.path === "3-2" && !imageEnabled
        const wide = step.code.length > 1
        return (
          <li
            key={step.path}
            aria-current={state === "current" ? "step" : undefined}
            className={`absolute top-0 flex h-[72px] w-[130px] flex-col items-center ${skipped ? "opacity-40" : ""}`}
            style={{ left: i * 154 }}
          >
            <span
              className={[
                "f-bold flex h-[32px] items-center justify-center rounded-full text-[11px]",
                wide ? "w-[44px]" : "w-[32px]",
                state === "current"
                  ? "bg-[#1E1E28] text-white"
                  : state === "done"
                    ? "border border-[#1E1E28] bg-white text-[#1E1E28]"
                    : "border border-[#D4D0C9] bg-white text-[#9A989F]",
              ].join(" ")}
            >
              {step.code}
            </span>
            <span
              className={`mt-[12px] text-[13px] whitespace-nowrap ${
                state === "upcoming" ? "f-medium text-[#9A989F]" : "f-bold text-[#1E1E28]"
              }`}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
