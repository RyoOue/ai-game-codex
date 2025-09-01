/* Minimal GA4 wrapper with safe no-ops when GA ID is not set. */

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export const GA_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID as any

let initialized = false

export function initAnalytics() {
  if (initialized) return
  initialized = true
  if (!GA_ID) return
  // inject gtag script
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // @ts-ignore
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}

function gtagEvent(name: string, params?: Record<string, any>) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', name, params || {})
}

export function trackEvent(name: string, params?: Record<string, any>) {
  gtagEvent(name, params)
}

export function trackPage(page: string) {
  gtagEvent('page_view', {
    page_title: page,
    page_location: location.href,
    page_path: location.pathname + location.search,
  })
}

export function trackChoice(scene: string, choice: { id: string; label?: string; next?: string }) {
  gtagEvent('choice_select', { scene, choice_id: choice.id, label: choice.label, next: choice.next })
}

export function trackMinigameStart(scene: string) {
  gtagEvent('minigame_start', { scene })
}

export function trackMinigameComplete(scene: string, score: number, total: number) {
  gtagEvent('minigame_complete', { scene, score, total })
}

export function trackMeterUpdate(meter: string, delta: number, value: number) {
  gtagEvent('meter_update', { meter, delta, value })
}

export function trackGameStart() {
  gtagEvent('game_start')
}

export function trackGameComplete(totalScore: number) {
  gtagEvent('game_complete', { score_total: totalScore })
}

export function trackCta(position: string) {
  gtagEvent('cta_click', { position })
}

