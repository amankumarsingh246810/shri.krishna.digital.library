import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useLocation
} from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Menu,
  Phone,
  X
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    target: "home"
  },
  {
    label: "About",
    target: "about"
  },
  {
    label: "Facilities",
    target: "facilities"
  },
  {
    label: "Contact",
    target: "contact"
  }
];

export default function PublicNavbar() {
  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);

  const location =
    useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function scrollToSection(
    sectionId
  ) {
    setMenuOpen(false);

    if (
      location.pathname !== "/"
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
        behavior: "smooth",
        block: "start"
      });
    }
  }

  return (
    <header className="public-navbar">
      <div className="public-navbar-inner">
        <Link
          to="/"
          className="library-brand"
          aria-label="Shri Krishna Digital Library home"
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

        <nav className="desktop-navigation">
          {navigation.map(
            (item) => (
              <button
                key={item.target}
                type="button"
                className="navigation-link"
                onClick={() =>
                  scrollToSection(
                    item.target
                  )
                }
              >
                {item.label}
              </button>
            )
          )}

          <a
            href="tel:8899776655"
            className="navigation-phone"
          >
            <Phone size={15} />
            <span>
              8899776655
            </span>
          </a>

          <Link
            to="/student/login"
            className="navbar-login-button"
          >
            <GraduationCap
              size={17}
            />

            Student Login

            <ArrowRight
              size={15}
            />
          </Link>
        </nav>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(
              (previous) =>
                !previous
            )
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            menuOpen
          }
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-navigation">
          <div className="mobile-navigation-inner">
            {navigation.map(
              (item) => (
                <button
                  key={item.target}
                  type="button"
                  className="mobile-navigation-link"
                  onClick={() =>
                    scrollToSection(
                      item.target
                    )
                  }
                >
                  {item.label}
                </button>
              )
            )}

            <a
              href="tel:8899776655"
              className="mobile-phone-link"
            >
              <Phone size={17} />

              <span>
                Call Library Operator
              </span>
            </a>

            <Link
              to="/student/login"
              className="mobile-login-button"
            >
              <GraduationCap
                size={18}
              />

              Student Login

              <ArrowRight
                size={17}
              />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}