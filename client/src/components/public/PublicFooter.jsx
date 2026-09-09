import React from "react";

import {
  Link
} from "react-router-dom";

import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Phone
} from "lucide-react";

export default function PublicFooter() {
  function scrollToSection(
    sectionId
  ) {
    if (
      window.location.pathname !==
      "/"
    ) {
      window.location.href =
        `/#${sectionId}`;

      return;
    }

    const element =
      document.getElementById(
        sectionId
      );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  }

  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        <div className="public-footer-grid">
          <div className="footer-brand-column">
            <Link
              to="/"
              className="library-brand footer-brand"
            >
              <div className="brand-mark">
                <BookOpen size={22} />
              </div>

              <div className="brand-content">
                <span className="brand-name">
                  Shri Krishna
                </span>

                <span className="brand-subtitle">
                  DIGITAL LIBRARY
                </span>
              </div>
            </Link>

            <p className="footer-description">
              A peaceful, comfortable and
              focused study environment
              designed to help students
              prepare better and achieve
              their goals.
            </p>

            <div className="footer-open-status">
              <span className="status-dot" />

              <Clock3 size={15} />

              <span>
                Open 24 hours
              </span>
            </div>
          </div>

          <div className="footer-column">
            <h3>
              Explore
            </h3>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "home"
                )
              }
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "about"
                )
              }
            >
              About Us
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "facilities"
                )
              }
            >
              Facilities
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "contact"
                )
              }
            >
              Contact
            </button>
          </div>

          <div className="footer-column">
            <h3>
              Student Portal
            </h3>

            <Link to="/student/login">
              <GraduationCap
                size={16}
              />

              Student Login
            </Link>

            <Link to="/admin/login">
              <BookOpen size={16} />

              Admin Login
            </Link>
          </div>

          <div className="footer-column">
            <h3>
              Contact
            </h3>

            <a href="tel:7348095693">
              <Phone size={16} />

              7348095693
            </a>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "contact"
                )
              }
            >
              Get in touch

              <ArrowUpRight
                size={15}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="public-footer-bottom">
        <p>
          ©{" "}
          {new Date().getFullYear()}{" "}
          Shri Krishna Digital Library.
          All rights reserved.
        </p>

        <p>
          Built for focused learning.
        </p>
      </div>
    </footer>
  );
}