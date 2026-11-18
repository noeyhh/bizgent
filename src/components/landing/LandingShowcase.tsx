import { useEffect, useRef, useState } from "react"
import type {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react"

type Channel = "인스타그램" | "블로그" | "당근마켓" | "광고 이미지" | "카카오톡 채널"

type CardRatio = "portrait" | "square" | "tall"

type ImageCard = {
  kind: "image"
  image: string
  alt: string
  caption: string
  channel: Channel
  ratio: CardRatio
}

type TextCard = {
  kind: "text"
  label: string
  title: string
  sub: string
  channel: Channel
  background: "#F1E8DA" | "#D9643A" | "#1E1E28" | "#E7EAFB" | "#ECE8D3" | "#B9AF7A"
  foreground: "#1E1E28" | "#FFFFFF"
  accent: "#D9643A" | "#B9AF7A" | "#8E9BE6" | "#F1E8DA"
  ratio: CardRatio
}

type Card = ImageCard | TextCard
interface CardDimensions {
  width: number
  height: number
}

const cards: Card[] = [
  {
    kind: "image",
    image: "2cbe7.png",
    alt: "밤 라떼와 밤 페이스트리",
    caption: "고소한 밤 라떼, 이번 주만 만나요",
    channel: "인스타그램",
    ratio: "portrait",
  },
  {
    kind: "text",
    label: "NEW MENU",
    title: "가을 신메뉴\n고구마 라떼 출시",
    sub: "달콤한 군고구마 향 가득",
    channel: "인스타그램",
    background: "#F1E8DA",
    foreground: "#1E1E28",
    accent: "#D9643A",
    ratio: "square",
  },
  {
    kind: "image",
    image: "afdbb.png",
    alt: "창가의 브런치 테이블",
    caption: "창가 자리에서 여유로운 브런치",
    channel: "블로그",
    ratio: "tall",
  },
  {
    kind: "text",
    label: "LUNCH SPECIAL",
    title: "점심 특가\n떡볶이 4,900원",
    sub: "평일 11:30 – 14:00",
    channel: "당근마켓",
    background: "#D9643A",
    foreground: "#FFFFFF",
    accent: "#F1E8DA",
    ratio: "portrait",
  },
  {
    kind: "image",
    image: "eece9.png",
    alt: "정성스럽게 포장한 추석 선물세트",
    caption: "정성 담은 추석 선물세트 예약",
    channel: "광고 이미지",
    ratio: "square",
  },
  {
    kind: "text",
    label: "NOTICE",
    title: "추석 연휴\n휴무 안내",
    sub: "9.16(월) – 9.18(수) 휴무",
    channel: "카카오톡 채널",
    background: "#E7EAFB",
    foreground: "#1E1E28",
    accent: "#8E9BE6",
    ratio: "tall",
  },
  {
    kind: "image",
    image: "2d925.png",
    alt: "갓 구운 크루아상과 따뜻한 라떼",
    caption: "갓 구운 크루아상과 따뜻한 라떼 한 잔",
    channel: "광고 이미지",
    ratio: "portrait",
  },
  {
    kind: "text",
    label: "COUPON",
    title: "재방문 고객\n10% 할인 쿠폰",
    sub: "다음 방문 시 바로 사용",
    channel: "카카오톡 채널",
    background: "#1E1E28",
    foreground: "#FFFFFF",
    accent: "#D9643A",
    ratio: "square",
  },
  {
    kind: "image",
    image: "a299e.png",
    alt: "포장 주문을 준비하는 베이커리",
    caption: "포장 주문하면 쿠키 하나 더",
    channel: "당근마켓",
    ratio: "tall",
  },
  {
    kind: "text",
    label: "WEEKEND ONLY",
    title: "주말 한정\n디저트 세트",
    sub: "음료 + 케이크 9,900원",
    channel: "인스타그램",
    background: "#F1E8DA",
    foreground: "#1E1E28",
    accent: "#D9643A",
    ratio: "portrait",
  },
  {
    kind: "image",
    image: "d26d2.png",
    alt: "햇살 아래 놓인 디저트 접시",
    caption: "햇살 좋은 오후, 디저트 한 접시",
    channel: "인스타그램",
    ratio: "square",
  },
  {
    kind: "text",
    label: "FLOWER",
    title: "꽃다발\n예약 주문 받아요",
    sub: "기념일 3일 전까지 예약",
    channel: "블로그",
    background: "#ECE8D3",
    foreground: "#1E1E28",
    accent: "#B9AF7A",
    ratio: "tall",
  },
  {
    kind: "text",
    label: "BLACK FRIDAY",
    title: "11월\n블랙프라이데이 세일",
    sub: "전 품목 최대 30%",
    channel: "광고 이미지",
    background: "#1E1E28",
    foreground: "#FFFFFF",
    accent: "#D9643A",
    ratio: "portrait",
  },
  {
    kind: "text",
    label: "GRAND OPEN",
    title: "신규 오픈\n기념 이벤트",
    sub: "첫 방문 아메리카노 무료",
    channel: "당근마켓",
    background: "#D9643A",
    foreground: "#FFFFFF",
    accent: "#F1E8DA",
    ratio: "square",
  },
  {
    kind: "text",
    label: "HAIR SALON",
    title: "첫 방문 고객\n커트 20% 할인",
    sub: "평일 예약 시 적용",
    channel: "인스타그램",
    background: "#F1E8DA",
    foreground: "#1E1E28",
    accent: "#D9643A",
    ratio: "tall",
  },
  {
    kind: "text",
    label: "BAKERY",
    title: "오후 3시,\n소금빵 나오는 시간",
    sub: "매일 한정 40개",
    channel: "당근마켓",
    background: "#E7EAFB",
    foreground: "#1E1E28",
    accent: "#8E9BE6",
    ratio: "portrait",
  },
  {
    kind: "text",
    label: "NAIL",
    title: "가을 컬러\n네일 아트",
    sub: "이달의 디자인 10종",
    channel: "인스타그램",
    background: "#B9AF7A",
    foreground: "#1E1E28",
    accent: "#D9643A",
    ratio: "square",
  },
  {
    kind: "text",
    label: "RESTAURANT",
    title: "비 오는 날\n파전 + 막걸리 세트",
    sub: "저녁 6시부터",
    channel: "인스타그램",
    background: "#1E1E28",
    foreground: "#FFFFFF",
    accent: "#D9643A",
    ratio: "tall",
  },
  {
    kind: "text",
    label: "REVIEW EVENT",
    title: "리뷰 남기면\n음료 1잔 무료",
    sub: "영수증 리뷰 인증 시",
    channel: "카카오톡 채널",
    background: "#ECE8D3",
    foreground: "#1E1E28",
    accent: "#B9AF7A",
    ratio: "portrait",
  },
  {
    kind: "text",
    label: "CHRISTMAS",
    title: "크리스마스 케이크\n사전 예약",
    sub: "12월 20일까지",
    channel: "블로그",
    background: "#D9643A",
    foreground: "#FFFFFF",
    accent: "#F1E8DA",
    ratio: "square",
  },
]

const cardSize: Record<CardRatio, CardDimensions> = {
  portrait: { width: 288, height: 360 },
  square: { width: 340, height: 340 },
  tall: { width: 270, height: 360 },
}

const grainPattern =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.46'/%3E%3C/svg%3E\")"

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))
const padNumber = (value: number) => String(value).padStart(2, "0")
const cardLabel = (card: Card) =>
  (card.kind === "image" ? card.caption : card.title).replace(/\n/g, " ")

function CardFace({ card }: { card: Card }) {
  if (card.kind === "image") {
    return (
      <div className="relative size-full bg-[#FAF7F0] p-[8px]">
        <div className="relative size-full overflow-hidden">
          <img
            alt={card.alt}
            src={`/assets/${card.image}`}
            className="size-full object-cover"
            style={{
              filter:
                "saturate(0.85) contrast(0.95) sepia(0.08) brightness(1.02)",
            }}
            loading="lazy"
            draggable={false}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 mix-blend-multiply"
            style={{ backgroundImage: grainPattern }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex size-full flex-col p-[28px] text-left"
      style={{ backgroundColor: card.background, color: card.foreground }}
    >
      <span className="text-[11px] font-bold tracking-[0.18em]">
        {card.label}
      </span>
      <span
        className="mt-[13px] block h-[3px] w-[34px]"
        style={{ backgroundColor: card.accent }}
      />
      <div className="mt-auto">
        <p className="text-[27px] leading-[1.12] font-bold tracking-[-0.04em] whitespace-pre-line">
          {card.title}
        </p>
        <p className="mt-[12px] text-[13px] leading-[1.45] font-medium opacity-75">
          {card.sub}
        </p>
        <span
          className={`mt-[18px] inline-flex w-fit rounded-full border px-[10px] py-[5px] text-[11px] font-semibold ${
            card.foreground === "#FFFFFF"
              ? "border-white/35 bg-white text-[#1E1E28]"
              : "border-[rgba(30,30,40,0.16)] bg-white/80 text-[#1E1E28]"
          }`}
        >
          {card.channel}
        </span>
      </div>
    </div>
  )
}

function CardOverlay({
  card,
  centered,
  compact,
  onStart,
}: {
  card: Card
  centered: boolean
  compact: boolean
  onStart: () => void
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-[rgba(30,30,40,0.58)] p-[22px] text-left text-white transition-opacity duration-200 ${
        compact && centered
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      }`}
    >
      {card.kind === "image" && (
        <>
          <p className="max-w-[230px] text-[20px] leading-[1.3] font-bold tracking-[-0.025em]">
            {card.caption}
          </p>
          <span className="mt-[9px] w-fit rounded-full border border-white/45 px-[9px] py-[4px] text-[11px] font-semibold text-white">
            {card.channel}
          </span>
        </>
      )}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onStart()
        }}
        className="pointer-events-auto mt-[18px] w-fit rounded-full bg-white px-[16px] py-[10px] text-[13px] font-bold text-[#1E1E28] shadow-[0_6px_18px_rgba(30,30,40,0.16)]"
      >
        이 스타일로 만들어보기
      </button>
    </div>
  )
}

export function LandingShowcase({ onStart }: { onStart: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const mobileScrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startPosition: 0,
  })
  const [position, setPosition] = useState(0)
  const [current, setCurrent] = useState(0)
  const [compact, setCompact] = useState(false)
  const [stageWidth, setStageWidth] = useState(1200)

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)")
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setCompact(mobileQuery.matches || motionQuery.matches)
    update()
    mobileQuery.addEventListener("change", update)
    motionQuery.addEventListener("change", update)
    return () => {
      mobileQuery.removeEventListener("change", update)
      motionQuery.removeEventListener("change", update)
    }
  }, [])

  useEffect(() => {
    if (!stageRef.current) return
    const observer = new ResizeObserver(([entry]) =>
      setStageWidth(entry.contentRect.width),
    )
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [compact])

  const centerCard = (index: number) => {
    const next = clamp(index, 0, cards.length - 1)
    setCurrent(next)
    if (compact) {
      mobileScrollerRef.current
        ?.querySelector<HTMLElement>(`[data-card-index="${next}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        })
    } else {
      setPosition(next)
    }
  }

  const moveBy = (direction: number) => centerCard(current + direction)

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
    setPosition((value) => {
      const next = clamp(value + delta / 360, 0, cards.length - 1)
      setCurrent(Math.round(next))
      return next
    })
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startPosition: position,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    const deltaX = event.clientX - dragRef.current.startX
    if (Math.abs(deltaX) > 5) dragRef.current.moved = true
    const next = clamp(
      dragRef.current.startPosition - deltaX / 280,
      0,
      cards.length - 1,
    )
    setPosition(next)
    setCurrent(Math.round(next))
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    const snapped = Math.round(position)
    setPosition(snapped)
    setCurrent(snapped)
  }

  const renderCard = (
    card: Card,
    index: number,
    style?: React.CSSProperties,
  ) => {
    const centered = index === current
    const { width, height } = cardSize[card.ratio]

    return (
      <article
        key={`${card.kind}-${index}`}
        data-card-index={index}
        tabIndex={0}
        aria-label={cardLabel(card)}
        onClick={() => {
          if (!dragRef.current.moved && !centered) centerCard(index)
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !centered) {
            event.preventDefault()
            centerCard(index)
          }
        }}
        className={`group overflow-hidden rounded-[20px] border border-[rgba(30,30,40,0.14)] bg-[#FAF7F0] shadow-[0_16px_38px_rgba(30,30,40,0.13)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9643A] ${
          compact
            ? "relative shrink-0 snap-center"
            : "absolute top-1/2 left-1/2"
        }`}
        style={{
          width,
          height,
          ...style,
        }}
      >
        <CardFace card={card} />
        <CardOverlay
          card={card}
          centered={centered}
          compact={compact}
          onStart={() => (centered ? onStart() : centerCard(index))}
        />
      </article>
    )
  }

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      className="overflow-hidden border-t border-[rgba(30,30,40,0.10)] bg-white py-[96px]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-[24px] text-center">
        <span className="font-semibold rounded-full bg-[#ECE8D3] px-[12px] py-[6px] text-[13px] text-[#575130]">
          AI 제작 예시
        </span>
        <h2
          id="showcase-title"
          className="font-bold mt-[14px] text-[32px] leading-[1.3] tracking-[-0.03em] text-[#1E1E28] max-sm:text-[28px]"
        >
          우리 가게 홍보물, <span className="text-[#1E1E28]">AI</span>가 바로
          만들어요
        </h2>
        <p className="font-normal mt-[12px] max-w-[620px] text-[16px] leading-[1.7] text-[#6B6A72]">
          카페, 음식점, 꽃집, 뷰티샵까지 업종에 맞는 SNS 게시물과 광고 이미지를
          몇 분 만에 받아보세요.
        </p>
        <div className="mt-[28px] flex items-center gap-[12px]">
          <button
            type="button"
            onClick={onStart}
            className="btn-primary h-[44px] rounded-full bg-[#1E1E28] px-[24px] text-[15px] font-semibold text-white"
          >
            무료로 시작하기
          </button>
          <button
            type="button"
            onClick={() => moveBy(1)}
            className="btn-outline h-[44px] rounded-full border border-[rgba(30,30,40,0.15)] bg-white px-[24px] text-[15px] font-semibold text-[#1E1E28]"
          >
            예시 더 보기
          </button>
        </div>
      </div>

      <div className="mx-auto mt-[52px] max-w-[1320px] px-[24px]">
        {compact ? (
          <div
            ref={mobileScrollerRef}
            aria-label="AI 제작 예시 갤러리"
            className="-mx-[24px] flex snap-x snap-mandatory items-center gap-[14px] overflow-x-auto px-[calc(50vw-144px)] py-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect()
              const center = bounds.left + bounds.width / 2
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  "[data-card-index]",
                ),
              )
              let nearest = 0
              let nearestDistance = Number.POSITIVE_INFINITY
              items.forEach((item, index) => {
                const itemBounds = item.getBoundingClientRect()
                const distance = Math.abs(
                  itemBounds.left + itemBounds.width / 2 - center,
                )
                if (distance < nearestDistance) {
                  nearest = index
                  nearestDistance = distance
                }
              })
              setCurrent(nearest)
            }}
          >
            {cards.map((card, index) => renderCard(card, index))}
          </div>
        ) : (
          <div
            ref={stageRef}
            aria-label="AI 제작 예시 갤러리"
            className="relative h-[500px] cursor-grab touch-none overflow-hidden active:cursor-grabbing"
            style={{ perspective: "1200px" }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {cards.map((card, index) => {
              const distance = index - position
              const absoluteDistance = Math.abs(distance)
              const x = distance * Math.min(300, stageWidth * 0.235)
              const rotateY = clamp(-distance * 18, -35, 35)
              const scale = Math.max(0.72, 1 - absoluteDistance * 0.075)
              return renderCard(card, index, {
                transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${-absoluteDistance * 70}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: Math.max(0.28, 1 - absoluteDistance * 0.16),
                zIndex: 100 - Math.round(absoluteDistance * 10),
                transformStyle: "preserve-3d",
                transition:
                  "transform 160ms linear, opacity 180ms linear, box-shadow 180ms ease",
                willChange: "transform, opacity",
              })
            })}
          </div>
        )}

        <div className="mt-[8px] flex items-center justify-between text-[11px] font-semibold tracking-[0.14em] text-[#8A897F]">
          <span>SCROLL TO EXPLORE</span>
          <div className="flex items-center gap-[14px]">
            {!compact && (
              <div className="flex gap-[6px]">
                <button
                  type="button"
                  onClick={() => moveBy(-1)}
                  aria-label="이전 예시"
                  className="carousel-arrow flex size-[38px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white"
                >
                  <img
                    alt=""
                    src="/assets/5ad06.svg"
                    className="size-[16px] rotate-180"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => moveBy(1)}
                  aria-label="다음 예시"
                  className="carousel-arrow flex size-[38px] items-center justify-center rounded-full border border-[rgba(30,30,40,0.15)] bg-white"
                >
                  <img alt="" src="/assets/5ad06.svg" className="size-[16px]" />
                </button>
              </div>
            )}
            <span className="min-w-[58px] text-right text-[#6B6A72]">
              {padNumber(current + 1)} — {padNumber(cards.length)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
