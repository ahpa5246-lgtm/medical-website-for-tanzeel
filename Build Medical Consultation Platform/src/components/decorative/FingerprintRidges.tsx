type FingerprintRidgesProps = {
  className?: string
  color?: string
  count?: number
}

/**
 * Fingerprint-style decorative ridges — nested ellipses with a drifting
 * center that mimics the loop pattern of a real fingerprint.
 */
export default function FingerprintRidges({
  className = "",
  color = "#fb923c",
  count = 9,
}: FingerprintRidgesProps) {
  const ridges = Array.from({ length: count }, (_, i) => {
    const n = i + 1
    // Center drifts to simulate the fingerprint loop core
    const cx = 160 - n * 3.8
    const cy = 158 + n * 1.2
    // Outer ridges flatten slightly (more elliptical)
    const rx = 10 + n * 17
    const ry = 7 + n * 12
    const opacity = Math.max(0.1, 0.6 - i * 0.054)
    const sw = i < 2 ? 2 : i < 5 ? 1.5 : 1
    return { cx, cy, rx, ry, opacity, sw }
  })

  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute ${className}`}
    >
      {ridges.map((r, i) => (
        <ellipse
          key={i}
          cx={r.cx}
          cy={r.cy}
          rx={r.rx}
          ry={r.ry}
          stroke={color}
          strokeWidth={r.sw}
          opacity={r.opacity}
        />
      ))}
    </svg>
  )
}
