type WizardPlaceholderPageProps = {
  title: string
  stepLabel: string
}

export function WizardPlaceholderPage({
  title,
  stepLabel,
}: WizardPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-4xl p-12">
      <p className="text-sm font-semibold text-brand-600">{stepLabel}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 text-base text-slate-500">
        캠페인 생성을 위한 화면이 이곳에 구성됩니다.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-sm text-slate-400">
        다음 디자인을 기다리고 있습니다.
      </div>
    </div>
  )
}
