import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin, Phone, Mail, Globe, Building2, Bed, ShieldCheck,
  ArrowLeft, Stethoscope, IndianRupee, CalendarDays, CheckCircle2,
  BriefcaseMedical, AlertCircle, RefreshCw, Users, Star, Clock,
  Share2, Navigation, MessageCircle, ChevronRight, Sparkles, Award
} from "lucide-react";
import { motion } from "framer-motion";
import "./HospitalDetails.css";

// Smart URL builder — handles VITE_API_URL with or without /api
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const base = (envUrl || "http://localhost:5000").replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE = getBaseUrl();
const API_ORIGIN = API_BASE.replace(/\/api$/, "");
const HOSPITALS_API = `${API_BASE}/hospitals`;
const DOCTORS_API = `${API_BASE}/doctors`;

// Skeleton loader for initial page
const PageSkeleton = () => (
  <div className="hd-page">
    <div className="hd-skeleton-back" />
    <div className="hd-skeleton-hero" />
    <div className="hd-layout">
      <div>
        <div className="hd-skeleton-card" />
        <div className="hd-skeleton-card" />
      </div>
      <div>
        <div className="hd-skeleton-card hd-skeleton-card-sm" />
      </div>
    </div>
  </div>
);

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        let hospitalData = null;

        // PRIORITY 1: Router state
        if (location.state?.hospital) {
          hospitalData = location.state.hospital;
        }

        // PRIORITY 2: Direct fetch
        if (!hospitalData) {
          try {
            const hospRes = await fetch(`${HOSPITALS_API}/${id}`);
            if (hospRes.ok) {
              const hospData = await hospRes.json();
              hospitalData = hospData.hospital || hospData.data || hospData;
              if (Array.isArray(hospitalData)) hospitalData = hospitalData[0];
            }
          } catch (e) {
            console.warn("Direct fetch failed:", e.message);
          }
        }

        // PRIORITY 3: List fallback
        if (!hospitalData?.hospitalName) {
          try {
            const listRes = await fetch(HOSPITALS_API);
            if (listRes.ok) {
              const listData = await listRes.json();
              const allHospitals = Array.isArray(listData)
                ? listData
                : listData.hospitals || listData.data || [];
              hospitalData = allHospitals.find((h) => String(h._id) === String(id));
            }
          } catch (e) {
            console.warn("List fetch failed:", e.message);
          }
        }

        if (!hospitalData?.hospitalName) {
          throw new Error(
            "This hospital could not be found. Please try again from the hospitals page."
          );
        }

        setHospital(hospitalData);

        // Fetch doctors
        try {
          const docsRes = await fetch(DOCTORS_API);
          if (docsRes.ok) {
            const docsData = await docsRes.json();
            const allDoctors = Array.isArray(docsData) ? docsData : docsData.doctors || [];
            const hospitalDoctors = allDoctors.filter((doc) => {
              const docHospId =
                typeof doc.hospitalId === "object" ? doc.hospitalId?._id : doc.hospitalId;
              return String(docHospId) === String(id);
            });
            setDoctors(hospitalDoctors);
          }
        } catch (docErr) {
          console.warn("Could not fetch doctors:", docErr);
        }
      } catch (err) {
        console.error("Hospital details fetch error:", err);
        setError(err.message || "Unable to load hospital details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, location.state]);

  const handleBookDoctor = (doctor) => {
    navigate("/book-appointment", {
      state: { doctorId: doctor._id, hospitalId: id, doctor },
    });
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hospital.hospitalName,
        text: `Check out ${hospital.hospitalName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirections = () => {
    const address = [
      hospital.address?.street,
      hospital.address?.area,
      hospital.address?.city,
    ].filter(Boolean).join(", ");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="hd-page error-state">
        <div className="hd-error-icon">
          <AlertCircle size={36} />
        </div>
        <h2>Hospital Not Found</h2>
        <p>{error}</p>
        <div className="hd-error-actions">
          <button className="hd-btn-primary" onClick={() => navigate("/")}>
            <ArrowLeft size={15} /> Go Home
          </button>
          <button className="hd-btn-secondary" onClick={() => navigate("/hospitals")}>
            Browse Hospitals
          </button>
        </div>
      </div>
    );
  }

  if (!hospital) return null;

  const fullAddress =
    [
      hospital.address?.street,
      hospital.address?.area,
      hospital.address?.city,
      hospital.address?.state,
      hospital.address?.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "Address not available";

  // Build image gallery
  const galleryImages = [
    hospital.logo && getImageUrl(hospital.logo),
    ...(hospital.images || []).map(getImageUrl),
  ].filter(Boolean);

  return (
    <div className="hd-page">
      {/* Back Button */}
      <button className="hd-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero */}
      <motion.div
        className="hd-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="hd-hero-glow" aria-hidden="true" />

        <div className="hd-hero-content">
          <div className={`hd-hero-icon ${hospital.logo ? "has-image" : ""}`}>
            {hospital.logo ? (
              <img
                src={getImageUrl(hospital.logo)}
                alt={hospital.hospitalName}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.classList.remove("has-image");
                }}
              />
            ) : (
              <Building2 size={28} />
            )}
          </div>

          <div className="hd-hero-info">
            <div className="hd-hero-badges">
              <span className="hd-badge badge-teal">
                <Building2 size={11} /> {hospital.hospitalType || "Hospital"}
              </span>
              <span className="hd-badge badge-green">
                <ShieldCheck size={11} /> Verified
              </span>
              {hospital.ownershipType && (
                <span className="hd-badge badge-ghost">{hospital.ownershipType}</span>
              )}
            </div>
            <h1>{hospital.hospitalName}</h1>
            <p>
              <MapPin size={16} /> {fullAddress}
            </p>

            {/* Quick Actions */}
            <div className="hd-quick-actions">
              {hospital.phone && (
                <a href={`tel:${hospital.phone}`} className="hd-quick-btn">
                  <Phone size={14} /> Call
                </a>
              )}
              <button className="hd-quick-btn" onClick={handleDirections}>
                <Navigation size={14} /> Directions
              </button>
              <button className="hd-quick-btn" onClick={handleShare}>
                <Share2 size={14} /> {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>

        <div className="hd-hero-stats">
          <div className="hd-stat">
            <Stethoscope size={20} className="text-teal" />
            <div>
              <strong>{doctors.length}</strong>
              <span>Doctors</span>
            </div>
          </div>
          <div className="hd-stat">
            <Bed size={20} className="text-blue" />
            <div>
              <strong>{hospital.totalBeds || "N/A"}</strong>
              <span>Beds</span>
            </div>
          </div>
          {hospital.specialties?.length > 0 && (
            <div className="hd-stat">
              <Users size={20} className="text-amber" />
              <div>
                <strong>{hospital.specialties.length}</strong>
                <span>Specialties</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Image Gallery */}
      {galleryImages.length > 1 && (
        <div className="hd-gallery">
          <div className="hd-gallery-main">
            <img src={galleryImages[activeImage]} alt="Hospital" />
          </div>
          <div className="hd-gallery-thumbs">
            {galleryImages.slice(0, 4).map((img, i) => (
              <button
                key={i}
                className={`hd-gallery-thumb ${i === activeImage ? "is-active" : ""}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt={`View ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hd-layout">
        <div className="hd-main-content">
          <section className="hd-card">
            <div className="hd-card-header">
              <h2>About the Hospital</h2>
            </div>
            <p className="hd-description">
              {hospital.description || "No description provided by the hospital."}
            </p>

            <div className="hd-contact-grid">
              {hospital.phone && (
                <div className="hd-contact-item">
                  <div className="hd-contact-icon"><Phone size={14} /></div>
                  <div>
                    <small>Phone</small>
                    <span>{hospital.phone}</span>
                  </div>
                </div>
              )}
              {hospital.email && (
                <div className="hd-contact-item">
                  <div className="hd-contact-icon"><Mail size={14} /></div>
                  <div>
                    <small>Email</small>
                    <span>{hospital.email}</span>
                  </div>
                </div>
              )}
              {hospital.website && (
                <div className="hd-contact-item">
                  <div className="hd-contact-icon"><Globe size={14} /></div>
                  <div>
                    <small>Website</small>
                    <a href={hospital.website} target="_blank" rel="noreferrer">
                      {hospital.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="hd-card">
            <div className="hd-card-header">
              <h2>Facilities & Services</h2>
              {hospital.facilities?.length > 0 && (
                <span className="hd-card-badge">{hospital.facilities.length}</span>
              )}
            </div>
            <div className="hd-facilities-grid">
              {hospital.facilities?.length > 0 ? (
                hospital.facilities.map((facility, i) => (
                  <div className="hd-facility-item" key={i}>
                    <CheckCircle2 size={16} className="text-teal" />
                    <span>{facility}</span>
                  </div>
                ))
              ) : (
                <>
                  {hospital.emergencyAvailable && (
                    <div className="hd-facility-item">
                      <CheckCircle2 size={16} className="text-teal" /> 24/7 Emergency
                    </div>
                  )}
                  {hospital.ambulanceAvailable && (
                    <div className="hd-facility-item">
                      <CheckCircle2 size={16} className="text-teal" /> Ambulance Service
                    </div>
                  )}
                  {!hospital.emergencyAvailable && !hospital.ambulanceAvailable && (
                    <p className="hd-empty-text">General facilities available.</p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="hd-side-content">
          <section className="hd-card">
            <div className="hd-card-header">
              <h2>Specialties</h2>
            </div>
            <div className="hd-specialties-list">
              {hospital.specialties?.length > 0 ? (
                hospital.specialties.map((spec, i) => (
                  <span className="hd-specialty-pill" key={i}>{spec}</span>
                ))
              ) : (
                <p className="hd-empty-text">Multi-specialty hospital.</p>
              )}
            </div>
          </section>

          {hospital.workingHours?.length > 0 && (
            <section className="hd-card">
              <div className="hd-card-header">
                <h2>Working Hours</h2>
              </div>
              <div className="hd-working-hours">
                {hospital.workingHours.map((wh, i) => (
                  <div className="hd-wh-row" key={i}>
                    <span>{wh.day || wh.days || "Day"}</span>
                    <span>{wh.open || wh.openingTime || "—"} - {wh.close || wh.closingTime || "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hospital.emergencyAvailable && (
            <section className="hd-card hd-emergency-card">
              <div className="hd-emergency-icon">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3>24/7 Emergency</h3>
                <p>Round-the-clock emergency care available</p>
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* Doctors Section */}
      <div className="hd-doctors-section">
        <div className="hd-section-header">
          <div>
            <h2>Our Doctors</h2>
            <p>Book an appointment with our verified specialists.</p>
          </div>
          {doctors.length > 0 && (
            <span className="hd-count-badge">{doctors.length} available</span>
          )}
        </div>

        {doctors.length === 0 ? (
          <div className="hd-empty-doctors">
            <Stethoscope size={36} />
            <h3>No doctors listed yet</h3>
            <p>Doctors will appear here once they're added to this hospital.</p>
          </div>
        ) : (
          <div className="hd-doctors-grid">
            {doctors.map((doctor) => {
              const isAvailableToday = doctor.availableDays?.includes(
                new Date().toLocaleDateString("en-US", { weekday: "long" })
              );

              return (
                <div className="hd-doctor-card" key={doctor._id}>
                  <div className={`hd-doc-status ${isAvailableToday ? "is-online" : "is-offline"}`}>
                    <span className="hd-doc-status-dot" />
                    {isAvailableToday ? "Available Today" : "Not Available Today"}
                  </div>

                  <div className="hd-doc-header">
                    <div className="hd-doc-avatar">
                      {doctor.profileImage ? (
                        <img
                          src={getImageUrl(doctor.profileImage)}
                          alt={doctor.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{doctor.name?.charAt(0) || "D"}</span>
                      )}
                    </div>
                    <div className="hd-doc-info">
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="hd-doc-meta">
                    <span>
                      <BriefcaseMedical size={14} /> {doctor.experience ?? 0} yrs exp
                    </span>
                    <span>
                      <IndianRupee size={14} /> ₹{doctor.consultationFee ?? "—"}
                    </span>
                  </div>

                  {doctor.availableDays?.length > 0 && (
                    <div className="hd-doc-days">
                      <CalendarDays size={13} />
                      <span>
                        {doctor.availableDays.slice(0, 3).join(", ")}
                        {doctor.availableDays.length > 3 ? ` +${doctor.availableDays.length - 3}` : ""}
                      </span>
                    </div>
                  )}

                  <div className="hd-doc-actions">
                    <button
                      className="hd-doc-book-btn"
                      onClick={() => handleBookDoctor(doctor)}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetails;