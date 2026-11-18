import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { EntryBrand } from "../components/EntryBrand"
import { TermsModal } from "../components/TermsModal"
import { useAppStore } from "../store/AppContext"
import { AuthField } from "./LoginPage"

export function SignupPage() {
  const navigate = useNavigate()
  const { data, setData } = useAppStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordCheck, setPasswordCheck] = useState("")
  const [storeName, setStoreName] = useState("")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordCheck: "",
    storeName: "",
  })

  const agree = () => {
    setData((current) => ({
      ...current,
      termsAgreed: true,
      startIntent: current.startIntent ?? "start",
    }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = {
      email: email.trim() ? "" : "이메일을 입력해주세요",
      password: password ? "" : "비밀번호를 입력해주세요",
      passwordCheck: !passwordCheck
        ? "비밀번호 확인을 입력해주세요"
        : password === passwordCheck
          ? ""
          : "비밀번호가 일치하지 않습니다",
      storeName: storeName.trim() ? "" : "매장명을 입력해주세요",
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    // Landing CTA "매장 대표 이미지 무료 생성하기" lands on /store with the AI image modal open.
    const heroIntent = data.startIntent === "heroImage"
    setData((current) => ({
      ...current,
      startIntent: heroIntent ? null : current.startIntent,
      loggedIn: true,
      user: { ...current.user, name: storeName.trim(), email: email.trim() },
      store: { ...current.store, name: storeName.trim() },
    }))
    navigate(heroIntent ? "/store?imageCard=open" : "/")
  }

  return (
    <div className="entry-editorial pd-scope flex min-h-screen flex-col items-center justify-center gap-[28px] bg-[#F4F1EA] px-[24px] py-[72px]">
      <EntryBrand />
      <form onSubmit={submit} className="flex w-[480px] max-w-full flex-col gap-[28px] rounded-[22px] border border-[rgba(30,30,40,0.15)] bg-white p-[40px] shadow-[0_10px_30px_rgba(30,30,40,0.06)] max-sm:p-[28px]">
        <div className="text-center">
          <h1 className="text-[34px] leading-[36px] font-extrabold tracking-[-0.03em] text-[#1E1E28]">회원가입</h1>
          <p className="mt-[8px] text-[16px] leading-[22px] font-medium text-[#6B6A72]">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>
        </div>
        <div className="flex flex-col gap-[20px]">
          <AuthField
            compact
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
            compact
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
          <AuthField
            compact
            label="비밀번호 확인"
            type="password"
            value={passwordCheck}
            onChange={(value) => {
              setPasswordCheck(value)
              if (errors.passwordCheck) {
                setErrors((current) => ({ ...current, passwordCheck: "" }))
              }
            }}
            placeholder="비밀번호를 다시 입력하세요"
            error={errors.passwordCheck}
          />
          <AuthField
            compact
            label="매장명"
            value={storeName}
            onChange={(value) => {
              setStoreName(value)
              if (errors.storeName) {
                setErrors((current) => ({ ...current, storeName: "" }))
              }
            }}
            placeholder="매장명을 입력하세요"
            error={errors.storeName}
          />
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="flex size-[20px] items-center justify-center rounded-[6px] border-2 border-[#D9643A] bg-[#F6D9CF]">
            <img alt="" src="/assets/62ab4.svg" className="size-[12px]" />
          </span>
          <p className="text-[14px] font-medium text-[#6B6A72]">이용약관 및 개인정보처리방침에 동의합니다</p>
        </div>
        <button type="submit" className="btn-primary h-[56px] rounded-full bg-[#1E1E28] text-[19px] font-bold text-white">가입하기</button>
        <p className="text-center text-[16px] font-medium text-[#6B6A72]">
          이미 계정이 있으신가요? <Link to="/login" className="link-hover font-bold text-[#D9643A]">로그인</Link>
        </p>
      </form>
      <TermsModal open={!data.termsAgreed} onClose={() => navigate("/landing")} onAgree={agree} />
    </div>
  )
}
