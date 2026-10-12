import {
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  Pill,
  Activity,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import "./SpecialtiesSection.css";

const specialties = [
  {
    icon: Heart,
    name: "Cardiology",
    count: "320 Doctors",
  },
  {
    icon: Brain,
    name: "Neurology",
    count: "185 Doctors",
  },
  {
    icon: Eye,
    name: "Ophthalmology",
    count: "240 Doctors",
  },
  {
    icon: Bone,
    name: "Orthopedics",
    count: "290 Doctors",
  },
  {
    icon: Baby,
    name: "Pediatrics",
    count: "410 Doctors",
  },
  {
    icon: Stethoscope,
    name: "General Physician",
    count: "520 Doctors",
  },
  {
    icon: Pill,
    name: "Dermatology",
    count: "175 Doctors",
  },
  {
    icon: Activity,
    name: "Dentistry",
    count: "380 Doctors",
  },
];

const SpecialtiesSection = () => {
  return (
    <section id="specialties" className="specialties-section">
      <div className="specialties-container">

        {/* Header */}
        <motion.div
          className="specialties-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="specialties-heading">

            <h2>
              Browse by <span>Specialty</span>
            </h2>

            <p>
              Explore experienced doctors across different
              medical specialties.
            </p>
          </div>

          <motion.button
            className="specialties-view-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Grid */}
        <div className="specialties-grid">
          {specialties.map((spec, index) => {
            const Icon = spec.icon;

            return (
              <motion.article
                key={spec.name}
                className="specialty-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                whileHover={{
                  y: -7,
                  transition: { duration: 0.25 },
                }}
              >
                {/* Number */}
                <span className="specialty-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <motion.div
                  className="specialty-icon"
                  whileHover={{
                    scale: 1.1,
                    rotate: -6,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <Icon
                    size={24}
                    strokeWidth={1.8}
                  />
                </motion.div>

                {/* Content */}
                <div className="specialty-content">
                  <h3>{spec.name}</h3>

                  <p>{spec.count}</p>
                </div>

                {/* Arrow */}
                <motion.div
                  className="specialty-arrow"
                  whileHover={{
                    x: 4,
                  }}
                >
                  <ArrowRight size={17} />
                </motion.div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SpecialtiesSection;