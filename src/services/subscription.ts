// Single entry point for every "구독하기" / "플랜 업그레이드" action.
// For now it only shows a notice; replace requestSubscribe() with the payment flow later.

type Listener = (message: string) => void
const listeners = new Set<Listener>()

export const SUBSCRIBE_COMING_SOON = "구독 기능은 곧 열릴 예정이에요"

export function requestSubscribe() {
  listeners.forEach((listener) => listener(SUBSCRIBE_COMING_SOON))
}

export function onSubscribeNotice(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
