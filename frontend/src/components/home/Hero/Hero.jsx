import { ShieldCheck, Search, CalendarCheck, ArrowRight } from "lucide-react";
import {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import heroImage1 from "../../../assets/images/hero-doctors.jpg";
import heroImage2 from "../../../assets/images/heroImage1.png";
import heroImage3 from "../../../assets/images/heroImage2.png";
import heroImage4 from "../../../assets/images/heroImage3.png";
import heroImage5 from "../../../assets/images/heroImage4.png";

import "./Hero.css";

const slides = [heroImage1, heroImage2, heroImage3,heroImage4,heroImage5];
const SLIDE_DURATION = 5000; // keep in sync with --slide-duration in Hero.css

const stats = [
  { value: 5000, suffix: "+", label: "Verified doctors" },
  { value: 50, suffix: "K+", label: "Happy patients" },
  { value: 200, suffix: "+", label: "Specialties" },
];

const titleWords = ["Find", "the", "Right", "Doctor"];

/* ---------- Count-up number ---------- */
const CountUp = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.8,
      delay: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

/* ---------- Hero ---------- */
const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const reduce = useReducedMotion();

  // Timer resets whenever the slide changes (including manual clicks),
  // so the progress bar and the slide change always stay in sync.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timeout);
  }, [currentSlide]);

  const ease = [0.16, 1, 0.3, 1];

  return (
    <section className="hero">
      {/* Background slider */}
{/* Background slider */}
<div className="hero-bg" aria-hidden="true">
  <motion.div
    className="hero-slider-track"
    animate={{x: `-${currentSlide * (100 / slides.length)}%`,}}
    transition={{
      duration: reduce ? 0 : 0.8,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {slides.map((image, index) => (
      <div className="hero-slide" key={image}>
        <img
          src={image}
          alt=""
          className="hero-image"
          draggable="false"
        />
      </div>
    ))}
  </motion.div>

  <div className="hero-overlay" />
  <div className="hero-glow hero-glow-a" />
  <div className="hero-glow hero-glow-b" />
  <div className="hero-grain" />
</div>

      {/* Content */}
      <div className="hero-container">
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="hero-badge-icon">
              <ShieldCheck size={14} />
            </span>
            <span>Trusted by 50,000+ patients</span>
          </motion.div>

          <h1 className="hero-title" aria-label="Find the Right Doctor Near You">
            <span className="hero-title-line" aria-hidden="true">
              {titleWords.map((word, i) => (
                <span className="word-mask" key={word}>
                  <motion.span
                    className="word"
                    initial={{ y: "110%", rotate: 4 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.09, ease }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
            <span className="hero-title-accent" aria-hidden="true">
              <span className="word-mask">
                <motion.span
                  className="word"
                  initial={{ y: "110%", rotate: 4 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 0.9, delay: 0.55, ease }}
                >
                  Near You
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
          >
            Discover verified doctors, explore specialties, and book
            appointments with confidence — all in one place.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease }}
          >
            <a href="/doctors" className="btn btn-primary">
              <Search size={18} />
              Find a doctor
              <ArrowRight size={18} className="btn-arrow" />
            </a>
            <a href="/specialties" className="btn btn-ghost">
              Browse specialties
            </a>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {stats.map((s, i) => (
              <div className="stat-wrap" key={s.label}>
                {i > 0 && <div className="stat-divider" />}
                <div className="stat">
                  <h3>
                    <CountUp value={s.value} suffix={s.suffix} />
                  </h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Slider indicators with progress */}
          <div className="hero-slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero-dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show background image ${index + 1}`}
                aria-pressed={currentSlide === index}
              >
                <span className="hero-dot-fill" key={`${index}-${currentSlide}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Floating glass card (desktop only) */}
        <motion.aside
          className="hero-card"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease }}
          aria-hidden="true"
        >
          <div className="hero-card-float">
            <div className="hero-card-icon">
              <CalendarCheck size={22} />
            </div>
            <div>
              <p className="hero-card-label">Next available</p>
              <p className="hero-card-value">Today, 4:30 PM</p>
            </div>
            <span className="hero-card-live">
              <span className="hero-card-pulse" />
              Live
            </span>
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default Hero;