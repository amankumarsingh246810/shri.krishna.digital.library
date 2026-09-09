import React from "react";

import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  GraduationCap,
  Leaf,
  Newspaper,
  Phone,
  Snowflake,
  Sparkles,
  Users,
  Wifi,
  Droplets,
  Target,
  ShieldCheck
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";

const facilities = [
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    description:
      "Stay connected with reliable high-speed internet for online classes, research and study resources."
  },
  {
    icon: Snowflake,
    title: "Fully Air Conditioned",
    description:
      "Enjoy a comfortable and cool environment that helps you stay focused during long study sessions."
  },
  {
    icon: Newspaper,
    title: "Daily Newspapers",
    description:
      "Keep yourself updated with English and Hindi newspapers available every day."
  },
  {
    icon: BookOpen,
    title: "Competitive Magazines",
    description:
      "Access useful magazines and study resources for competitive examination preparation."
  },
  {
    icon: Droplets,
    title: "RO Water",
    description:
      "Clean and purified drinking water is available for students throughout the day."
  },
  {
    icon: Clock3,
    title: "Open 24 Hours",
    description:
      "Study whenever your schedule demands with a library that remains open around the clock."
  }
];

const benefits = [
  "Peaceful and focused study environment",
  "Comfortable space for long study sessions",
  "Resources for competitive examination preparation",
  "24-hour access according to your schedule"
];

