
import React, { useState } from "react";
import {
  HeartPulse,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  Activity,
  Pill,
  Ear,
  Microscope,
  Search,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Specialties.css";

const specialtiesData = [
  {
    name: "Cardiology",
    description: "Expert care for your heart and circulation.",
    doctors: 24,
    icon: HeartPulse,
  },
  {
    name: "Neurology",
    description: "Diagnosis and treatment of brain and nerve disorders.",
    doctors: 18,
    icon: Brain,
  },
  {
    name: "Ophthalmology",
    description: "Complete care for your eyes and vision.",
    doctors: 16,
    icon: Eye,
  },
  {
    name: "Orthopedics",
    description: "Care for bones, joints, muscles, and movement.",
    doctors: 21,
    icon: Bone,
  },
  {
    name: "Pediatrics",
    description: "Healthcare for infants, children, and adolescents.",
    doctors: 20,
    icon: Baby,
  },
  {
    name: "General Medicine",
    description: "Everyday healthcare, checkups, and diagnosis.",
    doctors: 32,
    icon: Stethoscope,
  },
  {
    name: "Dermatology",
    description: "Expert care for skin, hair, and nail conditions.",
    doctors: 14,
    icon: Activity,
  },
  {
    name: "Dentistry",
    description: "Preventive and restorative dental care.",
    doctors: 19,
    icon: Pill,
  },
  {
    name: "ENT",
    description: "Care for ear, nose, and throat conditions.",
    doctors: 12,
    icon: Ear,
  },
  {
    name: "Gynecology",
    description: "Women's reproductive and overall health.",
    doctors: 17,
    icon: UserRound,
  },
  {
    name: "Oncology",
    description: "Specialized evaluation and treatment of cancer.",
    doctors: 9,
    icon: Microscope,
  },
  {
    name: "Endocrinology",
    description: "Care for hormones, thyroid, and diabetes.",
    doctors: 11,
    icon: Activity,
  },
];

function Specialties() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredSpecialties = specialtiesData.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpecialtyClick = (specialty) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <main className="sp-page">
      <section className="sp-hero">
        <div className="sp-hero-content">
          <span className="sp-eyebrow">CARE THAT'S RIGHT FOR YOU</span>
          <h1>
            Explore Medical <span>Specialties</span>
          </h1>
          <p>
            Find the right specialist for your needs. Explore departments
            and connect with healthcare professionals.
          </p>

          <div className="sp-search">
            <Search size={21} />
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search medical specialties"
            />
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
              <strong>Expert Care</strong>
              <span>Across specialties</span>
            </div>
          </div>
          <div className="sp-floating-card sp-floating-bottom">
            <UserRound size={22} />
            <div>
              <strong>Find a Doctor</strong>
              <span>Care made simpler</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-list-section">
        <div className="sp-section-heading">
          <div>
            <span className="sp-eyebrow">FIND YOUR SPECIALIST</span>
            <h2>Browse by Specialty</h2>
            <p>Choose a department to explore relevant doctors.</p>
          </div>
          <span className="sp-results-count">
            {filteredSpecialties.length} specialties
          </span>
        </div>

        {filteredSpecialties.length > 0 ? (
          <div className="sp-grid">
            {filteredSpecialties.map((specialty) => {
              const Icon = specialty.icon;

              return (
                <article className="sp-card" key={specialty.name}>
                  <div className="sp-card-top">
                    <div className="sp-icon">
                      <Icon size={27} strokeWidth={1.8} />
                    </div>
                    <span className="sp-doctor-count">
                      {specialty.doctors} doctors
                    </span>
                  </div>

                  <h3>{specialty.name}</h3>
                  <p>{specialty.description}</p>

                  <button
                    type="button"
                    className="sp-explore-btn"
                    onClick={() => handleSpecialtyClick(specialty.name)}
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
            <h3>No specialties found</h3>
            <p>Try searching with another specialty name.</p>
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
        <button
          type="button"
          onClick={() => handleSpecialtyClick("General Medicine")}
        >
          Find a doctor <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}

export default Specialties;
