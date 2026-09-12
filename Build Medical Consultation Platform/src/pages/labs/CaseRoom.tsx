import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

type Choice = {
  id: string
  label: string
  note: string
  points: number
}

type Scene = {
  eyebrow: string
  title: string
  prompt: string
  choices: Choice[]
}

const SCENES: Scene[] = [
  {
    eyebrow: "غرفة الحالة · 01",
    title: "افصل الملاحظة عن الافتراض",
    prompt:
      "وصل ملف الحالة الخيالية «دلتا-17» وفيه وصف قصير وغير مكتمل. ما أول خطوة تفكير آمنة؟",
    choices: [
      {
        id: "facts",
        label: "تسجيل الحقائق الموجودة وما يزال مجهولًا",
        note: "اختيار قوي: يبدأ التفكير الجيد بحدود الدليل، لا بقفزة إلى الاستنتاج.",
        points: 2,
      },
      {
        id: "guess",
        label: "اختيار تفسير سريع ثم البحث عما يؤيده",
        note: "هذا يخلق انحياز التأكيد. ارجع وافصل الدليل عن الفرضية.",
        points: 0,
      },
      {
        id: "volume",
        label: "جمع أكبر عدد ممكن من التفاصيل بلا ترتيب",
        note: "كثرة المعلومات ليست بديلًا عن سؤال واضح وأولوية مفهومة.",
        points: 1,
      },
    ],
  },
  {
    eyebrow: "دفتر الأدلة · 02",
    title: "اختر الإشارة التي تقلل عدم اليقين",
    prompt:
      "أمامك ثلاث بطاقات بيانات تجريبية. أيها يخدم السؤال الحالي بدل أن يضيف ضوضاء؟",
    choices: [
      {
        id: "timeline",
        label: "خط زمني موثّق يوضح متى تغيّر الوصف",
        note: "صحيح: الخط الزمني يربط الادعاءات بسياق قابل للتفسير.",
        points: 2,
      },
      {
        id: "decoration",
        label: "مؤشر لوني بلا مصدر أو تعريف",
        note: "المؤشر غير المفسر يبدو مقنعًا لكنه لا يضيف دليلًا قابلًا للمراجعة.",
        points: 0,
      },
      {
        id: "duplicate",
        label: "نسخة ثانية من الوصف نفسه",
        note: "التكرار لا يعني دليلًا مستقلًا. ابحث عن معلومة تغير درجة اليقين.",
        points: 1,
      },
    ],
  },
  {
    eyebrow: "نقطة القرار · 03",
    title: "وثّق حدود قرارك",
    prompt:
      "انتهت الجولة وما زال جزء من الحالة مجهولًا. كيف تسلم قرارًا يمكن لشخص آخر مراجعته؟",
    choices: [
      {
        id: "bounded",
        label: "الحقائق → الفرضية → المجهول → ما يحتاج مراجعة بشرية",
        note: "ممتاز: هذه سلسلة تفسير قابلة للتدقيق ولا تدّعي يقينًا غير موجود.",
        points: 2,
      },
      {
        id: "certain",
        label: "كتابة جواب نهائي بلا ذكر لعدم اليقين",
        note: "إخفاء عدم اليقين يجعل القرار أقل أمانًا وأصعب في المراجعة.",
        points: 0,
      },
      {
        id: "handoff",
        label: "تمرير كل المعلومات بلا خلاصة أو سؤال محدد",
        note: "التسليم يحتاج خلاصة وحدودًا وسؤال مراجعة، لا مجرد نقل العبء.",
        points: 1,
      },
    ],
  },
]

