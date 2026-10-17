import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Boxes,
  Clock3,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Square,
  Trophy,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import TaskPlayer from "@/features/training/TaskPlayer"
import { getTrainingTask } from "@/features/training/trainingRepository"
import { useAuth } from "@/features/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import DemoLabel from "@/components/DemoLabel"
import Badge from "@/components/ui/Badge"
import { LAB_MODULES, labModuleById, type LabModule } from "./catalog"
import CaseRoom from "./CaseRoom"
import {
  createRouteLabQuotaClient,
  type LabQuotaErrorCode,
} from "./labQuotaClient"
import {
  createLabQuotaSession,
  type LabQuotaSession,
  type LabQuotaSessionState,
} from "./labQuotaSession"

function TypeIcon({ type }: { type: LabModule["type"] }) {
  if (type === "anatomy-3d") return <Boxes className="h-6 w-6" />
  if (type === "rapid-quiz") return <Sparkles className="h-6 w-6" />
  return <GitBranch className="h-6 w-6" />
}

function typeLabel(type: LabModule["type"]) {
  if (type === "anatomy-3d") return "تشريح تفاعلي ثلاثي الأبعاد"
  if (type === "rapid-quiz") return "تحدٍ تشخيصي سريع"
  return "حالة سريرية متفرعة"
}

function useLabQuota() {
  const { session: authSession } = useAuth()
  const sessionRef = useRef<LabQuotaSession | null>(null)
  const [state, setState] = useState<LabQuotaSessionState>({
    phase: "loading",
    quota: null,
    errorCode: null,
  })

  useEffect(() => {
    const session = createLabQuotaSession(
      createRouteLabQuotaClient({
        accessTokenProvider: async () => {
          const { data, error } = await supabase.auth.getSession()
          return error ? null : (data.session?.access_token ?? null)
        },
      }),
    )
    sessionRef.current = session
    const unsubscribe = session.subscribe(setState)
    void session.refresh()

    return () => {
      unsubscribe()
      session.dispose()
      if (sessionRef.current === session) sessionRef.current = null
    }
  }, [authSession?.user.id])

  const refresh = useCallback(() => void sessionRef.current?.refresh(), [])
  const start = useCallback(() => void sessionRef.current?.start(), [])
  const end = useCallback(() => void sessionRef.current?.end(), [])

  return { state, refresh, start, end }
}

function errorLabel(code: LabQuotaErrorCode | null) {
  if (code === "unconfigured") {
    return "اتصال المختبر غير مهيأ في هذا الإصدار، لذلك بقي الوصول مقفلاً."
  }
  if (code === "unauthenticated") {
    return "يلزم ربط جلسة دخول حقيقية ومصادق عليها قبل فتح المختبر."
  }
  if (code === "network") {
    return "تعذر الوصول إلى خادم الحصة. أُغلق البدء احترازيًا؛ يمكنك إعادة المحاولة."
  }
  return "لم نستطع التحقق من الحصة من الخادم، لذلك بقيت الوحدة مقفلة."
}

function quotaLabel(state: LabQuotaSessionState) {
  if (state.phase === "loading") return "جارٍ التحقق من الحصة على الخادم…"
  if (state.phase === "starting") return "جارٍ فتح جلسة محمية على الخادم…"
  if (state.phase === "ending") return "جارٍ إنهاء الجلسة على الخادم…"
  if (state.phase === "error") return errorLabel(state.errorCode)
  if (state.quota?.kind === "unlimited") {
    return "أكد الخادم أن هذه الجلسة ذات وصول غير محدود."
  }
  if (state.quota?.kind === "exhausted") {
    return "أكد الخادم انتهاء حصة اليوم. تُعاد الحصة وفق يوم بغداد."
  }
  if (state.quota?.kind === "limited") {
    const minutes = Math.max(1, Math.ceil(state.quota.remainingSeconds / 60))
    return `المتبقي حسب الخادم: نحو ${minutes} دقيقة.`
  }
  return "لا توجد حالة حصة موثوقة بعد."
}

