import React from "react";
import ReactDOM from "react-dom/client";


import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";

import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import FeeManagement from "./pages/admin/FeeManagement";
import PaymentHistory from "./pages/admin/PaymentHistory";
import Notifications from "./pages/admin/Notifications";

import "./styles.css";
import "./styles/auth.css";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Student */}
      <Route
        path="/student/login"
        element={<StudentLogin />}
      />

      <Route
        path="/student/dashboard"
        element={
          <StudentDashboard />
        }
      />

      {/* Admin */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminDashboard />
        }
      />

      <Route
        path="/admin/students"
        element={
          <StudentManagement />
        }
      />

      <Route
        path="/admin/fees"
        element={
          <FeeManagement />
        }
      />

      <Route
        path="/admin/payments"
        element={
          <PaymentHistory />
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <Notifications />
        }
      />
    </Routes>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);