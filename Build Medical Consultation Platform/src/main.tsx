import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import AppErrorBoundary from "@/components/system/AppErrorBoundary"
import ConfigurationGate from "@/components/system/ConfigurationGate"
import "./index.css"

document.documentElement.setAttribute("dir", "rtl")
document.documentElement.setAttribute("lang", "ar")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ConfigurationGate>
        <App />
      </ConfigurationGate>
    </AppErrorBoundary>
  </React.StrictMode>,
)
