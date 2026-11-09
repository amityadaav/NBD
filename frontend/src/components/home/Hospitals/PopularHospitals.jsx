
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  ArrowRight,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import "./PopularHospitals.css";

const HOSPITALS_API = "http://localhost:5000/api/hospitals";
const DOCTORS_API = "http://localhost:5000/api/doctors";

const PopularHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctorCounts, setDoctorCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch hospitals and doctors from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [hospitalResponse, doctorResponse] =
          await Promise.all([
            fetch(HOSPITALS_API),
            fetch(DOCTORS_API),
          ]);

        if (!hospitalResponse.ok) {
          throw new Error("Failed to fetch hospitals");
        }

        const hospitalResult = await hospitalResponse.json();

        const hospitalList = Array.isArray(hospitalResult)
          ? hospitalResult
          : hospitalResult.hospitals || [];

        setHospitals(hospitalList);

        // Doctor count grouped by hospital ID
        if (doctorResponse.ok) {
          const doctorResult = await doctorResponse.json();

          const doctorList = Array.isArray(doctorResult)
            ? doctorResult
            : doctorResult.doctors || [];

          const counts = {};

          doctorList.forEach((doctor) => {
            const hospitalId =
              typeof doctor.hospitalId === "object"
                ? doctor.hospitalId?._id
                : doctor.hospitalId;

            if (hospitalId) {
              counts[hospitalId] =
                (counts[hospitalId] || 0) + 1;
            }
          });

          setDoctorCounts(counts);
        }
      } catch (err) {
        setError(err.message || "Unable to load hospitals");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHospitalLocation = (hospital) => {
    if (typeof hospital.address === "string") {
      return hospital.city
        ? `${hospital.address}, ${hospital.city}`
        : hospital.address;
    }

    return (
      hospital.city ||
      hospital.address?.city ||
      hospital.location ||
      "Location unavailable"
    );
  };

  const getHospitalImage = (hospital) => {
    return (
      hospital.image ||
      hospital.profileImage ||
      hospital.hospitalImage ||
      "https://placehold.co/900x500?text=Hospital"
    );
  };

  const handleViewHospital = (hospital) => {
    navigate(`/hospitals/${hospital._id}`);
  };

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
              Discover trusted hospitals and healthcare
              facilities near you.
            </p>
          </div>

          <motion.button
            type="button"
            className="hospitals-view-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/hospitals")}
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <p className="hospital-status">
            Loading hospitals...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="hospital-status hospital-error">
            {error}
          </p>
        )}

        {/* Hospital Cards */}
        {!loading && !error && (
          <div className="hospitals-grid">
            {hospitals.slice(0, 4).map((hospital, index) => {
              const hospitalId = hospital._id;
              const doctorCount = doctorCounts[hospitalId] || 0;

              const rating =
                hospital.rating ?? hospital.averageRating;

              const reviews =
                hospital.reviewsCount ?? hospital.totalReviews;

              return (
                <motion.article
                  key={hospitalId}
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
                      src={getHospitalImage(hospital)}
                      alt={hospital.hospitalName}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/900x500?text=Hospital";
                      }}
                    />

                    <div className="hospital-type">
                      <Building2 size={13} />
                      <span>
                        {hospital.hospitalType || "Hospital"}
                      </span>
                    </div>

                    {rating != null && (
                      <div className="hospital-rating-badge">
                        <Star
                          size={12}
                          fill="currentColor"
                        />
                        {rating}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="hospital-content">
                    <h3 title={hospital.hospitalName}>
                      {hospital.hospitalName ||
                        "Unnamed Hospital"}
                    </h3>

                    <div className="hospital-location">
                      <MapPin size={15} />
                      <span>
                        {getHospitalLocation(hospital)}
                      </span>
                    </div>

                    <div className="hospital-info">
                      <div className="hospital-rating">
                        {rating != null && (
                          <span className="rating">
                            <Star
                              size={13}
                              fill="currentColor"
                            />
                            {rating}
                          </span>
                        )}

                        {reviews != null && (
                          <span className="reviews">
                            {reviews} Reviews
                          </span>
                        )}
                      </div>

                      <span className="doctor-count">
                        {doctorCount}{" "}
                        {doctorCount === 1 ? "Doctor" : "Doctors"}
                      </span>
                    </div>

                    <div className="hospital-footer">
                      <span>Healthcare services</span>

                      <motion.button
                        type="button"
                        className="hospital-link"
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          handleViewHospital(hospital)
                        }
                      >
                        View
                        <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}

            {hospitals.length === 0 && (
              <p className="hospital-status">
                No hospitals found.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularHospitals;
