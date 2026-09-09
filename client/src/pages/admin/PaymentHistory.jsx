import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  RefreshCw,
  IndianRupee,
  CreditCard,
  Wallet,
  Banknote,
  X,
  History,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock3,
  User,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Loader2
} from "lucide-react";

import api from "../../services/api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString(
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

function getMonthName(month) {
  return new Date(
    2000,
    Number(month) - 1,
    1
  ).toLocaleString("en-IN", {
    month: "long"
  });
}

function getPaymentMethodLabel(method) {
  switch (method) {
    case "cash":
      return "Cash";

    case "upi_offline":
      return "UPI / Offline";

    case "other":
      return "Other";

    default:
      return method || "—";
  }
}

function getPaymentMethodIcon(method) {
  switch (method) {
    case "cash":
      return Banknote;

    case "upi_offline":
      return Wallet;

    default:
      return CreditCard;
  }
}

function getAuditActionLabel(action) {
  switch (action) {
    case "created":
      return "Payment Created";

    case "correction_requested":
      return "Correction Requested";

    case "corrected":
      return "Payment Corrected";

    case "cancelled":
      return "Payment Cancelled";

    default:
      return action || "Unknown";
  }
}

function getAuditActionClass(action) {
  switch (action) {
    case "created":
      return "bg-green-100 text-green-700";

    case "corrected":
      return "bg-blue-100 text-blue-700";

    case "correction_requested":
      return "bg-yellow-100 text-yellow-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function createInitialCorrectionForm(payment) {
  return {
    month: payment?.month || "",
    year: payment?.year || "",
    amount:
      payment?.amount !== undefined
        ? payment.amount
        : "",
    paymentMethod:
      payment?.paymentMethod || "cash",
    paymentDate: payment?.paymentDate
      ? new Date(payment.paymentDate)
          .toISOString()
          .slice(0, 10)
      : "",
    receiptNumber:
      payment?.receiptNumber || "",
    reason: ""
  };
}

export default function PaymentHistory() {
  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("all");

  const [selectedYear, setSelectedYear] =
    useState("all");

  const [
    selectedPaymentMethod,
    setSelectedPaymentMethod
  ] = useState("all");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [auditHistory, setAuditHistory] =
    useState([]);

  const [auditLoading, setAuditLoading] =
    useState(false);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [
    showCorrectionModal,
    setShowCorrectionModal
  ] = useState(false);

  const [
    correctionForm,
    setCorrectionForm
  ] = useState(
    createInitialCorrectionForm(null)
  );

  const [
    correctionLoading,
    setCorrectionLoading
  ] = useState(false);

  const [
    correctionError,
    setCorrectionError
  ] = useState("");

  const [
    correctionSuccess,
    setCorrectionSuccess
  ] = useState("");

  const [
    auditError,
    setAuditError
  ] = useState("");

  async function loadPayments(
    showRefreshLoader = false
  ) {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await api.get("/payments");

      setPayments(
        response.data?.payments || []
      );
    } catch (err) {
      console.error(
        "Load payment history error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payment history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadAuditHistory(
    paymentId
  ) {
    if (!paymentId) {
      return;
    }

    try {
      setAuditLoading(true);
      setAuditError("");

      const response =
        await api.get(
          `/payment-audits/payment/${paymentId}`
        );

      setAuditHistory(
        response.data?.audits || []
      );
    } catch (err) {
      console.error(
        "Load audit history error:",
        err
      );

      setAuditHistory([]);

      setAuditError(
        err.response?.data?.message ||
          "Failed to load audit history."
      );
    } finally {
      setAuditLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const years = useMemo(() => {
    const uniqueYears =
      new Set(
        payments
          .map(
            (payment) =>
              payment.year
          )
          .filter(Boolean)
      );

    uniqueYears.add(
      getCurrentYear()
    );

    return Array.from(uniqueYears)
      .sort((a, b) => b - a);
  }, [payments]);

  const filteredPayments =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const student =
            payment.studentId || {};

          const matchesSearch =
            !searchValue ||
            student.name
              ?.toLowerCase()
              .includes(searchValue) ||
            student.fatherName
              ?.toLowerCase()
              .includes(searchValue) ||
            student.phoneNumber
              ?.toLowerCase()
              .includes(searchValue) ||
            student.seatNumber
              ?.toLowerCase()
              .includes(searchValue) ||
            payment.receiptNumber
              ?.toLowerCase()
              .includes(searchValue);

          const matchesMonth =
            selectedMonth === "all" ||
            String(payment.month) ===
              String(selectedMonth);

          const matchesYear =
            selectedYear === "all" ||
            String(payment.year) ===
              String(selectedYear);

          const matchesMethod =
            selectedPaymentMethod ===
              "all" ||
            payment.paymentMethod ===
              selectedPaymentMethod;

          return (
            matchesSearch &&
            matchesMonth &&
            matchesYear &&
            matchesMethod
          );
        }
      );
    }, [
      payments,
      search,
      selectedMonth,
      selectedYear,
      selectedPaymentMethod
    ]);

  const summary = useMemo(() => {
    const total =
      filteredPayments.reduce(
        (sum, payment) =>
          sum +
          Number(payment.amount || 0),
        0
      );

    const cash =
      filteredPayments
        .filter(
          (payment) =>
            payment.paymentMethod ===
            "cash"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.amount || 0),
          0
        );

    const upi =
      filteredPayments
        .filter(
          (payment) =>
            payment.paymentMethod ===
            "upi_offline"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.amount || 0),
          0
        );

    const other =
      filteredPayments
        .filter(
          (payment) =>
            payment.paymentMethod ===
            "other"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.amount || 0),
          0
        );

    return {
      count:
        filteredPayments.length,
      total,
      cash,
      upi,
      other
    };
  }, [filteredPayments]);

  function openDetails(payment) {
    setSelectedPayment(payment);
    setAuditHistory([]);
    setShowDetailsModal(true);
    loadAuditHistory(payment._id);
  }

  function closeDetails() {
    setShowDetailsModal(false);
    setSelectedPayment(null);
    setAuditHistory([]);
    setAuditError("");
  }

  function openCorrection(payment) {
    setSelectedPayment(payment);

    setCorrectionForm(
      createInitialCorrectionForm(
        payment
      )
    );

    setCorrectionError("");
    setCorrectionSuccess("");

    setShowDetailsModal(false);
    setShowCorrectionModal(true);

    loadAuditHistory(payment._id);
  }

  function closeCorrection() {
    if (correctionLoading) {
      return;
    }

    setShowCorrectionModal(false);
    setCorrectionError("");
    setCorrectionSuccess("");
    setCorrectionForm(
      createInitialCorrectionForm(
        selectedPayment
      )
    );
  }

  function handleCorrectionChange(
    event
  ) {
    const {
      name,
      value
    } = event.target;

    setCorrectionForm(
      (previous) => ({
        ...previous,
        [name]: value
      })
    );
  }

  async function handleCorrectionSubmit(
    event
  ) {
    event.preventDefault();

    if (!selectedPayment) {
      return;
    }

    setCorrectionError("");
    setCorrectionSuccess("");

    const amount =
      Number(
        correctionForm.amount
      );

    const month =
      Number(
        correctionForm.month
      );

    const year =
      Number(
        correctionForm.year
      );

    if (
      !month ||
      month < 1 ||
      month > 12
    ) {
      setCorrectionError(
        "Please select a valid month."
      );
      return;
    }

    if (
      !year ||
      year < 2000 ||
      year > 2100
    ) {
      setCorrectionError(
        "Please enter a valid year."
      );
      return;
    }

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setCorrectionError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (
      !correctionForm.paymentDate
    ) {
      setCorrectionError(
        "Payment date is required."
      );
      return;
    }

    if (
      !correctionForm.reason.trim()
    ) {
      setCorrectionError(
        "A reason is required for payment correction."
      );
      return;
    }

    if (
      correctionForm.reason.trim()
        .length > 500
    ) {
      setCorrectionError(
        "Correction reason cannot exceed 500 characters."
      );
      return;
    }

    try {
      setCorrectionLoading(true);

      const response =
        await api.post(
          `/payment-audits/${selectedPayment._id}/correct`,
          {
            month,
            year,
            amount,
            paymentMethod:
              correctionForm.paymentMethod,
            paymentDate:
              correctionForm.paymentDate,
            receiptNumber:
              correctionForm.receiptNumber.trim(),
            reason:
              correctionForm.reason.trim()
          }
        );

      const updatedPayment =
        response.data?.payment;

      setCorrectionSuccess(
        "Payment corrected successfully."
      );

      if (updatedPayment) {
        setSelectedPayment(
          updatedPayment
        );
      }

      await loadPayments(
        true
      );

      if (selectedPayment?._id) {
        await loadAuditHistory(
          selectedPayment._id
        );
      }

      setTimeout(() => {
        setShowCorrectionModal(
          false
        );
        setCorrectionSuccess("");
      }, 1200);
    } catch (err) {
      console.error(
        "Correct payment error:",
        err
      );

      setCorrectionError(
        err.response?.data?.message ||
          "Failed to correct payment."
      );
    } finally {
      setCorrectionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Payment History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View, verify and correct manually recorded library payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadPayments(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load payments
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Payments
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.count}
                </p>
              </div>

              <div className="rounded-xl bg-gray-100 p-3">
                <CreditCard
                  size={22}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Collected
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    summary.total
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3">
                <IndianRupee
                  size={22}
                  className="text-green-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Cash
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    summary.cash
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-blue-100 p-3">
                <Banknote
                  size={22}
                  className="text-blue-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  UPI / Offline
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    summary.upi
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-purple-100 p-3">
                <Wallet
                  size={22}
                  className="text-purple-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search student, mobile, seat..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <select
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="all">
                All Months
              </option>

              {Array.from(
                { length: 12 },
                (_, index) =>
                  index + 1
              ).map((month) => (
                <option
                  key={month}
                  value={month}
                >
                  {getMonthName(month)}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="all">
                All Years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>

            <select
              value={
                selectedPaymentMethod
              }
              onChange={(event) =>
                setSelectedPaymentMethod(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="all">
                All Payment Methods
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="upi_offline">
                UPI / Offline
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>
        </div>

        {/* Payment list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Loader2
                  size={22}
                  className="animate-spin"
                />

                Loading payment history...
              </div>
            </div>
          ) : filteredPayments.length ===
            0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <CreditCard
                  size={28}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No payments found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                Try changing your filters or search terms.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Month
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Method
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Payment Date
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(
                      (payment) => {
                        const student =
                          payment.studentId ||
                          {};

                        const MethodIcon =
                          getPaymentMethodIcon(
                            payment.paymentMethod
                          );

                        return (
                          <tr
                            key={
                              payment._id
                            }
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {student.name ||
                                    "Unknown Student"}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {student.phoneNumber ||
                                    "No mobile"}

                                  {student.seatNumber
                                    ? ` • Seat ${student.seatNumber}`
                                    : ""}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {getMonthName(
                                  payment.month
                                )}{" "}
                                {payment.year}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(
                                  payment.amount
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MethodIcon
                                  size={17}
                                />

                                {getPaymentMethodLabel(
                                  payment.paymentMethod
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {formatDate(
                                payment.paymentDate
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(
                                    payment
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                              >
                                <History
                                  size={16}
                                />

                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredPayments.map(
                  (payment) => {
                    const student =
                      payment.studentId ||
                      {};

                    const MethodIcon =
                      getPaymentMethodIcon(
                        payment.paymentMethod
                      );

                    return (
                      <div
                        key={
                          payment._id
                        }
                        className="p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {student.name ||
                                "Unknown Student"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {student.phoneNumber ||
                                "No mobile"}

                              {student.seatNumber
                                ? ` • Seat ${student.seatNumber}`
                                : ""}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Paid
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Month
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                              {getMonthName(
                                payment.month
                              )}{" "}
                              {payment.year}
                            </p>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Amount
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {formatCurrency(
                                payment.amount
                              )}
                            </p>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Method
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 font-medium text-gray-900">
                              <MethodIcon
                                size={15}
                              />

                              {getPaymentMethodLabel(
                                payment.paymentMethod
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Date
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                              {formatDate(
                                payment.paymentDate
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              payment
                            )
                          }
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <History
                            size={16}
                          />

                          View Details & Audit History
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Payment Details Modal */}
      {showDetailsModal &&
        selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Payment Details
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Payment ID:{" "}
                    {selectedPayment._id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-6">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={22}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="font-semibold text-green-800">
                        Payment Recorded
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        This payment was manually recorded by the library operator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <User size={17} />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Student
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedPayment
                        .studentId
                        ?.name ||
                        "Unknown"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedPayment
                        .studentId
                        ?.phoneNumber ||
                        "No mobile"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarDays
                        size={17}
                      />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Billing Month
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {getMonthName(
                        selectedPayment.month
                      )}{" "}
                      {selectedPayment.year}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <IndianRupee
                        size={17}
                      />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Amount
                      </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {formatCurrency(
                        selectedPayment.amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CreditCard
                        size={17}
                      />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Payment Method
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {getPaymentMethodLabel(
                        selectedPayment.paymentMethod
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock3
                        size={17}
                      />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Payment Date
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {formatDateTime(
                        selectedPayment.paymentDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Receipt
                        size={17}
                      />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Receipt Number
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedPayment
                        .receiptNumber ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={21}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="font-semibold text-blue-800">
                        Audit Protection
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        Any correction to this payment requires a reason and is permanently recorded in the payment audit history.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit History */}
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Audit History
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Complete history of changes made to this payment.
                      </p>
                    </div>
                  </div>

                  {auditError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {auditError}
                    </div>
                  )}

                  {auditLoading ? (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                      <Loader2
                        size={20}
                        className="mr-2 animate-spin"
                      />

                      Loading audit history...
                    </div>
                  ) : auditHistory.length ===
                    0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                      <History
                        size={26}
                        className="mx-auto text-gray-400"
                      />

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        No audit records found.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {auditHistory.map(
                        (audit) => (
                          <div
                            key={
                              audit._id
                            }
                            className="rounded-xl border border-gray-200 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAuditActionClass(
                                    audit.action
                                  )}`}
                                >
                                  {getAuditActionLabel(
                                    audit.action
                                  )}
                                </span>

                                <p className="mt-2 text-xs text-gray-500">
                                  {formatDateTime(
                                    audit.createdAt
                                  )}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xs text-gray-500">
                                  Admin
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {audit.adminId
                                    ?.name ||
                                    audit.adminId
                                      ?.email ||
                                    "Unknown admin"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-lg bg-gray-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Reason
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-700">
                                {audit.reason ||
                                  "—"}
                              </p>
                            </div>

                            {audit.previousData &&
                              audit.newData && (
                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                                    <p className="text-xs font-semibold text-red-700">
                                      Previous
                                    </p>

                                    <div className="mt-2 space-y-1 text-xs text-gray-700">
                                      <p>
                                        Month:{" "}
                                        {audit.previousData.month
                                          ? `${getMonthName(
                                              audit.previousData.month
                                            )} ${audit.previousData.year}`
                                          : "—"}
                                      </p>

                                      <p>
                                        Amount:{" "}
                                        {formatCurrency(
                                          audit.previousData.amount
                                        )}
                                      </p>

                                      <p>
                                        Method:{" "}
                                        {getPaymentMethodLabel(
                                          audit.previousData
                                            .paymentMethod
                                        )}
                                      </p>

                                      <p>
                                        Date:{" "}
                                        {formatDate(
                                          audit.previousData
                                            .paymentDate
                                        )}
                                      </p>

                                      <p>
                                        Receipt:{" "}
                                        {audit.previousData
                                          .receiptNumber ||
                                          "—"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                                    <p className="text-xs font-semibold text-green-700">
                                      New
                                    </p>

                                    <div className="mt-2 space-y-1 text-xs text-gray-700">
                                      <p>
                                        Month:{" "}
                                        {audit.newData.month
                                          ? `${getMonthName(
                                              audit.newData.month
                                            )} ${audit.newData.year}`
                                          : "—"}
                                      </p>

                                      <p>
                                        Amount:{" "}
                                        {formatCurrency(
                                          audit.newData.amount
                                        )}
                                      </p>

                                      <p>
                                        Method:{" "}
                                        {getPaymentMethodLabel(
                                          audit.newData
                                            .paymentMethod
                                        )}
                                      </p>

                                      <p>
                                        Date:{" "}
                                        {formatDate(
                                          audit.newData
                                            .paymentDate
                                        )}
                                      </p>

                                      <p>
                                        Receipt:{" "}
                                        {audit.newData
                                          .receiptNumber ||
                                          "—"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openCorrection(
                      selectedPayment
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Edit3
                    size={16}
                  />

                  Correct Payment
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Correction Modal */}
      {showCorrectionModal &&
        selectedPayment && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Correct Payment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    All corrections are recorded in the audit history.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCorrection
                  }
                  disabled={
                    correctionLoading
                  }
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  handleCorrectionSubmit
                }
                className="overflow-y-auto"
              >
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-yellow-700"
                      />

                      <div>
                        <p className="font-semibold text-yellow-800">
                          Important
                        </p>

                        <p className="mt-1 text-sm leading-6 text-yellow-700">
                          Only correct a payment when the original record contains an actual mistake. The previous information will remain available in the audit history.
                        </p>
                      </div>
                    </div>
                  </div>

                  {correctionError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {correctionError}
                      </span>
                    </div>
                  )}

                  {correctionSuccess && (
                    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {correctionSuccess}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Month
                      </label>

                      <select
                        name="month"
                        value={
                          correctionForm.month
                        }
                        onChange={
                          handleCorrectionChange
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      >
                        {Array.from(
                          { length: 12 },
                          (_, index) =>
                            index + 1
                        ).map(
                          (month) => (
                            <option
                              key={
                                month
                              }
                              value={
                                month
                              }
                            >
                              {getMonthName(
                                month
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Year
                      </label>

                      <input
                        type="number"
                        name="year"
                        min="2000"
                        max="2100"
                        value={
                          correctionForm.year
                        }
                        onChange={
                          handleCorrectionChange
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Amount
                      </label>

                      <div className="relative">
                        <IndianRupee
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="number"
                          name="amount"
                          min="0"
                          step="1"
                          value={
                            correctionForm.amount
                          }
                          onChange={
                            handleCorrectionChange
                          }
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>

                      <select
                        name="paymentMethod"
                        value={
                          correctionForm.paymentMethod
                        }
                        onChange={
                          handleCorrectionChange
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      >
                        <option value="cash">
                          Cash
                        </option>

                        <option value="upi_offline">
                          UPI / Offline
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Payment Date
                      </label>

                      <input
                        type="date"
                        name="paymentDate"
                        value={
                          correctionForm.paymentDate
                        }
                        onChange={
                          handleCorrectionChange
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Receipt Number
                      </label>

                      <input
                        type="text"
                        name="receiptNumber"
                        maxLength="100"
                        value={
                          correctionForm.receiptNumber
                        }
                        onChange={
                          handleCorrectionChange
                        }
                        placeholder="Optional"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Reason for Correction
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <textarea
                      name="reason"
                      rows="4"
                      maxLength="500"
                      value={
                        correctionForm.reason
                      }
                      onChange={
                        handleCorrectionChange
                      }
                      placeholder="Example: Amount was entered as ₹500 instead of ₹800."
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />

                    <div className="mt-1 text-right text-xs text-gray-400">
                      {
                        correctionForm.reason
                          .length
                      }{" "}
                      / 500
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={
                      closeCorrection
                    }
                    disabled={
                      correctionLoading
                    }
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      correctionLoading
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {correctionLoading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <ShieldCheck
                          size={17}
                        />

                        Save Correction
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}