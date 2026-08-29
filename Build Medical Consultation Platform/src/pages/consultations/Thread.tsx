import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Shield,
  Star,
  Clock,
  Send,
  MessageCircle,
  Lock,
  CheckCircle2,
  ThumbsUp,
  ChevronLeft,
  AlertCircle,
  Info,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { formatTimeAgo } from "@/lib/utils"
import DemoLabel from "@/components/DemoLabel"

// Mock consultation thread data
// TODO: Replace with real Supabase consultation + messages query
const MOCK_THREAD = {
  id: "c1",
  title: "ألم متكرر في الصدر عند ممارسة الرياضة",
  specialty: "القلب والأوعية الدموية",
  status: "answered" as "open" | "answered" | "closed",
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  isAnonymous: true,
  doctor: {
    id: "d1",
    name: "د. نور الهاشمي",
    specialty: "القلب والأوعية الدموية",
    rating: 4.9,
    consultationsAnswered: 847,
    avatarUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format",
  },
  messages: [
    {
      id: "m1",
      senderType: "patient" as const,
      senderName: "مريض #4821",
      content:
        "السلام عليكم، أعاني من ألم متكرر في منطقة الصدر عند ممارسة الرياضة الشديدة كالجري. الألم يشبه الضغط ويستمر لدقيقتين أو ثلاث ثم يختفي. عمري 38 سنة، لا أدخن، لكن لدي ضغط دم مرتفع منذ سنتين وأتناول دواءً له. هل هذا مقلق؟",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "m2",
      senderType: "doctor" as const,
      senderName: "د. نور الهاشمي",
      content: `وعليكم السلام،

شكرًا لمشاركة تفاصيلك. ما تصفه — ألم ضاغط في الصدر يظهر أثناء المجهود ويختفي مع الراحة — يُعدّ من الأعراض التي تستدعي التقييم الطبي الجاد، خاصة مع وجود تاريخ من ضغط الدم المرتفع.

هذا النمط يُذكّر بما يُسمى **ذبحة صدرية جهدية**، وهي تحدث عندما يحتاج القلب لأكسجين أكثر مما تستطيع الشرايين توصيله في أوقات المجهود.

**التوصيات العاجلة:**
- راجع طبيبك أو متابعتك القلبية في أقرب وقت — لا تتأخر.
- لا تمارس رياضة شديدة حتى يتم التقييم.
- قد يطلب منك الطبيب تخطيط قلب أثناء الجهد (تست الجهد) ومتابعة إضافية.

**تنبيه:** إذا ظهر الألم في الراحة أو مع مجهود أخف، أو صاحبه ضيق تنفس أو تعرق أو ألم ينتشر للذراع والفك — اذهب لأقرب طوارئ فورًا.

هل لديك أي تحاليل حديثة أو صورة قلب؟

*الدكتورة نور*`,
      createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "m3",
      senderType: "patient" as const,
      senderName: "مريض #4821",
      content:
        "شكرًا جزيلًا دكتورة. عندي تخطيط قلب عادي من قبل ستة أشهر لكن لم أعمل تست جهد. سأتواصل مع طبيب قلب قريبًا. هل إيبوبروفين يساعد على الألم؟",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "m4",
      senderType: "doctor" as const,
      senderName: "د. نور الهاشمي",
      content: `لا تتناول الإيبوبروفين لهذا النوع من الألم — مضادات الالتهاب غير الستيرويدية قد ترفع ضغط الدم وليست علاجًا لألم الصدر القلبي.

إذا وصف لك الطبيب المتابع نترات (نيتروجلسرين) للاستعمال عند الحاجة، استخدمها فقط. لا تعالج هذا النوع بنفسك.

التخطيط الطبيعي قبل ستة أشهر لا يستبعد مشكلة قلبية — تست الجهد ضروري. حجز موعد مع طبيب قلب هو الخطوة الصحيحة تمامًا. وفقك الله.`,
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    },
  ],
  isRated: false,
}

