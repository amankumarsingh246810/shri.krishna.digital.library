import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Phone,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import {
  useNavigate
} from "react-router-dom";

import AuthShell from "../../components/auth/AuthShell";

import {
  auth
} from "../../services/firebase";

export default function StudentLogin() {
  const navigate = useNavigate();

  const [
    phoneNumber,
    setPhoneNumber
  ] = useState("");

  const [
    otp,
    setOtp
  ] = useState("");

  const [
    confirmationResult,
    setConfirmationResult
  ] = useState(null);

  const [
    step,
    setStep
  ] = useState("phone");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    success,
    setSuccess
  ] = useState("");

  const [
    resendTimer,
    setResendTimer
  ] = useState(0);

  const recaptchaRef = useRef(null);

  /*
   * Clean up reCAPTCHA when the page
   * is unmounted.
   */
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // Ignore cleanup errors.
        }

        window.recaptchaVerifier = null;
      }

      recaptchaRef.current = null;
    };
  }, []);

  /*
   * Resend OTP countdown.
   */
  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendTimer]);

  /*
   * Normalize Indian phone numbers.
   */
  function normalizePhone(value) {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 10) {
      return `+91${digits}`;
    }

    if (
      digits.length === 12 &&
      digits.startsWith("91")
    ) {
      return `+${digits}`;
    }

    if (value.startsWith("+91")) {
      return `+91${digits.slice(-10)}`;
    }

    return value;
  }

  /*
   * Validate phone number.
   */
  function validatePhone() {
    const normalized = normalizePhone(phoneNumber);

    if (!/^\+91\d{10}$/.test(normalized)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );

      return null;
    }

    return normalized;
  }

  /*
   * Create Firebase reCAPTCHA verifier.
   */
  function setupRecaptcha() {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    const verifier = new RecaptchaVerifier(
      auth,
      "student-recaptcha",
      {
        size: "invisible",

        callback: () => {
          // reCAPTCHA completed.
        },

        "expired-callback": () => {
          setError(
            "Security verification expired. Please try again."
          );
        }
      }
    );

    window.recaptchaVerifier = verifier;
    recaptchaRef.current = verifier;

    return verifier;
  }

  /*
   * Send OTP.
   */
  async function sendOtp(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedPhone = validatePhone();

    if (!normalizedPhone) {
      return;
    }

    try {
      setLoading(true);

      const verifier = setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        verifier
      );

      setConfirmationResult(result);
      setPhoneNumber(normalizedPhone);
      setStep("otp");
      setResendTimer(30);

      setSuccess(
        `OTP sent to ${normalizedPhone}.`
      );
    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // Ignore cleanup errors.
        }

        window.recaptchaVerifier = null;
        recaptchaRef.current = null;
      }

      let message =
        "Unable to send OTP. Please try again.";

      if (
        error?.code ===
        "auth/invalid-phone-number"
      ) {
        message =
          "The mobile number is invalid.";
      }

      if (
        error?.code ===
        "auth/too-many-requests"
      ) {
        message =
          "Too many attempts. Please wait and try again later.";
      }

      if (
        error?.code ===
        "auth/quota-exceeded"
      ) {
        message =
          "OTP service limit has been reached temporarily.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Verify OTP.
   */
  async function verifyOtp(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!confirmationResult) {
      setError(
        "Please request a new OTP."
      );

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * Firebase signs the student in here.
       */
      const userCredential =
        await confirmationResult.confirm(otp);

      const user = userCredential.user;

      /*
       * Force-refresh the Firebase ID token.
       * This ensures the protected dashboard/backend
       * receives a valid authenticated token.
       */
      await user.getIdToken(true);

      console.log(
        "Student Firebase login successful:",
        user.phoneNumber
      );

      setSuccess(
        "Login successful. Opening your dashboard..."
      );

      /*
       * Small delay only for displaying the success
       * message. Navigation itself is not dependent
       * on a timeout.
       */
      navigate(
        "/student/dashboard",
        {
          replace: true
        }
      );
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      let message =
        "Invalid OTP. Please check the code and try again.";

      if (
        error?.code ===
        "auth/code-expired"
      ) {
        message =
          "This OTP has expired. Please request a new one.";
      }

      if (
        error?.code ===
        "auth/invalid-verification-code"
      ) {
        message =
          "The OTP you entered is incorrect.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Resend OTP.
   */
  async function resendOtp() {
    if (
      resendTimer > 0 ||
      loading
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const normalizedPhone =
      validatePhone();

    if (!normalizedPhone) {
      return;
    }

    try {
      setLoading(true);

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // Ignore cleanup errors.
        }

        window.recaptchaVerifier = null;
        recaptchaRef.current = null;
      }

      const verifier =
        setupRecaptcha();

      const result =
        await signInWithPhoneNumber(
          auth,
          normalizedPhone,
          verifier
        );

      setConfirmationResult(result);
      setOtp("");
      setResendTimer(30);

      setSuccess(
        "A new OTP has been sent."
      );
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Go back to phone number step.
   */
  function goBackToPhone() {
    setStep("phone");
    setOtp("");
    setError("");
    setSuccess("");
    setConfirmationResult(null);
  }

  return (
    <AuthShell
      title={
        step === "phone"
          ? "Welcome back."
          : "Verify your number."
      }
      description={
        step === "phone"
          ? "Sign in to your student portal using your registered mobile number."
          : `Enter the verification code sent to ${phoneNumber}.`
      }
      eyebrow="STUDENT PORTAL"
    >
      <div className="student-auth-card">
        <div className="student-auth-card-top">
          <div className="student-auth-card-icon">
            {step === "phone" ? (
              <Phone size={21} />
            ) : (
              <LockKeyhole size={21} />
            )}
          </div>

          <div>
            <strong>
              {step === "phone"
                ? "Student Sign In"
                : "OTP Verification"}
            </strong>

            <span>
              {step === "phone"
                ? "Use your registered mobile number"
                : "Securely verify your identity"}
            </span>
          </div>
        </div>

        {step === "phone" ? (
          <form
            onSubmit={sendOtp}
            className="student-auth-form"
          >
            <div className="auth-input-group">
              <label htmlFor="student-phone">
                Mobile Number
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-prefix">
                  +91
                </span>

                <input
                  id="student-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber
                    .replace(/^\+91/, "")
                    .replace(/\D/g, "")}
                  onChange={(event) =>
                    setPhoneNumber(
                      event.target.value
                    )
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="auth-message auth-message-error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-message-success">
                <CheckCircle2 size={16} />
                {success}
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
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div
              id="student-recaptcha"
              className="recaptcha-container"
            />
          </form>
        ) : (
          <form
            onSubmit={verifyOtp}
            className="student-auth-form"
          >
            <div className="otp-phone-display">
              <div>
                <Phone size={15} />

                <span>
                  {phoneNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={goBackToPhone}
              >
                Change
              </button>
            </div>

            <div className="auth-input-group">
              <label htmlFor="student-otp">
                Verification Code
              </label>

              <input
                id="student-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                className="otp-input"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="auth-message auth-message-error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-message-success">
                <CheckCircle2 size={16} />
                {success}
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
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="resend-row">
              <span>
                Didn't receive the code?
              </span>

              <button
                type="button"
                onClick={resendOtp}
                disabled={
                  resendTimer > 0 ||
                  loading
                }
              >
                <RefreshCw size={13} />

                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        <div className="auth-security-note">
          <ShieldCheck size={16} />

          <span>
            Your login is secured using
            Firebase Phone Authentication.
          </span>
        </div>
      </div>

      <div className="auth-footer-note">
        <span>
          Don't have a student account?
        </span>

        <span>
          Contact the library operator at{" "}
          <a href="tel:8899776655">
            8899776655
          </a>
        </span>
      </div>
    </AuthShell>
  );
}