import { lazy, Suspense, type ReactNode } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import Login from "@/pages/auth/Login"
import Signup from "@/pages/auth/Signup"
import ForgotPassword from "@/pages/auth/ForgotPassword"
import UpdatePassword from "@/pages/auth/UpdatePassword"
import AcceptInvitation from "@/pages/auth/AcceptInvitation"
import ConsultationList from "@/pages/consultations/List"
import SubmitConsultation from "@/pages/consultations/Submit"
import ConsultationThread from "@/pages/consultations/Thread"
import DoctorDirectory from "@/pages/doctors/Directory"
import DoctorProfile from "@/pages/doctors/Profile"
import ArticleList from "@/pages/articles/List"
import ArticleDetail from "@/pages/articles/Detail"
import ArticleEditor from "@/pages/articles/Editor"
import CourseList from "@/pages/courses/List"
import LibraryList from "@/pages/library/List"
import MedicalDisclaimer from "@/pages/legal/Disclaimer"
import Terms from "@/pages/legal/Terms"
import Privacy from "@/pages/legal/Privacy"
import VerificationApplication from "@/pages/verification/Application"
import PreviewNotice from "@/components/PreviewNotice"
import { LoadingState } from "@/components/system/AsyncState"
import RouteAnnouncer from "@/components/system/RouteAnnouncer"
import RequireRole from "@/features/auth/RequireRole"

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
      <Routes>
        {/* Auth routes — no layout header/footer */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />
        <Route path="/auth/accept-invite" element={<AcceptInvitation />} />

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
                  element={<VerificationApplication />}
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
  )
}