export default function ConsultationThread() {
  const [reply, setReply] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [rated, setRated] = useState(MOCK_THREAD.isRated)
  const [ratingValue, setRatingValue] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [previewAction, setPreviewAction] = useState("")

  function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setReply("")
      setPreviewAction("تم اختبار حقل المتابعة فقط؛ لم تُرسل الرسالة ولم تُحفظ.")
    }, 500)
  }

  function handleRate(stars: number) {
    setRatingValue(stars)
    setRated(true)
    // TODO: Insert consultation_ratings record in Supabase
  }

  const statusColors: Record<string, "warning" | "success" | "muted"> = {
    open: "warning",
    answered: "success",
    closed: "muted",
  }

  const statusLabels: Record<string, string> = {
    open: "قيد الانتظار",
    answered: "تمت الإجابة",
    closed: "مغلقة",
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-4 h-4 rtl-flip" />
        <Link
          to="/consultations"
          className="hover:text-primary-600 transition-colors"
        >
          استشاراتي
        </Link>
        <ChevronLeft className="w-4 h-4 rtl-flip" />
        <span className="truncate max-w-[200px]">{MOCK_THREAD.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <DemoLabel>استشارة وردود وهويات وتقييمات وإحصاءات خيالية</DemoLabel>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {MOCK_THREAD.title}
          </h1>
          <Badge variant={statusColors[MOCK_THREAD.status]} size="md">
            {statusLabels[MOCK_THREAD.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeAgo(MOCK_THREAD.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {MOCK_THREAD.messages.length} رسائل
          </span>
          {MOCK_THREAD.isAnonymous && (
            <span className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-slate-400" />
              هوية خيالية (لا إخفاء فعلي)
            </span>
          )}
        </div>
      </div>

      {/* Persistent disclaimer */}
      <div className="mb-3 flex gap-2.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>مثال توضيحي فقط:</strong> الأسماء والرسائل مركبة لشرح شكل
          المحادثة، وليست استشارة حقيقية أو توصية للاستخدام.
        </p>
      </div>
      <div className="mb-6 flex gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <p>
          الإجابة أدناه هي إرشاد طبي عام ولا تُعدّ تشخيصًا رسميًا أو علاقة طبيب-مريض
          ملزِمة. يُرجى مراجعة طبيبك للفحص المباشر.{" "}
          <Link
            to="/legal/disclaimer"
            className="underline font-medium hover:text-amber-900"
          >
            التنويه الكامل
          </Link>
        </p>
      </div>

      {/* Doctor card */}
      <Card className="mb-6 flex gap-4 items-center">
        <div className="relative shrink-0">
          <img
            src={MOCK_THREAD.doctor.avatarUrl}
            alt={MOCK_THREAD.doctor.name}
            className="w-14 h-14 rounded-xl object-cover bg-primary-50"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">
              {MOCK_THREAD.doctor.name}
            </p>
            <Badge variant="primary" size="sm">
              <Shield className="w-3 h-3" />
              شخصية خيالية
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {MOCK_THREAD.doctor.specialty}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {MOCK_THREAD.doctor.rating}
          </span>
          <span>
            {MOCK_THREAD.doctor.consultationsAnswered.toLocaleString("ar")}{" "}
            استشارة
          </span>
        </div>
      </Card>

      {/* Message thread */}
      <div className="space-y-4 mb-6">
        {MOCK_THREAD.messages.map((msg) => {
          const isDoctor = msg.senderType === "doctor"
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isDoctor ? "" : "flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {isDoctor ? (
                  <img
                    src={MOCK_THREAD.doctor.avatarUrl}
                    alt={msg.senderName}
                    className="w-9 h-9 rounded-xl object-cover bg-primary-50"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold">
                    م
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`flex-1 max-w-[85%] ${
                  isDoctor ? "" : "flex flex-col items-end"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isDoctor ? "text-primary-700" : "text-slate-600"
                    }`}
                  >
                    {msg.senderName}
                  </span>
                  {isDoctor && (
                    <Badge variant="primary" size="sm">
                      <Shield className="w-3 h-3" />
                      طبيب
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    {formatTimeAgo(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isDoctor
                      ? "bg-primary-50 border border-primary-100 text-slate-800 rounded-ss-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-se-sm"
                  }`}
                >
                  <DemoLabel>رسالة خيالية وليست نصيحة</DemoLabel>
                  {msg.content.replace(/\*\*/g, "")}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rating (after consultation answered) */}
      {MOCK_THREAD.status === "answered" && !rated && (
        <Card className="mb-6 text-center">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            جرّب تقييم الرد الخيالي
          </p>
          <p className="text-xs text-slate-500 mb-4">
            تقييمك يساعد المرضى الآخرين
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(s)}
                className="transition-transform hover:scale-110"
                aria-label={`${s} نجوم`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= (hoverRating || ratingValue)
                      ? "text-amber-500 fill-amber-500"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </Card>
      )}

      {rated && (
        <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          شكرًا لتقييمك — يساعد في بناء الثقة بالمنصة.
        </div>
      )}

      {/* Reply box */}
      {MOCK_THREAD.status !== "closed" && (
        <form
          onSubmit={handleReply}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
        >
          <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-primary-600" />
            إرسال متابعة للطبيب
          </p>
          <textarea
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="اكتب سؤالًا إضافيًا أو تفاصيل جديدة..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              size="sm"
              disabled={!reply.trim()}
              loading={submitting}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" />
              إرسال
            </Button>
          </div>
          {previewAction && (
            <p
              role="status"
              className="mt-3 rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-900"
            >
              {previewAction}
            </p>
          )}
        </form>
      )}

      {/* Second opinion */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
        <ThumbsUp className="w-4.5 h-4.5 shrink-0 mt-0.5 text-primary-600" />
        <div>
          <p className="font-medium text-slate-800 mb-1">تريد رأيًا ثانيًا؟</p>
          <p className="text-xs leading-relaxed">
            يمكنك طلب رأي طبيب آخر في نفس التخصص لمزيد من الطمأنينة.{" "}
            <button
              type="button"
              onClick={() =>
                setPreviewAction(
                  "طلب الرأي الثاني يحتاج حسابًا وخادم صلاحيات؛ الزر معروض لتوضيح المسار فقط.",
                )
              }
              className="text-primary-600 underline hover:text-primary-700 font-medium"
            >
              طلب رأي ثانٍ
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
