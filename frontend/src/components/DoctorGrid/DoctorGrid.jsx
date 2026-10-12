import "./DoctorGrid.css";
import doctors from "../../components/data/doctors";

const DoctorGrid = () => {
  return (
    <div className="doctor-grid">
      {doctors.map((doctor) => (
        <article className="doctor-card" key={doctor.id}>

          {/* Doctor Image */}
          <div className="doctor-image">
            <img
              src={doctor.image}
              alt={doctor.name}
            />
          </div>

          {/* Doctor Information */}
          <div className="doctor-info">

            <span
              className={`availability ${
                doctor.available ? "available" : "unavailable"
              }`}
            >
              ●{" "}
              {doctor.available
                ? "Available Today"
                : "Not Available"}
            </span>

            <h3>{doctor.name}</h3>

            <p className="specialty">
              {doctor.specialty}
            </p>

            <div className="doctor-meta">
              <span>★ {doctor.rating}</span>
              <span>{doctor.reviews} Reviews</span>
              <span>{doctor.city}</span>
            </div>

            <div className="doctor-bottom">
              <strong>
                ₹{doctor.consultationFee}
              </strong>

              <button className="book-btn">
                Book Appointment
              </button>
            </div>

          </div>
        </article>
      ))}
    </div>
  );
};

export default DoctorGrid;