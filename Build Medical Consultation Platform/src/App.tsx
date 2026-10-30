import { lazy, Suspense, type ReactNode } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import PreviewNotice from "@/components/PreviewNotice"
import { LoadingState } from "@/components/system/AsyncState"
import RouteAnnouncer from "@/components/system/RouteAnnouncer"
import RequireRole from "@/features/auth/RequireRole"
import UnavailableService from "@/components/UnavailableService"
import { consultationsEnabled, publicPreview } from "@/lib/releaseFlags"

const Login = lazy(() => import("@/pages/auth/Login"))
const Signup = lazy(() => import("@/pages/auth/Signup"))
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"))
const UpdatePassword = lazy(() => import("@/pages/auth/UpdatePassword"))
const AcceptInvitation = lazy(() => import("@/pages/auth/AcceptInvitation"))
const ConsultationList = lazy(() => import("@/pages/consultations/List"))
const SubmitConsultation = lazy(() => import("@/pages/consultations/Submit"))
const ConsultationThread = lazy(() => import("@/pages/consultations/Thread"))
const DoctorDirectory = lazy(() => import("@/pages/doctors/Directory"))
const DoctorProfile = lazy(() => import("@/pages/doctors/Profile"))
const ArticleList = lazy(() => import("@/pages/articles/List"))
const ArticleDetail = lazy(() => import("@/pages/articles/Detail"))
const CourseList = lazy(() => import("@/pages/courses/List"))
const LibraryList = lazy(() => import("@/pages/library/List"))
const MedicalDisclaimer = lazy(() => import("@/pages/legal/Disclaimer"))
const Terms = lazy(() => import("@/pages/legal/Terms"))
const Privacy = lazy(() => import("@/pages/legal/Privacy"))
const VerificationApplication = lazy(
  () => import("@/pages/verification/Application"),
)
const LabHub = lazy(() => import("@/pages/labs/LabHub"))
const Training = lazy(() => import("@/pages/training/Training"))
const AdminLayout = lazy(() => import("@/features/admin/AdminLayout"))

interface LazyRouteProps {
  children: ReactNode
  label: string
}

function LazyRoute({ children, label }: LazyRouteProps) {
  return (
    <Suspense fallback={<LoadingState label={label} />}>{children}</Suspense>
  )
}

function ConsultationRoute({ children }: { children: ReactNode }) {
  if (!consultationsEnabled) return <UnavailableService service="الاستشارات" />
  return children
}

function PreviewRestricted({
  service,
  children,
}: {
  service: string
  children: ReactNode
}) {
  if (publicPreview) return <UnavailableService service={service} />
  return children
}

function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
    >
      <p className="text-6xl font-black text-slate-200 mb-4">٤٠٤</p>
      <h1 className="text-xl font-bold text-slate-800 mb-2">
        الصفحة غير موجودة
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        يبدو أن الصفحة التي تبحث عنها لا وجود لها.
      </p>
      <a
        href="/"
        className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        العودة للرئيسية
      </a>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="جارٍ تحميل الصفحة…" />}>
      <BrowserRouter>
        <PreviewNotice />
        <Routes>
          {/* Auth routes — no layout header/footer */}
          <Route
            path="/auth/login"
            element={
              <PreviewRestricted service="الحسابات">
                <Login />
              </PreviewRestricted>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <PreviewRestricted service="الحسابات">
                <Signup />
              </PreviewRestricted>
            }
          />
          <Route
            path="/auth/forgot-password"
            element={
              <PreviewRestricted service="الحسابات">
                <ForgotPassword />
              </PreviewRestricted>
            }
          />
          <Route
            path="/auth/update-password"
            element={
              <PreviewRestricted service="الحسابات">
                <UpdatePassword />
              </PreviewRestricted>
            }
          />
          <Route
            path="/auth/accept-invite"
            element={
              <PreviewRestricted service="الحسابات">
                <AcceptInvitation />
              </PreviewRestricted>
            }
          />

          <Route
            path="/admin/*"
            element={
              <PreviewRestricted service="لوحة الإدارة">
                <RequireRole allow={["owner", "admin", "editor"]}>
                  <LazyRoute label="جارٍ تحميل مساحة الإدارة…">
                    <AdminLayout />
                  </LazyRoute>
                </RequireRole>
              </PreviewRestricted>
            }
          />

          {/* Main layout routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Consultations */}
                  <Route
                    path="/consultations"
                    element={
                      <ConsultationRoute>
                        <ConsultationList />
                      </ConsultationRoute>
                    }
                  />
                  <Route
                    path="/consultations/new"
                    element={
                      <ConsultationRoute>
                        <SubmitConsultation />
                      </ConsultationRoute>
                    }
                  />
                  <Route
                    path="/consultations/:id"
                    element={
                      <ConsultationRoute>
                        <ConsultationThread />
                      </ConsultationRoute>
                    }
                  />

                  {/* Doctors */}
                  <Route
                    path="/doctors"
                    element={
                      <PreviewRestricted service="دليل الأطباء">
                        <DoctorDirectory />
                      </PreviewRestricted>
                    }
                  />
                  <Route
                    path="/doctors/:id"
                    element={
                      <PreviewRestricted service="دليل الأطباء">
                        <DoctorProfile />
                      </PreviewRestricted>
                    }
                  />

                  {/* Articles, courses & library */}
                  <Route path="/articles" element={<ArticleList />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route
                    path="/articles/new"
                    element={<UnavailableService service="إرسال المقالات" />}
                  />
                  <Route path="/courses" element={<CourseList />} />
                  <Route
                    path="/training"
                    element={
                      <LazyRoute label="جارٍ تحميل مسار التدريب…">
                        <Training />
                      </LazyRoute>
                    }
                  />
                  <Route
                    path="/labs"
                    element={
                      <LazyRoute label="جارٍ تحميل مختبر التعلم…">
                        <LabHub />
                      </LazyRoute>
                    }
                  />
                  <Route
                    path="/labs/:moduleId"
                    element={
                      <LazyRoute label="جارٍ تحميل الوحدة التدريبية…">
                        <LabHub />
                      </LazyRoute>
                    }
                  />
                  <Route path="/library" element={<LibraryList />} />

                  {/* Legal */}
                  <Route
                    path="/legal/disclaimer"
                    element={<MedicalDisclaimer />}
                  />
                  <Route path="/legal/terms" element={<Terms />} />
                  <Route path="/legal/privacy" element={<Privacy />} />
                  <Route
                    path="/verification/apply"
                    element={
                      <PreviewRestricted service="التحقق من الأطباء">
                        <VerificationApplication />
                      </PreviewRestricted>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <RouteAnnouncer />
      </BrowserRouter>
    </Suspense>
  )
}
