import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  BellRing,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Megaphone,
  RefreshCw,
  Search,
  Send,
  Users,
  UserCheck,
  UserRound,
  WalletCards
} from "lucide-react";

import api from "../../services/api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const CURRENT_DATE =
  new Date();

const CURRENT_MONTH =
  CURRENT_DATE.getMonth() + 1;

const CURRENT_YEAR =
  CURRENT_DATE.getFullYear();

const AUDIENCES = [
  {
    id: "all_active",
    title: "All active students",
    description:
      "Send to every currently enrolled student.",
    icon: Users
  },

  {
    id: "unpaid",
    title: "Students with unpaid fees",
    description:
      "Target active students who have not paid the selected month.",
    icon: WalletCards
  },

  {
    id: "selected",
    title: "Select students",
    description:
      "Choose specific students from the active student list.",
    icon: UserCheck
  }
];

function getDefaultTitle(type) {
  return type === "fee_reminder"
    ? "Monthly fee reminder"
    : "Library announcement";
}

function getDefaultMessage(type) {
  return type === "fee_reminder"
    ? "Your monthly library fee is pending. Please contact the library operator to complete your payment."
    : "We have an important announcement from Shri Krishna Digital Library.";
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function getStatusClasses(status) {
  if (status === "sent") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-amber-200";
}

export default function Notifications() {
  const [students, setStudents] =
    useState([]);

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [stats, setStats] =
    useState({
      total: 0,
      sent: 0,
      failed: 0,
      queued: 0
    });

  const [audience, setAudience] =
    useState("all_active");

  const [type, setType] =
    useState("fee_reminder");

  const [
    selectedStudentIds,
    setSelectedStudentIds
  ] = useState([]);

  const [
    studentSearch,
    setStudentSearch
  ] = useState("");

  const [month, setMonth] =
    useState(CURRENT_MONTH);

  const [year, setYear] =
    useState(CURRENT_YEAR);

  const [title, setTitle] =
    useState(
      getDefaultTitle(
        "fee_reminder"
      )
    );

  const [message, setMessage] =
    useState(
      getDefaultMessage(
        "fee_reminder"
      )
    );

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTitle(
      getDefaultTitle(type)
    );

    setMessage(
      getDefaultMessage(type)
    );
  }, [type]);

  async function loadData(
    showRefreshState = false
  ) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        studentsResponse,
        notificationsResponse,
        statsResponse
      ] = await Promise.all([
        api.get("/students"),

        api.get(
          "/notifications?limit=50"
        ),

        api.get(
          "/notifications/stats"
        )
      ]);

      setStudents(
        studentsResponse.data
          .students || []
      );

      setNotifications(
        notificationsResponse.data
          .notifications || []
      );

      setStats(
        statsResponse.data.stats || {
          total: 0,
          sent: 0,
          failed: 0,
          queued: 0
        }
      );
    } catch (requestError) {
      console.error(
        "Notifications page load error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
          requestError.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const activeStudents =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.enrollmentStatus ===
            "active"
        ),
      [students]
    );

  const filteredStudents =
    useMemo(() => {
      const query =
        studentSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return activeStudents;
      }

      return activeStudents.filter(
        (student) => {
          const searchableText = [
            student.name,
            student.phoneNumber,
            student.seatNumber
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      activeStudents,
      studentSearch
    ]);

  const selectedStudents =
    useMemo(
      () =>
        activeStudents.filter(
          (student) =>
            selectedStudentIds.includes(
              student._id
            )
        ),
      [
        activeStudents,
        selectedStudentIds
      ]
    );

  const yearOptions =
    useMemo(() => {
      return Array.from(
        { length: 5 },
        (_, index) =>
          CURRENT_YEAR - index
      );
    }, []);

  function toggleStudent(
    studentId
  ) {
    setSelectedStudentIds(
      (current) =>
        current.includes(studentId)
          ? current.filter(
              (id) =>
                id !== studentId
            )
          : [
              ...current,
              studentId
            ]
    );
  }

  function selectAllVisible() {
    const visibleIds =
      filteredStudents.map(
        (student) =>
          student._id
      );

    setSelectedStudentIds(
      (current) => [
        ...new Set([
          ...current,
          ...visibleIds
        ])
      ]
    );
  }

  function clearSelected() {
    setSelectedStudentIds([]);
  }

  async function handleSend(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

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
      audience === "selected" &&
      selectedStudentIds.length === 0
    ) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    try {
      setSending(true);

      const response =
        await api.post(
          "/notifications/send",
          {
            audience,
            type,

            studentIds:
              audience === "selected"
                ? selectedStudentIds
                : [],

            title:
              title.trim(),

            message:
              message.trim(),

            month:
              type ===
                "fee_reminder" ||
              audience === "unpaid"
                ? Number(month)
                : undefined,

            year:
              type ===
                "fee_reminder" ||
              audience === "unpaid"
                ? Number(year)
                : undefined
          }
        );

      const summary =
        response.data.summary;

      setSuccess(
        `Notification sent to ${
          summary?.successful ?? 0
        } of ${
          summary?.targeted ?? 0
        } selected students.`
      );

      if (
        audience === "selected"
      ) {
        setSelectedStudentIds(
          []
        );
      }

      await loadData(true);
    } catch (requestError) {
      console.error(
        "Send notification error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
          requestError.message ||
          "Unable to send notification."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-gray-200" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-[620px] rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-700 ring-1 ring-orange-100">
              <BellRing className="h-3.5 w-3.5" />
              Communication Center
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Send fee reminders and important
              library announcements directly to
              students who have enabled browser
              notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              className={
                refreshing
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>
        </header>

        {/* Stats */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Bell}
            label="Total notifications"
            value={stats.total}
            tone="orange"
          />

          <StatCard
            icon={CheckCircle2}
            label="Delivered"
            value={stats.sent}
            tone="green"
          />

          <StatCard
            icon={CircleAlert}
            label="Failed"
            value={stats.failed}
            tone="red"
          />

          <StatCard
            icon={Clock3}
            label="Queued"
            value={stats.queued}
            tone="amber"
          />
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{success}</p>
          </div>
        )}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
          {/* Compose */}
          <form
            onSubmit={handleSend}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
          >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                  <Send className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Compose notification
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose who should receive the
                    message and publish it instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              {/* Audience */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      Audience
                    </label>

                    <p className="mt-1 text-xs text-slate-500">
                      Notifications are sent only to
                      active students.
                    </p>
                  </div>

                  {audience ===
                    "selected" && (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                      {
                        selectedStudentIds.length
                      }{" "}
                      selected
                    </span>
                  )}
                </div>

                <div className="grid gap-3">
                  {AUDIENCES.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const active =
                        audience ===
                        item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setAudience(
                              item.id
                            )
                          }
                          className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-orange-300 bg-orange-50/70 ring-2 ring-orange-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-orange-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-900">
                              {item.title}
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {
                                item.description
                              }
                            </span>
                          </span>

                          <span
                            className={`mt-1 h-4 w-4 rounded-full border-2 ${
                              active
                                ? "border-orange-600 bg-orange-600 shadow-[inset_0_0_0_3px_white]"
                                : "border-slate-300"
                            }`}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Student selector */}
              {audience ===
                "selected" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Select students
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          selectedStudents.length
                        }{" "}
                        active student
                        {selectedStudents.length ===
                        1
                          ? ""
                          : "s"}{" "}
                        selected
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={
                          selectAllVisible
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Select visible
                      </button>

                      <button
                        type="button"
                        onClick={
                          clearSelected
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="search"
                      value={
                        studentSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setStudentSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search by name, mobile or seat..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {filteredStudents.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                        No active students
                        found.
                      </div>
                    ) : (
                      filteredStudents.map(
                        (student) => {
                          const selected =
                            selectedStudentIds.includes(
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
                              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                                selected
                                  ? "border-orange-200 bg-orange-50"
                                  : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  selected
                                    ? "bg-orange-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {selected ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <UserRound className="h-4 w-4" />
                                )}
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-slate-800">
                                  {
                                    student.name
                                  }
                                </span>

                                <span className="mt-0.5 block truncate text-xs text-slate-500">
                                  {student.phoneNumber ||
                                    "No mobile"}

                                  {student.seatNumber
                                    ? ` • Seat ${student.seatNumber}`
                                    : ""}
                                </span>
                              </span>

                              <span
                                className={`h-4 w-4 rounded border ${
                                  selected
                                    ? "border-orange-600 bg-orange-600"
                                    : "border-slate-300 bg-white"
                                }`}
                              />
                            </button>
                          );
                        }
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="text-sm font-bold text-slate-800">
                  Notification type
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TypeButton
                    active={
                      type ===
                      "fee_reminder"
                    }
                    icon={WalletCards}
                    title="Fee reminder"
                    description="Remind students about pending monthly fees."
                    onClick={() =>
                      setType(
                        "fee_reminder"
                      )
                    }
                  />

                  <TypeButton
                    active={
                      type ===
                      "announcement"
                    }
                    icon={Megaphone}
                    title="Announcement"
                    description="Share library news, schedules or important updates."
                    onClick={() =>
                      setType(
                        "announcement"
                      )
                    }
                  />
                </div>
              </div>

              {/* Fee period */}
              {(type ===
                "fee_reminder" ||
                audience ===
                  "unpaid") && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Fee month"
                    value={month}
                    onChange={(
                      event
                    ) =>
                      setMonth(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    options={MONTHS.map(
                      (
                        name,
                        index
                      ) => ({
                        value:
                          index + 1,
                        label:
                          name
                      })
                    )}
                  />

                  <SelectField
                    label="Fee year"
                    value={year}
                    onChange={(
                      event
                    ) =>
                      setYear(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    options={yearOptions.map(
                      (value) => ({
                        value,
                        label:
                          String(
                            value
                          )
                      })
                    )}
                  />
                </div>
              )}

              {/* Content */}
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="notification-title"
                      className="text-sm font-bold text-slate-800"
                    >
                      Title
                    </label>

                    <span className="text-xs text-slate-400">
                      {title.length}/80
                    </span>
                  </div>

                  <input
                    id="notification-title"
                    value={title}
                    maxLength={80}
                    onChange={(
                      event
                    ) =>
                      setTitle(
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter notification title"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="notification-message"
                      className="text-sm font-bold text-slate-800"
                    >
                      Message
                    </label>

                    <span className="text-xs text-slate-400">
                      {message.length}/500
                    </span>
                  </div>

                  <textarea
                    id="notification-message"
                    value={message}
                    maxLength={500}
                    rows={5}
                    onChange={(
                      event
                    ) =>
                      setMessage(
                        event.target
                          .value
                      )
                    }
                    placeholder="Write your notification..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Send */}
              <div className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-orange-950">
                    Ready to send
                  </p>

                  <p className="mt-1 text-xs leading-5 text-orange-800/70">
                    Students must have enabled
                    browser notifications on
                    their device to receive this
                    push message.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Send className="h-4 w-4" />

                  {sending
                    ? "Sending..."
                    : "Send notification"}
                </button>
              </div>
            </div>
          </form>

          {/* Preview + recent */}
          <aside className="space-y-6">
            {/* Preview */}
            <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                      Live preview
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      Student notification
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Bell className="h-5 w-5 text-orange-300" />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                      {type ===
                      "fee_reminder" ? (
                        <WalletCards className="h-5 w-5" />
                      ) : (
                        <Megaphone className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {title ||
                          "Notification title"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {message ||
                          "Your notification message will appear here."}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Shri Krishna Digital Library •
                    now
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <PreviewMetric
                    label="Audience"
                    value={
                      audience ===
                      "all_active"
                        ? `${activeStudents.length} active`
                        : audience ===
                          "unpaid"
                        ? "Unpaid fees"
                        : `${selectedStudentIds.length} selected`
                    }
                  />

                  <PreviewMetric
                    label="Type"
                    value={
                      type ===
                      "fee_reminder"
                        ? "Fee reminder"
                        : "Announcement"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Recent notifications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest delivery activity
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {
                    notifications.length
                  }
                </span>
              </div>

              <div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">
                {notifications.length ===
                0 ? (
                  <div className="px-5 py-10 text-center">
                    <Bell className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No notifications yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your sent notifications
                      will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <div
                        key={
                          notification._id
                        }
                        className="px-5 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            {notification.type ===
                            "fee_reminder" ? (
                              <WalletCards className="h-4 w-4" />
                            ) : (
                              <Megaphone className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {notification.title ||
                                    notification.type.replace(
                                      "_",
                                      " "
                                    )}
                                </p>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {
                                    notification.message
                                  }
                                </p>
                              </div>

                              <span
                                className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${getStatusClasses(
                                  notification.status
                                )}`}
                              >
                                {
                                  notification.status
                                }
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-400">
                              <span>
                                {notification
                                  .studentId
                                  ?.name ||
                                  "Student"}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatDate(
                                  notification.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 rotate-[-90deg] text-slate-400" />

          <p>
            Push notifications use Firebase Cloud
            Messaging. The library operator still
            controls when messages are sent; there
            are no automatic fee reminders in this
            workflow.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone
}) {
  const toneClasses = {
    orange:
      "bg-orange-50 text-orange-700",

    green:
      "bg-emerald-50 text-emerald-700",

    red:
      "bg-red-50 text-red-700",

    amber:
      "bg-amber-50 text-amber-700"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <span className="text-2xl font-black tracking-tight text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function TypeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-950 text-white"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10 text-orange-300"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span>
        <span
          className={`block text-sm font-bold ${
            active
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {title}
        </span>

        <span
          className={`mt-1 block text-xs leading-5 ${
            active
              ? "text-slate-300"
              : "text-slate-500"
          }`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      >
        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function PreviewMetric({
  label,
  value
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-white">
        {value}
      </p>
    </div>
  );
}