import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Users,
  CreditCard,
  Bell,
  History,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const admin = JSON.parse(
    localStorage.getItem("admin") || "null"
  );

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    navigate("/admin/login", {
      replace: true
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-orange-900/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                <Sparkles size={10} className="text-orange-600" />
                ADMIN PORTAL
              </span>
              <h1 className="font-serif text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Shri Krishna Digital Library
              </h1>
            </div>
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">
                {admin?.name || "Library Admin"}
              </p>
              <p className="text-xs text-slate-500">
                {admin?.email || "admin@shrikrishna.com"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white active:scale-95"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Colorful Welcome Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#2B170B] via-[#42220F] to-[#2B170B] p-6 text-white shadow-xl shadow-orange-950/10 sm:p-8">
          {/* Ambient Colorful Background Glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live System Dashboard
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-amber-50 sm:text-3xl lg:text-4xl">
                Welcome back, {admin?.name || "Library Admin"} 👋
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-100/80 sm:text-base">
                Manage student records, track monthly fee statuses, record offline payments, and send instant notifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-amber-100 backdrop-blur-md border border-white/10">
                <ShieldCheck size={18} className="text-amber-300" />
                <span>Operator Privileges</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Colorful Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Student Management Card */}
          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
                  <Users size={24} />
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  Manage Records
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Student Management
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Add new students, update contact details, set library seating, and manage active enrollments.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 transition-all group-hover:translate-x-1">
              <span>Manage Students</span>
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Fee Management Card */}
          <button
            type="button"
            onClick={() => navigate("/admin/fees")}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
                  <IndianRupee size={24} />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Collect Dues
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Fee Management
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Check monthly dues, monitor pending student payments, and manually process offline fee records.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-600 transition-all group-hover:translate-x-1">
              <span>Manage Fees</span>
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Payment History Card */}
          <button
            type="button"
            onClick={() => navigate("/admin/payments")}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 transition-transform duration-300 group-hover:scale-110">
                  <History size={24} />
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  Audit Logs
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Payment History
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Access transaction histories, payment collection summaries, and administrative correction logs.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-600 transition-all group-hover:translate-x-1">
              <span>View Payments</span>
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Notifications Card */}
          <Link
            to="/admin/notifications"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 transition-transform duration-300 group-hover:scale-110">
                  <Bell size={24} />
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  Active Feature
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Send fee reminders, seat notices, and important library announcements directly to student portals.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-orange-600 transition-all group-hover:translate-x-1">
              <span>Open Notifications</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          {/* Offline Payments Info Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-teal-400 to-cyan-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100">
                  <CreditCard size={24} />
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  Manual Entry
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Offline Payments
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Students pay operators directly via cash or personal UPI. Operators manually update system records.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              <CheckCircle2 size={16} className="text-teal-600" />
              <span>Direct Operator Entry System</span>
            </div>
          </div>

          {/* Payment Audit Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r from-rose-400 to-pink-500" />
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-100">
                  <Zap size={24} />
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                  Enabled
                </span>
              </div>

              <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                Payment Audit
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Payment corrections are logged with old/new values, reasons, and operator timestamps for security.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <CheckCircle2 size={16} className="text-rose-600" />
              <span>Full Audit Trail Enabled</span>
            </div>
          </div>

        </section>

        {/* Informational Payment Policy Banner */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                Payment Policy Banner
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                This application does not process online payment transactions directly. Students pay the library operator directly through offline methods such as Cash or UPI. The library operator is responsible for manually marking payments as paid in this admin panel.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}