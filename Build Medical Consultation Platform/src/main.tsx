import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import AppErrorBoundary from "@/components/system/AppErrorBoundary"
import ConfigurationGate from "@/components/system/ConfigurationGate"
import { AuthProvider } from "@/features/auth/AuthProvider"
import "./index.css"

// Keep third-party display fonts off the critical rendering path. On slow
// connections the browser keeps the system-font fallback (font-display:
// optional), avoiding a late layout shift. This also prevents external font
// requests from delaying the page's first meaningful paint.
function loadNonCriticalFonts() {
  const fontStylesheet = document.createElement("link")
  fontStylesheet.rel = "stylesheet"
  fontStylesheet.href =
    "https://fonts.googleapis.com/css2?family=Alexandria:wght@700;900&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=optional"
  document.head.appendChild(fontStylesheet)
}

if (document.readyState === "complete") {
  window.setTimeout(loadNonCriticalFonts, 0)
} else {
  window.addEventListener(
    "load",
    () => window.setTimeout(loadNonCriticalFonts, 0),
    { once: true },
  )
}

document.documentElement.setAttribute("dir", "rtl")
document.documentElement.setAttribute("lang", "ar")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ConfigurationGate>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigurationGate>
    </AppErrorBoundary>
  </React.StrictMode>,
)
