
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { MapPin, Search, ChevronDown } from "lucide-react";
// import "./FindDoctors.css";

// function FindDoctors() {
//   const navigate = useNavigate();

//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [specialty, setSpecialty] = useState("");
//   const [consultationType, setConsultationType] = useState("");
//   const [gender, setGender] = useState("");
//   const [experience, setExperience] = useState("");
//   const [rating, setRating] = useState("");

//   // Fetch doctors from MongoDB backend
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch(
//           "http://localhost:5000/api/doctors"
//         );

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             result.message || "Failed to fetch doctors."
//           );
//         }

//         setDoctors(
//           Array.isArray(result.doctors) ? result.doctors : []
//         );
//       } catch (err) {
//         console.error("Fetch doctors error:", err);
//         setError(
//           err.message || "Unable to connect to the server."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   const filteredDoctors = doctors.filter((doctor) => {
//     const hospitalName =
//       typeof doctor.hospitalId === "object"
//         ? doctor.hospitalId?.hospitalName || ""
//         : "";

//     const searchText = search.toLowerCase();

//     const matchesSearch =
//       doctor.name?.toLowerCase().includes(searchText) ||
//       doctor.specialty?.toLowerCase().includes(searchText) ||
//       hospitalName.toLowerCase().includes(searchText);

//     const matchesSpecialty =
//       !specialty ||
//       doctor.specialty?.toLowerCase() === specialty.toLowerCase();

//     const matchesType =
//       !consultationType ||
//       (doctor.consultationType || "")
//         .toLowerCase()
//         .replace("in-person", "in-clinic") ===
//         consultationType.toLowerCase().replace("in-person", "in-clinic");

//     const matchesGender =
//       !gender ||
//       (doctor.gender || "").toLowerCase() === gender.toLowerCase();

//     const matchesExperience =
//       !experience ||
//       Number(doctor.experience || 0) >= Number(experience);

//     const matchesRating =
//       !rating || Number(doctor.rating || 0) >= Number(rating);

//     return (
//       matchesSearch &&
//       matchesSpecialty &&
//       matchesType &&
//       matchesGender &&
//       matchesExperience &&
//       matchesRating
//     );
//   });

//   const handleBookAppointment = (doctor) => {
//     const hospitalId =
//       typeof doctor.hospitalId === "object"
//         ? doctor.hospitalId?._id
//         : doctor.hospitalId;

//     if (!doctor._id || !hospitalId) {
//       alert(
//         "Doctor or hospital ID is missing. Please check the backend data."
//       );
//       return;
//     }

//     navigate("/book-appointment", {
//       state: {
//         doctorId: doctor._id,
//         hospitalId,
//         doctor,
//       },
//     });
//   };

//   return (
//     <div className="fd-page-container">
//       <header className="fd-page-header">
//         <h1>Find Doctors</h1>
//         <p>
//           Search for doctors based on your preferences and requirements.
//         </p>
//       </header>

//       <section className="fd-page-toolbar">
//         <button type="button" className="fd-page-location">
//           <MapPin size={18} />

//           <span className="fd-page-location-info">
//             <small>Your Location</small>
//             <strong>BTM Layout, Bengaluru</strong>
//           </span>

//           <ChevronDown size={16} />
//         </button>

//         <div className="fd-page-search">
//           <Search size={18} />

//           <input
//             type="text"
//             placeholder="Search doctors or specialties..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </section>

//       <main className="fd-page-layout">
//         <aside className="fd-page-sidebar">
//           <h2>Filters</h2>

//           <div className="fd-page-filter">
//             <label htmlFor="fd-specialty">Specialty</label>
//             <select
//               id="fd-specialty"
//               value={specialty}
//               onChange={(e) => setSpecialty(e.target.value)}
//             >
//               <option value="">All Specialties</option>
//               <option value="cardiology">Cardiology</option>
//               <option value="dermatology">Dermatology</option>
//               <option value="neurology">Neurology</option>
//               <option value="pediatrics">Pediatrics</option>
//             </select>
//           </div>

//           <div className="fd-page-filter">
//             <label htmlFor="fd-consultation">Consultation Type</label>
//             <select
//               id="fd-consultation"
//               value={consultationType}
//               onChange={(e) => setConsultationType(e.target.value)}
//             >
//               <option value="">All Types</option>
//               <option value="in-person">In-Person</option>
//               <option value="online">Online</option>
//             </select>
//           </div>

//           <div className="fd-page-filter">
//             <label htmlFor="fd-gender">Gender</label>
//             <select
//               id="fd-gender"
//               value={gender}
//               onChange={(e) => setGender(e.target.value)}
//             >
//               <option value="">All Genders</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>

//           <div className="fd-page-filter">
//             <label htmlFor="fd-experience">Experience</label>
//             <select
//               id="fd-experience"
//               value={experience}
//               onChange={(e) => setExperience(e.target.value)}
//             >
//               <option value="">Any Experience</option>
//               <option value="5">5+ Years</option>
//               <option value="10">10+ Years</option>
//               <option value="15">15+ Years</option>
//             </select>
//           </div>

//           <div className="fd-page-filter">
//             <label htmlFor="fd-rating">Rating</label>
//             <select
//               id="fd-rating"
//               value={rating}
//               onChange={(e) => setRating(e.target.value)}
//             >
//               <option value="">Any Rating</option>
//               <option value="4">4.0+</option>
//               <option value="4.5">4.5+</option>
//               <option value="4.8">4.8+</option>
//             </select>
//           </div>

//           <button
//             type="button"
//             className="fd-page-reset"
//             onClick={() => {
//               setSpecialty("");
//               setConsultationType("");
//               setGender("");
//               setExperience("");
//               setRating("");
//               setSearch("");
//             }}
//           >
//             Clear Filters
//           </button>
//         </aside>

//         <section className="fd-page-results">
//           <div className="fd-page-results-header">
//             <h2>Available Doctors</h2>
//             <span>
//               {loading ? "Loading..." : `${filteredDoctors.length} doctors found`}
//             </span>
//           </div>

//           {loading ? (
//             <div className="fd-page-empty">
//               <p>Loading doctors...</p>
//             </div>
//           ) : error ? (
//             <div className="fd-page-empty">
//               <h3>Unable to load doctors</h3>
//               <p>{error}</p>
//               <p>Check that your backend server is running on port 5000.</p>
//             </div>
//           ) : filteredDoctors.length > 0 ? (
//             <div className="fd-page-doctor-grid">
//               {filteredDoctors.map((doctor) => {
//                 const hospitalName =
//                   typeof doctor.hospitalId === "object"
//                     ? doctor.hospitalId?.hospitalName || "Hospital"
//                     : "Hospital";

//                 const hospitalAddress =
//                   typeof doctor.hospitalId === "object"
//                     ? doctor.hospitalId?.address
//                     : "";

//                 return (
//                   <article
//                     className="fd-page-doctor-card"
//                     key={doctor._id}
//                   >
//                     <div className="fd-page-doctor-image">
//                       {doctor.profileImage ? (
//                         <img
//                           src={doctor.profileImage}
//                           alt={doctor.name}
//                         />
//                       ) : (
//                         <MapPin size={32} />
//                       )}
//                     </div>

//                     <div className="fd-page-doctor-details">
//                       <h3>{doctor.name}</h3>

//                       <p className="fd-page-doctor-specialty">
//                         {doctor.specialty}
//                       </p>

//                       <p className="fd-page-doctor-hospital">
//                         {hospitalName}
//                       </p>

//                       {hospitalAddress && (
//                         <p className="fd-page-doctor-hospital">
//                           {typeof hospitalAddress === "string"
//                             ? hospitalAddress
//                             : [
//                                 hospitalAddress.street,
//                                 hospitalAddress.city,
//                               ]
//                                 .filter(Boolean)
//                                 .join(", ")}
//                         </p>
//                       )}

//                       <div className="fd-page-doctor-meta">
//                         <span>
//                           Experience: {doctor.experience || 0} years
//                         </span>

//                         {doctor.rating != null && (
//                           <span>⭐ {doctor.rating}</span>
//                         )}

//                         <span>
//                           Fee: ₹{doctor.consultationFee}
//                         </span>

//                         <span>
//                           Available:{" "}
//                           {doctor.availableDays?.length
//                             ? doctor.availableDays.join(", ")
//                             : "Contact hospital"}
//                         </span>
//                       </div>

//                       <div className="fd-page-doctor-footer">
//                         <button
//                           type="button"
//                           className="fd-page-book-button"
//                           onClick={() => handleBookAppointment(doctor)}
//                         >
//                           Book Appointment
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="fd-page-empty">
//               <Search size={32} />
//               <h3>No doctors found</h3>
//               <p>Try changing your search or clearing the filters.</p>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }

// export default FindDoctors;
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  BriefcaseMedical,
  CalendarDays,
  IndianRupee,
  X,
} from "lucide-react";
import "./FindDoctors.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api$/, "");
const DOCTORS_ENDPOINT = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/doctors`;

function getHospitalName(doctor) {
  return typeof doctor.hospitalId === "object"
    ? doctor.hospitalId?.hospitalName || "Hospital"
    : "Hospital";
}

function getHospitalAddress(doctor) {
  const address = typeof doctor.hospitalId === "object" ? doctor.hospitalId?.address : "";
  if (typeof address === "string") return address;
  if (address && typeof address === "object") {
    return [address.street, address.city].filter(Boolean).join(", ");
  }
  return "";
}

function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
}

function FindDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [experience, setExperience] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDoctors() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(DOCTORS_ENDPOINT, { signal: controller.signal });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch doctors.");
        }

        setDoctors(Array.isArray(result.doctors) ? result.doctors : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch doctors error:", err);
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchDoctors();
    return () => controller.abort();
  }, []);

  const specialties = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))].sort(),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const hospitalName = getHospitalName(doctor);
      const matchesSearch =
        !query ||
        [doctor.name, doctor.specialty, hospitalName, getHospitalAddress(doctor)]
          .some((value) => String(value || "").toLowerCase().includes(query));

      const matchesSpecialty =
        !specialty || (doctor.specialty || "").toLowerCase() === specialty.toLowerCase();

      const type = (doctor.consultationType || "")
        .toLowerCase()
        .replace("in-person", "in-clinic");
      const selectedType = consultationType.toLowerCase().replace("in-person", "in-clinic");
      const matchesType = !consultationType || type === selectedType;
      const matchesExperience = !experience || Number(doctor.experience || 0) >= Number(experience);

      return matchesSearch && matchesSpecialty && matchesType && matchesExperience;
    });
  }, [doctors, search, specialty, consultationType, experience]);

  const clearFilters = () => {
    setSearch("");
    setSpecialty("");
    setConsultationType("");
    setExperience("");
  };

  const handleBookAppointment = (doctor) => {
    const hospitalId =
      typeof doctor.hospitalId === "object" ? doctor.hospitalId?._id : doctor.hospitalId;

    if (!doctor._id || !hospitalId) {
      alert("Doctor or hospital ID is missing. Please check the backend data.");
      return;
    }

    navigate("/book-appointment", {
      state: { doctorId: doctor._id, hospitalId, doctor },
    });
  };

  const activeFilters = [specialty, consultationType, experience].filter(Boolean).length;

  return (
    <div className="fd-page-container">
      <header className="fd-page-header">
        <div>
          <span className="fd-eyebrow">CARE THAT FITS YOU</span>
          <h1>Find your doctor</h1>
          <p>Compare specialists and book your next appointment.</p>
        </div>
        <div className="fd-location-pill">
          <MapPin size={16} aria-hidden="true" />
          <span>Bengaluru</span>
        </div>
      </header>

      <section className="fd-page-toolbar" aria-label="Search doctors">
        <div className="fd-page-search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by doctor, specialty or hospital"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search by doctor, specialty or hospital"
          />
          {search && (
            <button className="fd-clear-search" type="button" onClick={() => setSearch("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          className={`fd-filter-toggle ${showFilters ? "is-active" : ""}`}
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={17} />
          Filters
          {activeFilters > 0 && <span className="fd-filter-count">{activeFilters}</span>}
        </button>
      </section>

      <main className="fd-page-layout">
        <aside className={`fd-page-sidebar ${showFilters ? "is-open" : ""}`}>
          <div className="fd-sidebar-heading">
            <h2>Filters</h2>
            <button type="button" onClick={clearFilters} className="fd-text-button">Clear all</button>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-specialty">Specialty</label>
            <select id="fd-specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
              <option value="">All specialties</option>
              {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-consultation">Consultation</label>
            <select id="fd-consultation" value={consultationType} onChange={(event) => setConsultationType(event.target.value)}>
              <option value="">All types</option>
              <option value="in-person">In-clinic</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="fd-page-filter">
            <label htmlFor="fd-experience">Experience</label>
            <select id="fd-experience" value={experience} onChange={(event) => setExperience(event.target.value)}>
              <option value="">Any experience</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
              <option value="15">15+ years</option>
            </select>
          </div>
        </aside>

        <section className="fd-page-results">
          <div className="fd-page-results-header">
            <div>
              <h2>Available doctors</h2>
              <p>{loading ? "Finding specialists…" : `${filteredDoctors.length} ${filteredDoctors.length === 1 ? "doctor" : "doctors"} found`}</p>
            </div>
          </div>

          {loading ? (
            <div className="fd-page-state"><span className="fd-spinner" /><p>Loading doctors…</p></div>
          ) : error ? (
            <div className="fd-page-state fd-state-error">
              <h3>Unable to load doctors</h3>
              <p>{error}</p>
              <button type="button" className="fd-secondary-button" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : filteredDoctors.length ? (
            <div className="fd-page-doctor-grid">
              {filteredDoctors.map((doctor) => {
                const hospitalName = getHospitalName(doctor);
                const hospitalAddress = getHospitalAddress(doctor);
                const imageUrl = getImageUrl(doctor.profileImage);

                return (
                  <article className="fd-page-doctor-card" key={doctor._id}>
                    <div className="fd-doctor-card-top">
                      <div className="fd-doctor-avatar">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={doctor.name || "Doctor"}
                            onError={(event) => { event.currentTarget.style.display = "none"; }}
                          />
                        ) : null}
                        <span aria-hidden="true">{(doctor.name || "D").trim().charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="fd-doctor-identity">
                        <h3>{doctor.name || "Doctor"}</h3>
                        <p>{doctor.specialty || "General physician"}</p>
                      </div>
                      {doctor.rating != null && Number.isFinite(Number(doctor.rating)) && (
                        <span className="fd-doctor-rating"><Star size={13} fill="currentColor" /> {doctor.rating}</span>
                      )}
                    </div>

                    <div className="fd-doctor-hospital">
                      <BriefcaseMedical size={15} aria-hidden="true" />
                      <span>{hospitalName}</span>
                    </div>
                    {hospitalAddress && (
                      <div className="fd-doctor-address"><MapPin size={14} aria-hidden="true" /><span>{hospitalAddress}</span></div>
                    )}

                    <div className="fd-doctor-facts">
                      <div>
                        <BriefcaseMedical size={15} aria-hidden="true" />
                        <span>{doctor.experience != null ? `${doctor.experience} years experience` : "Experience not listed"}</span>
                      </div>
                      <div>
                        <IndianRupee size={15} aria-hidden="true" />
                        <span>{doctor.consultationFee != null ? `₹${doctor.consultationFee} consultation` : "Fee on request"}</span>
                      </div>
                      {doctor.availableDays?.length > 0 && (
                        <div>
                          <CalendarDays size={15} aria-hidden="true" />
                          <span>{doctor.availableDays.slice(0, 3).join(", ")}{doctor.availableDays.length > 3 ? " +" : ""}</span>
                        </div>
                      )}
                    </div>

                    <button type="button" className="fd-page-book-button" onClick={() => handleBookAppointment(doctor)}>
                      Book appointment
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="fd-page-state">
              <Search size={28} aria-hidden="true" />
              <h3>No doctors found</h3>
              <p>Try another search or remove some filters.</p>
              <button type="button" className="fd-secondary-button" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FindDoctors;
