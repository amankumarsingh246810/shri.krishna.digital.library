import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  History,
  Loader2,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Users,
  UserRound,
  X,
  XCircle
} from "lucide-react";

import api from "../../services/api";

import "./Notifications.css";


/* =========================================================
   CONSTANTS
========================================================= */

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


const AUDIENCES = [
  {
    id: "all_active",
    title: "All Active Students",
    description:
      "Send this notification to every currently active student.",
    icon: Users,
    tone: "orange"
  },
  {
    id: "unpaid",
    title: "Students With Unpaid Fees",
    description:
      "Target active students whose selected month's fee is unpaid.",
    icon: BellRing,
    tone: "brown"
  },
  {
    id: "selected",
    title: "Selected Students",
    description:
      "Choose specific students who should receive the notification.",
    icon: UserRound,
    tone: "green"
  }
];


const NOTIFICATION_TYPES = [
  {
    id: "fee_reminder",
    title: "Fee Reminder",
    description:
      "A friendly reminder about the monthly library fee.",
    icon: FileText,
    tone: "orange"
  },
  {
    id: "announcement",
    title: "Announcement",
    description:
      "Share an important update or message with students.",
    icon: Megaphone,
    tone: "brown"
  }
];


/* =========================================================
   HELPERS
========================================================= */

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}


function getCurrentYear() {
  return new Date().getFullYear();
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "S";
}


function getStatusInfo(notification) {
  const status =
    notification?.status ||
    notification?.deliveryStatus ||
    "";

  const normalized =
    String(status).toLowerCase();

  if (
    normalized === "sent" ||
    normalized === "delivered" ||
    normalized === "success"
  ) {
    return {
      label: "Sent",
      icon: CheckCircle2,
      className:
        "notification-status notification-status-success"
    };
  }

  if (
    normalized === "failed" ||
    normalized === "error"
  ) {
    return {
      label: "Failed",
      icon: XCircle,
      className:
        "notification-status notification-status-failed"
    };
  }

  return {
    label:
      normalized
        ? String(status)
            .charAt(0)
            .toUpperCase() +
          String(status).slice(1)
        : "Queued",
    icon: Clock3,
    className:
      "notification-status notification-status-pending"
  };
}


