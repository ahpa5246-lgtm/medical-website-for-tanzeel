import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { BookOpenText, HeartPulse, ShieldCheck, Sparkles } from "lucide-react"
import GrainOverlay from "@/components/decor/GrainOverlay"
import PatternField from "@/components/decor/PatternField"
import SketchAccents from "@/components/decor/SketchAccents"

export default function AuthShell({
  children,
  story = "مساحتك الصغيرة للتعلم والمعرفة.",
}: {
  children: ReactNode
  story?: string
}) {
  return (
    <main dir="rtl" className="auth-editorial">
      <GrainOverlay />
      <div className="auth-editorial-layout">
        <aside className="auth-story" aria-label="عن المنصة">
          <PatternField variant="confetti" />
          <SketchAccents motif="auth" />
          <Link to="/" className="auth-brand">
            <span className="auth-brand-mark"><HeartPulse aria-hidden="true" /></span>
            <span>ميدكونكت <small>نسخة عرض تجريبية</small></span>
          </Link>
          <div className="auth-story-middle">
            <div className="auth-illustration" aria-hidden="true">
              <div className="auth-illustration-orbit" />
              <div className="auth-illustration-book">
                <BookOpenText />
              </div>
              <div className="auth-illustration-heart"><HeartPulse /></div>
              <div className="auth-illustration-star"><Sparkles /></div>
            </div>
            <p className="auth-story-eyebrow">معرفة أقرب إليك</p>
            <h2>خطوة صغيرة،<br /><span>رحلة أجمل.</span></h2>
            <p>{story}</p>
            <div className="auth-story-check"><ShieldCheck aria-hidden="true" /> الحسابات الحقيقية متاحة فقط بعد تهيئة الخدمة واعتمادها.</div>
          </div>
          <p className="auth-story-foot">صُنعت هذه الواجهة بالعربية أولًا وبروح الرسومات اليدوية.</p>
        </aside>
        <div className="auth-form-wrap">
          <div className="auth-form-top"><Link to="/">العودة للرئيسية ←</Link><span>نسخة تجريبية</span></div>
          {children}
          <p className="auth-form-foot">لا تُدخل معلومات طبية أو صحية في نماذج العرض غير التشغيلية.</p>
        </div>
      </div>
    </main>
  )
}
