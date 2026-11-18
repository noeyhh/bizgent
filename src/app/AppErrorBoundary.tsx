import { Component, type ErrorInfo, type ReactNode } from "react"

type AppErrorBoundaryProps = {
  children: ReactNode
  resetDemoData: () => void
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("BizGent route error", error, info)
  }

  private reset = () => {
    this.props.resetDemoData()
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] p-[40px]">
        <div className="w-[420px] rounded-[20px] border border-[#e5eaf1] bg-white p-[32px] text-center shadow-[0px_12px_32px_rgba(16,24,40,0.08)]">
          <h1 className="f-bold text-[26px] text-[#172033]">문제가 발생했어요</h1>
          <div className="mt-[28px] flex justify-center gap-[10px]">
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="f-semibold h-[46px] rounded-full border border-[#d0d7e2] bg-white px-[20px] text-[15px] text-[#667085]"
            >
              홈으로
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="f-semibold h-[46px] rounded-full bg-[#2563eb] px-[20px] text-[15px] text-white"
            >
              데모 데이터 초기화
            </button>
          </div>
        </div>
      </div>
    )
  }
}
