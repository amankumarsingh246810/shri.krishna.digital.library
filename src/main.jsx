import React from "react";
import ReactDOM from "react-dom/client";
import {
  AirVent,
  BookOpen,
  Clock3,
  Droplets,
  Wifi,
  Newspaper,
  Phone,
  Quote,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  MapPin
} from "lucide-react";
import "./styles.css";

const facilities = [
  { icon: Wifi, title: "Free Wi-Fi", text: "High-speed internet access for online classes, research and study." },
  { icon: AirVent, title: "Fully Air Conditioned", text: "A comfortable, quiet and cool environment throughout the day." },
  { icon: Newspaper, title: "Daily Newspapers", text: "Read daily English & Hindi newspapers and stay informed." },
  { icon: BookOpen, title: "Competitive Magazines", text: "Useful magazines and study material for competitive exams." },
  { icon: Droplets, title: "RO Drinking Water", text: "Clean and safe RO drinking water available for students." },
  { icon: Clock3, title: "Open 24 Hours", text: "Study whenever you are most productive — day or night." }
];

const highlights = [
  "Peaceful study environment",
  "Student-friendly facilities",
  "24×7 access",
  "Dedicated study space",
  "English & Hindi reading material",
  "Comfortable seating"
];

function App() {
  const [open, setOpen] = React.useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container nav">
          <button className="brand" onClick={() => scrollTo("home")} aria-label="Go to home">
            <span className="brand-mark"><BookOpen size={24} /></span>
            <span>
              <strong>Shri Krishna</strong>
              <small>Digital Library, Musaila Chauraha, Deoria</small>
            </span>
          </button>

          <nav className={`nav-links ${open ? "open" : ""}`}>
            <button onClick={() => scrollTo("home")}>Home</button>
            <button onClick={() => scrollTo("facilities")}>Facilities</button>
            <button onClick={() => scrollTo("about")}>About</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
          </nav>

          <a className="nav-call" href="tel:9161072919">
            <Phone size={17} /> Call Now
          </a>

          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow"><Clock3 size={16} /> OPEN 24 HOURS • EVERY DAY</div>
              <h1>A Better Place to <span>Focus, Learn & Grow.</span></h1>
              <p className="hero-text">
                Welcome to Shri Krishna Digital Library — a peaceful, comfortable and
                student-friendly study space designed to help you turn your preparation
                into progress.
              </p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => scrollTo("facilities")}>
                  Explore Facilities <ArrowRight size={18} />
                </button>
                <a className="secondary-btn" href="tel:8899776655">
                  <Phone size={18} /> Contact Operator
                </a>
              </div>
              <div className="hero-trust">
                <span><CheckCircle2 size={18} /> Quiet study space</span>
                <span><CheckCircle2 size={18} /> 24×7 access</span>
                <span><CheckCircle2 size={18} /> Student focused</span>
              </div>
            </div>

            <div className="hero-card-wrap">
              <div className="hero-card">
                <div className="card-top">
                  <div className="mini-logo"><GraduationCap size={25} /></div>
                  <div>
                    <p>YOUR STUDY • YOUR GOAL</p>
                    <h3>Study Today.<br />Succeed Tomorrow.</h3>
                  </div>
                </div>
                <div className="quote-box">
                  <Quote size={22} />
                  <p>“Success is the sum of small efforts, repeated day in and day out.”</p>
                </div>
                <div className="open-badge"><span /> Open 24 Hours</div>
              </div>
              <div className="floating-stat">
                <BookOpen size={20} />
                <div><strong>6+</strong><span>Student Facilities</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <div className="container quote-inner">
            <Quote size={34} />
            <div>
              <p className="quote-main">“Dreams don't work unless you do. Give your goals a place, give them your time.”</p>
              <p className="quote-sub">Make every hour count at Shri Krishna Digital Library.</p>
            </div>
          </div>
        </section>

        <section id="facilities" className="section">
          <div className="container">
            <div className="section-heading">
              <span>WHY CHOOSE US</span>
              <h2>Everything you need to <em>study better.</em></h2>
              <p>Built around the needs of students preparing for exams, careers and a brighter future.</p>
            </div>

            <div className="facility-grid">
              {facilities.map(({ icon: Icon, title, text }) => (
                <article className="facility-card" key={title}>
                  <div className="facility-icon"><Icon size={24} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container about-grid">
            <div className="about-panel">
              <span className="section-label">A SPACE FOR YOUR GOALS</span>
              <h2>Turn your study hours into <span>productive hours.</span></h2>
              <p>
                Shri Krishna Digital Library is designed for students who want a
                distraction-free place to prepare consistently. Whether you are preparing
                for a competitive examination, attending online classes or simply looking
                for a focused study environment, our facilities are available around the clock.
              </p>
              <div className="check-grid">
                {highlights.map(item => (
                  <div key={item}><CheckCircle2 size={18} /> {item}</div>
                ))}
              </div>
            </div>

            <div className="hours-card">
              <div className="hours-icon"><Clock3 size={30} /></div>
              <p>LIBRARY HOURS</p>
              <h3>24 / 7</h3>
              <span>Open every day</span>
              <div className="hours-line" />
              <small>Study at the time that works best for you.</small>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container contact-card">
            <div>
              <span className="section-label">HAVE QUESTIONS?</span>
              <h2>Ready to make your study time count?</h2>
              <p>Call the library operator for information about the library and its facilities.</p>
            </div>
            <a className="contact-number" href="tel:9161072919">
              <span className="contact-icon"><Phone size={22} /></span>
              <span><small>Library Operator</small><strong>9161072919</strong></span>
              <ArrowRight size={20} />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand"><span className="brand-mark"><BookOpen size={20} /></span><strong>Shri Krishna Digital Library Musaila Chauraha, Deoria</strong></div>
            <p>Study • Focus • Achieve</p>
          </div>
          <div className="footer-info"><MapPin size={17} /> Your trusted 24×7 study space</div>
          <p className="copyright">© {new Date().getFullYear()} Shri Krishna Digital Library Musaila Chauraha, Deoria. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