const HANDOFF_SCENES: Scene[] = [
  {
    eyebrow: "غرفة التسليم · 01",
    title: "ابدأ بخلاصة يمكن اختبارها",
    prompt:
      "لديك ملف خيالي طويل وملاحظات متفرقة. ما أفضل افتتاحية لتسليم الحالة إلى زميل آخر؟",
    choices: [
      {
        id: "summary",
        label: "جملة موجزة: ما نعرفه، وما الذي نحتاج حسمه",
        note: "اختيار قوي: الخلاصة المحددة تمنح المستلم سؤالًا واضحًا بدل كومة معلومات.",
        points: 2,
      },
      {
        id: "transcript",
        label: "قراءة كل الملاحظات حسب ترتيب كتابتها",
        note: "الترتيب الزمني مفيد أحيانًا، لكنه لا يعوض عن خلاصة وسؤال واضحين.",
        points: 1,
      },
      {
        id: "conclusion",
        label: "إعلان نتيجة نهائية قبل عرض الأدلة",
        note: "هذا يجعل المراجعة أصعب وقد يدفع المستلم لقبول افتراض غير موثق.",
        points: 0,
      },
    ],
  },
  {
    eyebrow: "لوحة الفرز · 02",
    title: "أبقِ المصدر ملازمًا للمعلومة",
    prompt:
      "وجدت معلومتين متشابهتين، إحداهما موثقة بوقت ومصدر والأخرى منسوخة بلا سياق. ماذا تسلّم؟",
    choices: [
      {
        id: "source",
        label: "المعلومة الموثقة مع وقتها ومصدرها وحدودها",
        note: "صحيح: المصدر والوقت جزء من الدليل، وليسا حاشية يمكن إسقاطها.",
        points: 2,
      },
      {
        id: "both",
        label: "المعلومتان وكأنهما دليلان مستقلان",
        note: "النسخة غير الموثقة قد تكون تكرارًا، فلا ينبغي أن تضاعف وزن الدليل.",
        points: 0,
      },
      {
        id: "short",
        label: "الأقصر منهما لتسريع التسليم",
        note: "الاختصار جيد فقط إذا حافظ على المصدر والسياق وحدود اليقين.",
        points: 1,
      },
    ],
  },
  {
    eyebrow: "بوابة المراجعة · 03",
    title: "حوّل المجهول إلى سؤال مراجعة",
    prompt: "بقي تعارض غير محسوم في الملف الخيالي. كيف تنهي التسليم؟",
    choices: [
      {
        id: "question",
        label: "تسمية التعارض وكتابة سؤال محدد للمراجع البشري",
        note: "ممتاز: أنت لا تخفي الفجوة ولا تحوّلها إلى يقين مصطنع.",
        points: 2,
      },
      {
        id: "hide",
        label: "حذف إحدى المعلومتين كي يبدو الملف متسقًا",
        note: "الاتساق الشكلي لا يبرر إخفاء تعارض قد يغيّر فهم الحالة.",
        points: 0,
      },
      {
        id: "flag",
        label: "كتابة «غير واضح» بلا تحديد سبب أو خطوة تالية",
        note: "رصد المشكلة بداية جيدة، لكن التسليم يحتاج سؤالًا أو خطوة مراجعة محددة.",
        points: 1,
      },
    ],
  },
]

const ROOM_COPY = {
  evidence: {
    kicker: "SAFE DEMO · تدريب منطق الواجهة",
    title: "مسار دلتا: غرفة الأدلة",
  },
  handoff: {
    kicker: "SAFE DEMO · تحدي التسليم المنظم",
    title: "مسار سيغما: غرفة التسليم",
  },
}

