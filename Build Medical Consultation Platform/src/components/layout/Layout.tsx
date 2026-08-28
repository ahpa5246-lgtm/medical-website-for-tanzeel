import Header from "./Header"
import Footer from "./Footer"
import PreviewNotice from "@/components/PreviewNotice"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen flex flex-col bg-white">
      <PreviewNotice />
      <Header />
      <main className="flex-1 page-enter">{children}</main>
      <Footer />
    </div>
  )
}
