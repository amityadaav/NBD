import {
  MapPin,
  Star,
  ArrowRight,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import "./PopularHospitals.css";

const hospitals = [
  {
    id: 1,
    name: "Apollo Hospitals",
    location: "Bengaluru",
    rating: "4.8",
    reviews: 320,
    doctors: "120+ Doctors",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Manipal Hospital",
    location: "Bengaluru",
    rating: "4.7",
    reviews: 280,
    doctors: "95+ Doctors",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Fortis Hospital",
    location: "Bengaluru",
    rating: "4.8",
    reviews: 410,
    doctors: "110+ Doctors",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Narayana Health",
    location: "Bengaluru",
    rating: "4.6",
    reviews: 245,
    doctors: "85+ Doctors",
    image:
      "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=900&q=80",
  },
];

const PopularHospitals = () => {
  return (
    <section className="hospitals-section">
      <div className="hospitals-container">

        {/* Header */}
        <motion.div
          className="hospitals-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hospitals-heading">
            <h2>
              Popular <span>Hospitals</span>
            </h2>

            <p>
              Discover trusted hospitals and healthcare facilities
              near you.
            </p>
          </div>

          <motion.button
            className="hospitals-view-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Hospital Cards */}
        <div className="hospitals-grid">
          {hospitals.map((hospital, index) => (
            <motion.article
              key={hospital.id}
              className="hospital-card"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
            >
              {/* Image */}
              <div className="hospital-image">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                />

                <div className="hospital-type">
                  <Building2 size={13} />
                  <span>Hospital</span>
                </div>

                <div className="hospital-rating-badge">
                  <Star
                    size={12}
                    fill="currentColor"
                  />
                  {hospital.rating}
                </div>
              </div>

              {/* Content */}
              <div className="hospital-content">

                <h3>{hospital.name}</h3>

                <div className="hospital-location">
                  <MapPin size={15} />
                  <span>{hospital.location}</span>
                </div>

                <div className="hospital-info">
                  <div className="hospital-rating">
                    <span className="rating">
                      <Star
                        size={13}
                        fill="currentColor"
                      />
                      {hospital.rating}
                    </span>

                    <span className="reviews">
                      {hospital.reviews} Reviews
                    </span>
                  </div>

                  <span className="doctor-count">
                    {hospital.doctors}
                  </span>
                </div>

                <div className="hospital-footer">
                  <span>Available healthcare</span>

                  <motion.button
                    className="hospital-link"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    View
                    <ArrowRight size={14} />
                  </motion.button>
                </div>

              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularHospitals;