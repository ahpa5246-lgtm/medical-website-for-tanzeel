import { useEffect, useRef, type ReactNode } from "react"

export default function HandUnderline({
  children,
  color = "#e8ac49",
  type = "underline",
}: {
  children: ReactNode
  color?: string
  type?: "underline" | "circle" | "highlight"
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let active = true
    let cleanup: (() => void) | undefined
    void import("rough-notation")
      .then(({ annotate }) => {
        if (!active) return
        const motion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
        const annotation = annotate(el, {
          type,
          color,
          strokeWidth: 2.8,
          padding: 3,
          multiline: true,
          rtl: true,
          animate: !motion,
          animationDuration: 650,
        })
        annotation.show()
        cleanup = () => annotation.remove()
      })
      .catch(() => {})
    return () => {
      active = false
      cleanup?.()
    }
  }, [color, type])
  return (
    <span className="hand-underlined" ref={ref}>
      {children}
    </span>
  )
}
