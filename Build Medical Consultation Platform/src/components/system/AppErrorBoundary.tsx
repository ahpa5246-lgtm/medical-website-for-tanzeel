import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCcw, RotateCcw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("MedConnect render boundary", info.componentStack)
    }
  }

  private retry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main dir="rtl" className="mc-system-state">
        <section className="mc-system-state__panel mc-surface-raised" role="alert">
          <span className="mc-system-state__icon" aria-hidden="true">
            <AlertTriangle />
          </span>
          <h1 className="mc-system-state__title">تعذر عرض المنصة</h1>
          <p className="mc-system-state__description">
            حدث خطأ غير متوقع أثناء تحميل الواجهة. يمكنكِ إعادة المحاولة دون
            مغادرة الصفحة، أو إعادة تحميل المنصة إذا استمر الخطأ.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={this.retry} className="mc-system-state__action">
              <RotateCcw className="h-4 w-4" /> إعادة المحاولة
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mc-system-state__action bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4" /> إعادة تحميل المنصة
            </button>
          </div>
        </section>
      </main>
    )
  }
}
