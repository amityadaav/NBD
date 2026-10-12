
import React, { useState } from "react";
import { MapPin, Search, ChevronDown } from "lucide-react";
import doctors from "../../components/data/doctors";
import "./FindDoctors.css";

function FindDoctors() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [gender, setGender] = useState("");
  const [experience, setExperience] = useState("");
  const [rating, setRating] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.hospital?.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialty =
      !specialty ||
      doctor.specialty?.toLowerCase() === specialty.toLowerCase();

    const matchesType =
      !consultationType ||
      doctor.consultationType?.toLowerCase() ===
        consultationType.toLowerCase();

    const matchesGender =
      !gender ||
      doctor.gender?.toLowerCase() === gender.toLowerCase();

    const matchesExperience =
      !experience || Number(doctor.experience) >= Number(experience);

    const matchesRating =
      !rating || Number(doctor.rating) >= Number(rating);

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesType &&
      matchesGender &&
      matchesExperience &&
      matchesRating
    );
  });

  return (
    <div className="fd-page-container">
      <header className="fd-page-header">
        <h1>Find Doctors</h1>
        <p>
          Search for doctors based on your preferences and requirements.
        </p>
      </header>

      <section className="fd-page-toolbar">
        <button type="button" className="fd-page-location">
          <MapPin size={18} />

          <span className="fd-page-location-info">
            <small>Your Location</small>
            <strong>BTM Layout, Bengaluru</strong>
          </span>

          <ChevronDown size={16} />
        </button>

        <div className="fd-page-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search doctors or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <main className="fd-page-layout">
        <aside className="fd-page-sidebar">
          <h2>Filters</h2>

          <div className="fd-page-filter">
            <label htmlFor="fd-specialty">Specialty</label>
            <select
              id="fd-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-consultation">Consultation Type</label>
            <select
              id="fd-consultation"
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="in-person">In-Person</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-gender">Gender</label>
            <select
              id="fd-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-experience">Experience</label>
            <select
              id="fd-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Any Experience</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
              <option value="15">15+ Years</option>
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-rating">Rating</label>
            <select
              id="fd-rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </div>

          <button
            type="button"
            className="fd-page-reset"
            onClick={() => {
              setSpecialty("");
              setConsultationType("");
              setGender("");
              setExperience("");
              setRating("");
              setSearch("");
            }}
          >
            Clear Filters
          </button>
        </aside>

        <section className="fd-page-results">
          <div className="fd-page-results-header">
            <h2>Available Doctors</h2>
            <span>{filteredDoctors.length} doctors found</span>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="fd-page-doctor-grid">
              {filteredDoctors.map((doctor) => (
                <article
                  className="fd-page-doctor-card"
                  key={doctor.id}
                >
                  <div className="fd-page-doctor-image">
                    <img src={doctor.image} alt={doctor.name} />
                  </div>

                  <div className="fd-page-doctor-details">
                    <h3>{doctor.name}</h3>
                    <p className="fd-page-doctor-specialty">
                      {doctor.specialty}
                    </p>
                    <p className="fd-page-doctor-hospital">
                      {doctor.hospital}
                    </p>

                    <div className="fd-page-doctor-meta">
                      <span>
                        Experience: {doctor.experience} years
                      </span>
                      <span>⭐ {doctor.rating}</span>
                      <span>Available: {doctor.available}</span>
                    </div>

                    <div className="fd-page-doctor-footer">
                      <button className="fd-page-book-button" onClick={() => {
                        // Add appointment booking logic her
                      }}>
                      Book Appointment
                    </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="fd-page-empty">
              <Search size={32} />
              <h3>No doctors found</h3>
              <p>Try changing your search or clearing the filters.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FindDoctors;