export default function Home() {
  function scrollToSection(
    sectionId
  ) {
    const element =
      document.getElementById(
        sectionId
      );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  return (
    <div className="public-site">
      <PublicNavbar />

      <main>
        {/* =====================================
            HERO
        ====================================== */}
        <section
          id="home"
          className="hero-section"
        >
          <div className="hero-background-glow hero-glow-one" />
          <div className="hero-background-glow hero-glow-two" />

          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="eyebrow-icon">
                  <Sparkles size={14} />
                </span>

                <span>
                  A better place to study
                </span>
              </div>

              <h1 className="hero-title">
                Your space to
                <span>
                  learn & grow.
                </span>
              </h1>

              <p className="hero-description">
                Shri Krishna Digital Library
                provides a peaceful, comfortable
                and distraction-free environment
                where students can focus on their
                preparation and work towards a
                brighter future.
              </p>

              <div className="hero-actions">
                <Link
                  to="/student/login"
                  className="hero-primary-button"
                >
                  <GraduationCap
                    size={19}
                  />

                  Student Login

                  <ArrowRight
                    size={17}
                  />
                </Link>

                <button
                  type="button"
                  className="hero-secondary-button"
                  onClick={() =>
                    scrollToSection(
                      "facilities"
                    )
                  }
                >
                  Explore Facilities

                  <ArrowDown
                    size={17}
                  />
                </button>
              </div>

              <div className="hero-trust">
                <div className="trust-icon">
                  <Check size={15} />
                </div>

                <div>
                  <strong>
                    Built for focused learning
                  </strong>

                  <span>
                    A comfortable study space
                    designed around students.
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-frame">
                <div className="hero-image-placeholder">
                  <div className="hero-image-overlay" />

                  <div className="hero-visual-content">
                    <div className="visual-top-line">
                      <span>
                        SHRI KRISHNA
                      </span>

                      <span className="visual-live">
                        <span />
                        OPEN NOW
                      </span>
                    </div>

                    <div className="visual-center">
                      <div className="visual-book-icon">
                        <BookOpen
                          size={31}
                        />
                      </div>

                      <h2>
                        Focus.
                        <br />
                        Prepare.
                        <br />
                        Achieve.
                      </h2>

                      <p>
                        Your success begins
                        with consistent effort.
                      </p>
                    </div>

                    <div className="visual-bottom-card">
                      <div>
                        <Clock3 size={19} />

                        <span>
                          Open 24 Hours
                        </span>
                      </div>

                      <div>
                        <Wifi size={19} />

                        <span>
                          Free Wi-Fi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-card floating-card-one">
                <div className="floating-icon">
                  <Target size={18} />
                </div>

                <div>
                  <strong>
                    Stay Focused
                  </strong>

                  <span>
                    Study without distractions
                  </span>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <div className="floating-icon green">
                  <ShieldCheck
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Student Friendly
                  </strong>

                  <span>
                    Comfortable environment
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-scroll-indicator">
            <span>
              Scroll to explore
            </span>

            <ArrowDown size={15} />
          </div>
        </section>

        {/* =====================================
            QUICK STATS
        ====================================== */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">
                24/7
              </span>

              <span className="stat-label">
                Library Access
              </span>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <span className="stat-number">
                100%
              </span>

              <span className="stat-label">
                Study Focus
              </span>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <span className="stat-number">
                FREE
              </span>

              <span className="stat-label">
                Wi-Fi Access
              </span>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <span className="stat-number">
                DAILY
              </span>

              <span className="stat-label">
                Newspapers
              </span>
            </div>
          </div>
        </section>

        {/* =====================================
            ABOUT
        ====================================== */}
        <section
          id="about"
          className="about-section"
        >
          <div className="about-container">
            <div className="about-visual">
              <div className="about-main-card">
                <div className="about-card-pattern" />

                <div className="about-card-content">
                  <div className="about-icon-large">
                    <BookOpen size={31} />
                  </div>

                  <span className="about-small-title">
                    THE RIGHT ENVIRONMENT
                  </span>

                  <h3>
                    Where dedication
                    meets opportunity.
                  </h3>

                  <p>
                    Every focused hour you spend
                    today brings you one step
                    closer to your goals.
                  </p>
                </div>
              </div>

              <div className="about-mini-card">
                <Users size={21} />

                <div>
                  <strong>
                    Student First
                  </strong>

                  <span>
                    Designed around your needs
                  </span>
                </div>
              </div>
            </div>

            <div className="about-content">
              <span className="section-eyebrow">
                <Sparkles size={14} />
                About Our Library
              </span>

              <h2 className="section-heading">
                More than a library.
                <span>
                  A place for ambition.
                </span>
              </h2>

              <p className="section-description">
                Shri Krishna Digital Library
                is designed for students who
                understand that consistent
                preparation creates lasting
                results.
              </p>

              <p className="section-description">
                Whether you are preparing for
                competitive examinations,
                attending online classes or
                working towards your academic
                goals, our library provides the
                environment you need to stay
                focused.
              </p>

              <div className="benefit-list">
                {benefits.map(
                  (benefit) => (
                    <div
                      key={benefit}
                      className="benefit-item"
                    >
                      <div>
                        <Check size={15} />
                      </div>

                      <span>
                        {benefit}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            FACILITIES
        ====================================== */}
        <section
          id="facilities"
          className="facilities-section"
        >
          <div className="facilities-container">
            <div className="section-header-centered">
              <span className="section-eyebrow">
                <Sparkles size={14} />
                Our Facilities
              </span>

              <h2 className="section-heading">
                Everything you need
                <span>
                  to study better.
                </span>
              </h2>

              <p className="section-description centered">
                We have created a comfortable
                study environment with facilities
                that make your everyday preparation
                easier.
              </p>
            </div>

            <div className="facilities-grid">
              {facilities.map(
                (
                  facility,
                  index
                ) => {
                  const Icon =
                    facility.icon;

                  return (
                    <article
                      key={
                        facility.title
                      }
                      className="facility-card"
                    >
                      <div className="facility-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="facility-icon">
                        <Icon size={23} />
                      </div>

                      <h3>
                        {
                          facility.title
                        }
                      </h3>

                      <p>
                        {
                          facility.description
                        }
                      </p>

                      <div className="facility-line" />
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            PHILOSOPHY
        ====================================== */}
        <section className="philosophy-section">
          <div className="philosophy-decoration decoration-left">
            <Leaf size={85} />
          </div>

          <div className="philosophy-decoration decoration-right">
            <Leaf size={70} />
          </div>

          <div className="philosophy-container">
            <span className="philosophy-label">
              <Sparkles size={14} />
              A thought for every student
            </span>

            <div className="philosophy-mark">
              “
            </div>

            <blockquote>
              Success is not achieved
              overnight. It is built
              through the small efforts
              you choose to make every
              single day.
            </blockquote>

            <div className="philosophy-line" />

            <p>
              Stay consistent. Stay focused.
              Keep moving forward.
            </p>
          </div>
        </section>

        {/* =====================================
            CTA
        ====================================== */}
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-content">
              <span className="section-eyebrow light">
                <GraduationCap size={14} />
                Start Your Journey
              </span>

              <h2>
                Your next productive
                <span>
                  study session starts here.
                </span>
              </h2>

              <p>
                Log in to your student portal
                and manage your library
                membership, payment status and
                more.
              </p>

              <div className="cta-actions">
                <Link
                  to="/student/login"
                  className="cta-primary-button"
                >
                  <GraduationCap
                    size={19}
                  />

                  Student Login

                  <ArrowRight
                    size={17}
                  />
                </Link>

                <a
                  href="tel:8899776655"
                  className="cta-secondary-button"
                >
                  <Phone size={17} />

                  Contact Library
                </a>
              </div>
            </div>

            <div className="cta-decoration">
              <div className="cta-circle circle-one" />
              <div className="cta-circle circle-two" />
              <div className="cta-circle circle-three" />

              <div className="cta-book">
                <BookOpen size={44} />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            CONTACT
        ====================================== */}
        <section
          id="contact"
          className="contact-section"
        >
          <div className="contact-container">
            <div>
              <span className="section-eyebrow">
                <Phone size={14} />
                Contact Us
              </span>

              <h2 className="section-heading">
                Have a question?
                <span>
                  We are here to help.
                </span>
              </h2>

              <p className="section-description">
                For membership information,
                library timings or any other
                query, feel free to contact
                the library operator.
              </p>
            </div>

            <a
              href="tel:8899776655"
              className="contact-card"
            >
              <div className="contact-card-icon">
                <Phone size={23} />
              </div>

              <div>
                <span>
                  Library Operator
                </span>

                <strong>
                  8899776655
                </strong>

                <small>
                  Tap to call
                </small>
              </div>

              <ArrowRight
                size={20}
                className="contact-arrow"
              />
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}