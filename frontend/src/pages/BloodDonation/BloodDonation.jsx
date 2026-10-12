
import React, { useState } from "react";
import {
  Heart,
  MapPin,
  Search,
  Droplet,
  Clock,
  Phone,
  UserRound,
  Plus,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

import "./BloodDonation.css";

const initialDonors = [
  {
    id: 1,
    name: "Rahul Sharma",
    bloodGroup: "O+",
    location: "BTM Layout, Bengaluru",
    lastDonation: "4 months ago",
    available: true,
  },
  {
    id: 2,
    name: "Priya Singh",
    bloodGroup: "B+",
    location: "Jayanagar, Bengaluru",
    lastDonation: "6 months ago",
    available: true,
  },
  {
    id: 3,
    name: "Amit Kumar",
    bloodGroup: "A+",
    location: "Koramangala, Bengaluru",
    lastDonation: "5 months ago",
    available: true,
  },
  {
    id: 4,
    name: "Neha Verma",
    bloodGroup: "AB+",
    location: "HSR Layout, Bengaluru",
    lastDonation: "3 months ago",
    available: false,
  },
];

const bloodGroups = [
  "All Groups",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

function BloodDonation() {
  const [donors, setDonors] = useState(initialDonors);
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("All Groups");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "O+",
    location: "",
    phone: "",
  });

  const filteredDonors = donors.filter((donor) => {
    const matchesGroup =
      bloodGroup === "All Groups" ||
      donor.bloodGroup === bloodGroup;

    const matchesSearch =
      donor.name.toLowerCase().includes(search.toLowerCase()) ||
      donor.location.toLowerCase().includes(search.toLowerCase());

    return matchesGroup && matchesSearch;
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const newDonor = {
      id: Date.now(),
      name: formData.name.trim(),
      bloodGroup: formData.bloodGroup,
      location: formData.location.trim(),
      phone: formData.phone.trim(),
      lastDonation: "Not specified",
      available: true,
    };

    setDonors((previous) => [...previous, newDonor]);
    setFormData({
      name: "",
      bloodGroup: "O+",
      location: "",
      phone: "",
    });
    setShowForm(false);
    setBloodGroup("All Groups");
    setSearch("");
  };

  return (
    <main className="bd-page">
      {/* Hero */}
      <section className="bd-hero">
        <div className="bd-hero-content">
          <span className="bd-eyebrow">
            <HeartPulse size={16} />
            BE SOMEONE'S LIFELINE
          </span>

          <h1>
            Donate Blood.
            <br />
            <span>Save a Life.</span>
          </h1>

          <p>
            A single blood donation can make a meaningful
            difference. Connect with blood donors in your
            community and help someone in need.
          </p>

          <div className="bd-hero-actions">
            <button
              className="bd-primary-btn"
              onClick={() => setShowForm(true)}
            >
              <Heart size={18} />
              Become a Donor
            </button>

            <a href="#bd-find-donors" className="bd-secondary-btn">
              Find Blood Donors
            </a>
          </div>

          <div className="bd-trust">
            <ShieldCheck size={17} />
            Every donation matters. Every life counts.
          </div>
        </div>

        <div className="bd-hero-visual">
          <div className="bd-blood-icon">
            <Droplet size={100} fill="currentColor" />
            <Heart className="bd-heart-overlay" size={35} />
          </div>

          <div className="bd-floating-card bd-floating-top">
            <HeartPulse size={22} />
            <div>
              <strong>Give the gift of life</strong>
              <span>Be a voluntary donor</span>
            </div>
          </div>

          <div className="bd-floating-card bd-floating-bottom">
            <ShieldCheck size={22} />
            <div>
              <strong>Donate responsibly</strong>
              <span>Follow medical guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Information cards */}
      <section className="bd-info-grid">
        <article className="bd-info-card">
          <div className="bd-info-icon">
            <Droplet size={23} />
          </div>
          <h3>Blood Groups</h3>
          <p>Find donors by their blood group.</p>
        </article>

        <article className="bd-info-card">
          <div className="bd-info-icon">
            <MapPin size={23} />
          </div>
          <h3>Local Community</h3>
          <p>Search for donors in your area.</p>
        </article>

        <article className="bd-info-card">
          <div className="bd-info-icon">
            <Heart size={23} />
          </div>
          <h3>Make a Difference</h3>
          <p>Help connect people who need blood.</p>
        </article>
      </section>

      {/* Find donors */}
      <section className="bd-donors-section" id="bd-find-donors">
        <div className="bd-section-heading">
          <div>
            <span className="bd-section-label">
              DONOR DIRECTORY
            </span>
            <h2>Find Blood Donors</h2>
          </div>

          <button
            className="bd-register-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Register as Donor
          </button>
        </div>

        <div className="bd-filters">
          <div className="bd-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bd-group-filter">
            <Droplet size={18} />
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              aria-label="Filter by blood group"
            >
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bd-results-heading">
          <h3>Available Donor Listings</h3>
          <span>{filteredDonors.length} listed</span>
        </div>

        {filteredDonors.length > 0 ? (
          <div className="bd-donor-grid">
            {filteredDonors.map((donor) => (
              <article className="bd-donor-card" key={donor.id}>
                <div className="bd-donor-top">
                  <div className="bd-avatar">
                    <UserRound size={27} />
                  </div>

                  <span className="bd-blood-badge">
                    <Droplet size={14} fill="currentColor" />
                    {donor.bloodGroup}
                  </span>
                </div>

                <h3>{donor.name}</h3>

                <div className="bd-donor-location">
                  <MapPin size={15} />
                  <span>{donor.location}</span>
                </div>

                <div className="bd-donor-last">
                  <Clock size={15} />
                  Last donation: {donor.lastDonation}
                </div>

                <div className="bd-donor-footer">
                  <span
                    className={
                      donor.available
                        ? "bd-status bd-status-available"
                        : "bd-status bd-status-unavailable"
                    }
                  >
                    <span className="bd-status-dot" />
                    {donor.available ? "Listed as available" : "Availability unconfirmed"}
                  </span>

                  <button
                    type="button"
                    className="bd-contact-btn"
                    disabled={!donor.phone}
                    onClick={() => {
                      if (donor.phone) {
                        window.location.href = `tel:${donor.phone}`;
                      }
                    }}
                  >
                    <Phone size={15} />
                    {donor.phone ? "Contact" : "Contact unavailable"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bd-empty">
            <Droplet size={35} />
            <h3>No matching donors found</h3>
            <p>Try a different blood group or search location.</p>
          </div>
        )}

      </section>

      {/* Registration form */}
      {showForm && (
        <div
          className="bd-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bd-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="bd-modal-close"
              onClick={() => setShowForm(false)}
              aria-label="Close registration form"
            >
              ×
            </button>

            <span className="bd-section-label">
              JOIN THE COMMUNITY
            </span>

            <h2 id="bd-form-title">Become a Blood Donor</h2>
            <p>
              Enter your details to add a sample listing to this demo.
            </p>

            <form className="bd-form" onSubmit={handleRegister}>
              <label htmlFor="bd-name">Full Name</label>
              <input
                id="bd-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <label htmlFor="bd-blood-group">Blood Group</label>
              <select
                id="bd-blood-group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                {bloodGroups.slice(1).map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>

              <label htmlFor="bd-location">City or Area</label>
              <input
                id="bd-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. BTM Layout, Bengaluru"
                required
              />

              <label htmlFor="bd-phone">Phone Number</label>
              <input
                id="bd-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter contact number"
                pattern="[+]?[0-9\s-]{8,15}"
                required
              />

              <button className="bd-primary-btn" type="submit">
                Register Donor
              </button>

              <small>
                This demo stores registrations only in page state.
                It does not save data to a database.
              </small>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default BloodDonation;

