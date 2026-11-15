import { ArrowRight, ArrowUpRight, Play, Stethoscope, HeartPulse, UserRound } from "lucide-react";
import "./Hero.css";
import heroImage from "../../../assets/images/HealthcareTeams.png";

const actions = [
  { href: "/doctors", label: "Find a doctor", Icon: Stethoscope, variant: "primary" },
  { href: "/donate-blood", label: "Donate blood", Icon: HeartPulse, variant: "blood" },
];

const stats = [
  { value: "10k+", label: "Happy patients" },
  { value: "500+", label: "Verified doctors" },
  { value: "4.8", label: "Average rating" },
];

const Hero = () => {
  return (
    <section className="sm-hero">
      <div className="sm-stage">
        <div className="sm-panel" aria-hidden="true" />

        {/* LEFT */}
        <div className="sm-left">
<h1 className="sm-title">
  Your Trusted
  <span className="sm-title__line">
    Healthcare<span className="sm-orb" aria-hidden="true" />Partner.
  </span>
</h1>

<p className="sm-tagline">
  Find trusted doctors near you, explore verified specialists,
  and book appointments effortlessly. Your health deserves
  the right care.
</p>

          <div className="sm-actions">
            {actions.map(({ href, label, Icon, variant }) => (
              <a
                key={label}
                href={href}
                className={`sm-action${variant ? ` sm-action--${variant}` : ""}`}
              >
                <span className="sm-action__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {label}
                {variant === "primary" && (
                  <ArrowRight size={16} aria-hidden="true" className="sm-action__arrow" />
                )}
              </a>
            ))}
          </div>

          <div className="sm-stats">
            <div className="sm-stats__thumb">
              <button type="button" className="sm-stats__play" aria-label="Play virtual tour">
                <Play size={14} fill="currentColor" aria-hidden="true" />
              </button>
              <span className="sm-stats__tour">Virtual tour</span>
            </div>

            <dl className="sm-stats__grid">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* CENTER */}
        <img src={heroImage} alt="Our doctors" className="sm-person" />

        <span className="sm-chip sm-chip--1">Reliable</span>
        <span className="sm-chip sm-chip--2">Experienced</span>
        <span className="sm-chip sm-chip--3">Professional</span>

        {/* RIGHT */}
        <div className="sm-right">
          <div className="sm-right__top">
            <h2>Verified specialists, ready to see you</h2>
            <p>
              Every doctor is background-checked and reviewed by real
              patients. Pick a time, no phone calls needed.
            </p>
          </div>

          <div className="sm-right__bottom">
            <p className="sm-feedback">
              Every review helps us improve.
            </p>
            <div className="sm-right__row">
              <div className="sm-avatars" aria-hidden="true">
                <span>A</span>
                <span>R</span>
                <span>S</span>
              </div>
              <a href="/doctors" className="sm-arrow" aria-label="Browse doctors">
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;