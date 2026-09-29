import { NavLink, Route, Routes } from "react-router-dom"
import { LayoutDashboard, LogOut, MessageSquareText, Stethoscope, Users } from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"
import AdminDashboard from "./AdminDashboard"
import AdminDoctors from "./AdminDoctors"
import DoctorEditor from "./DoctorEditor"
import AdminUsers from "./AdminUsers"\nimport AdminConsultations from "./AdminConsultations"\nimport RequireRole from "@/features/auth/RequireRole"

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const links = [
    ["/admin", "لوحة التحكم", LayoutDashboard],
    ["/admin/doctors", "إدارة الأطباء", Stethoscope],\n    ...(profile?.role === "owner" || profile?.role === "admin" ? [["/admin/consultations", "الاستشارات", MessageSquareText] as const] : []),
    ["/admin/users", "المستخدمون", Users],
  ] as const
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[17rem_1fr]"
    >
      <aside className="border-b border-slate-200 bg-slate-950 p-5 text-white lg:min-h-screen lg:border-b-0 lg:border-l">
        <p className="text-lg font-black">MedConnect</p>
        <p className="mt-1 text-xs text-slate-400">مساحة الإدارة</p>
        <nav className="mt-7 flex gap-2 lg:flex-col">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-7 border-t border-slate-800 pt-5">
          <p className="text-sm font-bold">{profile?.display_name}</p>
          <p className="text-xs text-slate-400">{profile?.role}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-4 flex items-center gap-2 text-sm font-bold text-red-300"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="p-5 sm:p-8 lg:p-10">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="doctors/new" element={<DoctorEditor />} />
          <Route path="doctors/:id" element={<DoctorEditor />} />
          <Route path="users" element={<AdminUsers />} />\n          <Route path="consultations" element={<RequireRole allow={["owner","admin"]}><AdminConsultations /></RequireRole>} />
        </Routes>
      </main>
    </div>
  )
}