function LabList() {
  return (
    <div dir="rtl" className="min-h-[70vh] bg-slate-50">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-primary-200">
              <FlaskConical className="h-4 w-4" /> مختبرات تعلم تجريبية
            </span>
            <DemoLabel>محتوى خيالي غير مراجع طبيًا</DemoLabel>
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[1.4] sm:text-5xl">
            تعلّم بالممارسة داخل حالات قصيرة وواضحة.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            المحتوى السريري ما زال بنيويًا وغير معتمد. الوصول لا يعتمد على عدّاد
            في المتصفح، ويبقى مقفلاً إذا تعذر إعداد الخادم أو المصادقة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black text-primary-700">
              المرحلة التجريبية
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">وحدات المختبر</h2>
          </div>
          <p className="max-w-xl text-xs leading-6 text-slate-500">
            يعيد كل تحميل أو تبويب جديد قراءة الحصة من الخادم. لا تُخزّن مدة
            الاستخدام أو صلاحية الفتح في المتصفح.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {LAB_MODULES.map((module) => (
            <article
              key={module.id}
              className="flex min-h-[330px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <TypeIcon type={module.type} />
                </span>
                <Badge
                  variant={
                    module.status === "pilot-shell" ? "primary" : "muted"
                  }
                >
                  {module.status === "pilot-shell"
                    ? "قالب الطيار"
                    : "مخطط لاحقًا"}
                </Badge>
              </div>
              <p className="mt-5 text-xs font-bold text-primary-700">
                {typeLabel(module.type)} · {module.specialty}
              </p>
              <h3 className="mt-2 text-xl font-black text-ink">
                {module.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {module.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5">
                  <Clock3 className="h-3.5 w-3.5" /> {module.estimatedMinutes}{" "}
                  دقائق
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5">
                  <Trophy className="h-3.5 w-3.5" /> {module.xpReward} XP مخطط
                </span>
              </div>
              <Link
                to={`/labs/${module.id}`}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                استعراض الوحدة <ArrowLeft className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function LabAccessPanel({ module }: { module: LabModule }) {
  const { state, refresh, start, end } = useLabQuota()
  const enabledShell = module.status === "pilot-shell"
  const [published, setPublished] = useState(false)
  useEffect(() => {
    let active = true
    getTrainingTask("chest-pain")
      .then((task) => {
        if (active) setPublished(Boolean(task))
      })
      .catch(() => {
        if (active) setPublished(false)
      })
    return () => {
      active = false
    }
  }, [module.id])
  const canStart = enabledShell && state.phase === "ready" && published
  const active = state.phase === "active"
  const busy = ["loading", "starting", "ending"].includes(state.phase)

  return (
    <aside
      data-lab-quota-source="server"
      data-lab-quota-state={state.phase}
      className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-black text-ink">الوصول الذي يؤكده الخادم</h2>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
        <li>المجاني: ساعة واحدة يوميًا بتوقيت بغداد.</li>
        <li>الاشتراك: حالة غير محدودة فقط إذا أكدها الخادم؛ الدفع غير مفعّل.</li>
      </ul>

      <div
        aria-live="polite"
        className={`mt-5 rounded-2xl p-4 text-xs leading-6 ${
          state.phase === "error" || state.phase === "locked"
            ? "bg-amber-50 text-amber-900"
            : active
              ? "bg-emerald-50 text-emerald-900"
              : "bg-slate-50 text-slate-700"
        }`}
      >
        <span className="mb-2 flex items-center gap-2 font-black">
          <LockKeyhole className="h-4 w-4" /> حالة الحصة
        </span>
        {quotaLabel(state)}
      </div>

      {active && published && (
        <TaskPlayer stageId="chest-pain" onClose={end} onComplete={end} />
      )}
      {!published && (
        <p className="mt-4 text-sm text-slate-600">
          لا يوجد نشاط منشور لهذه الوحدة بعد؛ لا تُستهلك الحصة لعرض قالب فارغ.
        </p>
      )}
      {active ? (
        <button
          type="button"
          onClick={end}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-900"
        >
          <Square className="h-4 w-4" /> إنهاء الجلسة
        </button>
      ) : (
        <button
          type="button"
          disabled={!canStart}
          onClick={start}
          data-lab-start-guard={canStart ? "server-verified" : "server-locked"}
          className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
            canStart
              ? "bg-primary-600 text-white transition hover:bg-primary-700"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          <Play className="h-4 w-4" />
          {busy
            ? "جارٍ التحقق…"
            : enabledShell
              ? "بدء الوحدة بعد تحقق الخادم"
              : "هذه الوحدة مخططة لاحقًا"}
        </button>
      )}

      {(state.phase === "error" || state.phase === "locked") && (
        <button
          type="button"
          onClick={refresh}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> إعادة التحقق من الخادم
        </button>
      )}

      <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
        نبضة الخادم كل 45 ثانية أثناء الجلسة فقط. لا يوجد عدّ تنازلي محلي، ولا
        تُحفظ نقاط أو تقدم أو شارات في هذه المرحلة.
      </p>
    </aside>
  )
}

function LabDetail({ module }: { module: LabModule }) {
  const enabledShell = module.status !== "planned"

  return (
    <div dir="rtl" className="min-h-[70vh] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            to="/labs"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" /> كل المختبرات
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant={enabledShell ? "primary" : "muted"}>
              {module.status === "playable-demo"
                ? "تجربة قابلة للعب"
                : enabledShell
                  ? "قالب طيار"
                  : "مخطط لاحقًا"}
            </Badge>
            <DemoLabel>غير مراجع طبيًا</DemoLabel>
          </div>
          <h1 className="mt-5 text-3xl font-black text-ink sm:text-4xl">
            {module.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
            {module.description}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="font-black text-amber-900">
                  تنبيه المحتوى السريري
                </h2>
                <p className="mt-2 text-sm leading-7 text-amber-800">
                  هذه وحدة بنيوية خيالية وغير مراجعة. لا تُستخدم للتشخيص أو
                  العلاج أو التعليم الطبي الحقيقي، ولا يمكن نشرها قبل اعتماد
                  مراجع طبي مرخّص.
                </p>
              </div>
            </div>
          </div>

          {(module.status === "playable-demo" ||
            module.id === "chest-pain-case") && (
            <CaseRoom key={module.id} moduleId={module.id} />
          )}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-ink">مسار الوحدة المخطط</h2>
            <ol className="mt-5 space-y-3">
              {module.stages.map((stage, index) => (
                <li
                  key={stage}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs text-primary-700 shadow-sm">
                    {index + 1}
                  </span>
                  {stage}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {module.status !== "playable-demo" ? (
          <LabAccessPanel module={module} />
        ) : (
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700">
            هذه تجربة خيالية محلية ولا تحتاج حسابًا. الإجابات لا تُحفظ أو تستخدم طبيًا.
          </aside>
        )}
      </section>
    </div>
  )
}

function MissingLab() {
  return (
    <div
      dir="rtl"
      className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center"
    >
      <h1 className="text-2xl font-black text-ink">الوحدة غير موجودة</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        هذا الرابط لا يطابق أي وحدة في كتالوج المختبر التجريبي.
      </p>
      <Link
        to="/labs"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white"
      >
        العودة للمختبرات
      </Link>
    </div>
  )
}

export default function LabHub() {
  const { moduleId } = useParams<{ moduleId: string }>()
  if (!moduleId) return <LabList />
  const module = labModuleById(moduleId)
  return module ? <LabDetail module={module} /> : <MissingLab />
}
