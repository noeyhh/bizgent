type PlaceholderPageProps = {
  title: string
  description: string
  standalone?: boolean
}

export function PlaceholderPage({
  title,
  description,
  standalone = false,
}: PlaceholderPageProps) {
  return (
    <div
      className={
        standalone
          ? "grid min-h-screen place-items-center bg-slate-50 p-10"
          : "p-12"
      }
    >
      <section
        className={
          standalone
            ? "w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-12 text-center"
            : ""
        }
      >
        <p className="text-sm font-semibold text-brand-600">BizGent</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 text-base text-slate-500">{description}</p>
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
          다음 디자인을 기다리고 있습니다.
        </div>
      </section>
    </div>
  )
}
