import { useState } from "react"
import { ImageOff, type LucideIcon } from "lucide-react"

export default function CapabilityPhoto({
  source,
  icon: Icon,
}: {
  source: string
  icon: LucideIcon
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="capability-photo" aria-hidden="true">
      {failed ? (
        <div className="capability-photo-fallback">
          <Icon />
          <ImageOff />
        </div>
      ) : (
        <img
          src={source}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
      <span className="capability-image-caption">صورة توضيحية</span>
    </div>
  )
}
