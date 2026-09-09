import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Users,
  UserCheck,
  X,
  XCircle
} from "lucide-react";

import api from "../../services/api";


// ============================================================
// CONSTANTS
// ============================================================

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

const AUDIENCES = [
  {
    value: "all_active",
    title: "All Active Students",
    description: "Send to every currently active student.",
    icon: Users
  },
  {
    value: "unpaid",
    title: "Students With Unpaid Fees",
    description: "Target active students who have not paid.",
    icon: Clock3
  },
  {
    value: "selected",
    title: "Selected Students",
    description: "Choose specific students manually.",
    icon: UserCheck
  }
];

const NOTIFICATION_TYPES = [
  {
    value: "fee_reminder",
    title: "Fee Reminder",
    description: "Remind students about pending monthly fees.",
    icon: BellRing
  },
  {
    value: "announcement",
    title: "Announcement",
    description: "Send an important library announcement.",
    icon: Megaphone
  }
];


// ============================================================
// HELPERS
// ============================================================

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatNotificationType(type) {
  if (type === "fee_reminder") {
    return "Fee Reminder";
  }

  if (type === "announcement") {
    return "Announcement";
  }

  return type || "Notification";
}

function formatAudience(audience) {
  if (audience === "all_active") {
    return "All Active";
  }

  if (audience === "unpaid") {
    return "Unpaid Students";
  }

  if (audience === "selected") {
    return "Selected Students";
  }

  return audience || "—";
}

function getStatusConfig(status) {
  switch (status) {
    case "sent":
      return {
        label: "Delivered",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2
      };

    case "failed":
      return {
        label: "Failed",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: XCircle
      };

    case "queued":
      return {
        label: "Queued",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3
      };

    default:
      return {
        label: status || "Unknown",
        className:
          "border-slate-200 bg-slate-50 text-slate-600",
        icon: Info
      };
  }
}


// ============================================================
// SMALL UI COMPONENTS
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClassName,
  loading
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {value}
            </p>
          )}

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 sm:flex">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}


function FormLabel({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-bold text-slate-800">
      {children}

      {required && (
        <span className="ml-1 text-orange-600">
          *
        </span>
      )}
    </label>
  );
}