function getNotificationDate(notification) {
  return (
    notification?.createdAt ||
    notification?.sentAt ||
    notification?.updatedAt
  );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Notifications() {
  const navigate = useNavigate();


  /* -------------------------------------------------------
     PAGE STATE
  ------------------------------------------------------- */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sending, setSending] =
    useState(false);


  /* -------------------------------------------------------
     DATA STATE
  ------------------------------------------------------- */

  const [notifications, setNotifications] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [stats, setStats] =
    useState({
      total: 0,
      sent: 0,
      failed: 0,
      queued: 0
    });


  /* -------------------------------------------------------
     COMPOSER STATE
  ------------------------------------------------------- */

  const [audience, setAudience] =
    useState("all_active");

  const [type, setType] =
    useState("fee_reminder");

  const [title, setTitle] =
    useState("Monthly Library Fee Reminder");

  const [message, setMessage] =
    useState(
      "Dear student, your monthly library fee is pending. Please contact the library operator to complete your payment."
    );

  const [month, setMonth] =
    useState(getCurrentMonth());

  const [year, setYear] =
    useState(getCurrentYear());


  /* -------------------------------------------------------
     STUDENT SELECTION
  ------------------------------------------------------- */

  const [studentSearch, setStudentSearch] =
    useState("");

  const [selectedStudentIds, setSelectedStudentIds] =
    useState([]);


  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [historySearch, setHistorySearch] =
    useState("");

  const [mobileHistoryOpen, setMobileHistoryOpen] =
    useState(false);


  /* =======================================================
     LOAD DATA
  ======================================================= */

  async function loadData(
    showLoader = true
  ) {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [
        notificationsResponse,
        statsResponse,
        studentsResponse
      ] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/stats"),
        api.get("/students")
      ]);


      /* Notifications */

      const notificationData =
        notificationsResponse?.data?.notifications;

      setNotifications(
        Array.isArray(notificationData)
          ? notificationData
          : []
      );


      /* Stats */

      const statsData =
        statsResponse?.data?.stats ||
        statsResponse?.data ||
        {};

      setStats({
        total:
          Number(
            statsData.total ??
            statsData.totalNotifications ??
            0
          ),

        sent:
          Number(
            statsData.sent ??
            statsData.successful ??
            statsData.delivered ??
            0
          ),

        failed:
          Number(
            statsData.failed ??
            0
          ),

        queued:
          Number(
            statsData.queued ??
            0
          )
      });


      /* Students */

      const studentData =
        studentsResponse?.data?.students;

      setStudents(
        Array.isArray(studentData)
          ? studentData
          : []
      );
    } catch (requestError) {
      console.error(
        "Failed to load notification data:",
        requestError
      );

      setError(
        requestError?.response?.data?.message ||
          "Unable to load notification data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const selectedAudience = useMemo(
    () =>
      AUDIENCES.find(
        (item) =>
          item.id === audience
      ) || AUDIENCES[0],
    [audience]
  );


  const selectedType = useMemo(
    () =>
      NOTIFICATION_TYPES.find(
        (item) =>
          item.id === type
      ) || NOTIFICATION_TYPES[0],
    [type]
  );


  const filteredStudents = useMemo(() => {
    const search =
      studentSearch
        .trim()
        .toLowerCase();

    const activeStudents =
      students.filter(
        (student) =>
          student.enrollmentStatus ===
          "active"
      );

    if (!search) {
      return activeStudents;
    }

    return activeStudents.filter(
      (student) =>
        student.name
          ?.toLowerCase()
          .includes(search) ||
        student.phoneNumber
          ?.toLowerCase()
          .includes(search) ||
        student.seatNumber
          ?.toLowerCase()
          .includes(search)
    );
  }, [
    students,
    studentSearch
  ]);


  const filteredHistory = useMemo(() => {
    const search =
      historySearch
        .trim()
        .toLowerCase();

    if (!search) {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.title
          ?.toLowerCase()
          .includes(search) ||
        notification.message
          ?.toLowerCase()
          .includes(search) ||
        notification.type
          ?.toLowerCase()
          .includes(search) ||
        notification.status
          ?.toLowerCase()
          .includes(search)
    );
  }, [
    notifications,
    historySearch
  ]);


  const selectedCount =
    selectedStudentIds.length;


  /* =======================================================
     STUDENT SELECTION HANDLERS
  ======================================================= */

  function toggleStudent(studentId) {
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


  function selectAllVisibleStudents() {
    const visibleIds =
      filteredStudents.map(
        (student) =>
          student._id
      );

    setSelectedStudentIds(
      (current) => {
        const combined = new Set([
          ...current,
          ...visibleIds
        ]);

        return Array.from(
          combined
        );
      }
    );
  }


  function clearSelectedStudents() {
    setSelectedStudentIds([]);
  }


  /* =======================================================
     FORM HANDLERS
  ======================================================= */

  function handleAudienceChange(
    nextAudience
  ) {
    setAudience(nextAudience);

    if (
      nextAudience !==
      "selected"
    ) {
      setSelectedStudentIds([]);
    }
  }


  function handleTypeChange(
    nextType
  ) {
    setType(nextType);

    if (
      nextType ===
      "fee_reminder"
    ) {
      setTitle(
        "Monthly Library Fee Reminder"
      );

      setMessage(
        "Dear student, your monthly library fee is pending. Please contact the library operator to complete your payment."
      );
    } else {
      setTitle(
        "Important Library Announcement"
      );

      setMessage(
        "Dear student, we have an important update from Shri Krishna Digital Library. Please check the latest information from the library operator."
      );
    }
  }


  async function handleSubmit(
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
      audience ===
        "selected" &&
      selectedStudentIds.length === 0
    ) {
      setError(
        "Please select at least one student."
      );
      return;
    }


    if (
      type ===
        "fee_reminder" &&
      (!month || !year)
    ) {
      setError(
        "Please select the fee month and year."
      );
      return;
    }


    try {
      setSending(true);

      const payload = {
        audience,
        type,
        title:
          title.trim(),
        message:
          message.trim(),
        month:
          type ===
          "fee_reminder"
            ? Number(month)
            : undefined,
        year:
          type ===
          "fee_reminder"
            ? Number(year)
            : undefined,
        studentIds:
          audience ===
          "selected"
            ? selectedStudentIds
            : []
      };


      const response =
        await api.post(
          "/notifications/send",
          payload
        );


      const result =
        response?.data || {};


      const targeted =
        result.targeted ??
        result.targetedCount ??
        0;

      const successful =
        result.successful ??
        result.sent ??
        result.delivered ??
        0;

      const failed =
        result.failed ??
        0;


      setSuccess(
        `Notification sent successfully to ${successful || targeted} student${(successful || targeted) === 1 ? "" : "s"}.`
      );


      /*
       * Refresh notification history
       * without showing the full page loader.
       */
      await loadData(false);


      /*
       * Clear selected students after
       * a successful selected-audience send.
       */
      if (
        audience ===
        "selected"
      ) {
        setSelectedStudentIds([]);
      }


      /*
       * Keep the form usable for another
       * notification.
       */
      if (
        failed > 0
      ) {
        setSuccess(
          `Notification processed. ${successful} sent successfully and ${failed} failed.`
        );
      }
    } catch (requestError) {
      console.error(
        "Send notification error:",
        requestError
      );

      setError(
        requestError?.response?.data?.message ||
          "Unable to send notification. Please try again."
      );
    } finally {
      setSending(false);
    }
  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );

    navigate(
      "/admin/login",
      {
        replace: true
      }
    );
  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="notifications-loading-icon">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h2>
            Preparing your communication center
          </h2>

          <p>
            Loading students and notification history...
          </p>
        </div>
      </div>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  const AudienceIcon =
    selectedAudience?.icon ||
    Users;


  return (
    <div className="notifications-page">
      {/* ===================================================
          TOP NAVIGATION
      =================================================== */}

      <header className="notifications-nav">
        <div className="notifications-nav-inner">

          <Link
            to="/admin/dashboard"
            className="notifications-brand"
          >
            <span className="notifications-brand-mark">
              <Sparkles className="h-5 w-5" />
            </span>

            <span>
              <strong>
                SHRI KRISHNA
              </strong>

              <small>
                DIGITAL LIBRARY
              </small>
            </span>
          </Link>


          <div className="notifications-nav-right">

            <Link
              to="/admin/dashboard"
              className="notifications-back-link"
            >
              <ArrowLeft className="h-4 w-4" />

              <span>
                Dashboard
              </span>
            </Link>


            <button
              type="button"
              onClick={handleLogout}
              className="notifications-logout"
            >
              Logout
            </button>

          </div>
        </div>
      </header>


      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="notifications-hero-section">
          <div className="notifications-container">

            <div className="notifications-hero">

              <div className="notifications-hero-copy">

                <div className="notifications-eyebrow">
                  <span className="notifications-eyebrow-icon">
                    <Bell className="h-4 w-4" />
                  </span>

                  COMMUNICATION CENTER
                </div>


                <h1>
                  Stay connected.
                  <br />

                  <span>
                    Keep students informed.
                  </span>
                </h1>


                <p>
                  Send thoughtful fee reminders and
                  important library announcements
                  directly to your students.
                </p>


                <div className="notifications-hero-meta">

                  <div>
                    <Check className="h-4 w-4" />

                    <span>
                      Manual control
                    </span>
                  </div>

                  <div>
                    <Check className="h-4 w-4" />

                    <span>
                      Firebase notifications
                    </span>
                  </div>

                  <div>
                    <Check className="h-4 w-4" />

                    <span>
                      Student focused
                    </span>
                  </div>

                </div>

              </div>


              <div className="notifications-hero-visual">

                <div className="notifications-orbit notifications-orbit-one" />
                <div className="notifications-orbit notifications-orbit-two" />

                <div className="notifications-hero-card">

                  <div className="notifications-hero-card-top">
                    <span>
                      SHRI KRISHNA
                    </span>

                    <span className="notifications-open-badge">
                      <span />
                      LIVE
                    </span>
                  </div>


                  <div className="notifications-hero-card-icon">
                    <BellRing className="h-8 w-8" />
                  </div>


                  <h2>
                    Your message
                    <br />
                    matters.
                  </h2>


                  <p>
                    Reach the right students
                    with the right information.
                  </p>


                  <div className="notifications-hero-card-bottom">

                    <div>
                      <Users className="h-4 w-4" />
                      <span>
                        {students.filter(
                          (student) =>
                            student.enrollmentStatus ===
                            "active"
                        ).length}{" "}
                        active students
                      </span>
                    </div>

                    <div>
                      <Bell className="h-4 w-4" />
                      <span>
                        Push enabled
                      </span>
                    </div>

                  </div>

                </div>


                <div className="notifications-floating-card notifications-floating-one">
                  <span className="notifications-floating-icon">
                    <Send className="h-4 w-4" />
                  </span>

                  <span>
                    <strong>
                      Quick delivery
                    </strong>

                    <small>
                      Send in seconds
                    </small>
                  </span>
                </div>


                <div className="notifications-floating-card notifications-floating-two">
                  <span className="notifications-floating-icon green">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>

                  <span>
                    <strong>
                      Student friendly
                    </strong>

                    <small>
                      Clear & simple messages
                    </small>
                  </span>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="notifications-main-section">
          <div className="notifications-container">

            {/* =============================================
                STATS
            ============================================= */}

            <div className="notifications-stats-grid">

              <div className="notification-stat-card">
                <div className="notification-stat-icon orange">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <span>
                    Total notifications
                  </span>

                  <strong>
                    {stats.total}
                  </strong>
                </div>
              </div>


              <div className="notification-stat-card">
                <div className="notification-stat-icon green">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <span>
                    Successfully sent
                  </span>

                  <strong>
                    {stats.sent}
                  </strong>
                </div>
              </div>


              <div className="notification-stat-card">
                <div className="notification-stat-icon brown">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <span>
                    Queued
                  </span>

                  <strong>
                    {stats.queued}
                  </strong>
                </div>
              </div>


              <div className="notification-stat-card">
                <div className="notification-stat-icon red">
                  <XCircle className="h-5 w-5" />
                </div>

                <div>
                  <span>
                    Failed
                  </span>

                  <strong>
                    {stats.failed}
                  </strong>
                </div>
              </div>

            </div>


            {/* =============================================
                FEEDBACK
            ============================================= */}

            {error && (
              <div className="notification-alert notification-alert-error">
                <XCircle className="h-5 w-5 shrink-0" />

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  aria-label="Close error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}


            {success && (
              <div className="notification-alert notification-alert-success">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <span>
                  {success}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSuccess("")
                  }
                  aria-label="Close success message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}


            {/* =============================================
                COMPOSER HEADER
            ============================================= */}

            <div className="notifications-section-heading">

              <div>
                <span className="notifications-section-kicker">
                  CREATE MESSAGE
                </span>

                <h2>
                  Send a new notification
                </h2>

                <p>
                  Choose your audience, write your message,
                  preview it and send it when you're ready.
                </p>
              </div>


              <button
                type="button"
                className="notifications-refresh-button"
                onClick={() =>
                  loadData(false)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

            </div>


            {/* =============================================
                COMPOSER
            ============================================= */}

            <form
              onSubmit={handleSubmit}
              className="notifications-composer-grid"
            >

              {/* LEFT SIDE */}

              <div className="notifications-composer-main">

                {/* AUDIENCE */}

                <section className="notification-form-card">

                  <div className="notification-card-heading">
                    <div className="notification-card-number">
                      01
                    </div>

                    <div>
                      <h3>
                        Choose your audience
                      </h3>

                      <p>
                        Decide who should receive this message.
                      </p>
                    </div>
                  </div>


                  <div className="audience-grid">

                    {AUDIENCES.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const active =
                          audience ===
                          item.id;

                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              handleAudienceChange(
                                item.id
                              )
                            }
                            className={`audience-card ${
                              active
                                ? "active"
                                : ""
                            }`}
                          >
                            <div className="audience-card-top">

                              <div
                                className={`audience-icon ${item.tone}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              <span
                                className={`audience-radio ${
                                  active
                                    ? "active"
                                    : ""
                                }`}
                              >
                                {active && (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>

                            </div>


                            <strong>
                              {item.title}
                            </strong>

                            <p>
                              {item.description}
                            </p>
                          </button>
                        );
                      }
                    )}

                  </div>


                  {/* SELECTED STUDENTS */}

                  {audience ===
                    "selected" && (
                    <div className="selected-students-panel">

                      <div className="selected-students-header">

                        <div>
                          <strong>
                            Select students
                          </strong>

                          <span>
                            {selectedCount} selected
                          </span>
                        </div>


                        <div className="selected-students-actions">

                          <button
                            type="button"
                            onClick={
                              selectAllVisibleStudents
                            }
                          >
                            Select visible
                          </button>

                          <button
                            type="button"
                            onClick={
                              clearSelectedStudents
                            }
                          >
                            Clear
                          </button>

                        </div>

                      </div>


                      <div className="student-search">
                        <Search className="h-4 w-4" />

                        <input
                          type="text"
                          value={
                            studentSearch
                          }
                          onChange={(event) =>
                            setStudentSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search by student name, phone or seat..."
                        />
                      </div>


                      <div className="student-selection-list">

                        {filteredStudents.length ===
                        0 ? (
                          <div className="student-selection-empty">
                            <Users className="h-6 w-6" />

                            <span>
                              No active students found.
                            </span>
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
                                  type="button"
                                  key={
                                    student._id
                                  }
                                  className={`student-selection-row ${
                                    selected
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    toggleStudent(
                                      student._id
                                    )
                                  }
                                >

                                  <div className="student-avatar">
                                    {getInitials(
                                      student.name
                                    )}
                                  </div>


                                  <div className="student-selection-info">
                                    <strong>
                                      {
                                        student.name
                                      }
                                    </strong>

                                    <span>
                                      {student.phoneNumber}
                                      {student.seatNumber
                                        ? ` • Seat ${student.seatNumber}`
                                        : ""}
                                    </span>
                                  </div>


                                  <div
                                    className={`student-selection-check ${
                                      selected
                                        ? "selected"
                                        : ""
                                    }`}
                                  >
                                    {selected && (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </div>

                                </button>
                              );
                            }
                          )
                        )}

                      </div>

                    </div>
                  )}

                </section>


                {/* TYPE */}

                <section className="notification-form-card">

                  <div className="notification-card-heading">
                    <div className="notification-card-number">
                      02
                    </div>

                    <div>
                      <h3>
                        What would you like to send?
                      </h3>

                      <p>
                        Choose the purpose of your notification.
                      </p>
                    </div>
                  </div>


                  <div className="type-grid">

                    {NOTIFICATION_TYPES.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const active =
                          type ===
                          item.id;

                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              handleTypeChange(
                                item.id
                              )
                            }
                            className={`type-card ${
                              active
                                ? "active"
                                : ""
                            }`}
                          >

                            <div
                              className={`type-icon ${item.tone}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div>
                              <strong>
                                {item.title}
                              </strong>

                              <p>
                                {item.description}
                              </p>
                            </div>

                            <span
                              className={`type-radio ${
                                active
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {active && (
                                <Check className="h-3 w-3" />
                              )}
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>


                  {/* FEE PERIOD */}

                  {type ===
                    "fee_reminder" && (
                    <div className="fee-period-box">

                      <div>
                        <strong>
                          Fee period
                        </strong>

                        <p>
                          Select the month this reminder is about.
                        </p>
                      </div>


                      <div className="fee-period-fields">

                        <label>
                          <span>
                            Month
                          </span>

                          <div className="select-wrapper">
                            <select
                              value={
                                month
                              }
                              onChange={(event) =>
                                setMonth(
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                            >
                              {MONTHS.map(
                                (
                                  monthName,
                                  index
                                ) => (
                                  <option
                                    value={
                                      index + 1
                                    }
                                    key={
                                      monthName
                                    }
                                  >
                                    {
                                      monthName
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </label>


                        <label>
                          <span>
                            Year
                          </span>

                          <div className="select-wrapper">
                            <select
                              value={
                                year
                              }
                              onChange={(event) =>
                                setYear(
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                            >
                              {[
                                getCurrentYear() - 1,
                                getCurrentYear(),
                                getCurrentYear() + 1
                              ].map(
                                (
                                  yearValue
                                ) => (
                                  <option
                                    value={
                                      yearValue
                                    }
                                    key={
                                      yearValue
                                    }
                                  >
                                    {
                                      yearValue
                                    }
                                  </option>
                                )
                              )}
                            </select>

                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </label>

                      </div>

                    </div>
                  )}

                </section>


                {/* MESSAGE */}

                <section className="notification-form-card">

                  <div className="notification-card-heading">
                    <div className="notification-card-number">
                      03
                    </div>

                    <div>
                      <h3>
                        Write your message
                      </h3>

                      <p>
                        Keep the message short, clear and student friendly.
                      </p>
                    </div>
                  </div>


                  <div className="notification-fields">

                    <label className="notification-field">
                      <div className="notification-field-label">
                        <span>
                          Notification title
                        </span>

                        <small>
                          {title.length}/80
                        </small>
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
                        placeholder="Enter notification title"
                      />
                    </label>


                    <label className="notification-field">
                      <div className="notification-field-label">
                        <span>
                          Message
                        </span>

                        <small>
                          {message.length}/500
                        </small>
                      </div>

                      <textarea
                        rows={6}
                        maxLength={500}
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target.value
                          )
                        }
                        placeholder="Write your notification..."
                      />
                    </label>

                  </div>

                </section>


                {/* SEND */}

                <div className="notification-submit-area">

                  <div className="notification-submit-info">
                    <div className="notification-submit-icon">
                      <Send className="h-5 w-5" />
                    </div>

                    <div>
                      <strong>
                        Ready to send?
                      </strong>

                      <span>
                        This notification will be sent through your configured Firebase notification system.
                      </span>
                    </div>
                  </div>


                  <button
                    type="submit"
                    disabled={
                      sending
                    }
                    className="notification-send-button"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />

                        Sending...
                      </>
                    ) : (
                      <>
                        Send notification

                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                </div>

              </div>


              {/* RIGHT SIDE PREVIEW */}

              <aside className="notifications-composer-sidebar">

                <div className="notification-preview-card">

                  <div className="notification-preview-heading">

                    <div>
                      <span>
                        LIVE PREVIEW
                      </span>

                      <h3>
                        Student notification
                      </h3>
                    </div>

                    <div className="preview-live-dot">
                      <span />
                      Live
                    </div>

                  </div>


                  <div className="phone-preview">

                    <div className="phone-preview-top">
                      <span>
                        9:41
                      </span>

                      <div>
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>


                    <div className="phone-preview-brand">
                      <div className="phone-preview-brand-icon">
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <div>
                        <strong>
                          Shri Krishna
                        </strong>

                        <span>
                          Digital Library
                        </span>
                      </div>
                    </div>


                    <div className="phone-preview-notification">

                      <div className="phone-preview-notification-top">

                        <div className="phone-preview-notification-app">
                          <Bell className="h-3.5 w-3.5" />
                        </div>

                        <span>
                          NOW
                        </span>

                      </div>


                      <h4>
                        {title ||
                          "Notification title"}
                      </h4>

                      <p>
                        {message ||
                          "Your notification message will appear here."}
                      </p>

                    </div>


                    <div className="phone-preview-home-indicator" />

                  </div>


                  <div className="preview-details">

                    <div className="preview-detail-row">
                      <span>
                        Audience
                      </span>

                      <strong>
                        <AudienceIcon className="h-3.5 w-3.5" />

                        {audience ===
                        "selected"
                          ? `${selectedCount} selected`
                          : selectedAudience.title}
                      </strong>
                    </div>


                    <div className="preview-detail-row">
                      <span>
                        Type
                      </span>

                      <strong>
                        {selectedType.title}
                      </strong>
                    </div>


                    {type ===
                      "fee_reminder" && (
                      <div className="preview-detail-row">
                        <span>
                          Fee period
                        </span>

                        <strong>
                          {
                            MONTHS[
                              Number(
                                month
                              ) - 1
                            ]
                          }{" "}
                          {year}
                        </strong>
                      </div>
                    )}

                  </div>

                </div>


                {/* QUICK INFO */}

                <div className="notification-tip-card">

                  <div className="notification-tip-icon">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div>
                    <span>
                      MESSAGE TIP
                    </span>

                    <strong>
                      Keep it simple.
                    </strong>

                    <p>
                      A clear title and short message
                      make notifications easier for students
                      to understand quickly.
                    </p>
                  </div>

                </div>

              </aside>

            </form>


            {/* =============================================
                HISTORY
            ============================================= */}

            <section className="notification-history-section">

              <div className="notifications-section-heading history-heading">

                <div>
                  <span className="notifications-section-kicker">
                    ACTIVITY
                  </span>

                  <h2>
                    Recent notifications
                  </h2>

                  <p>
                    Review messages sent from the library communication center.
                  </p>
                </div>


                <div className="history-heading-actions">

                  <div className="history-search">
                    <Search className="h-4 w-4" />

                    <input
                      type="text"
                      value={
                        historySearch
                      }
                      onChange={(event) =>
                        setHistorySearch(
                          event.target.value
                        )
                      }
                      placeholder="Search history..."
                    />
                  </div>


                  <button
                    type="button"
                    className="history-mobile-toggle"
                    onClick={() =>
                      setMobileHistoryOpen(
                        (current) =>
                          !current
                      )
                    }
                  >
                    <History className="h-4 w-4" />

                    {mobileHistoryOpen
                      ? "Hide history"
                      : "View history"}
                  </button>

                </div>

              </div>


              <div
                className={`notification-history-card ${
                  mobileHistoryOpen
                    ? "mobile-open"
                    : ""
                }`}
              >

                {filteredHistory.length ===
                0 ? (
                  <div className="notification-history-empty">
                    <div>
                      <Bell className="h-7 w-7" />
                    </div>

                    <h3>
                      No notifications yet
                    </h3>

                    <p>
                      Once you send a notification,
                      its activity will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE */}

                    <div className="notification-history-table-wrapper">
                      <table className="notification-history-table">
                        <thead>
                          <tr>
                            <th>
                              Notification
                            </th>

                            <th>
                              Audience
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Status
                            </th>

                            <th>
                              Date
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredHistory
                            .slice(
                              0,
                              20
                            )
                            .map(
                              (
                                notification,
                                index
                              ) => {
                                const status =
                                  getStatusInfo(
                                    notification
                                  );

                                const StatusIcon =
                                  status.icon;

                                return (
                                  <tr
                                    key={
                                      notification._id ||
                                      notification.id ||
                                      index
                                    }
                                  >

                                    <td>
                                      <div className="history-message-cell">

                                        <div className="history-message-icon">
                                          <Bell className="h-4 w-4" />
                                        </div>

                                        <div>
                                          <strong>
                                            {
                                              notification.title ||
                                              "Notification"
                                            }
                                          </strong>

                                          <span>
                                            {
                                              notification.message ||
                                              "—"
                                            }
                                          </span>
                                        </div>

                                      </div>
                                    </td>


                                    <td>
                                      <span className="history-audience">
                                        {notification.audience ===
                                        "selected"
                                          ? "Selected students"
                                          : notification.audience ===
                                            "unpaid"
                                          ? "Unpaid students"
                                          : "All active students"}
                                      </span>
                                    </td>


                                    <td>
                                      <span className="history-type">
                                        {notification.type ===
                                        "fee_reminder"
                                          ? "Fee reminder"
                                          : "Announcement"}
                                      </span>
                                    </td>


                                    <td>
                                      <span
                                        className={
                                          status.className
                                        }
                                      >
                                        <StatusIcon className="h-3.5 w-3.5" />

                                        {
                                          status.label
                                        }
                                      </span>
                                    </td>


                                    <td>
                                      <span className="history-date">
                                        {formatDateTime(
                                          getNotificationDate(
                                            notification
                                          )
                                        )}
                                      </span>
                                    </td>

                                  </tr>
                                );
                              }
                            )}
                        </tbody>
                      </table>
                    </div>


                    {/* MOBILE CARDS */}

                    <div className="notification-history-mobile">
                      {filteredHistory
                        .slice(
                          0,
                          20
                        )
                        .map(
                          (
                            notification,
                            index
                          ) => {
                            const status =
                              getStatusInfo(
                                notification
                              );

                            const StatusIcon =
                              status.icon;

                            return (
                              <div
                                className="history-mobile-card"
                                key={
                                  notification._id ||
                                  notification.id ||
                                  index
                                }
                              >

                                <div className="history-mobile-top">

                                  <div className="history-mobile-icon">
                                    <Bell className="h-4 w-4" />
                                  </div>

                                  <span
                                    className={
                                      status.className
                                    }
                                  >
                                    <StatusIcon className="h-3.5 w-3.5" />

                                    {
                                      status.label
                                    }
                                  </span>

                                </div>


                                <h3>
                                  {
                                    notification.title ||
                                    "Notification"
                                  }
                                </h3>


                                <p>
                                  {
                                    notification.message ||
                                    "—"
                                  }
                                </p>


                                <div className="history-mobile-meta">

                                  <span>
                                    {notification.audience ===
                                    "selected"
                                      ? "Selected students"
                                      : notification.audience ===
                                        "unpaid"
                                      ? "Unpaid students"
                                      : "All active students"}
                                  </span>

                                  <span>
                                    {notification.type ===
                                    "fee_reminder"
                                      ? "Fee reminder"
                                      : "Announcement"}
                                  </span>

                                  <span>
                                    {formatDate(
                                      getNotificationDate(
                                        notification
                                      )
                                    )}
                                  </span>

                                </div>

                              </div>
                            );
                          }
                        )}
                    </div>
                  </>
                )}

              </div>

            </section>

          </div>
        </section>

      </main>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="notifications-footer">
        <div className="notifications-container">

          <div>
            <strong>
              SHRI KRISHNA DIGITAL LIBRARY
            </strong>

            <span>
              Built for focused learning.
            </span>
          </div>

          <span>
            Communication Center
          </span>

        </div>
      </footer>

    </div>
  );
}