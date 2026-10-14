import { Suspense, useLayoutEffect, useRef, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import RouteAnnouncer from "./RouteAnnouncer"
import { LoadingState } from "./AsyncState"
import { animateRouteEntry } from "./routeMotion.mjs"

function CommittedSurface({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const main =
      document.getElementById("main-content") ??
      ref.current?.querySelector("main") ??
      ref.current
    if (main) main.tabIndex = -1
    const title = ref.current?.querySelector("h1")?.textContent
    if (title) document.title = `${title} — ميدكونكت`
    main?.focus({ preventScroll: true })
    return animateRouteEntry(
      ref.current,
      window.matchMedia?.("(prefers-reduced-motion: reduce)"),
    )
  }, [pathname])
  return (
    <div ref={ref} className="route-surface" data-route-surface={pathname}>
      {children}
      <RouteAnnouncer />
    </div>
  )
}

export default function RouteSurface({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState label="جارٍ تحميل الصفحة…" />}>
      <CommittedSurface>{children}</CommittedSurface>
    </Suspense>
  )
}
