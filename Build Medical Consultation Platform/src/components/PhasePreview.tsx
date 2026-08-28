import { ArrowLeft, CheckCircle2, Construction } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "@/components/ui/Button"

interface PhasePreviewProps {
  eyebrow: string
  title: string
  description: string
  items: string[]
}

export default function PhasePreview({
  eyebrow,
  title,
  description,
  items,
}: PhasePreviewProps) {
  return (
    <div dir="rtl" className="min-h-[70vh]">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-primary-200">
            <Construction className="h-4 w-4" /> {eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[1.4] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600"
            >
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-600" />{" "}
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/articles">
            <Button>استكشف المرحلة الحالية</Button>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-bold text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" /> الرئيسية
          </Link>
        </div>
      </section>
    </div>
  )
}
