type HeroRingsProps = {
  className?: string
  stroke?: string
}

/** Static geometric rings used behind hero media and copy. */
export default function HeroRings({
  className = "",
  stroke = "#42b77a",
}: HeroRingsProps) {
  return (
    <svg
      className={`pointer-events-none absolute ${className}`}
      viewBox="0 0 360 360"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="180"
        cy="180"
        r="58"
        stroke={stroke}
        strokeWidth="2.5"
        opacity=".72"
      />
      <circle
        cx="180"
        cy="180"
        r="96"
        stroke={stroke}
        strokeWidth="2"
        opacity=".52"
      />
      <circle
        cx="180"
        cy="180"
        r="136"
        stroke={stroke}
        strokeWidth="1.5"
        opacity=".35"
      />
      <circle
        cx="180"
        cy="180"
        r="172"
        stroke={stroke}
        strokeWidth="1"
        opacity=".18"
      />
    </svg>
  )
}
