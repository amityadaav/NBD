// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   MapPin, Search, SlidersHorizontal, Star, BriefcaseMedical,
//   CalendarDays, IndianRupee, X, RefreshCw, Video, Building2,
//   CheckCircle2, ChevronLeft, ChevronRight
// } from "lucide-react";
// import "./FindDoctors.css";

// const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
// const API_ORIGIN = API_URL.replace(/\/api$/, "");
// const DOCTORS_ENDPOINT = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/doctors`;

// const ITEMS_PER_PAGE = 12;

// // --- Helpers ---
// function getHospitalName(doctor) {
//   return typeof doctor.hospitalId === "object"
//     ? doctor.hospitalId?.hospitalName || "Hospital"
//     : "Hospital";
// }

// function getHospitalAddress(doctor) {
//   const address = typeof doctor.hospitalId === "object" ? doctor.hospitalId?.address : "";
//   if (typeof address === "string") return address;
//   if (address && typeof address === "object") {
//     return [address.street, address.city].filter(Boolean).join(", ");
//   }
//   return "";
// }

// function getImageUrl(path) {
//   if (!path) return "";
//   if (/^https?:\/\//i.test(path)) return path;
//   return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
// }

// // --- Components ---
// function DoctorAvatar({ name, imageUrl }) {
//   const [failed, setFailed] = useState(false);
//   const initial = (name || "D").trim().charAt(0).toUpperCase();

//   return (
//     <div className="fd-card-avatar">
//       {imageUrl && !failed ? (
//         <img
//           src={imageUrl}
//           alt={name || "Doctor"}
//           loading="lazy"
//           onError={() => setFailed(true)}
//         />
//       ) : (
//         <span aria-hidden="true">{initial}</span>
//       )}
//     </div>
//   );
// }

// function FindDoctors() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // --- Filter State (Initialized from URL) ---
//   const initialSpecialty = searchParams.get("specialty") || "";
//   const initialSearch = searchParams.get("search") || "";
//   const initialType = searchParams.get("type") || "";
//   const initialExperience = searchParams.get("experience") || "";

//   const [specialty, setSpecialty] = useState(initialSpecialty);
//   const [search, setSearch] = useState(initialSearch);
//   const [consultationType, setConsultationType] = useState(initialType);
//   const [experience, setExperience] = useState(initialExperience);

//   // Debounced search string to prevent stuttering
//   const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   // --- Fetch Doctors ---
//   const fetchDoctors = useCallback(async (signal) => {
//     try {
//       setLoading(true);
//       setError("");
//       const response = await fetch(DOCTORS_ENDPOINT, { signal });
//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to fetch doctors.");
//       }

//       setDoctors(Array.isArray(result.doctors) ? result.doctors : []);
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         console.error("Fetch doctors error:", err);
//         setError(err.message || "Unable to connect to the server.");
//       }
//     } finally {
//       if (!signal?.aborted) setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const controller = new AbortController();
//     fetchDoctors(controller.signal);
//     return () => controller.abort();
//   }, [fetchDoctors]);

//   // --- Debounce Search Logic ---
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [search]);

//   // --- Sync Filters to URL ---
//   useEffect(() => {
//     const params = new URLSearchParams();
//     if (debouncedSearch) params.set("search", debouncedSearch);
//     if (specialty) params.set("specialty", specialty);
//     if (consultationType) params.set("type", consultationType);
//     if (experience) params.set("experience", experience);
    
//     setSearchParams(params, { replace: true });
//   }, [debouncedSearch, specialty, consultationType, experience, setSearchParams]);

//   // --- Reset page on filter change ---
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearch, specialty, consultationType, experience]);

//   // --- Extract Unique Specialties ---
//   const specialties = useMemo(
//     () =>
//       [...new Set(doctors.map((d) => d.specialty).filter(Boolean))].sort((a, b) =>
//         a.localeCompare(b)
//       ),
//     [doctors]
//   );

//   // --- Filtering Logic ---
//   const filteredDoctors = useMemo(() => {
//     const query = debouncedSearch.trim().toLowerCase();

