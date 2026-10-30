import { createElement, useEffect, useState } from "react"

type Pattern = "confetti" | "grain" | "sparkles"

const rules: Record<Pattern, string> = {
  grain: `
    @grid: 32x20 / 100% 100%;
    :container { background: transparent; }
    @size: @r(1px, 3px);
    border-radius: 50%;
    background: @p(#047e8b, #e5aa4b, #ef8d7f, #b1d6ca);
    opacity: @r(.20, .49);
    transform: translate(@r(-7px, 7px), @r(-7px, 7px));
  `,
  confetti: `
    @grid: 19x10 / 100% 100%;
    :container { background: transparent; }
    @size: @r(3px, 8px);
    border: @p(1px solid #087e8b, 2px solid #efa64c, 1px solid #f19988);
    background: @p(transparent, transparent, #f9d8a8, #c9ebea);
    opacity: @r(.28, .66);
    border-radius: @p(100%, 3px, 45%);
    transform: rotate(@r(-65deg, 65deg));
  `,
  sparkles: `
    @grid: 12x7 / 100% 100%;
    :container { background: transparent; }
    @size: @r(5px, 12px);
    background: @p(#e9b54d, #0e939c, #e5938d);
    opacity: @r(.16, .4);
    clip-path: polygon(50% 0, 65% 40%, 100% 50%, 65% 60%, 50% 100%, 35% 60%, 0 50%, 35% 40%);
  `,
}

export default function PatternField({
  variant = "grain",
  className = "",
}: {
  variant?: Pattern
  className?: string
}) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    void import("css-doodle").then(() => {
      if (active) setReady(true)
    }).catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return (
    <div className={`pattern-field ${className}`} aria-hidden="true">
      {ready ? createElement("css-doodle", { className: "pattern-doodle" }, rules[variant]) : null}
    </div>
  )
}
