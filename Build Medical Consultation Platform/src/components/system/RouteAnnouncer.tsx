import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

export default function RouteAnnouncer() {
  const { pathname } = useLocation()
  const [message, setMessage] = useState("")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById("main-content")
      main?.focus({ preventScroll: true })
      setMessage(document.title || "ميدكونكت")
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <p className="mc-visually-hidden" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  )
}