//     return doctors.filter((doctor) => {
//       const hospitalName = getHospitalName(doctor);
//       const hospitalAddress = getHospitalAddress(doctor);

//       const matchesSearch =
//         !query ||
//         [
//           doctor.name,
//           doctor.specialty,
//           doctor.qualification,
//           hospitalName,
//           hospitalAddress,
//         ].some((value) => String(value || "").toLowerCase().includes(query));

//       const matchesSpecialty =
//         !specialty || (doctor.specialty || "").toLowerCase() === specialty.toLowerCase();

//       const type = (doctor.consultationType || "").toLowerCase().replace("in-person", "in-clinic");
//       const selectedType = consultationType.toLowerCase().replace("in-person", "in-clinic");
//       const matchesType = !consultationType || type === selectedType;

//       const matchesExperience = !experience || Number(doctor.experience || 0) >= Number(experience);

//       return matchesSearch && matchesSpecialty && matchesType && matchesExperience;
//     });
//   }, [doctors, debouncedSearch, specialty, consultationType, experience]);

//   // --- Pagination ---
//   const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     document.querySelector(".fd-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }
//     pages.push(1);
//     if (currentPage > 3) pages.push("...");
//     const start = Math.max(2, currentPage - 1);
//     const end = Math.min(totalPages - 1, currentPage + 1);
//     for (let i = start; i <= end; i++) pages.push(i);
//     if (currentPage < totalPages - 2) pages.push("...");
//     pages.push(totalPages);
//     return pages;
//   };

//   // --- Actions ---
//   const clearFilters = () => {
//     setSearch("");
//     setSpecialty("");
//     setConsultationType("");
//     setExperience("");
//     setCurrentPage(1);
//   };

//   const removeFilter = (type) => {
//     if (type === "search") setSearch("");
//     if (type === "specialty") setSpecialty("");
//     if (type === "type") setConsultationType("");
//     if (type === "experience") setExperience("");
//   };

//   const handleBookAppointment = (doctor) => {
//     const hospitalId =
//       typeof doctor.hospitalId === "object" ? doctor.hospitalId?._id : doctor.hospitalId;

//     if (!doctor._id || !hospitalId) {
//       alert("Doctor or hospital ID is missing. Please check the backend data.");
//       return;
//     }

//     navigate("/book-appointment", {
//       state: { doctorId: doctor._id, hospitalId, doctor },
//     });
//   };

//   const activeFilterCount = [specialty, consultationType, experience].filter(Boolean).length;
//   const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

//   return (
//     <div className="fd-page-container">
//       <header className="fd-page-header">
//         <div className="fd-header-text">
//           <span className="fd-eyebrow">CARE THAT FITS YOU</span>
//           <h1>Find your doctor</h1>
//         </div>
//         <div className="fd-location-pill">
//           <MapPin size={15} />
//           <span>Bengaluru, KA</span>
//         </div>
//       </header>

//       <section className="fd-toolbar" aria-label="Search and filter doctors">
//         <div className="fd-search-wrap">
//           <Search size={19} className="fd-search-icon" aria-hidden="true" />
//           <input
//             type="search"
//             placeholder="Search name, specialty, hospital..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             aria-label="Search doctors"
//           />
//           {search && (
//             <button
//               className="fd-search-clear"
//               type="button"
//               onClick={() => setSearch("")}
//               aria-label="Clear search"
//             >
//               <X size={15} />
//             </button>
//           )}
//         </div>

//         <button
//           className={`fd-filter-btn ${showFilters ? "is-active" : ""}`}
//           type="button"
//           onClick={() => setShowFilters((v) => !v)}
//           aria-expanded={showFilters}
//           aria-controls="fd-filter-panel"
//         >
//           <SlidersHorizontal size={17} />
//           <span className="fd-filter-label">Filters</span>
//           {activeFilterCount > 0 && (
//             <span className="fd-filter-count">{activeFilterCount}</span>
//           )}
//         </button>
//       </section>

