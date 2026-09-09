import React, {
  useState
} from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import AuthShell from "../../components/auth/AuthShell";

import api from "../../services/api";

export default function AdminLogin() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail
  ] = useState("");

  const [
    password,
    setPassword
  ] = useState("");

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/admin/login",
          {
            email: cleanEmail,
            password
          }
        );

      const data =
        response.data;

      if (
        !data?.success ||
        !data?.token
      ) {
        throw new Error(
          data?.message ||
            "Unable to sign in."
        );
      }

      localStorage.setItem(
        "adminToken",
        data.token
      );

      localStorage.setItem(
        "admin",
        JSON.stringify(
          data.admin
        )
      );

      navigate(
        "/admin/dashboard",
        {
          replace: true
        }
      );
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Admin access."
      description="Manage students, memberships, payments and notifications from your library control panel."
      eyebrow="LIBRARY ADMIN"
    >
      <div className="student-auth-card admin-auth-card">
        <div className="student-auth-card-top">
          <div className="student-auth-card-icon admin-icon">
            <KeyRound size={21} />
          </div>

          <div>
            <strong>
              Administrator Sign In
            </strong>

            <span>
              Authorized library operator access
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="student-auth-form"
        >
          <div className="auth-input-group">
            <label htmlFor="admin-email">
              Email Address
            </label>

            <div className="auth-input-wrapper">
              <span className="auth-input-leading">
                <Mail size={17} />
              </span>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label htmlFor="admin-password">
                Password
              </label>

              <span>
                Protected access
              </span>
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-leading">
                <LockKeyhole
                  size={17}
                />
              </span>

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              <span>
                !
              </span>

              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="spin"
                />

                Signing in...
              </>
            ) : (
              <>
                Sign in to Dashboard

                <ArrowRight
                  size={17}
                />
              </>
            )}
          </button>
        </form>

        <div className="admin-security-card">
          <div>
            <ShieldCheck size={17} />
          </div>

          <div>
            <strong>
              Secure administrator area
            </strong>

            <span>
              Only authorized library
              operators should access this
              dashboard.
            </span>
          </div>
        </div>
      </div>

      <div className="auth-footer-note">
        <span>
          Student?
        </span>

        <a href="/student/login">
          Go to Student Login
        </a>
      </div>
    </AuthShell>
  );
}