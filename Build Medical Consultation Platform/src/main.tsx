import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Set RTL direction on the document root for the Arabic-first layout
document.documentElement.setAttribute("dir", "rtl")
document.documentElement.setAttribute("lang", "ar")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
