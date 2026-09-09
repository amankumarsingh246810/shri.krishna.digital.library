
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import {
  User,
  Phone,
  UserRound,
  Armchair,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  CreditCard,
  Loader2,
  AlertCircle,
  Bell,
  BellRing,
  ShieldCheck
} from "lucide-react";

import { auth } from "../../services/firebase";
import api from "../../services/api";

import {
  registerCurrentDevice,
  listenForForegroundMessages
} from "../../services/notification";

function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState(null);

  const [paymentStatus, setPaymentStatus] =
    useState(null);

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [notificationEnabled, setNotificationEnabled] =
    useState(false);

  const [notificationMessage, setNotificationMessage] =
    useState("");

  const [notificationError, setNotificationError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * Listen for notifications while the
   * student is currently using the dashboard.
   */
  useEffect(() => {
    let unsubscribe;

    async function setupForegroundNotifications() {
      unsubscribe =
        await listenForForegroundMessages(
          (payload) => {
            const title =
              payload.notification?.title ||
              "Shri Krishna Digital Library";

            const message =
              payload.notification?.body ||
              "You have a new notification.";

            setNotificationMessage(
              `${title}: ${message}`
            );

            /*
             * If browser notifications are already
             * allowed, show a native notification.
             */
            if (
              "Notification" in window &&
              Notification.permission ===
                "granted"
            ) {
              new Notification(
                title,
                {
                  body: message,
                  icon: "/favicon.ico"
                }
              );
            }
          }
        );
    }

    setupForegroundNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      /*
       * Firebase authentication token is now handled
       * automatically by the api.js interceptor.
       *
       * No manual studentToken retrieval or
       * Authorization header is required here.
       */

      const [
        studentResponse,
        paymentStatusResponse,
        paymentsResponse
      ] = await Promise.all([
        api.get(
          "/student-auth/me"
        ),

        api.get(
          "/student-auth/payment-status"
        ),

        api.get(
          "/student-auth/payments"
        )
      ]);

      if (
        !studentResponse.data.success ||
        !paymentStatusResponse.data.success ||
        !paymentsResponse.data.success
      ) {
        throw new Error(
          "Unable to load dashboard data."
        );
      }

      const currentStudent =
        studentResponse.data.student;

      setStudent(
        currentStudent
      );

      setPaymentStatus(
        paymentStatusResponse.data
      );

      setPayments(
        paymentsResponse.data.payments
      );

      /*
       * Keep the latest student information
       * in localStorage.
       */
      localStorage.setItem(
        "student",
        JSON.stringify(
          currentStudent
        )
      );
    } catch (error) {
      console.error(
        "Student dashboard error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        /*
         * Remove any legacy/local student session
         * data when the backend rejects authentication.
         */
        localStorage.removeItem(
          "studentToken"
        );

        localStorage.removeItem(
          "student"
        );

        await signOut(auth).catch(
          () => {}
        );

        navigate(
          "/student/login",
          {
            replace: true
          }
        );

        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Enable Firebase Cloud Messaging
   * for the current student's device.
   */
  async function handleEnableNotifications() {
    setNotificationLoading(true);

    setNotificationMessage("");

    setNotificationError("");

    try {
      const result =
        await registerCurrentDevice();

      if (!result.success) {
        setNotificationError(
          result.message ||
            "Unable to enable notifications."
        );

        return;
      }

      setNotificationEnabled(true);

      setNotificationMessage(
        "Notifications enabled successfully. You will receive important library updates and fee reminders."
      );
    } catch (error) {
      console.error(
        "Enable notification error:",
        error
      );

      setNotificationError(
        error.response?.data?.message ||
          error.message ||
          "Unable to enable notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      /*
       * We intentionally don't fail logout
       * if notification cleanup isn't possible.
       *
       * Firebase authentication and server-side
       * notification-token cleanup can be handled
       * independently.
       */
      try {
        if (notificationEnabled) {
          /*
           * The Firebase notification token itself is
           * managed by the notification service/browser.
           * Server-side token cleanup can be handled
           * separately if required.
           */
        }
      } catch (notificationError) {
        console.error(
          "Notification cleanup error:",
          notificationError
        );
      }

      await signOut(auth);
    } catch (error) {
      console.error(
        "Firebase logout error:",
        error
      );
    } finally {
      localStorage.removeItem(
        "studentToken"
      );

      localStorage.removeItem(
        "student"
      );

      navigate(
        "/student/login",
        {
          replace: true
        }
      );
    }
  }

  function formatMonth(
    month,
    year
  ) {
    if (!month || !year) {
      return "";
    }

    const date =
      new Date(
        year,
        month - 1,
        1
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric"
      }
    );
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function formatPaymentMethod(
    method
  ) {
    if (!method) {
      return "—";
    }

    const methodNames = {
      cash: "Cash",
      upi_offline: "UPI",
      other: "Other"
    };

    return (
      methodNames[method] ||
      method
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

          <p className="mt-4 text-sm text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-xl font-bold text-gray-800">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid =
    paymentStatus?.paymentStatus ===
    "paid";

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
              Shri Krishna Digital Library
            </h1>

            <p className="text-xs text-gray-500 sm:text-sm">
              Student Portal
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            <LogOut className="h-4 w-4" />

            <span className="hidden sm:inline">
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>

        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Welcome */}
        <section className="mb-6">
          <p className="text-sm text-gray-500">
            Welcome back
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">
            {student?.name ||
              "Student"}{" "}
            👋
          </h2>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* Notification Section */}
        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  {notificationEnabled ? (
                    <BellRing className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Bell className="h-6 w-6 text-blue-600" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Library Notifications
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                    Enable notifications to receive
                    important library updates and
                    monthly fee reminders.
                  </p>
                </div>

              </div>

              <div className="shrink-0">

                {notificationEnabled ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
                    <ShieldCheck className="h-5 w-5" />

                    Notifications Enabled
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleEnableNotifications
                    }
                    disabled={
                      notificationLoading
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {notificationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Enabling...
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />

                        Enable Notifications
                      </>
                    )}
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* Notification feedback */}
          {(notificationMessage ||
            notificationError) && (
            <div className="p-5 sm:p-6">

              {notificationMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p>
                    {notificationMessage}
                  </p>
                </div>
              )}

              {notificationError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Unable to enable notifications
                    </p>

                    <p className="mt-1">
                      {notificationError}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </section>

        {/* Student Profile */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h3 className="font-bold text-gray-800">
                Student Profile
              </h3>

              <p className="text-xs text-gray-500">
                Your registered library information
              </p>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Name */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <User className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Student Name
                </span>
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                {student?.name ||
                  "—"}
              </p>

            </div>

            {/* Father Name */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <UserRound className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Father's Name
                </span>
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                {student?.fatherName ||
                  "—"}
              </p>

            </div>

            {/* Mobile */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Mobile Number
                </span>
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                {student?.phoneNumber ||
                  "—"}
              </p>

            </div>

            {/* Seat */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <Armchair className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Seat Number
                </span>
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                {student?.seatNumber ||
                  "Not assigned"}
              </p>

            </div>

            {/* Monthly Fee */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <IndianRupee className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Monthly Fee
                </span>
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                ₹
                {student?.monthlyFee ??
                  0}
              </p>

            </div>

            {/* Enrollment */}
            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Enrollment Status
                </span>
              </div>

              <p
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  student?.enrollmentStatus ===
                  "active"
                    ? "bg-green-100 text-green-700"
                    : student?.enrollmentStatus ===
                      "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {student?.enrollmentStatus ||
                  "unknown"}
              </p>

            </div>

          </div>

        </section>

        {/* Current Fee */}
        <section className="mb-6">

          <div className="mb-4">

            <h3 className="text-xl font-bold text-gray-800">
              Current Month Fee
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {formatMonth(
                paymentStatus?.month,
                paymentStatus?.year
              )}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Monthly Fee
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-800">
                  ₹
                  {paymentStatus?.monthlyFee ??
                    student?.monthlyFee ??
                    0}
                </p>
              </div>

              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Clock3 className="h-5 w-5" />
                )}

                {isPaid
                  ? "Fee Paid"
                  : "Fee Unpaid"}
              </div>

            </div>

            <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">

              <div>
                <p className="text-xs text-gray-500">
                  Payment Date
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDate(
                    paymentStatus
                      ?.payment
                      ?.paymentDate
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatPaymentMethod(
                    paymentStatus
                      ?.payment
                      ?.paymentMethod
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Receipt Number
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {paymentStatus
                    ?.payment
                    ?.receiptNumber ||
                    "—"}
                </p>
              </div>

            </div>

            {!isPaid && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Monthly fee is pending
                  </p>

                  <p className="mt-1 text-xs leading-5 text-yellow-700">
                    Please contact the library
                    operator to pay your monthly
                    fee. Payments are manually
                    updated by the library operator.
                  </p>
                </div>

              </div>
            )}

          </div>

        </section>

        {/* Payment History */}
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>

            <div>
              <h3 className="font-bold text-gray-800">
                Payment History
              </h3>

              <p className="text-xs text-gray-500">
                Your previous monthly payments
              </p>
            </div>

          </div>

          {payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">

              <CalendarDays className="mx-auto h-10 w-10 text-gray-400" />

              <p className="mt-3 font-medium text-gray-700">
                No payment history available
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your payments will appear here
                after the library operator records
                them.
              </p>

            </div>
          ) : (
            <>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">

                {payments.map(
                  (payment) => (
                    <div
                      key={
                        payment._id
                      }
                      className="rounded-xl border border-gray-200 p-4"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="font-semibold text-gray-800">
                            {formatMonth(
                              payment.month,
                              payment.year
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(
                              payment.paymentDate
                            )}
                          </p>
                        </div>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Paid
                        </span>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-xs text-gray-500">
                            Amount
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            ₹
                            {payment.amount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Method
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {formatPaymentMethod(
                              payment.paymentMethod
                            )}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">
                            Receipt
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {payment.receiptNumber ||
                              "—"}
                          </p>
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[700px] text-left">

                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">

                      <th className="px-4 py-3 font-semibold">
                        Month
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Amount
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Payment Date
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Method
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Receipt
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {payments.map(
                      (payment) => (
                        <tr
                          key={
                            payment._id
                          }
                          className="border-b border-gray-100 last:border-0"
                        >

                          <td className="px-4 py-4 text-sm font-medium text-gray-800">
                            {formatMonth(
                              payment.month,
                              payment.year
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-gray-800">
                            ₹
                            {payment.amount}
                          </td>

                          <td className="px-4 py-4">

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Paid
                            </span>

                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatDate(
                              payment.paymentDate
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatPaymentMethod(
                              payment.paymentMethod
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {payment.receiptNumber ||
                              "—"}
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

        {/* Footer */}
        <footer className="py-8 text-center">

          <p className="text-xs text-gray-500">
            Shri Krishna Digital Library
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Student Portal
          </p>

        </footer>

      </main>

    </div>
  );
}

export default StudentDashboard;