//       {/* --- Active Filters Display --- */}
//       {hasActiveFilters && (
//         <div className="fd-active-filters">
//           <span className="fd-active-label">Active filters:</span>
//           {search && (
//             <button className="fd-chip" onClick={() => removeFilter("search")}>
//               "{search}" <X size={12} />
//             </button>
//           )}
//           {specialty && (
//             <button className="fd-chip" onClick={() => removeFilter("specialty")}>
//               {specialty} <X size={12} />
//             </button>
//           )}
//           {consultationType && (
//             <button className="fd-chip" onClick={() => removeFilter("type")}>
//               {consultationType === "online" ? "Video Consultation" : "In-Clinic"} <X size={12} />
//             </button>
//           )}
//           {experience && (
//             <button className="fd-chip" onClick={() => removeFilter("experience")}>
//               {experience}+ Years Exp <X size={12} />
//             </button>
//           )}
//           <button className="fd-chip-clear" onClick={clearFilters}>
//             Clear all
//           </button>
//         </div>
//       )}

//       <div className="fd-layout">
//         <aside
//           id="fd-filter-panel"
//           className={`fd-sidebar ${showFilters ? "is-open" : ""}`}
//         >
//           <div className="fd-sidebar-header">
//             <h2>Filters</h2>
//             {hasActiveFilters && (
//               <button type="button" onClick={clearFilters} className="fd-clear-btn">
//                 Clear all
//               </button>
//             )}
//           </div>

//           <div className="fd-filter-group">
//             <label htmlFor="filter-specialty">Specialty</label>
//             <select
//               id="filter-specialty"
//               value={specialty}
//               onChange={(e) => setSpecialty(e.target.value)}
//             >
//               <option value="">All Specialties</option>
//               {specialties.map((item) => (
//                 <option key={item} value={item}>{item}</option>
//               ))}
//             </select>
//           </div>

//           <div className="fd-filter-group">
//             <label htmlFor="filter-consultation">Consultation Type</label>
//             <select
//               id="filter-consultation"
//               value={consultationType}
//               onChange={(e) => setConsultationType(e.target.value)}
//             >
//               <option value="">All Types</option>
//               <option value="in-person">In-Clinic Visit</option>
//               <option value="online">Video Consultation</option>
//             </select>
//           </div>

//           <div className="fd-filter-group">
//             <label htmlFor="filter-experience">Experience</label>
//             <select
//               id="filter-experience"
//               value={experience}
//               onChange={(e) => setExperience(e.target.value)}
//             >
//               <option value="">Any Experience</option>
//               <option value="5">5+ years</option>
//               <option value="10">10+ years</option>
//               <option value="15">15+ years</option>
//             </select>
//           </div>
//         </aside>

//         <main className="fd-results">
//           <div className="fd-results-header">
//             <h2>
//               {hasActiveFilters ? "Matching Doctors" : "Available Doctors"}
//             </h2>
//             <p aria-live="polite">
//               {loading
//                 ? "Searching…"
//                 : `Showing ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredDoctors.length)} of ${filteredDoctors.length} doctor${filteredDoctors.length === 1 ? "" : "s"}`}
//             </p>
//           </div>

//           {loading ? (
//             <div className="fd-doctor-grid">
//               {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
//                 <div key={i} className="fd-skeleton-card">
//                   <div className="fd-skeleton-top">
//                     <div className="fd-skeleton-avatar" />
//                     <div className="fd-skeleton-lines">
//                       <div className="fd-skeleton-line long" />
//                       <div className="fd-skeleton-line short" />
//                     </div>
//                   </div>
//                   <div className="fd-skeleton-line" />
//                   <div className="fd-skeleton-line short" />
//                 </div>
//               ))}
//             </div>
//           ) : error ? (
//             <div className="fd-state-card fd-state-error">
//               <div className="fd-state-icon">!</div>
//               <h3>Unable to load doctors</h3>
//               <p>{error}</p>
//               <button type="button" className="fd-secondary-btn" onClick={() => fetchDoctors()}>
//                 <RefreshCw size={14} /> Try again
//               </button>
//             </div>
//           ) : filteredDoctors.length > 0 ? (
//             <>
//               <div className="fd-doctor-grid">
//                 {paginatedDoctors.map((doctor) => {
//                   const hospitalName = getHospitalName(doctor);
//                   const hospitalAddress = getHospitalAddress(doctor);
//                   const imageUrl = getImageUrl(doctor.profileImage);
//                   const ratingNum = Number(doctor.rating);
//                   const hasRating = Number.isFinite(ratingNum) && ratingNum > 0;
//                   const isOnline = (doctor.consultationType || "").toLowerCase() === "online";

