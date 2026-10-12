
import React, { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Phone,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

import "./Hospitals.css";
import hospitals from "../../components/data/hospitals";

function Hospitals() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  const filteredHospitals = useMemo(() => {
    let result = hospitals.filter((hospital) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        hospital.name?.toLowerCase().includes(searchText) ||
        hospital.location?.toLowerCase().includes(searchText);

      // Update these checks if your data uses different category values.
      const type = hospital.type?.toLowerCase().replace(/[\s_-]/g, "");
      const matchesCategory =
        category === "all" ||
        type === category.replace(/[\s_-]/g, "");

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "rating") {
      result = [...result].sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    return result;
  }, [search, category, sortBy]);

  return (
    <main className="hp-page-container">
      {/* Header */}
      <section className="hp-page-header">
        <div className="hp-page-header-content">
          <span className="hp-page-label">
            HEALTHCARE FACILITIES
          </span>

          <h1>
            Find the right
            <span> hospital for you.</span>
          </h1>

          <p>
            Discover trusted hospitals and healthcare facilities
            near you. Compare services, doctors and ratings.
          </p>
        </div>

        {/* Search */}
        <form
          className="hp-page-search"
          onSubmit={(e) => e.preventDefault()}
        >
          <Search size={20} />

          <input
            type="search"
            placeholder="Search hospitals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search hospitals"
          />

          <button type="submit">Search</button>
        </form>
      </section>

      {/* Location and Category Filters */}
      <section className="hp-page-toolbar">
        <button
          type="button"
          className="hp-page-location"
        >
          <MapPin size={18} />

          <span className="hp-page-location-content">
            <small>Your Location</small>
            <strong>BTM Layout, Bengaluru</strong>
          </span>

          <ChevronDown size={16} />
        </button>

        <div className="hp-page-categories">
          {[
            { label: "All Hospitals", value: "all" },
            { label: "Multi-Specialty", value: "multispecialty" },
            { label: "General", value: "general" },
            { label: "Specialty", value: "specialty" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                category === item.value ? "active" : ""
              }
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Hospital List */}
      <section className="hp-page-list">
        <div className="hp-page-list-heading">
          <div>
            <h2>Hospitals near you</h2>
            <p>
              Showing {filteredHospitals.length} hospitals
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort hospitals"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="nearest">Nearest</option>
          </select>
        </div>

        {/* Hospital Cards */}
        {filteredHospitals.length > 0 ? (
          <div className="hp-page-grid">
            {filteredHospitals.map((hospital) => (
              <article
                className="hp-page-card"
                key={hospital.id}
              >
                <div className="hp-page-image">
                  <img
                    src={hospital.image}
                    alt={hospital.name}
                    loading="lazy"
                  />

                  {hospital.available24x7 && (
                    <span className="hp-page-badge">
                      24/7 Available
                    </span>
                  )}
                </div>

                <div className="hp-page-card-content">
                  <h3>{hospital.name}</h3>

                  <div className="hp-page-location">
                    <MapPin size={15} />
                    <span>{hospital.location}</span>
                  </div>

                  <div className="hp-page-rating">
                    <span className="hp-page-rating-score">
                      <Star size={14} fill="currentColor" />
                      {hospital.rating}
                    </span>

                    <span>
                      ({hospital.reviews} reviews)
                    </span>
                  </div>

                  <div className="hp-page-meta">
                    <span>{hospital.doctors} Doctors</span>
                    <span>
                      {hospital.available24x7
                        ? "Open 24/7"
                        : "Availability varies"}
                    </span>
                  </div>

                  <div className="hp-page-actions">
                    <button
                      type="button"
                      className="hp-page-view-button"
                      onClick={() =>
                        window.location.assign(
                          `/hospitals/${hospital.id}`
                        )
                      }
                    >
                      View Hospital
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      className="hp-page-call-button"
                      aria-label={`Call ${hospital.name}`}
                      onClick={() => {
                        if (hospital.phone) {
                          window.location.href =
                            `tel:${hospital.phone}`;
                        }
                      }}
                      disabled={!hospital.phone}
                    >
                      <Phone size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="hp-page-empty">
            <Search size={32} />
            <h3>No hospitals found</h3>
            <p>Try another search term or choose a different category.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Hospitals;
