import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import AppErrorBoundary from "@/components/system/AppErrorBoundary"
import ConfigurationGate from "@/components/system/ConfigurationGate"
import { AuthProvider } from "@/features/auth/AuthProvider"
import "./index.css"
import "./styles/editorial-doodles.css"
import "./styles/editorial-articles.css"
import "./styles/blue-green-refinement.css"

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
