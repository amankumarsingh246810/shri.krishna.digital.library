import { useEffect, useState } from "react";
import {
  IndianRupee,
  Search,
  CheckCircle2,
  Clock3,
  Users,
  Receipt,
  Loader2,
  X,
  CreditCard,
  CalendarDays,
  AlertCircle
} from "lucide-react";

import api from "../../services/api";

function FeeManagement() {
  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [students, setStudents] = useState([]);

  const [summary, setSummary] = useState({
    totalStudents: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    totalCollected: 0
  });

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [paymentForm, setPaymentForm] =
    useState({
      amount: "",
      paymentMethod: "cash",
      receiptNumber: ""
    });

  useEffect(() => {
    loadMonthlyPaymentStatus();
  }, [month, year]);

  async function loadMonthlyPaymentStatus() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await api.get(
          `/payments/status/${year}/${month}`
        );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to load fee information."
        );
      }

      setStudents(
        response.data.students || []
      );

      setSummary(
        response.data.summary || {
          totalStudents: 0,
          paidStudents: 0,
          unpaidStudents: 0,
          totalCollected: 0
        }
      );
    } catch (error) {
      console.error(
        "Load fee management error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load fee information."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPaymentModal(student) {
    setSelectedStudent(student);

    setPaymentForm({
      amount: student.student.monthlyFee || "",
      paymentMethod: "cash",
      receiptNumber: ""
    });

    setError("");
    setSuccess("");
  }

  function handleClosePaymentModal() {
    if (submitting) {
      return;
    }

    setSelectedStudent(null);

    setPaymentForm({
      amount: "",
      paymentMethod: "cash",
      receiptNumber: ""
    });
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target;

    setPaymentForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleRecordPayment(event) {
    event.preventDefault();

    if (!selectedStudent) {
      return;
    }

    setError("");
    setSuccess("");

    const amount = Number(
      paymentForm.amount
    );

    if (!amount || amount < 0) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await api.post(
          "/payments",
          {
            studentId:
              selectedStudent.student._id,

            month,

            year,

            amount,

            paymentMethod:
              paymentForm.paymentMethod,

            receiptNumber:
              paymentForm.receiptNumber.trim()
          }
        );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to record payment."
        );
      }

      setSelectedStudent(null);

      setPaymentForm({
        amount: "",
        paymentMethod: "cash",
        receiptNumber: ""
      });

      setSuccess(
        `Payment recorded successfully for ${selectedStudent.student.name}.`
      );

      await loadMonthlyPaymentStatus();
    } catch (error) {
      console.error(
        "Record payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to record payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatMonth(monthNumber) {
    const date = new Date(
      2000,
      monthNumber - 1,
      1
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long"
      }
    );
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatPaymentMethod(method) {
    const methods = {
      cash: "Cash",
      upi_offline: "UPI",
      other: "Other"
    };

    return (
      methods[method] ||
      method ||
      "—"
    );
  }

  const filteredStudents =
    students.filter((item) => {
      const student =
        item.student;

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        student.name
          ?.toLowerCase()
          .includes(search) ||
        student.phoneNumber
          ?.toLowerCase()
          .includes(search) ||
        student.fatherName
          ?.toLowerCase()
          .includes(search) ||
        student.seatNumber
          ?.toLowerCase()
          .includes(search)
      );
    });

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Fee Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage monthly student fees
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <CalendarDays className="h-4 w-4" />

              {formatMonth(month)}{" "}
              {year}
            </div>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              {success}
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="grid gap-4 sm:grid-cols-3">

            <div>
              <label
                htmlFor="month"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Month
              </label>

              <select
                id="month"
                value={month}
                onChange={(event) =>
                  setMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {Array.from(
                  { length: 12 },
                  (_, index) => {
                    const monthNumber =
                      index + 1;

                    return (
                      <option
                        key={monthNumber}
                        value={monthNumber}
                      >
                        {formatMonth(
                          monthNumber
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Year
              </label>

              <select
                id="year"
                value={year}
                onChange={(event) =>
                  setYear(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {Array.from(
                  { length: 5 },
                  (_, index) => {
                    const yearValue =
                      currentDate.getFullYear() -
                      2 +
                      index;

                    return (
                      <option
                        key={yearValue}
                        value={yearValue}
                      >
                        {yearValue}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="studentSearch"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search Student
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="studentSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Name, mobile, seat..."
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

          </div>

        </section>

        {/* Summary */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Students
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-800">
                  {summary.totalStudents}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Paid */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                  {summary.paidStudents}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Unpaid */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Unpaid
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {summary.unpaidStudents}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <Clock3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Collected */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Collected
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-800">
                  ₹
                  {summary.totalCollected}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

        </section>

        {/* Student List */}
        <section className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-gray-800">
              Student Fees
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredStudents.length} student
              {filteredStudents.length !== 1
                ? "s"
                : ""}{" "}
              displayed
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-5 py-16">
              <div className="text-center">
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading fee information...
                </p>
              </div>
            </div>
          ) : filteredStudents.length ===
            0 ? (
            <div className="px-5 py-16 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-400" />

              <p className="mt-3 font-medium text-gray-700">
                No students found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing the search or
                selected month.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredStudents.map(
                  (item) => {
                    const student =
                      item.student;

                    const payment =
                      item.payment;

                    const isPaid =
                      item.paymentStatus ===
                      "paid";

                    return (
                      <div
                        key={student._id}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {student.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {student.phoneNumber}
                            </p>

                            {student.seatNumber && (
                              <p className="mt-1 text-xs text-gray-500">
                                Seat:{" "}
                                {student.seatNumber}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              isPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isPaid
                              ? "Paid"
                              : "Unpaid"}
                          </span>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div>
                            <p className="text-xs text-gray-500">
                              Monthly Fee
                            </p>

                            <p className="mt-1 font-semibold text-gray-800">
                              ₹
                              {
                                student.monthlyFee
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Paid Amount
                            </p>

                            <p className="mt-1 font-semibold text-gray-800">
                              ₹
                              {payment?.amount ||
                                0}
                            </p>
                          </div>

                          {isPaid && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Payment Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  {formatDate(
                                    payment?.paymentDate
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Method
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  {formatPaymentMethod(
                                    payment?.paymentMethod
                                  )}
                                </p>
                              </div>
                            </>
                          )}

                        </div>

                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenPaymentModal(
                                item
                              )
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Receipt className="h-4 w-4" />
                            Record Payment
                          </button>
                        )}

                      </div>
                    );
                  }
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">

                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">

                      <th className="px-5 py-4 font-semibold">
                        Student
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Seat
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Monthly Fee
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Payment
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map(
                      (item) => {
                        const student =
                          item.student;

                        const payment =
                          item.payment;

                        const isPaid =
                          item.paymentStatus ===
                          "paid";

                        return (
                          <tr
                            key={student._id}
                            className="border-b border-gray-100 last:border-0"
                          >

                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-800">
                                {student.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  student.phoneNumber
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {student.seatNumber ||
                                "—"}
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                              ₹
                              {
                                student.monthlyFee
                              }
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                  isPaid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isPaid ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Clock3 className="h-3.5 w-3.5" />
                                )}

                                {isPaid
                                  ? "Paid"
                                  : "Unpaid"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {payment
                                ? `₹${payment.amount}`
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {payment
                                ? formatDate(
                                    payment.paymentDate
                                  )
                                : "—"}
                            </td>

                            <td className="px-5 py-4">
                              {!isPaid ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenPaymentModal(
                                      item
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  <Receipt className="h-4 w-4" />
                                  Record Payment
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-green-600">
                                  Payment recorded
                                </span>
                              )}
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

      </main>

      {/* Payment Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

              <div>
                <h2 className="font-bold text-gray-800">
                  Record Payment
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {formatMonth(month)}{" "}
                  {year}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleClosePaymentModal
                }
                disabled={submitting}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Student information */}
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {
                      selectedStudent
                        .student.name
                    }
                  </p>

                  <p className="text-xs text-gray-500">
                    {
                      selectedStudent
                        .student.phoneNumber
                    }

                    {selectedStudent.student
                      .seatNumber &&
                      ` • Seat ${selectedStudent.student.seatNumber}`}
                  </p>
                </div>

              </div>

            </div>

            {/* Form */}
            <form
              onSubmit={
                handleRecordPayment
              }
              className="space-y-5 p-5 sm:p-6"
            >

              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Payment Amount
                </label>

                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      paymentForm.amount
                    }
                    onChange={
                      handlePaymentChange
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Monthly fee: ₹
                  {
                    selectedStudent
                      .student
                      .monthlyFee
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Payment Method
                </label>

                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={
                      paymentForm.paymentMethod
                    }
                    onChange={
                      handlePaymentChange
                    }
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="cash">
                      Cash
                    </option>

                    <option value="upi_offline">
                      UPI
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  This records an offline/manual
                  payment only.
                </p>
              </div>

              <div>
                <label
                  htmlFor="receiptNumber"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Receipt Number
                  <span className="ml-1 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="receiptNumber"
                    name="receiptNumber"
                    type="text"
                    value={
                      paymentForm.receiptNumber
                    }
                    onChange={
                      handlePaymentChange
                    }
                    placeholder="e.g. SKDL-001"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs leading-5 text-blue-700">
                  By submitting this form, the
                  payment will be marked as{" "}
                  <strong>Paid</strong> for{" "}
                  {formatMonth(month)}{" "}
                  {year}.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    handleClosePaymentModal
                  }
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Paid
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

export default FeeManagement;