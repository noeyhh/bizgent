// Single entry point for every "구독 전용" lock in the campaign flow.
// For now it shows a small hint; later this will open the real 구독 popup.

type Listener = (featureName: string) => void
const listeners = new Set<Listener>()

export function openUpgradeModal(featureName: string) {
  listeners.forEach((listener) => listener(featureName))
}

export function onUpgradeRequest(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
