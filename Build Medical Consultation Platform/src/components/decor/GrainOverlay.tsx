export default function GrainOverlay({
  className = "",
}: {
  className?: string
}) {
  return <span className={`grain-overlay ${className}`} aria-hidden="true" />
}
