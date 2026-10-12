
import "./DoctorsNearYou.css";
import { MapPin, Search, ChevronDown } from "lucide-react";
import doctors from "../../data/doctors";
const DoctorsNearYou = () => {
  return (
    <section className="near-section">
      <div className="container">

        {/* Section Header */}
        <div className="section-headers">
          <div>
            <h2>Doctors Near You</h2>
          </div>

          <button className="view-all">
            View All <span>→</span>
          </button>
        </div>

        {/* Search & Location */}
        <div className="doctor-toolbar">

          <button className="location-box">
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
            />
          </div>

        </div>

        {/* Doctors */}
        <div className="doctor-data">
  {doctors.slice(0, 5).map((doctor) => (
    <div className="doctor-card" key={doctor.id}>
      <div className="doctor-image">
        <img src={doctor.image} alt={doctor.name} />
      </div>

      <div className="doctor-info">
        <span className="availability">
          ● {doctor.available ? "Available Today" : "Not Available"}
        </span>

        <h3>{doctor.name}</h3>

        <p className="specialty">{doctor.specialty}</p>

        <div className="doctor-meta">
          <span>★ {doctor.rating}</span>
          <span>{doctor.reviews} Reviews</span>
          <span>{doctor.city}</span>
        </div>

        <div className="doctor-bottom">
          <strong>₹{doctor.consultationFee}</strong>

          <button className="book-btn">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

      </div>
    </section>
  );
};

export default DoctorsNearYou;
