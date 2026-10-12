import "./FeaturedDoctors.css";
import { Phone, MessageCircle } from "lucide-react";

const featuredDoctors = [
  { name: "Dr. Amit Sharma", speciality: "Cardiologist", clinic: "City Heart Care", area: "Indore" },
  { name: "Dr. Neha Verma", speciality: "Dermatologist", clinic: "Skin Plus Clinic", area: "Indore" },
  { name: "Dr. Raj Malhotra", speciality: "Orthopedic", clinic: "Ortho Care", area: "Indore" },
];

const FeaturedDoctors = () => {
  return (
    <section className="featured-section">
      <div className="container">
        <h2 className="section-title">🏥 Featured Doctors</h2>

        <div className="doctor-grid">
          {featuredDoctors.map((doc, i) => (
            <div className="doctor-card featured" key={i}>
              <h3>{doc.name}</h3>
              <p>{doc.speciality}</p>
              <span>{doc.clinic}, {doc.area}</span>

              <div className="actions">
                <button className="call"><Phone size={16}/> Call</button>
                <button className="whatsapp"><MessageCircle size={16}/> WhatsApp</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctors;
