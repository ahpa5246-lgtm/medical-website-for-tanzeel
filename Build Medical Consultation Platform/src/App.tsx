import { lazy, Suspense, type ReactNode } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import PreviewNotice from "@/components/PreviewNotice"
import { LoadingState } from "@/components/system/AsyncState"
import RouteAnnouncer from "@/components/system/RouteAnnouncer"
import RequireRole from "@/features/auth/RequireRole"

const AdminLayout = lazy(() => import("@/features/admin/AdminLayout"))
const ContentDetail = lazy(() => import("@/features/content/ContentDetail"))
const ContentEditor = lazy(() => import("@/features/content/ContentEditor"))
const ContentManage = lazy(() => import("@/features/content/ContentManage"))
const TanzeelSpace = lazy(() => import("@/features/tanzeel/TanzeelSpace"))
const TanzeelManage = lazy(() => import("@/features/tanzeel/TanzeelManage"))
const Login = lazy(() => import("@/pages/auth/Login"))
const Signup = lazy(() => import("@/pages/auth/Signup"))
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"))
const ConsultationList = lazy(() => import("@/pages/consultations/List"))
const SubmitConsultation = lazy(() => import("@/pages/consultations/Submit"))
const ConsultationThread = lazy(() => import("@/pages/consultations/Thread"))
const DoctorDirectory = lazy(() => import("@/pages/doctors/Directory"))
const DoctorProfile = lazy(() => import("@/pages/doctors/Profile"))
const ArticleList = lazy(() => import("@/pages/articles/List"))
const ArticleDetail = lazy(() => import("@/pages/articles/Detail"))
const ArticleEditor = lazy(() => import("@/pages/articles/Editor"))
const CourseList = lazy(() => import("@/pages/courses/List"))
const LibraryList = lazy(() => import("@/pages/library/List"))
const MedicalDisclaimer = lazy(() => import("@/pages/legal/Disclaimer"))
const Terms = lazy(() => import("@/pages/legal/Terms"))
const Privacy = lazy(() => import("@/pages/legal/Privacy"))
const VerificationApplication = lazy(
  () => import("@/pages/verification/Application"),
)

interface LazyRouteProps {
  children: ReactNode
  label: string
}

function LazyRoute({ children, label }: LazyRouteProps) {
  return (
    <Suspense fallback={<LoadingState label={label} />}>{children}</Suspense>
  )
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
    <BrowserRouter>
      <PreviewNotice />
      <Suspense fallback={<LoadingState label="جارٍ تحميل الصفحة…" />}>
        <Routes>
          {/* Auth routes — no layout header/footer */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/admin/*"
            element={
              <RequireRole allow={["owner", "admin", "editor"]}>
                <LazyRoute label="جارٍ تحميل مساحة الإدارة…">
                  <AdminLayout />
                </LazyRoute>
              </RequireRole>
            }
          />

          {/* Main layout routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tanzeel" element={<TanzeelSpace />} />
                  <Route path="/tanzeel/manage" element={<TanzeelManage />} />

                  {/* Consultations */}
                  <Route path="/consultations" element={<ConsultationList />} />
                  <Route
                    path="/consultations/new"
                    element={<SubmitConsultation />}
                  />
                  <Route
                    path="/consultations/:id"
                    element={<ConsultationThread />}
                  />

                  {/* Doctors */}
                  <Route path="/doctors" element={<DoctorDirectory />} />
                  <Route path="/doctors/:id" element={<DoctorProfile />} />

                  {/* Articles, courses & library */}
                  <Route path="/articles" element={<ArticleList />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/articles/new" element={<ArticleEditor />} />
                  <Route path="/courses" element={<CourseList />} />
                  <Route
                    path="/courses/manage"
                    element={<ContentManage kind="course" />}
                  />
                  <Route
                    path="/courses/new"
                    element={<ContentEditor kind="course" />}
                  />
                  <Route
                    path="/courses/:id/edit"
                    element={<ContentEditor kind="course" />}
                  />
                  <Route
                    path="/courses/:id"
                    element={<ContentDetail kind="course" />}
                  />
                  <Route
                    path="/training"
                    element={<Navigate to="/courses" replace />}
                  />
                  <Route path="/library" element={<LibraryList />} />
                  <Route
                    path="/library/manage"
                    element={<ContentManage kind="library" />}
                  />
                  <Route
                    path="/library/new"
                    element={<ContentEditor kind="library" />}
                  />
                  <Route
                    path="/library/:id/edit"
                    element={<ContentEditor kind="library" />}
                  />
                  <Route
                    path="/library/:id"
                    element={<ContentDetail kind="library" />}
                  />

                  {/* Legal */}
                  <Route
                    path="/legal/disclaimer"
                    element={<MedicalDisclaimer />}
                  />
                  <Route path="/legal/terms" element={<Terms />} />
                  <Route path="/legal/privacy" element={<Privacy />} />
                  <Route
                    path="/verification/apply"
                    element={<VerificationApplication />}
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
      <RouteAnnouncer />
    </BrowserRouter>
  )
}