//                   return (
//                     <article className="fd-doctor-card" key={doctor._id}>
//                       <div className="fd-card-header">
//                         <DoctorAvatar name={doctor.name} imageUrl={imageUrl} />
//                         <div className="fd-card-header-info">
//                           <h3>{doctor.name || "Doctor"}</h3>
//                           <p>{doctor.specialty || "General physician"}</p>
//                         </div>
//                         {hasRating && (
//                           <span className="fd-card-rating">
//                             <Star size={13} fill="currentColor" /> {ratingNum.toFixed(1)}
//                           </span>
//                         )}
//                       </div>

//                       <div className="fd-card-meta">
//                         <div className="fd-meta-row">
//                           <Building2 size={15} className="fd-meta-icon" />
//                           <span>{hospitalName}</span>
//                         </div>
//                         {hospitalAddress && (
//                           <div className="fd-meta-row">
//                             <MapPin size={15} className="fd-meta-icon" />
//                             <span>{hospitalAddress}</span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="fd-card-facts">
//                         <div className="fd-fact">
//                           <BriefcaseMedical size={15} />
//                           <span>{doctor.experience ?? 0} years exp</span>
//                         </div>
//                         <div className="fd-fact">
//                           {isOnline ? <Video size={15} /> : <CheckCircle2 size={15} />}
//                           <span>{isOnline ? "Video Consult" : "In-Clinic"}</span>
//                         </div>
//                         {doctor.availableDays?.length > 0 && (
//                           <div className="fd-fact">
//                             <CalendarDays size={15} />
//                             <span>{doctor.availableDays.slice(0, 3).join(", ")}</span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="fd-card-footer">
//                         <div className="fd-card-fee">
//                           <strong>
//                             <IndianRupee size={14} /> 
//                             {doctor.consultationFee ?? "N/A"}
//                           </strong>
//                         </div>
//                         <button
//                           type="button"
//                           className="fd-book-btn"
//                           onClick={() => handleBookAppointment(doctor)}
//                         >
//                           Book Now
//                         </button>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>

//               {totalPages > 1 && (
//                 <nav className="fd-pagination" aria-label="Pagination">
//                   <button
//                     type="button"
//                     className="fd-page-btn fd-page-prev"
//                     disabled={currentPage === 1}
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     aria-label="Previous page"
//                   >
//                     <ChevronLeft size={16} /> Previous
//                   </button>

