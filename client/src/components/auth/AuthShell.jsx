import React from "react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { Link } from "react-router-dom";

export default function AuthShell({
  children,
  title,
  description,
  eyebrow = "SHRI KRISHNA DIGITAL LIBRARY",
  showBack = true
}) {
  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-one" />
      <div className="auth-background-shape auth-shape-two" />

      <div className="auth-shell">
        <aside className="auth-visual-panel">
          <Link
            to="/"
            className="auth-brand"
          >
            <div className="auth-brand-icon">
              <BookOpen size={21} />
            </div>

            <div>
              <strong>
                Shri Krishna
              </strong>

              <span>
                DIGITAL LIBRARY
              </span>
            </div>
          </Link>

          <div className="auth-visual-content">
            <div className="auth-eyebrow">
              <Sparkles size={14} />

              <span>
                Focus. Prepare. Achieve.
              </span>
            </div>

            <h1>
              A quiet place
              <span>
                for big ambitions.
              </span>
            </h1>

            <p>
              Access your library portal,
              stay updated with your
              membership and keep your
              preparation on track.
            </p>

            <div className="auth-benefits">
              <div>
                <div className="auth-benefit-icon">
                  <Clock3 size={17} />
                </div>

                <span>
                  Open 24 hours
                </span>
              </div>

              <div>
                <div className="auth-benefit-icon">
                  <ShieldCheck size={17} />
                </div>

                <span>
                  Secure student access
                </span>
              </div>

              <div>
                <div className="auth-benefit-icon">
                  <CheckCircle2 size={17} />
                </div>

                <span>
                  Student-focused environment
                </span>
              </div>
            </div>
          </div>

          <div className="auth-quote">
            <span>
              “
            </span>

            <p>
              Consistency turns ordinary
              effort into extraordinary
              results.
            </p>
          </div>
        </aside>

        <main className="auth-form-panel">
          {showBack && (
            <Link
              to="/"
              className="auth-back-link"
            >
              <ArrowLeft size={16} />

              Back to website
            </Link>
          )}

          <div className="auth-form-wrapper">
            <div className="auth-form-heading">
              <span className="auth-form-eyebrow">
                {eyebrow}
              </span>

              <h2>
                {title}
              </h2>

              <p>
                {description}
              </p>
            </div>

            {children}
          </div>

          <div className="auth-mobile-brand">
            <div className="auth-brand-icon">
              <BookOpen size={19} />
            </div>

            <div>
              <strong>
                Shri Krishna
              </strong>

              <span>
                DIGITAL LIBRARY
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}