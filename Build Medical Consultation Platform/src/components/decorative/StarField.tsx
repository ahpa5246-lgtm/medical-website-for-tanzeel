import { useMemo } from "react"

type Star = {
  id: number
  x: number // % from left
  startY: number // % from bottom
  size: number // px
  dur: number // animation seconds
  delay: number // animation-delay (negative = already in progress)
  opacity: number
  glow: boolean
}

// Deterministic distribution using golden-ratio spacing — stable across renders
function buildStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const phi = 137.508 // golden angle °
    const x = (i * phi) % 100
    const startY = ((i * 47.3 + 13.7) % 110) - 5 // some start slightly below viewport
    const sizeSlot = i % 5 // 0-4
    const size = [1, 1.3, 1.8, 2.4, 3.0][sizeSlot]
    const dur = 7 + (i % 9) * 1.4 // 7 – 19.2 s
    const delay = -((i * 3.17) % dur) // already mid-flight
    const opacity = [0.45, 0.55, 0.65, 0.8, 0.95][sizeSlot]
    const glow = sizeSlot >= 3 // only medium+ stars glow
    return { id: i, x, startY, size, dur, delay, opacity, glow }
  })
}

export default function StarField({ count = 55 }: { count?: number }) {
  const stars = useMemo(() => buildStars(count), [count])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            bottom: `${s.startY}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: s.glow
              ? `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(66,183,122,0.70) 55%, transparent 100%)`
              : `rgba(66, 183, 122, ${s.opacity})`,
            boxShadow: s.glow
              ? `0 0 ${s.size * 3}px ${s.size}px rgba(66,183,122,0.55)`
              : "none",
            animation: `starFloat ${s.dur}s ${s.delay}s infinite linear`,
          }}
        />
      ))}
    </div>
  )
}
