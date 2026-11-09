
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, ChevronDown } from "lucide-react";
import "./DoctorsNearYou.css";

const API_URL = "http://localhost:5000/api/doctors";

const DoctorsNearYou = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch doctors");
        }

        setDoctors(
          Array.isArray(result)
            ? result
            : result.doctors || []
        );
      } catch (err) {
        setError(err.message || "Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Search doctors by name, specialty or hospital
  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.toLowerCase();

    return (
      doctor.name?.toLowerCase().includes(query) ||
      doctor.specialty?.toLowerCase().includes(query) ||
      doctor.hospitalId?.hospitalName?.toLowerCase().includes(query)
    );
  });

  // Book appointment
  const handleBookAppointment = (doctor) => {
    const hospitalId =
      typeof doctor.hospitalId === "object"
        ? doctor.hospitalId?._id
        : doctor.hospitalId;

    if (!doctor._id || !hospitalId) {
      alert("Doctor or hospital details are missing.");
      return;
    }

    navigate("/book-appointment", {
      state: {
        doctorId: doctor._id,
        hospitalId,
        doctor,
      },
    });
  };

  return (
    <section className="near-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-headers">
          <div>
            <h2>Doctors Near You</h2>
          </div>

          <button
            className="view-all"
            onClick={() => navigate("/find-doctors")}
          >
            View All <span>→</span>
          </button>
        </div>

        {/* Search & Location */}
        <div className="doctor-toolbar">
          <button
            type="button"
            className="location-box"
            title="Current location"
          >
            <MapPin size={16} className="location-icon" />

            <span className="location-content">
              <small>Your Location</small>
              <strong>BTM Layout, Bengaluru</strong>
            </span>

            <ChevronDown size={16} className="location-arrow" />
          </button>

          <div className="search-box">
            <Search size={16} className="search-icon" />

            <input
              type="text"
              placeholder="Search doctors or specialties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && <p>Loading doctors...</p>}

        {/* Error */}
        {!loading && error && (
          <p className="error-message">{error}</p>
        )}

        {/* Doctors */}
        {!loading && !error && (
          <div className="doctor-data">
            {filteredDoctors.slice(0, 5).map((doctor) => {
              const hospital =
                typeof doctor.hospitalId === "object"
                  ? doctor.hospitalId
                  : null;

              const availableToday =
                doctor.availableDays?.includes(
                  new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  })
                );

              return (
                <div className="doctor-card" key={doctor._id}>
                  <div className="doctor-image">
                    <img
                      src={
                        doctor.profileImage ||
                        "https://placehold.co/160x160?text=Doctor"
                      }
                      alt={doctor.name}
                    />
                  </div>

                  <div className="doctor-info">
                    <span className="availability">
                      ●{" "}
                      {availableToday
                        ? "Available Today"
                        : "Availability varies"}
                    </span>

                    <h3>{doctor.name}</h3>

                    <p className="specialty">
                      {doctor.specialty}
                    </p>

                    <p>{doctor.qualification}</p>

                    <div className="doctor-meta">
                      <span>
                        {doctor.experience ?? 0} years experience
                      </span>

                      <span>
                        {hospital?.hospitalName || "Hospital details unavailable"}
                      </span>
                    </div>

                    <div className="doctor-bottom">
                      <strong>
                        ₹{doctor.consultationFee}
                      </strong>

                      <button
                        className="book-btn"
                        onClick={() =>
                          handleBookAppointment(doctor)
                        }
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDoctors.length === 0 && (
              <p>
                {search
                  ? "No doctors found matching your search."
                  : "No doctors available right now."}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsNearYou;
