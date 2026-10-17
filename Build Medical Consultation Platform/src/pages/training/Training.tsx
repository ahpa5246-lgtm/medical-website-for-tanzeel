import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  LockKeyhole,
  MessageSquareText,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Trophy,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import TaskPlayer from "@/features/training/TaskPlayer"
import {
  getTrainingProgress as loadProgress,
  resetTraining,
} from "@/features/training/trainingRepository"
import DemoLabel from "@/components/DemoLabel"
import {
  ALL_STAGES,
  TRAINING_WORLDS,
  findTrainingStage,
  getStageAvailability,
  getTrainingProgress,
} from "./trainingPath.mjs"

const iconMap = {
  pulse: Activity,
  shield: ShieldCheck,
  file: FileText,
  heart: HeartPulse,
  timer: TimerReset,
  message: MessageSquareText,
  anatomy: HeartPulse,
  flask: FlaskConical,
  trophy: Trophy,
}

export default function Training() {
  const { session } = useAuth()
  const [completed, setCompleted] = useState<string[]>([])
  const [player, setPlayer] = useState(false)
  const [details, setDetails] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function refreshProgress() {
    try {
      const records = await loadProgress()
      setCompleted(records.map((row) => row.stage_id))
    } catch {
      setError("تعذر تحميل التقدم المحفوظ.")
    }
  }
  useEffect(() => {
    let active = true
    setCompleted([])
    if (session)
      loadProgress()
        .then((records) => {
          if (active) setCompleted(records.map((row) => row.stage_id))
        })
        .catch(() => {
          if (active) setError("تعذر تحميل التقدم.")
        })
    return () => {
      active = false
    }
  }, [session?.user.id])
  const [selectedId, setSelectedId] = useState(ALL_STAGES[0].id)
  const selected = findTrainingStage(selectedId) || ALL_STAGES[0]
  const selectedState = getStageAvailability(selected.id, completed)
  const progress = useMemo(() => getTrainingProgress(completed), [completed])

  async function completeSelected() {
    setPlayer(false)
    await refreshProgress()
  }
  async function resetProgress() {
    if (
      !session ||
      !window.confirm("هل تريدين مسح التقدم المحفوظ وإعادة المسار؟")
    )
      return
    setBusy(true)
    setError("")
    try {
      await resetTraining()
      setCompleted([])
      setSelectedId(ALL_STAGES[0].id)
      setPlayer(false)
    } catch {
      setError("تعذر إعادة المسار.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div dir="rtl" className="training-page">
      <section className="training-hero">
        <div className="training-hero-grid" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="training-kicker">
                  <Sparkles className="h-4 w-4" /> مسار ميدكونكت التفاعلي
                </span>
                <DemoLabel>نموذج عرض غير معتمد طبيًا</DemoLabel>
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.25] text-white sm:text-6xl">
                كل مرحلة تقرّبك من <span>فهم الصورة كاملة.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
                رحلة تدريبية تجريبية تحوّل المفاهيم الطبية إلى مهام قصيرة، حالات
                متفرعة، ونماذج بصرية داخل خريطة واحدة.
              </p>
            </div>

            <aside className="training-progress-card" aria-label="تقدم التدريب">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-cyan-200">
                    تقدمك التجريبي
                  </p>
                  <p className="mt-1 text-3xl font-black text-white">
                    {progress.percent}%
                  </p>
                </div>
                <div
                  className="training-progress-orb"
                  style={
                    {
                      "--progress": `${progress.percent * 3.6}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span>
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-[width] duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>{progress.xp} نقطة خبرة</span>
                <button
                  type="button"
                  disabled={!session || busy}
                  onClick={() => void resetProgress()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-bold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> إعادة المسار
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:py-12">
        <div className="training-map" aria-label="خريطة مراحل التدريب">
          <div className="training-map-haze" aria-hidden="true" />
          {TRAINING_WORLDS.map((world, worldIndex) => (
            <section
              key={world.id}
              className={`training-world training-world-${world.tone}`}
            >
              <header className="training-world-heading">
                <span>{world.number}</span>
                <div>
                  <p>{world.eyebrow}</p>
                  <h2>{world.title}</h2>
                  <small>{world.description}</small>
                </div>
              </header>

              <div className="training-stage-track">
                <svg
                  className="training-route"
                  viewBox="0 0 800 260"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d={
                      worldIndex % 2 === 0
                        ? "M80 190 C240 10 500 250 720 70"
                        : "M80 70 C260 250 500 10 720 190"
                    }
                  />
                </svg>
                {world.stages.map((stage, stageIndex) => {
                  const state = getStageAvailability(stage.id, completed)
                  const Icon =
                    iconMap[(stage.icon as keyof typeof iconMap)] || Activity
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(stage.id)
                        setPlayer(false)
                        setDetails(false)
                      }}
                      className={`training-stage training-stage-${stageIndex + 1} training-stage-${state} ${
                        selected.id === stage.id ? "is-selected" : ""
                      }`}
                      aria-pressed={selected.id === stage.id}
                      aria-label={`${stage.title} — ${
                        state === "locked"
                          ? "مقفلة"
                          : state === "complete"
                            ? "مكتملة"
                            : "متاحة"
                      }`}
                    >
                      <span className="training-stage-platform">
                        <span className="training-stage-icon">
                          {state === "locked" ? (
                            <LockKeyhole />
                          ) : state === "complete" ? (
                            <Check />
                          ) : (
                            <Icon />
                          )}
                        </span>
                      </span>
                      <strong>{stage.shortTitle}</strong>
                      <small>{stage.xp} XP</small>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="training-mission-panel" aria-live="polite">
          <div className="training-mission-visual">
            <div className="training-mission-cube">
              <HeartPulse />
            </div>
            <span>{selected.type}</span>
          </div>
          <p className="mt-6 text-xs font-black text-primary-700">
            المهمة المحددة
          </p>
          <h2 className="mt-2 text-2xl font-black leading-9 text-ink">
            {selected.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {selected.brief}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <span className="training-stat">
              <Clock3 /> {selected.minutes} دقائق
            </span>
            <span className="training-stat">
              <Trophy /> {selected.xp} XP
            </span>
          </div>
          <div className={`training-status training-status-${selectedState}`}>
            {selectedState === "complete"
              ? "أنجزتِ هذه المرحلة"
              : selectedState === "active"
                ? "المرحلة متاحة الآن"
                : "أكملي المرحلة السابقة أولًا"}
          </div>
          <button
            type="button"
            disabled={selectedState !== "active" || !session}
            onClick={() => setPlayer(true)}
            className="training-start-button"
          >
            {selectedState === "active" ? (
              <>
                <Play /> فتح النشاط
              </>
            ) : selectedState === "complete" ? (
              <>
                <Check /> مكتملة
              </>
            ) : (
              <>
                <LockKeyhole /> مرحلة مقفلة
              </>
            )}
          </button>
          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            السيناريو تمثيلي لأغراض عرض المنتج فقط، ولا يقدم تشخيصًا أو قرارًا
            علاجيًا.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-red-700">
              {error}
            </p>
          )}
          {!session && (
            <Link
              className="mt-4 block underline"
              to="/auth/login?returnTo=%2Ftraining"
            >
              سجلي الدخول لحفظ التقدم
            </Link>
          )}
          {player && (
            <TaskPlayer
              key={selected.id}
              stageId={selected.id}
              onClose={() => setPlayer(false)}
              onComplete={() => void completeSelected()}
            />
          )}
          {details && (
            <div
              id="task-details"
              className="mt-4 rounded-xl border p-4 text-sm leading-7"
            >
              {selected.brief}
              <p>
                لا تُمنح نقاط إلا بعد إنجاز نشاط منشور والتحقق من النتيجة على
                الخادم.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setDetails((value) => !value)}
            aria-expanded={details}
            aria-controls="task-details"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black text-primary-700 hover:bg-primary-50"
          >
            تفاصيل المهمة <ArrowLeft className="h-4 w-4" />
          </button>
        </aside>
      </section>
    </div>
  )
}
