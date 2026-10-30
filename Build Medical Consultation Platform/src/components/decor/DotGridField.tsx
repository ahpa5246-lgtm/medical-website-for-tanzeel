type DotGridTone = "teal" | "sky"
type DotGridFade = "edges" | "left" | "right" | "center"

export default function DotGridField({
  className = "",
  tone = "teal",
  fade = "edges",
}: {
  className?: string
  tone?: DotGridTone
  fade?: DotGridFade
}) {
  return (
    <div
      className={`dot-grid-field dot-grid-field--${tone} dot-grid-field--${fade} ${className}`}
      aria-hidden="true"
      data-dot-grid
      data-pattern={tone}
    />
  )
}
