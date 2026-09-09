import { Link, useNavigate } from "react-router-dom";

import {
  IndianRupee,
  Users,
  CreditCard,
  Bell,
  History,
  LogOut
} from "lucide-react";
// import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Shri Krishna Digital Library
            </p>

            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin?.name ||
                  "Library Admin"}
              </p>

              <p className="text-xs text-slate-500">
                {admin?.email || ""}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <LogOut size={16} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-6 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">
            Welcome back
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {admin?.name ||
              "Library Admin"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Manage students, monthly fees,
            payment records and library
            operations from one place.
          </p>
        </section>

        {/* Main Management Cards */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Student Management */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/students")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Student Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add students, update student
              details and manage enrollment
              status.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-blue-700">
              Manage Students →
            </span>
          </button>

          {/* Fee Management */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/fees")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <IndianRupee size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Fee Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Check monthly fee status and
              manually record offline student
              payments.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-green-700">
              Manage Fees →
            </span>
          </button>

          {/* Payment History */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/payments")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <History size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Payment History
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View recorded payments,
              collection summaries and complete
              payment audit history.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-purple-700">
              View Payments →
            </span>
          </button>

          {/* Notifications */}
          <Link
            to="/admin/notifications"
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                <Bell className="h-6 w-6" />
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Available
              </span>
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Notifications
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send fee reminders and important library
              announcements directly to students.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-orange-600">
              Open Notifications
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
          {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Bell size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Notifications
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send fee reminders and important
              library announcements to students.
            </p>

            <span className="mt-4 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              Coming Next
            </span>
          </div> */}

          {/* Manual Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CreditCard size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Offline Payments
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Students pay the library operator
              directly. The operator manually
              records the payment in the admin
              panel.
            </p>

            <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Manual Entry
            </span>
          </div>

          {/* Audit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <History size={24} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Payment Audit
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Payment corrections are tracked
              with the previous value, corrected
              value, reason and administrator.
            </p>

            <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Enabled
            </span>
          </div>
        </section>

        {/* Payment Policy */}
        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">
            Payment Policy
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            This application does not process
            online payments. Students pay the
            library operator directly through
            offline methods such as cash or UPI.
            The library operator is responsible
            for manually marking payments as paid.
          </p>
        </section>
      </main>
    </div>
  );
}