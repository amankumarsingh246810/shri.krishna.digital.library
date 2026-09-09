import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  Loader2,
  AlertCircle,
  Send,
  Users,
  RefreshCw,
  Search,
  XCircle
} from "lucide-react";

import api from "../../services/api";

function Notifications() {
  const [students, setStudents] =
    useState([]);

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    selectedStudentIds,
    setSelectedStudentIds
  ] = useState([]);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ------------------------------------------
   * Load students
   * ------------------------------------------
   */
  async function loadStudents() {
    try {
      setLoadingStudents(true);

      const response =
        await api.get(
          "/students"
        );

      if (
        !response.data.success
      ) {
        throw new Error(
          "Failed to load students"
        );
      }

      const activeStudents =
        response.data.students.filter(
          (student) =>
            student.enrollmentStatus ===
            "active"
        );

      setStudents(
        activeStudents
      );
    } catch (error) {
      console.error(
        "Load students error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load students"
      );
    } finally {
      setLoadingStudents(
        false
      );
    }
  }

  /*
   * ------------------------------------------
   * Load notification history
   * ------------------------------------------
   */
  async function loadNotifications() {
    try {
      setLoadingNotifications(
        true
      );

      const response =
        await api.get(
          "/notifications"
        );

      if (
        !response.data.success
      ) {
        throw new Error(
          "Failed to load notifications"
        );
      }

      setNotifications(
        response.data.notifications
      );
    } catch (error) {
      console.error(
        "Load notifications error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load notification history"
      );
    } finally {
      setLoadingNotifications(
        false
      );
    }
  }

  /*
   * ------------------------------------------
   * Initial load
   * ------------------------------------------
   */
  useEffect(() => {
    loadStudents();
    loadNotifications();
  }, []);

  /*
   * ------------------------------------------
   * Filter students
   * ------------------------------------------
   */
  const filteredStudents =
    useMemo(() => {
      const searchTerm =
        search
          .trim()
          .toLowerCase();

      if (!searchTerm) {
        return students;
      }

      return students.filter(
        (student) =>
          student.name
            ?.toLowerCase()
            .includes(
              searchTerm
            ) ||
          student.phoneNumber
            ?.toLowerCase()
            .includes(
              searchTerm
            ) ||
          student.fatherName
            ?.toLowerCase()
            .includes(
              searchTerm
            ) ||
          student.seatNumber
            ?.toLowerCase()
            .includes(
              searchTerm
            )
      );
    }, [
      students,
      search
    ]);

  /*
   * ------------------------------------------
   * Toggle student
   * ------------------------------------------
   */
  function toggleStudent(
    studentId
  ) {
    setSelectedStudentIds(
      (current) => {
        if (
          current.includes(
            studentId
          )
        ) {
          return current.filter(
            (id) =>
              id !== studentId
          );
        }

        return [
          ...current,
          studentId
        ];
      }
    );
  }

  /*
   * ------------------------------------------
   * Select all filtered students
   * ------------------------------------------
   */
  function toggleSelectAll() {
    const filteredIds =
      filteredStudents.map(
        (student) =>
          student._id
      );

    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every(
        (id) =>
          selectedStudentIds.includes(
            id
          )
      );

    if (allSelected) {
      setSelectedStudentIds(
        (current) =>
          current.filter(
            (id) =>
              !filteredIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedStudentIds(
        (current) => [
          ...new Set([
            ...current,
            ...filteredIds
          ])
        ]
      );
    }
  }

  /*
   * ------------------------------------------
   * Select all active students
   * ------------------------------------------
   */
  function selectAllStudents() {
    setSelectedStudentIds(
      students.map(
        (student) =>
          student._id
      )
    );
  }

  /*
   * ------------------------------------------
   * Clear selection
   * ------------------------------------------
   */
  function clearSelection() {
    setSelectedStudentIds(
      []
    );
  }

  /*
   * ------------------------------------------
   * Send notification
   * ------------------------------------------
   */
  async function handleSendNotification(
    event
  ) {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (
      !title.trim()
    ) {
      setError(
        "Please enter a notification title."
      );

      return;
    }

    if (
      !message.trim()
    ) {
      setError(
        "Please enter a notification message."
      );

      return;
    }

    if (
      selectedStudentIds.length ===
      0
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
            studentIds:
              selectedStudentIds,

            title:
              title.trim(),

            message:
              message.trim()
          }
        );

      if (
        !response.data.success
      ) {
        throw new Error(
          response.data.message ||
            "Failed to send notification"
        );
      }

      setSuccess(
        response.data.message
      );

      setTitle("");
      setMessage("");
      setSelectedStudentIds(
        []
      );

      await loadNotifications();
    } catch (error) {
      console.error(
        "Send notification error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to send notification"
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * ------------------------------------------
   * Refresh everything
   * ------------------------------------------
   */
  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    await Promise.all([
      loadStudents(),
      loadNotifications()
    ]);

    setRefreshing(false);
  }

  /*
   * ------------------------------------------
   * Date formatting
   * ------------------------------------------
   */
  function formatDate(
    date
  ) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  /*
   * ------------------------------------------
   * Notification status
   * ------------------------------------------
   */
  function getStatusBadge(
    status
  ) {
    if (
      status === "sent"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sent
        </span>
      );
    }

    if (
      status === "queued"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          <Clock3 className="h-3.5 w-3.5" />
          Queued
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  const filteredIds =
    filteredStudents.map(
      (student) =>
        student._id
    );

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every(
      (id) =>
        selectedStudentIds.includes(
          id
        )
    );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
              Shri Krishna Digital Library
            </h1>

            <p className="text-xs text-gray-500 sm:text-sm">
              Admin Notifications
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing
            }
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <section className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Send Notification
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Send announcements and
                important updates to
                registered students.
              </p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Notification form */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Send className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="font-bold text-gray-800">
                  Notification Details
                </h3>

                <p className="text-xs text-gray-500">
                  Compose your message
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleSendNotification
              }
              className="space-y-5"
            >
              {/* Title */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="notification-title"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Notification Title
                  </label>

                  <span className="text-xs text-gray-400">
                    {title.length}/100
                  </span>
                </div>

                <input
                  id="notification-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="e.g. Library Holiday Notice"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Message */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="notification-message"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Message
                  </label>

                  <span className="text-xs text-gray-400">
                    {message.length}/500
                  </span>
                </div>

                <textarea
                  id="notification-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  rows={6}
                  placeholder="Write your notification message here..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Selected students */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />

                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Recipients
                    </p>

                    <p className="text-xs text-blue-600">
                      {selectedStudentIds.length}{" "}
                      student(s) selected
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  selectedStudentIds.length ===
                    0 ||
                  !title.trim() ||
                  !message.trim()
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <BellRing className="h-5 w-5" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Student selection */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-gray-800">
                  Select Students
                </h3>

                <p className="text-xs text-gray-500">
                  Only active students are shown
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    selectAllStudents
                  }
                  className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    clearSelection
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name, mobile, father name or seat..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filtered select all */}
            {filteredStudents.length >
              0 && (
              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                className="mb-3 flex items-center gap-2 text-xs font-semibold text-blue-600"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    allFilteredSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {allFilteredSelected &&
                    "✓"}
                </span>

                Select all visible students
              </button>
            )}

            {/* Students */}
            <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {loadingStudents ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading students...
                  </p>
                </div>
              ) : filteredStudents.length ===
                0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
                  <Users className="mx-auto h-9 w-9 text-gray-400" />

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No active students found
                  </p>
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
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selected &&
                            "✓"}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {
                                student.name
                              }
                            </p>

                            {student.seatNumber && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                                Seat{" "}
                                {
                                  student.seatNumber
                                }
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {
                              student.phoneNumber
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </section>
        </div>

        {/* Notification history */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <Clock3 className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h3 className="font-bold text-gray-800">
                Notification History
              </h3>

              <p className="text-xs text-gray-500">
                Previously sent notifications
              </p>
            </div>
          </div>

          {loadingNotifications ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading notification history...
              </p>
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
              <Bell className="mx-auto h-10 w-10 text-gray-400" />

              <p className="mt-3 font-medium text-gray-700">
                No notifications yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Sent notifications will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile history */}
              <div className="space-y-3 md:hidden">
                {notifications.map(
                  (notification) => (
                    <div
                      key={
                        notification._id
                      }
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {notification.studentId?.name ||
                              "Student"}
                          </p>
                        </div>

                        {getStatusBadge(
                          notification.status
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {
                          notification.message
                        }
                      </p>

                      <p className="mt-3 text-xs text-gray-400">
                        {formatDate(
                          notification.createdAt
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Desktop history */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 font-semibold">
                        Student
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Notification
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Channel
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {notifications.map(
                      (
                        notification
                      ) => (
                        <tr
                          key={
                            notification._id
                          }
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-gray-800">
                              {notification.studentId?.name ||
                                "Student"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {notification.studentId?.phoneNumber ||
                                "—"}
                            </p>
                          </td>

                          <td className="max-w-[350px] px-4 py-4">
                            <p className="text-sm font-semibold text-gray-800">
                              {
                                notification.title
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {
                                notification.message
                              }
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm capitalize text-gray-600">
                            {
                              notification.channel
                            }
                          </td>

                          <td className="px-4 py-4">
                            {getStatusBadge(
                              notification.status
                            )}
                          </td>

                          <td className="px-4 py-4 text-xs text-gray-500">
                            {formatDate(
                              notification.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Notifications;