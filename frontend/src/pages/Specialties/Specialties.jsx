import { useEffect, useMemo, useRef, useState } from "react";
import {
  HeartPulse, Brain, Eye, Bone, Baby, Stethoscope, Droplets, Smile,
  Ear, Microscope, FlaskConical, Search, ArrowRight, UserRound, Users,
  X, RotateCw, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Specialties.css";

/* -----------------------------------------------------------
   Specialty data.
   `iconName` is a STRING so a real API can return it safely.
   The component maps it to a lucide component below.
   ----------------------------------------------------------- */
const specialtiesData = [
  { name: "Cardiology",       description: "Expert care for your heart and circulation.",      doctors: 24, iconName: "HeartPulse",    accent: "#e11d48" },
  { name: "Neurology",        description: "Diagnosis and treatment of brain and nerve disorders.", doctors: 18, iconName: "Brain",         accent: "#7c3aed" },
  { name: "Ophthalmology",    description: "Complete care for your eyes and vision.",          doctors: 16, iconName: "Eye",           accent: "#0284c7" },
  { name: "Orthopedics",      description: "Care for bones, joints, muscles, and movement.",   doctors: 21, iconName: "Bone",          accent: "#ea580c" },
  { name: "Pediatrics",       description: "Healthcare for infants, children, and adolescents.", doctors: 20, iconName: "Baby",         accent: "#db2777" },
  { name: "General Medicine", description: "Everyday healthcare, checkups, and diagnosis.",    doctors: 32, iconName: "Stethoscope",   accent: "#0f766e" },
  { name: "Dermatology",      description: "Expert care for skin, hair, and nail conditions.", doctors: 14, iconName: "Droplets",      accent: "#0891b2" },
  { name: "Dentistry",        description: "Preventive and restorative dental care.",          doctors: 19, iconName: "Smile",         accent: "#2563eb" },
  { name: "ENT",              description: "Care for ear, nose, and throat conditions.",       doctors: 12, iconName: "Ear",           accent: "#ca8a04" },
  { name: "Gynecology",       description: "Women's reproductive and overall health.",         doctors: 17, iconName: "UserRound",     accent: "#c026d3" },
  { name: "Oncology",         description: "Specialized evaluation and treatment of cancer.",  doctors: 9,  iconName: "Microscope",    accent: "#4f46e5" },
  { name: "Endocrinology",    description: "Care for hormones, thyroid, and diabetes.",        doctors: 11, iconName: "FlaskConical",  accent: "#16a34a" },
];

/* Map string names → lucide components */
const ICONS = {
  HeartPulse, Brain, Eye, Bone, Baby, Stethoscope, Droplets, Smile,
  Ear, Microscope, FlaskConical, UserRound,
};

const POPULAR = ["General Medicine", "Cardiology", "Pediatrics", "Dermatology"];

/* Stub — swap for `fetch("/api/specialties").then(r => r.json())` later.
   Return shape must match `specialtiesData` (with `iconName`, not `icon`). */
function fetchSpecialties() {
  return new Promise((resolve) =>
    setTimeout(() => resolve(specialtiesData), 500)
  );
}

function Specialties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError(false);
    fetchSpecialties()
      .then(setSpecialties)
      .catch(() => {
        setError(true);
        setSpecialties(specialtiesData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /* Press "/" to jump to search */
  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visible = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = specialties.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) =>
      sortBy === "doctors" ? b.doctors - a.doctors : a.name.localeCompare(b.name)
    );
  }, [specialties, searchTerm, sortBy]);

  const totalDoctors = useMemo(
    () => specialties.reduce((sum, s) => sum + s.doctors, 0),
    [specialties]
  );

  /* ✅ Route matches the rest of the app: /find-doctors */
  const goToDoctors = (specialty) =>
    navigate(`/find-doctors?specialty=${encodeURIComponent(specialty)}`);

  return (
    /* ✅ No nested <main> — MainLayout already provides one */
    <div className="sp-page">
      <div className="sp-inner">
        <section className="sp-hero">
          <div className="sp-hero-content">
            <span className="sp-eyebrow">CARE THAT'S RIGHT FOR YOU</span>
            <h1>
              Explore Medical <span>Specialties</span>
            </h1>
            <p>
              Find the right specialist for your needs. Explore departments and
              connect with healthcare professionals.
            </p>

            <div className="sp-search">
              <Search size={21} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by specialty or condition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchTerm("")}
                aria-label="Search medical specialties"
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="sp-clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : (
                <kbd className="sp-kbd" aria-hidden="true">/</kbd>
              )}
            </div>

            <div className="sp-chips" role="group" aria-label="Popular specialties">
              <span>Popular:</span>
              {POPULAR.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="sp-chip"
                  onClick={() => setSearchTerm(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="sp-hero-note">
              <HeartPulse size={18} />
              <span>Your health journey starts with the right care.</span>
            </div>
          </div>

          <div className="sp-hero-visual">
            <div className="sp-visual-circle">
              <Stethoscope size={100} strokeWidth={1.2} />
            </div>
            <div className="sp-floating-card sp-floating-top">
              <HeartPulse size={22} />
              <div>
                <strong>{specialties.length || 12} specialties</strong>
                <span>Expert care</span>
              </div>
            </div>
            <div className="sp-floating-card sp-floating-bottom">
              <UserRound size={22} />
              <div>
                <strong>{totalDoctors ? `${totalDoctors}+ doctors` : "Find a Doctor"}</strong>
                <span>Care made simpler</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sp-list-section" aria-busy={loading}>
          <div className="sp-section-heading">
            <div>
              <span className="sp-eyebrow">FIND YOUR SPECIALIST</span>
              <h2>Browse by Specialty</h2>
              <p>Choose a department to explore relevant doctors.</p>
            </div>

            <div className="sp-heading-actions">
              <label className="sp-sort">
                <span className="sp-sr">Sort specialties</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">A to Z</option>
                  <option value="doctors">Most doctors</option>
                </select>
              </label>
              <span className="sp-results-count" aria-live="polite">
                {loading ? "Loading…" : `${visible.length} specialties`}
              </span>
            </div>
          </div>

          {error && (
            <div className="sp-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>We couldn't refresh the list, so you're seeing saved data.</span>
              <button type="button" onClick={load}>
                <RotateCw size={12} /> Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="sp-skeletons">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="sp-skeleton-card" key={i}>
                  <div className="sp-skeleton-icon" />
                  <div className="sp-skeleton-line" style={{ width: "55%" }} />
                  <div className="sp-skeleton-line" style={{ width: "90%" }} />
                  <div className="sp-skeleton-line" style={{ width: "70%" }} />
                </div>
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="sp-grid">
              {visible.map((specialty, index) => {
                /* ✅ Safe icon lookup — never undefined */
                const Icon = ICONS[specialty.iconName] || Stethoscope;
                return (
                  <article
                    className="sp-card"
                    key={specialty.name}
                    style={{
                      "--card-accent": specialty.accent,
                      animationDelay: `${Math.min(index, 8) * 40}ms`,
                    }}
                  >
                    <div className="sp-card-top">
                      <div className="sp-icon">
                        <Icon size={27} strokeWidth={1.8} />
                      </div>
                      <span className="sp-doctor-count">
                        <Users size={12} /> {specialty.doctors} doctors
                      </span>
                    </div>

                    <h3>{specialty.name}</h3>
                    <p>{specialty.description}</p>

                    <button
                      type="button"
                      className="sp-explore-btn"
                      onClick={() => goToDoctors(specialty.name)}
                      aria-label={`Find ${specialty.name} doctors`}
                    >
                      Find doctors <ArrowRight size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="sp-empty">
              <Search size={35} />
              <h3>No specialties match "{searchTerm}"</h3>
              <p>Check the spelling, or try a broader term like "heart" or "skin".</p>
              <button type="button" onClick={() => setSearchTerm("")}>
                Clear search
              </button>
            </div>
          )}
        </section>

        <section className="sp-cta">
          <div>
            <h2>Not sure which specialist you need?</h2>
            <p>Start with a general physician who can guide your next steps.</p>
          </div>
          <button type="button" onClick={() => goToDoctors("General Medicine")}>
            Find a doctor <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default Specialties;