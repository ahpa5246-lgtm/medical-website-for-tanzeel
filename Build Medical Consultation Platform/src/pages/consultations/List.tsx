import { Link } from "react-router-dom"
import { MessageCircle, Clock, Plus, ChevronLeft } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { MOCK_CONSULTATIONS } from "@/data/mockData"
import { formatTimeAgo } from "@/lib/utils"
import DemoLabel from "@/components/DemoLabel"

const STATUS_LABELS: Record<string, string> = {
  open: "قيد الانتظار",
  answered: "تمت الإجابة",
  closed: "مغلقة",
}

const STATUS_VARIANTS: Record<string, "warning" | "success" | "muted"> = {
  open: "warning",
  answered: "success",
  closed: "muted",
}

export default function ConsultationList() {
  // TODO: Replace with real query filtered by current user's ID via Supabase RLS
  const consultations = MOCK_CONSULTATIONS

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">استشاراتي</h1>
          <p className="text-slate-500 text-sm mt-1">
            متابعة جميع استشاراتك الطبية
          </p>
        </div>
        <Link to="/consultations/new">
          <Button className="gap-1.5">
            <Plus className="w-4 h-4" />
            استشارة جديدة
          </Button>
        </Link>
      </div>
      <div className="mb-5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs leading-6 text-primary-900">
        الاستشارات أدناه أمثلة مركبة لشرح الحالات المتوقعة، وليست بيانات مرضى
        حقيقية.
      </div>

      {consultations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            لا توجد استشارات بعد
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            اطرح أول سؤال طبي وسيجيبك طبيب متخصص خلال ساعات
          </p>
          <Link to="/consultations/new">
            <Button variant="accent">ابدأ استشارتك الأولى</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Link key={c.id} to={`/consultations/${c.id}`}>
              <Card hover className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.status === "answered"
                      ? "bg-emerald-50 text-emerald-600"
                      : c.status === "open"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <DemoLabel>استشارة وهوية ورسائل خيالية</DemoLabel>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {c.title}
                    </p>
                    <Badge variant={STATUS_VARIANTS[c.status]} size="sm">
                      {STATUS_LABELS[c.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c.specialty}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(new Date(c.submittedAt))}
                    </span>
                    {c.doctorName && (
                      <span className="flex items-center gap-1">
                        <span>·</span>
                        {c.doctorName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ms-auto">
                      {c.messageCount} رسائل
                      <ChevronLeft className="w-3.5 h-3.5 rtl-flip" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
