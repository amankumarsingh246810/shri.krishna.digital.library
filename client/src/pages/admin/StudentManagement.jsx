import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  Search,
  Users,
  X
} from "lucide-react";
import api from "../../services/api";

const initialFormData = {
  name: "",
  fatherName: "",
  phoneNumber: "",
  email: "",
  address: "",
  seatNumber: "",
  monthlyFee: "",
  enrollmentStatus: "active"
};

function StudentManagement() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState(initialFormData);

  const [editingStudentId, setEditingStudentId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Fetch students
  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students");

      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Fetch students error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Open add form
  function handleAddStudent() {
    setEditingStudentId(null);
    setFormData(initialFormData);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // Open edit form
  function handleEditStudent(student) {
    setEditingStudentId(student._id);

    setFormData({
      name: student.name || "",
      fatherName: student.fatherName || "",
      phoneNumber: student.phoneNumber || "",
      email: student.email || "",
      address: student.address || "",
      seatNumber: student.seatNumber || "",
      monthlyFee: student.monthlyFee ?? "",
      enrollmentStatus: student.enrollmentStatus || "active"
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // Close form
  function handleCloseForm() {
    setShowForm(false);
    setEditingStudentId(null);
    setFormData(initialFormData);
  }

  // Submit student form
  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        monthlyFee: Number(formData.monthlyFee)
      };

      if (editingStudentId) {
        const response = await api.put(
          `/students/${editingStudentId}`,
          payload
        );

        if (response.data.success) {
          setSuccess("Student updated successfully.");
        }
      } else {
        const response = await api.post(
          "/students",
          payload
        );

        if (response.data.success) {
          setSuccess("Student added successfully.");
        }
      }

      await fetchStudents();

      setTimeout(() => {
        handleCloseForm();
      }, 700);
    } catch (error) {
      console.error("Save student error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  // Change enrollment status
  async function handleStatusChange(studentId, status) {
    try {
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/students/${studentId}/enrollment`,
        {
          status
        }
      );

      if (response.data.success) {
        setSuccess(
          `Student marked as ${status}.`
        );

        await fetchStudents();

        setTimeout(() => {
          setSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.error(
        "Update enrollment status error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update enrollment status."
      );
    }
  }

  // Search students
  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name?.toLowerCase().includes(search) ||
        student.fatherName
          ?.toLowerCase()
          .includes(search) ||
        student.phoneNumber?.includes(search) ||
        student.seatNumber
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Student Management
                </h1>

                <p className="text-sm text-gray-500">
                  Manage library students and enrollment
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddStudent}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by name, father name, mobile number or seat number..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Student Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold">
            {filteredStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {students.length}
          </span>{" "}
          students
        </div>

        {/* Student Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />

              <h3 className="font-semibold text-gray-700">
                No students found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add a student or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Seat
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Monthly Fee
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {student.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            S/O {student.fatherName}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {student.phoneNumber}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {student.seatNumber || "Not assigned"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-gray-700">
                        ₹{student.monthlyFee}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={student.enrollmentStatus}
                          onChange={(event) =>
                            handleStatusChange(
                              student._id,
                              event.target.value
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none ${
                            student.enrollmentStatus ===
                            "active"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : student.enrollmentStatus ===
                                "inactive"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-yellow-200 bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          <option value="active">
                            Active
                          </option>

                          <option value="pending">
                            Pending
                          </option>

                          <option value="inactive">
                            Inactive
                          </option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            handleEditStudent(student)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingStudentId
                    ? "Edit Student"
                    : "Add New Student"}
                </h2>

                <p className="text-sm text-gray-500">
                  Enter student information below
                </p>
              </div>

              <button
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Student Name *
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter student name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Father's Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Father's Name *
                  </label>

                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    placeholder="Enter father's name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mobile Number *
                  </label>

                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Seat */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Seat Number
                  </label>

                  <input
                    name="seatNumber"
                    value={formData.seatNumber}
                    onChange={handleChange}
                    placeholder="Example: A-12"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Monthly Fee */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Monthly Fee *
                  </label>

                  <input
                    name="monthlyFee"
                    type="number"
                    min="0"
                    value={formData.monthlyFee}
                    onChange={handleChange}
                    required
                    placeholder="Example: 1500"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter student's address"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Enrollment Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Enrollment Status
                </label>

                <select
                  name="enrollmentStatus"
                  value={formData.enrollmentStatus}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingStudentId
                    ? "Update Student"
                    : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;