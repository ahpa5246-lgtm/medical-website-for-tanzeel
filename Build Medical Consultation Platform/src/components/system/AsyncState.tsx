import type { ReactNode } from "react"
import {
  AlertTriangle,
  Ban,
  CloudOff,
  Inbox,
  LoaderCircle,
  RotateCcw,
} from "lucide-react"

interface BaseStateProps {
  title: string
  description: string
  icon: ReactNode
  role?: "status" | "alert"
  action?: ReactNode
}

function StateSurface({
  title,
  description,
  icon,
  role = "status",
  action,
}: BaseStateProps) {
  return (
    <section dir="rtl" className="mc-system-state" role={role}>
      <div className="mc-system-state__panel mc-surface">
        <span className="mc-system-state__icon" aria-hidden="true">
          {icon}
        </span>
        <h2 className="mc-system-state__title">{title}</h2>
        <p className="mc-system-state__description">{description}</p>
        {action}
      </div>
    </section>
  )
}

export function LoadingState({ label = "جارٍ تحميل المحتوى…" }) {
  return (
    <StateSurface
      title="لحظات قليلة"
      description={label}
      icon={
        <LoaderCircle className="animate-spin motion-reduce:animate-none" />
      }
    />
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <StateSurface
      title={title}
      description={description}
      icon={<Inbox />}
      action={action}
    />
  )
}

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function ErrorState({
  title = "تعذر إكمال الطلب",
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <StateSurface
      title={title}
      description={description}
      icon={<AlertTriangle />}
      role="alert"
      action={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mc-system-state__action"
          >
            <RotateCcw className="h-4 w-4" /> إعادة المحاولة
          </button>
        ) : undefined
      }
    />
  )
}

export function DeniedState({
  description = "لا يملك هذا الحساب صلاحية الوصول إلى هذا المحتوى.",
}) {
  return (
    <StateSurface
      title="الوصول غير متاح"
      description={description}
      icon={<Ban />}
      role="alert"
    />
  )
}

export function OfflineState() {
  return (
    <StateSurface
      title="لا يوجد اتصال بالإنترنت"
      description="تحققي من الاتصال، ثم أعيدي المحاولة دون فقدان البيانات المدخلة."
      icon={<CloudOff />}
      role="alert"
    />
  )
}
