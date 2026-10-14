import Header from "./Header"
import Footer from "./Footer"
import RouteSurface from "../system/RouteSurface"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen flex flex-col bg-white">
      <a href="#main-content" className="mc-skip-link">
        الانتقال إلى المحتوى الرئيسي
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <RouteSurface>{children}</RouteSurface>
      </main>
      <Footer />
    </div>
  )
}