function CustomSelect({
  value,
  onChange,
  children,
  disabled
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Notifications() {
  // ----------------------------------------------------------
  // PAGE DATA
  // ----------------------------------------------------------

  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    queued: 0
  });

  // ----------------------------------------------------------
  // LOADING STATES
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] =
    useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ----------------------------------------------------------
  // FORM STATE
  // ----------------------------------------------------------

  const currentDate = new Date();

  const [audience, setAudience] =
    useState("all_active");

  const [type, setType] =
    useState("fee_reminder");

  const [month, setMonth] =
    useState(currentDate.getMonth() + 1);

  const [year, setYear] =
    useState(currentDate.getFullYear());

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [selectedStudents, setSelectedStudents] =
    useState([]);

  // ----------------------------------------------------------
  // SEARCH / FILTER STATE
  // ----------------------------------------------------------

  const [studentSearch, setStudentSearch] =
    useState("");

  const [historySearch, setHistorySearch] =
    useState("");

  const [historyFilter, setHistoryFilter] =
    useState("all");

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================================
  // INITIAL DATA
  // ==========================================================

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (audience === "selected") {
      loadStudents();
    }
  }, [audience]);

  // ==========================================================
  // API
  // ==========================================================

  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [notificationsResponse, statsResponse] =
        await Promise.all([
          api.get("/notifications"),
          api.get("/notifications/stats")
        ]);

      if (
        !notificationsResponse.data?.success ||
        !statsResponse.data?.success
      ) {
        throw new Error(
          "Unable to load notification data."
        );
      }

      setNotifications(
        notificationsResponse.data.notifications || []
      );

      const statsData =
        statsResponse.data.stats ||
        statsResponse.data;

      setStats({
        total:
          statsData.total ??
          statsData.totalNotifications ??
          0,

        sent:
          statsData.sent ??
          statsData.delivered ??
          0,

        failed:
          statsData.failed ??
          0,

        queued:
          statsData.queued ??
          0
      });
    } catch (requestError) {
      console.error(
        "Notification page error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadStudents() {
    setStudentsLoading(true);

    try {
      const response =
        await api.get("/students");

      if (!response.data?.success) {
        throw new Error(
          "Unable to load students."
        );
      }

      setStudents(
        response.data.students || []
      );
    } catch (requestError) {
      console.error(
        "Load students error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }


  async function refreshNotifications() {
    setRefreshing(true);
    setError("");

    try {
      await loadPageData();
    } finally {
      setRefreshing(false);
    }
  }


  async function handleSendNotification(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------
    // Frontend validation
    // --------------------------------------------

    if (!title.trim()) {
      setError(
        "Please enter a notification title."
      );

      return;
    }

    if (!message.trim()) {
      setError(
        "Please enter a notification message."
      );

      return;
    }

    if (
      type === "fee_reminder" &&
      (!month || !year)
    ) {
      setError(
        "Please select the month and year for the fee reminder."
      );

      return;
    }

    if (
      audience === "selected" &&
      selectedStudents.length === 0
    ) {
      setError(
        "Please select at least one student."
      );

      return;
    }

    // --------------------------------------------
    // Preserve existing backend payload contract
    // --------------------------------------------

    const payload = {
      audience,
      type,
      title: title.trim(),
      message: message.trim(),
      month:
        type === "fee_reminder"
          ? Number(month)
          : undefined,
      year:
        type === "fee_reminder"
          ? Number(year)
          : undefined,
      studentIds:
        audience === "selected"
          ? selectedStudents
          : undefined
    };

    try {
      setSending(true);

      const response =
        await api.post(
          "/notifications/send",
          payload
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to send notification."
        );
      }

      const result =
        response.data;

      const successful =
        result.successful ??
        result.sent ??
        result.delivered ??
        0;

      const failed =
        result.failed ??
        0;

      const targeted =
        result.targeted ??
        result.targetedCount ??
        0;

      setSuccess(
        `Notification sent successfully. ${targeted} student${
          targeted === 1 ? "" : "s"
        } targeted${
          successful
            ? `, ${successful} delivered`
            : ""
        }${
          failed
            ? `, ${failed} failed`
            : ""
        }.`
      );

      // --------------------------------------------
      // Reset message fields only.
      // Keep audience/type/month/year for convenience.
      // --------------------------------------------

      setTitle("");
      setMessage("");
      setSelectedStudents([]);

      // --------------------------------------------
      // Refresh backend data.
      // --------------------------------------------

      await loadPageData();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (requestError) {
      console.error(
        "Send notification error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to send notification."
      );
    } finally {
      setSending(false);
    }
  }


  // ==========================================================
  // STUDENT SELECTION
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const search =
        studentSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return students;
      }

      return students.filter(
        (student) => {
          const name =
            student.name?.toLowerCase() || "";

          const phone =
            student.phoneNumber?.toLowerCase() ||
            "";

          const seat =
            student.seatNumber?.toLowerCase() ||
            "";

          return (
            name.includes(search) ||
            phone.includes(search) ||
            seat.includes(search)
          );
        }
      );
    }, [students, studentSearch]);


  function toggleStudent(studentId) {
    setSelectedStudents(
      (current) =>
        current.includes(studentId)
          ? current.filter(
              (id) => id !== studentId
            )
          : [...current, studentId]
    );
  }


  function selectAllFilteredStudents() {
    const ids =
      filteredStudents.map(
        (student) => student._id
      );

    setSelectedStudents(
      (current) => [
        ...new Set([
          ...current,
          ...ids
        ])
      ]
    );
  }


  function clearSelectedStudents() {
    setSelectedStudents([]);
  }


  // ==========================================================
  // HISTORY FILTER
  // ==========================================================

  const filteredNotifications =
    useMemo(() => {
      const search =
        historySearch
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          const matchesStatus =
            historyFilter === "all" ||
            notification.status ===
              historyFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!search) {
            return true;
          }

          const titleText =
            notification.title?.toLowerCase() ||
            "";

          const messageText =
            notification.message?.toLowerCase() ||
            "";

          const typeText =
            notification.type?.toLowerCase() ||
            "";

          return (
            titleText.includes(search) ||
            messageText.includes(search) ||
            typeText.includes(search)
          );
        }
      );
    }, [
      notifications,
      historySearch,
      historyFilter
    ]);


  // ==========================================================
  // YEAR OPTIONS
  // ==========================================================

  const yearOptions =
    useMemo(() => {
      const currentYear =
        new Date().getFullYear();

      return Array.from(
        { length: 5 },
        (_, index) =>
          currentYear - index
      );
    }, []);


  // ==========================================================
  // FORM PREVIEW
  // ==========================================================

  const selectedAudience =
    AUDIENCES.find(
      (item) =>
        item.value === audience
    );

  const selectedType =
    NOTIFICATION_TYPES.find(
      (item) =>
        item.value === type
    );

  const PreviewIcon =
    selectedType?.icon || Bell;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
              <Bell className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900 sm:text-base">
                Shri Krishna Digital Library
              </p>

              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:block">
                Admin Communication Center
              </p>
            </div>
          </div>

          {/* Header actions */}

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/admin/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>

            <button
              type="button"
              onClick={refreshNotifications}
              disabled={
                refreshing ||
                loading
              }
              title="Refresh notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* ===================================================
            PAGE HERO
        ==================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
          {/* Decorative shapes */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-orange-300">
                <Sparkles className="h-3.5 w-3.5" />
                Communication Center
              </div>

              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Keep students informed,
                <span className="text-orange-400">
                  {" "}
                  instantly.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Send targeted fee reminders and
                important library announcements
                directly to students through the
                notification system.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-5 lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
                  <Send className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Delivery
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    Manual & controlled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ===================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1 leading-6">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-bold">
                Notification sent
              </p>

              <p className="mt-1 leading-6">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100"
              aria-label="Dismiss success"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}


        {/* ===================================================
            STATISTICS
        ==================================================== */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Bell}
            label="Total Notifications"
            value={stats.total}
            description="Notifications recorded in the system"
            iconClassName="bg-orange-50 text-orange-600"
            loading={loading}
          />

          <StatCard
            icon={CheckCircle2}
            label="Delivered"
            value={stats.sent}
            description="Successfully delivered notifications"
            iconClassName="bg-emerald-50 text-emerald-600"
            loading={loading}
          />

          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats.failed}
            description="Notifications that could not be delivered"
            iconClassName="bg-red-50 text-red-600"
            loading={loading}
          />

          <StatCard
            icon={Clock3}
            label="Queued"
            value={stats.queued}
            description="Notifications currently awaiting delivery"
            iconClassName="bg-amber-50 text-amber-600"
            loading={loading}
          />
        </section>


        {/* ===================================================
            SEND + PREVIEW
        ==================================================== */}

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
          {/* =================================================
              SEND FORM
          ================================================== */}

          <form
            onSubmit={
              handleSendNotification
            }
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.05)]"
          >
            <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
              <SectionHeading
                eyebrow="Create notification"
                title="Compose a message"
                description="Choose your audience, define the message type, and send a polished notification to students."
                icon={Send}
              />

              {/* -------------------------------------------
                  AUDIENCE
              -------------------------------------------- */}

              <div>
                <FormLabel required>
                  Who should receive this?
                </FormLabel>

                <div className="grid gap-3 md:grid-cols-3">
                  {AUDIENCES.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const active =
                        audience ===
                        item.value;

                      return (
                        <button
                          key={
                            item.value
                          }
                          type="button"
                          onClick={() =>
                            setAudience(
                              item.value
                            )
                          }
                          disabled={
                            sending
                          }
                          className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${
                            active
                              ? "border-orange-500 bg-orange-50/70 shadow-[0_8px_25px_rgba(249,115,22,0.10)]"
                              : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                          }`}
                        >
                          {active && (
                            <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                              <Check className="h-3 w-3" />
                            </div>
                          )}

                          <div
                            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                              active
                                ? "bg-orange-500 text-white"
                                : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <p className="pr-5 text-sm font-black text-slate-900">
                            {item.title}
                          </p>

                          <p className="mt-1.5 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>


              {/* -------------------------------------------
                  SELECTED STUDENTS
              -------------------------------------------- */}

              {audience ===
                "selected" && (
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Select students
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedStudents.length}{" "}
                        selected
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={
                          selectAllFilteredStudents
                        }
                        disabled={
                          studentsLoading ||
                          filteredStudents.length ===
                            0
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Select visible
                      </button>

                      <button
                        type="button"
                        onClick={
                          clearSelectedStudents
                        }
                        disabled={
                          selectedStudents.length ===
                          0
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="search"
                      value={
                        studentSearch
                      }
                      onChange={(event) =>
                        setStudentSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search by name, mobile or seat..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>

                  <div className="max-h-[330px] overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    {studentsLoading ? (
                      <div className="flex min-h-[180px] items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-500" />

                          <p className="mt-3 text-xs font-semibold text-slate-500">
                            Loading students...
                          </p>
                        </div>
                      </div>
                    ) : filteredStudents.length ===
                      0 ? (
                      <div className="px-5 py-12 text-center">
                        <Users className="mx-auto h-8 w-8 text-slate-300" />

                        <p className="mt-3 text-sm font-bold text-slate-700">
                          No students found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try another search.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredStudents.map(
                          (student) => {
                            const selected =
                              selectedStudents.includes(
                                student._id
                              );

                            return (
                              <button
                                key={
                                  student._id
                                }
                                type="button"
                                onClick={() =>
                                  toggleStudent(
                                    student._id
                                  )
                                }
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                                  selected
                                    ? "bg-orange-50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                    selected
                                      ? "bg-orange-500 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {student.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                    "S"}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {student.name ||
                                      "Unnamed student"}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {student.phoneNumber ||
                                      "No mobile"}{" "}
                                    • Seat{" "}
                                    {student.seatNumber ||
                                      "—"}
                                  </p>
                                </div>

                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                    selected
                                      ? "border-orange-500 bg-orange-500 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* -------------------------------------------
                  TYPE
              -------------------------------------------- */}

              <div className="mt-7">
                <FormLabel required>
                  Notification type
                </FormLabel>

                <div className="grid gap-3 sm:grid-cols-2">
                  {NOTIFICATION_TYPES.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const active =
                        type ===
                        item.value;

                      return (
                        <button
                          key={
                            item.value
                          }
                          type="button"
                          onClick={() =>
                            setType(
                              item.value
                            )
                          }
                          disabled={
                            sending
                          }
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-orange-500 bg-orange-50/70"
                              : "border-slate-200 bg-white hover:border-orange-200"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-orange-500 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-black text-slate-900">
                                {item.title}
                              </p>

                              {active && (
                                <Check className="h-4 w-4 shrink-0 text-orange-600" />
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>


              {/* -------------------------------------------
                  MONTH / YEAR
              -------------------------------------------- */}

              {type ===
                "fee_reminder" && (
                <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Fee period
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Select the month this reminder
                        refers to.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FormLabel required>
                        Month
                      </FormLabel>

                      <CustomSelect
                        value={
                          month
                        }
                        onChange={(event) =>
                          setMonth(
                            Number(
                              event.target
                                .value
                            )
                          )
                        }
                        disabled={
                          sending
                        }
                      >
                        {MONTHS.map(
                          (
                            monthOption
                          ) => (
                            <option
                              key={
                                monthOption.value
                              }
                              value={
                                monthOption.value
                              }
                            >
                              {
                                monthOption.label
                              }
                            </option>
                          )
                        )}
                      </CustomSelect>
                    </div>

                    <div>
                      <FormLabel required>
                        Year
                      </FormLabel>

                      <CustomSelect
                        value={year}
                        onChange={(event) =>
                          setYear(
                            Number(
                              event.target
                                .value
                            )
                          )
                        }
                        disabled={
                          sending
                        }
                      >
                        {yearOptions.map(
                          (
                            yearOption
                          ) => (
                            <option
                              key={
                                yearOption
                              }
                              value={
                                yearOption
                              }
                            >
                              {
                                yearOption
                              }
                            </option>
                          )
                        )}
                      </CustomSelect>
                    </div>
                  </div>
                </div>
              )}


              {/* -------------------------------------------
                  TITLE
              -------------------------------------------- */}

              <div className="mt-7">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel required>
                    Notification title
                  </FormLabel>

                  <span className="mb-2 text-[11px] font-semibold text-slate-400">
                    {title.length}/80
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={80}
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder={
                    type ===
                    "fee_reminder"
                      ? "Monthly fee reminder"
                      : "Important library announcement"
                  }
                  disabled={sending}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-slate-50"
                />
              </div>


              {/* -------------------------------------------
                  MESSAGE
              -------------------------------------------- */}

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel required>
                    Message
                  </FormLabel>

                  <span className="mb-2 text-[11px] font-semibold text-slate-400">
                    {message.length}/500
                  </span>
                </div>

                <textarea
                  maxLength={500}
                  rows={6}
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder={
                    type ===
                    "fee_reminder"
                      ? "Please clear your monthly library fee for the selected month."
                      : "Write your important announcement here..."
                  }
                  disabled={sending}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-slate-50"
                />
              </div>


              {/* -------------------------------------------
                  FOOTER ACTION
              -------------------------------------------- */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <span>
                    Notifications are sent manually by
                    the library operator.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-w-[180px]"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>


          {/* =================================================
              LIVE PREVIEW
          ================================================== */}

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-600">
                      Live preview
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      Student notification
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Bell className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6">
                {/* Phone-style notification */}

                <div className="mx-auto max-w-[390px] rounded-[28px] border border-slate-200 bg-slate-950 p-2 shadow-2xl">
                  <div className="overflow-hidden rounded-[22px] bg-[#f7f8fa]">
                    {/* Fake status bar */}

                    <div className="flex items-center justify-between bg-white px-5 py-3 text-[10px] font-bold text-slate-500">
                      <span>
                        9:41
                      </span>

                      <span>
                        Shri Krishna Library
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                          <Bell className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[11px] font-black text-slate-900">
                            Shri Krishna Digital Library
                          </p>

                          <p className="text-[9px] font-semibold text-slate-400">
                            Just now
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <PreviewIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900">
                              {title.trim() ||
                                "Your notification title"}
                            </p>

                            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                              {message.trim() ||
                                "Your notification message will appear here."}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-700">
                                {formatNotificationType(
                                  type
                                )}
                              </span>

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">
                                {formatAudience(
                                  audience
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Preview details */}

                <div className="mt-5 grid gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Audience
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {selectedAudience?.icon && (
                        <selectedAudience.icon className="h-4 w-4 text-orange-600" />
                      )}

                      <p className="text-sm font-bold text-slate-800">
                        {selectedAudience?.title ||
                          "Audience"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Delivery
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      Manual push notification
                    </p>
                  </div>

                  {type ===
                    "fee_reminder" && (
                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                        Fee period
                      </p>

                      <p className="mt-2 text-sm font-bold text-orange-900">
                        {
                          MONTHS.find(
                            (item) =>
                              item.value ===
                              Number(month)
                          )?.label
                        }{" "}
                        {year}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </section>


        {/* ===================================================
            NOTIFICATION HISTORY
        ==================================================== */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Activity"
                title="Notification history"
                description="Review notifications sent from the admin panel and monitor delivery status."
                icon={Clock3}
              />

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:mb-6 lg:w-auto">
                <div className="relative min-w-0 flex-1 sm:min-w-[250px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={
                      historySearch
                    }
                    onChange={(event) =>
                      setHistorySearch(
                        event.target.value
                      )
                    }
                    placeholder="Search notifications..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <CustomSelect
                  value={
                    historyFilter
                  }
                  onChange={(event) =>
                    setHistoryFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="sent">
                    Delivered
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                  <option value="queued">
                    Queued
                  </option>
                </CustomSelect>
              </div>
            </div>
          </div>


          {/* =================================================
              HISTORY LOADING
          ================================================== */}

          {loading ? (
            <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-100 p-5"
                  >
                    <div className="h-4 w-32 rounded bg-slate-100" />

                    <div className="mt-4 h-5 w-3/4 rounded bg-slate-100" />

                    <div className="mt-3 h-12 w-full rounded bg-slate-100" />

                    <div className="mt-5 h-4 w-24 rounded bg-slate-100" />
                  </div>
                )
              )}
            </div>
          ) : filteredNotifications.length ===
            0 ? (
            <div className="px-5 py-16 text-center sm:px-7">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-base font-black text-slate-800">
                No notifications found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Notifications you send from the
                communication center will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------
                  MOBILE / TABLET CARDS
              ---------------------------------------------- */}

              <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-2 xl:hidden">
                {filteredNotifications.map(
                  (notification) => {
                    const statusConfig =
                      getStatusConfig(
                        notification.status
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    return (
                      <div
                        key={
                          notification._id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                              <Bell className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {notification.title ||
                                  "Notification"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {formatDateTime(
                                  notification.createdAt
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusConfig.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />

                            {
                              statusConfig.label
                            }
                          </span>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                          {notification.message ||
                            "No message"}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Type
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatNotificationType(
                                notification.type
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Audience
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatAudience(
                                notification.audience
                              )}
                            </p>
                          </div>
                        </div>

                        {(notification.month ||
                          notification.year) && (
                          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                            <p className="text-xs font-semibold text-slate-500">
                              Fee period:{" "}
                              <span className="font-black text-slate-700">
                                {notification.month
                                  ? MONTHS.find(
                                      (
                                        item
                                      ) =>
                                        item.value ===
                                        Number(
                                          notification.month
                                        )
                                    )?.label
                                  : "—"}{" "}
                                {notification.year ||
                                  ""}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>


              {/* ---------------------------------------------
                  DESKTOP TABLE
              ---------------------------------------------- */}

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-7 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Notification
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Type
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Audience
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredNotifications.map(
                      (notification) => {
                        const statusConfig =
                          getStatusConfig(
                            notification.status
                          );

                        const StatusIcon =
                          statusConfig.icon;

                        return (
                          <tr
                            key={
                              notification._id
                            }
                            className="group transition hover:bg-orange-50/30"
                          >
                            <td className="max-w-[440px] px-7 py-5">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                  <Bell className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-slate-900">
                                    {notification.title ||
                                      "Notification"}
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                    {notification.message ||
                                      "No message"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                {formatNotificationType(
                                  notification.type
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-xs font-bold text-slate-700">
                                {formatAudience(
                                  notification.audience
                                )}
                              </p>

                              {(notification.month ||
                                notification.year) && (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {notification.month
                                    ? MONTHS.find(
                                        (
                                          item
                                        ) =>
                                          item.value ===
                                          Number(
                                            notification.month
                                          )
                                      )?.label
                                    : "—"}{" "}
                                  {notification.year ||
                                    ""}
                                </p>
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-5">
                              <p className="text-xs font-bold text-slate-700">
                                {formatDate(
                                  notification.createdAt
                                )}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {new Date(
                                  notification.createdAt ||
                                    Date.now()
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit"
                                  }
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusConfig.className}`}
                              >
                                <StatusIcon className="h-3 w-3" />

                                {
                                  statusConfig.label
                                }
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>


        {/* ===================================================
            FOOTER NOTE
        ==================================================== */}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

            <p className="leading-5">
              Notifications are controlled manually by
              the library operator. No automatic fee
              reminders are triggered from this page.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 font-bold text-orange-600 transition hover:text-orange-700"
          >
            Back to dashboard
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>
      </main>
    </div>
  );
}