export default function CaseRoom({ moduleId }: { moduleId: string }) {
  const room = moduleId === "handoff-case" ? "handoff" : "evidence"
  const scenes = room === "handoff" ? HANDOFF_SCENES : SCENES
  const copy = ROOM_COPY[room]
  const [sceneIndex, setSceneIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Choice>>({})
  const scene = scenes[sceneIndex]
  const answer = answers[sceneIndex]
  const finished = sceneIndex === scenes.length - 1 && Boolean(answer)
  const score = useMemo(
    () =>
      Object.values(answers).reduce((total, item) => total + item.points, 0),
    [answers],
  )

  const choose = (choice: Choice) => {
    if (answer) return
    setAnswers((current) => ({ ...current, [sceneIndex]: choice }))
  }

  const reset = () => {
    setSceneIndex(0)
    setAnswers({})
  }

  return (
    <section
      aria-labelledby="case-room-title"
      data-demo-storage="memory-only"
      className="overflow-hidden rounded-[2rem] border border-indigo-200 bg-[#11132b] text-white shadow-[0_30px_90px_-45px_rgba(79,70,229,.65)]"
    >
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,.28),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,.24),transparent_38%)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-cyan-200">
              {copy.kicker}
            </p>
            <h2 id="case-room-title" className="mt-2 text-2xl font-black">
              {copy.title}
            </h2>
          </div>
          <div className="flex items-center gap-2" aria-label="تقدم المسار">
            {scenes.map((item, index) => (
              <span
                key={item.eyebrow}
                className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${
                  index === sceneIndex
                    ? "w-9 bg-pink-300"
                    : answers[index]
                      ? "w-4 bg-cyan-300"
                      : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="p-5 sm:p-7">
          <p className="text-xs font-black text-pink-200">{scene.eyebrow}</p>
          <h3 className="mt-2 text-xl font-black sm:text-2xl">{scene.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            {scene.prompt}
          </p>

          <div className="mt-6 grid gap-3">
            {scene.choices.map((choice) => {
              const selected = answer?.id === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => choose(choice)}
                  disabled={Boolean(answer)}
                  aria-pressed={selected}
                  className={`min-h-14 rounded-2xl border px-4 py-3 text-right text-sm font-bold transition motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 ${
                    selected
                      ? "border-cyan-300 bg-cyan-300/15 text-white"
                      : "border-white/10 bg-white/[.04] text-slate-200 hover:border-pink-300/70 hover:bg-white/[.08] disabled:hover:border-white/10"
                  }`}
                >
                  {choice.label}
                </button>
              )
            })}
          </div>

          <div aria-live="polite" className="mt-5 min-h-24">
            {answer && (
              <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
                <p className="flex items-center gap-2 text-sm font-black text-cyan-200">
                  <Sparkles className="h-4 w-4" /> تغذية راجعة فورية
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {answer.note}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!finished && answer && (
              <button
                type="button"
                onClick={() => setSceneIndex((current) => current + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#11132b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                المحطة التالية <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {finished && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pink-300 px-5 py-2.5 text-sm font-black text-[#11132b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                <RotateCcw className="h-4 w-4" /> إعادة المسار
              </button>
            )}
          </div>
        </div>

        <aside className="border-t border-white/10 bg-white/[.035] p-5 lg:border-t-0 lg:border-r">
          <p className="flex items-center gap-2 text-sm font-black text-white">
            <ClipboardList className="h-4 w-4 text-cyan-300" /> دفتر المسار
          </p>
          <ol className="mt-4 space-y-3 text-xs leading-6 text-slate-300">
            {scenes.map((item, index) => (
              <li key={item.title} className="flex gap-2">
                <CheckCircle2
                  className={`mt-1 h-4 w-4 shrink-0 ${
                    answers[index] ? "text-cyan-300" : "text-white/20"
                  }`}
                />
                <span>{item.title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-2xl bg-white/[.06] p-4">
            <p className="text-xs text-slate-400">نتيجة تجريبية داخل الجلسة</p>
            <p className="mt-1 text-3xl font-black text-pink-200">{score}/6</p>
            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              تُصفّر عند تحديث الصفحة ولا تُحفظ في المتصفح.
            </p>
          </div>
          <p className="mt-5 flex gap-2 text-[11px] leading-5 text-amber-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            محاكاة خيالية لتدريب ترتيب المعلومات فقط؛ ليست تعليمًا طبيًا معتمدًا
            ولا تُستخدم للتشخيص أو العلاج.
          </p>
        </aside>
      </div>
    </section>
  )
}