//                   <div className="fd-page-numbers">
//                     {getPageNumbers().map((page, index) => {
//                       if (page === "...") {
//                         return (
//                           <span key={`ellipsis-${index}`} className="fd-page-ellipsis">
//                             ...
//                           </span>
//                         );
//                       }
//                       return (
//                         <button
//                           key={page}
//                           type="button"
//                           className={`fd-page-num ${currentPage === page ? "is-active" : ""}`}
//                           onClick={() => handlePageChange(page)}
//                           aria-label={`Go to page ${page}`}
//                           aria-current={currentPage === page ? "page" : undefined}
//                         >
//                           {page}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     type="button"
//                     className="fd-page-btn fd-page-next"
//                     disabled={currentPage === totalPages}
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     aria-label="Next page"
//                   >
//                     Next <ChevronRight size={16} />
//                   </button>
//                 </nav>
//               )}
//             </>
//           ) : (
//             <div className="fd-state-card">
//               <div className="fd-state-icon"><Search size={26} /></div>
//               <h3>No doctors found</h3>
//               <p>
//                 {search
//                   ? `No results for "${search}". Try adjusting your search.`
//                   : "There are no doctors matching your filters right now."}
//               </p>
//               <button type="button" className="fd-secondary-btn" onClick={clearFilters}>
//                 Clear all filters
//               </button>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default FindDoctors;
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin, Search, SlidersHorizontal, Star, BriefcaseMedical,
  CalendarDays, IndianRupee, X, RefreshCw, Video, Building2,
  CheckCircle2, ChevronLeft, ChevronRight, Sparkles, Clock,
  BadgeCheck, ArrowRight, Filter
} from "lucide-react";
import "./FindDoctors.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api$/, "");
const DOCTORS_ENDPOINT = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/doctors`;

const ITEMS_PER_PAGE = 12;

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
function getInitials(name) {
  return (name || "D").trim().split(/\s+/).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function DoctorAvatar({ name, imageUrl }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="app-dr-avatar">
      {imageUrl && !failed ? (
        <img src={imageUrl} alt={name || "Doctor"} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}

function FindDoctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [consultationType, setConsultationType] = useState(searchParams.get("type") || "");
  const [experience, setExperience] = useState(searchParams.get("experience") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDoctors = useCallback(async (signal) => {
    try {
      setLoading(true); setError("");
      const response = await fetch(DOCTORS_ENDPOINT, { signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch doctors.");
      setDoctors(Array.isArray(result.doctors) ? result.doctors : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch doctors error:", err);
        setError(err.message || "Unable to connect to the server.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (specialty) params.set("specialty", specialty);
    if (consultationType) params.set("type", consultationType);
    if (experience) params.set("experience", experience);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, specialty, consultationType, experience, setSearchParams]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, specialty, consultationType, experience]);

  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialty).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const hospitalName = getHospitalName(doctor);
      const hospitalAddress = getHospitalAddress(doctor);
      const matchesSearch = !query || [
        doctor.name, doctor.specialty, doctor.qualification, hospitalName, hospitalAddress,
      ].some((v) => String(v || "").toLowerCase().includes(query));
      const matchesSpecialty = !specialty || (doctor.specialty || "").toLowerCase() === specialty.toLowerCase();
      const type = (doctor.consultationType || "").toLowerCase().replace("in-person", "in-clinic");
      const selectedType = consultationType.toLowerCase().replace("in-person", "in-clinic");
      const matchesType = !consultationType || type === selectedType;
      const matchesExperience = !experience || Number(doctor.experience || 0) >= Number(experience);
      return matchesSearch && matchesSpecialty && matchesType && matchesExperience;
    });
  }, [doctors, debouncedSearch, specialty, consultationType, experience]);

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector(".app-dr-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const clearFilters = () => {
    setSearch(""); setSpecialty(""); setConsultationType(""); setExperience(""); setCurrentPage(1);
  };

  const removeFilter = (type) => {
    if (type === "search") setSearch("");
    if (type === "specialty") setSpecialty("");
    if (type === "type") setConsultationType("");
    if (type === "experience") setExperience("");
  };

  const handleBookAppointment = (doctor) => {
    const hospitalId = typeof doctor.hospitalId === "object" ? doctor.hospitalId?._id : doctor.hospitalId;
    if (!doctor._id || !hospitalId) return alert("Doctor or hospital ID is missing.");
    navigate("/book-appointment", { state: { doctorId: doctor._id, hospitalId, doctor } });
  };

  const activeFilterCount = [specialty, consultationType, experience].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <div className="app-dr-container">
      {/* HEADER */}
      <header className="app-dr-hero">
        <div className="app-dr-hero-content">
          <div>
            <span className="app-dr-eyebrow"><Sparkles size={12} /> Care that fits you</span>
            <h1 className="app-dr-h1">Find your <span className="app-dr-accent">perfect doctor</span></h1>
            <p className="app-dr-subtitle">Book appointments with trusted specialists — online or in-clinic.</p>
          </div>
          <div className="app-dr-stats">
            <div>
              <span className="app-dr-stat-val">{loading ? "—" : doctors.length}+</span>
              <span className="app-dr-stat-lbl">Verified doctors</span>
            </div>
            <div className="app-dr-stat-div"></div>
            <div>
              <span className="app-dr-stat-val">{specialties.length}</span>
              <span className="app-dr-stat-lbl">Specialties</span>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH TOOLBAR */}
      <section className="app-dr-toolbar">
        <div className="app-dr-search">
          <Search size={18} className="app-dr-search-icon" />
          <input
            type="search"
            placeholder="Search by name, specialty, or hospital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="app-dr-search-clear" onClick={() => setSearch("")}><X size={14}/></button>
          )}
        </div>
        <button
          className={`app-dr-filter-btn ${showFilters ? "is-active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} /> Filters {activeFilterCount > 0 && <span className="app-dr-filter-badge">{activeFilterCount}</span>}
        </button>
      </section>

      <div className="app-dr-layout">
        {/* SIDEBAR */}
        <aside className={`app-dr-sidebar ${showFilters ? "is-open" : ""}`}>
          <div className="app-dr-sidebar-head">
            <h2><SlidersHorizontal size={16} /> Refine</h2>
            {hasActiveFilters && <button className="app-dr-reset" onClick={clearFilters}>Reset</button>}
          </div>

          <div className="app-dr-group">
            <label>Specialty</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">All specialties</option>
              {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="app-dr-group">
            <label>Consultation</label>
            <div className="app-dr-toggle">
              <button className={consultationType === "" ? "is-active" : ""} onClick={() => setConsultationType("")}>All</button>
              <button className={consultationType === "in-person" ? "is-active" : ""} onClick={() => setConsultationType("in-person")}>Clinic</button>
              <button className={consultationType === "online" ? "is-active" : ""} onClick={() => setConsultationType("online")}>Video</button>
            </div>
          </div>

          <div className="app-dr-group">
            <label>Experience</label>
            <select value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="">Any experience</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
              <option value="15">15+ years</option>
            </select>
          </div>
        </aside>

        {/* RESULTS */}
        <main className="app-dr-results">
          <div className="app-dr-results-head">
            <h2>{hasActiveFilters ? "Matching doctors" : "Available doctors"}</h2>
            <p>{loading ? "Searching…" : `Showing ${filteredDoctors.length} results`}</p>
          </div>

          {loading ? (
            <div className="app-dr-grid">
              {[1,2,3,4].map(i => <div key={i} className="app-dr-skeleton" />)}
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="app-dr-grid">
              {paginatedDoctors.map(doctor => {
                const isOnline = (doctor.consultationType || "").toLowerCase() === "online";
                return (
                  <article className="app-dr-card" key={doctor._id}>
                    <div className="app-dr-card-top">
                      <div className="app-dr-avatar-wrap">
                        <DoctorAvatar name={doctor.name} imageUrl={getImageUrl(doctor.profileImage)} />
                        <span className={`app-dr-dot ${isOnline ? "is-online" : ""}`} />
                      </div>
                      <div className="app-dr-card-info">
                        <h3>{doctor.name}</h3>
                        <p>{doctor.specialty || "General physician"}</p>
                      </div>
                    </div>

                    <div className="app-dr-card-meta">
                      <div className="app-dr-meta-row"><Building2 size={14}/> {getHospitalName(doctor)}</div>
                      <div className="app-dr-meta-row"><MapPin size={14}/> {getHospitalAddress(doctor) || "Address not provided"}</div>
                    </div>

                    <div className="app-dr-card-facts">
                      <span className="app-dr-fact"><BriefcaseMedical size={13}/> {doctor.experience || 0} yrs</span>
                      <span className="app-dr-fact">{isOnline ? <Video size={13}/> : <CheckCircle2 size={13}/>} {isOnline ? "Video" : "Clinic"}</span>
                    </div>

                    <div className="app-dr-card-bottom">
                      <div className="app-dr-fee">
                        <small>Fee</small>
                        <strong><IndianRupee size={13}/> {doctor.consultationFee || "N/A"}</strong>
                      </div>
                      <button className="app-dr-book" onClick={() => handleBookAppointment(doctor)}>
                        Book <ArrowRight size={14}/>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="app-dr-empty">
              <Search size={32} />
              <h3>No doctors found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters}>Clear all filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FindDoctors;