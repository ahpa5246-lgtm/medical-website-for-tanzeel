type WaveDividerProps = {
  color?: string
  className?: string
}

/** A tiny static SVG transition between a hero surface and the section that follows. */
export default function WaveDivider({
  color = "#ffffff",
  className = "",
}: WaveDividerProps) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 -bottom-px z-10 h-12 w-full sm:h-16 ${className}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={color}
        d="M0,192L60,181.3C120,171,240,149,360,154.7C480,160,600,192,720,202.7C840,213,960,203,1080,176C1200,149,1320,107,1380,85.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
      />
    </svg>
  )
}
