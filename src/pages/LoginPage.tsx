import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { EntryBrand } from "../components/EntryBrand"
import { useAppStore } from "../store/AppContext"

export function LoginPage() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ email: "", password: "" })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = {
      email: email.trim() ? "" : "이메일을 입력해주세요",
      password: password.trim() ? "" : "비밀번호를 입력해주세요",
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    // Landing CTA "매장 대표 이미지 무료 생성하기" lands on /store with the AI image modal open.
    const heroIntent = data.startIntent === "heroImage"
    setData((current) => ({
      ...current,
      startIntent: heroIntent ? null : current.startIntent,
      loggedIn: true,
      user: { ...current.user, email: email.trim() },
    }))
    navigate(heroIntent ? "/store?imageCard=open" : "/")
  }

  return (
    <div className="entry-editorial auth-page pd-scope relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F1EA] px-[24px] py-[64px]">
      <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
        <header className="flex h-[88px] items-center justify-between px-[120px] py-[20px]">
          <EntryBrand light />
          <nav className="flex items-center gap-[32px] text-[15px] font-medium text-white">
            <span>기능 소개</span><span>요금제</span>
            <span className="rounded-[12px] flex h-[44px] items-center border border-white px-[20px] text-[15px] font-semibold">무료로 시작하기</span>
          </nav>
        </header>
        <div className="flex flex-col items-center pt-[24px] text-center">
          <p className="rounded-full bg-white/20 px-[14px] py-[8px] text-[13px] font-semibold text-white">소상공인을 위한 AI 마케팅 에이전트</p>
          <h1 className="mt-[12px] text-[48px] leading-[1.25] font-extrabold text-white">매장 마케팅을, <span className="text-[#ffd60a]">AI</span> 가 기획하다</h1>
          <p className="mt-[8px] text-[16px] leading-[1.6] font-normal text-[#f0f5fa]">타겟 고객 분석부터 콘텐츠 제작, 게시까지 AI가 한 번에 해결해드립니다.<br />마케팅 전문가 없어도, 광고 문구 몰라도 BizGent가 함께 하겠습니다.</p>
          <img alt="" src="/assets/a6c40.png" className="mt-[100px] h-[452px] w-[1251px] rounded-[40px] object-cover opacity-0" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-transparent" aria-hidden="true" />

      <div className="relative z-10 flex w-full flex-col items-center gap-[28px]">
        <EntryBrand light large />
        <form onSubmit={submit} className="flex w-[480px] max-w-full flex-col gap-[28px] rounded-[22px] border border-[rgba(30,30,40,0.15)] bg-white p-[40px] shadow-[0_10px_30px_rgba(30,30,40,0.06)] max-sm:p-[28px]">
          <div className="text-center">
            <h2 className="text-[34px] leading-[36px] font-extrabold tracking-[-0.03em] text-[#1E1E28]">로그인</h2>
            <p className="mt-[8px] text-[17px] leading-[22px] font-medium text-[#6B6A72]">BizGent와 함께 매장 마케팅을 시작하세요</p>
          </div>
          <div className="flex flex-col gap-[16px]">
            <AuthField
              label="이메일"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value)
                if (errors.email) setErrors((current) => ({ ...current, email: "" }))
              }}
              placeholder="이메일을 입력하세요"
              error={errors.email}
            />
            <AuthField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                if (errors.password) setErrors((current) => ({ ...current, password: "" }))
              }}
              placeholder="비밀번호를 입력하세요"
              error={errors.password}
            />
          </div>
          <button type="submit" className="btn-primary h-[56px] rounded-full bg-[#1E1E28] text-[19px] font-bold text-white">로그인</button>
          <p className="text-center text-[17px] font-medium text-[#6B6A72]">
            계정이 없으신가요? <Link to="/signup" className="link-hover font-bold text-[#D9643A]">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  compact = false,
  error = "",
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  compact?: boolean
  error?: string
}) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className={`font-bold text-[#1E1E28] ${compact ? "text-[16px]" : "text-[17px]"}`}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-[56px] rounded-[14px] border bg-white px-[16px] font-normal text-[#1E1E28] outline-none placeholder:text-[#9A989F] focus:border-[#D9643A] ${error ? "border-[#B94B3C]" : "border-[rgba(30,30,40,0.15)]"} ${compact ? "text-[16px]" : "text-[18px]"}`}
      />
      {error && (
        <span className="text-[13px] font-medium text-[#B94B3C]">
          {error}
        </span>
      )}
    </label>
  )
}
