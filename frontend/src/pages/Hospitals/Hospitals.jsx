
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Search,
//   MapPin,
//   Star,
//   Phone,
//   ArrowRight,
//   ChevronDown,
// } from "lucide-react";

// import "./Hospitals.css";

// const API_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000";

// function Hospitals() {
//   const [hospitals, setHospitals] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("all");
//   const [sortBy, setSortBy] = useState("recommended");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch hospitals from backend
//   useEffect(() => {
//     const controller = new AbortController();

//     const fetchHospitals = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch(
//           `${API_URL}/api/hospitals`,
//           { signal: controller.signal }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch hospitals.");
//         }

//         const result = await response.json();

//         // Supports both array and { data: [...] } responses
//         const hospitalData = Array.isArray(result)
//           ? result
//           : result.data ?? result.hospitals ?? [];

//         setHospitals(
//           hospitalData.map((hospital) => ({
//             ...hospital,

//             // Map MongoDB fields to frontend fields
//             id: hospital._id,
//             name: hospital.hospitalName || "Unnamed Hospital",
//             type: hospital.hospitalType || "",
//             location: [
//               hospital.address?.area,
//               hospital.address?.city,
//             ]
//               .filter(Boolean)
//               .join(", ") || "Location unavailable",

//             phone: hospital.phone || "",
//             image:
//               hospital.logo ||
//               hospital.images?.[0] ||
//               "",

//             // These fields aren't present in your schema
//             rating: hospital.rating ?? null,
//             reviews: hospital.reviews ?? 0,
//             doctors: hospital.doctorCount ?? 0,

//             available24x7:
//               hospital.emergencyAvailable === true,
//           }))
//         );
//       } catch (err) {
//         if (err.name !== "AbortError") {
//           setError(err.message || "Something went wrong.");
//         }
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchHospitals();

//     return () => controller.abort();
//   }, []);

//   // Search, category filtering and sorting
//   const filteredHospitals = useMemo(() => {
//     let result = hospitals.filter((hospital) => {
//       const searchText = search.trim().toLowerCase();

//       const matchesSearch =
//         hospital.name.toLowerCase().includes(searchText) ||
//         hospital.location.toLowerCase().includes(searchText) ||
//         hospital.type.toLowerCase().includes(searchText) ||
//         hospital.address?.city
//           ?.toLowerCase()
//           .includes(searchText) ||
//         hospital.specialties?.some((specialty) =>
//           specialty.toLowerCase().includes(searchText)
//         );

//       const normalizedType = hospital.type
//         .toLowerCase()
//         .replace(/[\s_-]/g, "");

//       const matchesCategory =
//         category === "all" ||
//         normalizedType.includes(category);

//       return matchesSearch && matchesCategory;
//     });

//     if (sortBy === "rating") {
//       result = [...result].sort(
//         (a, b) =>
//           Number(b.rating || 0) - Number(a.rating || 0)
//       );
//     }

//     return result;
//   }, [hospitals, search, category, sortBy]);

//   return (
//     <main className="hp-page-container">
//       {/* Header */}
//       <section className="hp-page-header">
//         <div className="hp-page-header-content">
//           <span className="hp-page-label">
//             HEALTHCARE FACILITIES
//           </span>

//           <h1>
//             Find the right
//             <span> hospital for you.</span>
//           </h1>

//           <p>
//             Discover hospitals and healthcare facilities.
//             Compare services, specialties and availability.
//           </p>
//         </div>

//         <form
//           className="hp-page-search"
//           onSubmit={(e) => e.preventDefault()}
//         >
//           <Search size={20} />

//           <input
//             type="search"
//             placeholder="Search hospitals or specialties..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             aria-label="Search hospitals"
//           />

//           <button type="submit">Search</button>
//         </form>
//       </section>

//       {/* Location and Category Filters */}
//       <section className="hp-page-toolbar">
//         <button
//           type="button"
//           className="hp-page-location"
//         >
//           <MapPin size={18} />

//           <span className="hp-page-location-content">
//             <small>Your Location</small>
//             <strong>BTM Layout, Bengaluru</strong>
//           </span>

//           <ChevronDown size={16} />
//         </button>

//         <div className="hp-page-categories">
//           {[
//             { label: "All Hospitals", value: "all" },
//             { label: "Multi-Specialty", value: "multispecialty" },
//             { label: "General", value: "general" },
//             { label: "Specialty", value: "specialty" },
//           ].map((item) => (
//             <button
//               key={item.value}
//               type="button"
//               className={
//                 category === item.value ? "active" : ""
//               }
//               onClick={() => setCategory(item.value)}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* Hospital List */}
//       <section className="hp-page-list">
//         <div className="hp-page-list-heading">
//           <div>
//             <h2>Hospitals near you</h2>
//             <p>
//               {loading
//                 ? "Loading hospitals..."
//                 : `Showing ${filteredHospitals.length} hospitals`}
//             </p>
//           </div>

//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             aria-label="Sort hospitals"
//           >
//             <option value="recommended">Recommended</option>
//             <option value="rating">Highest Rated</option>
//           </select>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="hp-page-empty">
//             <p>Loading hospitals from server...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {!loading && error && (
//           <div className="hp-page-empty">
//             <h3>Unable to load hospitals</h3>
//             <p>{error}</p>

//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Hospital Cards */}
//         {!loading && !error && (
//           filteredHospitals.length > 0 ? (
//             <div className="hp-page-grid">
//               {filteredHospitals.map((hospital) => (
//                 <article
//                   className="hp-page-card"
//                   key={hospital.id}
//                 >
//                   <div className="hp-page-image">
//                     {hospital.image ? (
//                       <img
//                         src={hospital.image}
//                         alt={hospital.name}
//                         loading="lazy"
//                       />
//                     ) : (
//                       <div className="hp-page-image-placeholder">
//                         <MapPin size={32} />
//                         <span>Hospital</span>
//                       </div>
//                     )}

//                     {hospital.available24x7 && (
//                       <span className="hp-page-badge">
//                         Emergency Available
//                       </span>
//                     )}
//                   </div>

//                   <div className="hp-page-card-content">
//                     <h3>{hospital.name}</h3>

//                     <div className="hp-page-location">
//                       <MapPin size={15} />
//                       <span>{hospital.location}</span>
//                     </div>

//                     <div className="hp-page-rating">
//                       <span className="hp-page-rating-score">
//                         <Star size={14} fill="currentColor" />
//                         {hospital.rating ?? "Not rated"}
//                       </span>

//                       <span>
//                         ({hospital.reviews} reviews)
//                       </span>
//                     </div>

//                     <div className="hp-page-meta">
//                       <span>
//                         {hospital.doctors} Doctors
//                       </span>

//                       <span>
//                         {hospital.available24x7
//                           ? "Emergency services"
//                           : "Check availability"}
//                       </span>
//                     </div>

//                     {hospital.specialties?.length > 0 && (
//                       <p className="hp-page-specialties">
//                         {hospital.specialties
//                           .slice(0, 3)
//                           .join(" • ")}
//                       </p>
//                     )}

//                     <div className="hp-page-actions">
//                       <button
//                         type="button"
//                         className="hp-page-view-button"
//                         onClick={() =>
//                           window.location.assign(
//                             `/hospitals/${hospital.id}`
//                           )
//                         }
//                       >
//                         View Hospital
//                         <ArrowRight size={16} />
//                       </button>

//                       <button
//                         type="button"
//                         className="hp-page-call-button"
//                         aria-label={`Call ${hospital.name}`}
//                         onClick={() => {
//                           if (hospital.phone) {
//                             window.location.href =
//                               `tel:${hospital.phone}`;
//                           }
//                         }}
//                         disabled={!hospital.phone}
//                       >
//                         <Phone size={17} />
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           ) : (
//             <div className="hp-page-empty">
//               <Search size={32} />
//               <h3>No hospitals found</h3>
//               <p>
//                 Try another search term or choose a
//                 different category.
//               </p>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setSearch("");
//                   setCategory("all");
//                 }}
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )
//         )}
//       </section>
//     </main>
//   );
// }

// export default Hospitals;
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  ArrowRight,
  ChevronDown,
  Building2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import "./Hospitals.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
const HOSPITALS_ENDPOINT = `${API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`}/hospitals`;

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
};

const normalize = (value = "") =>
  String(value).toLowerCase().replace(/[\s_-]/g, "");

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(HOSPITALS_ENDPOINT, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Could not load hospitals (${response.status}).`);
        }

        const result = await response.json();
        const data = Array.isArray(result)
          ? result
          : result.hospitals ?? result.data ?? [];

        setHospitals(
          data.map((hospital) => ({
            ...hospital,
            id: hospital._id || hospital.id,
            name: hospital.hospitalName || hospital.name || "Hospital",
            type: hospital.hospitalType || hospital.type || "",
            location:
              [
                hospital.address?.area,
                hospital.address?.city,
                hospital.address?.state,
              ]
                .filter(Boolean)
                .filter((value, index, arr) => arr.indexOf(value) === index)
                .join(", ") || "Location not provided",
            phone: hospital.phone || "",
            image: getImageUrl(hospital.logo || hospital.images?.[0] || hospital.image),
            specialties: Array.isArray(hospital.specialties)
              ? hospital.specialties
              : [],
            emergencyAvailable: hospital.emergencyAvailable === true,
            createdAt: hospital.createdAt || "",
          }))
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchHospitals();
    return () => controller.abort();
  }, []);

  const filteredHospitals = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = hospitals.filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(term) ||
        hospital.location.toLowerCase().includes(term) ||
        hospital.type.toLowerCase().includes(term) ||
        hospital.specialties.some((item) => item.toLowerCase().includes(term));

      const type = normalize(hospital.type);
      const isMulti = type.includes("multi") || type.includes("multispecial");
      const matchesCategory =
        category === "all" ||
        (category === "multispecialty" && isMulti) ||
        (category === "general" && type.includes("general")) ||
        (category === "specialty" && !isMulti && !type.includes("general"));

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "emergency") {
      result.sort((a, b) => Number(b.emergencyAvailable) - Number(a.emergencyAvailable));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [hospitals, search, category, sortBy]);

  return (
    <main className="hp-page-container">
      <section className="hp-page-header">
        <div className="hp-page-header-content">
          <span className="hp-page-label">HEALTHCARE DIRECTORY</span>
          <h1>
            Find care that’s <span>closer to you.</span>
          </h1>
          <p>
            Explore hospitals, check key services, and contact the right care team.
          </p>
        </div>

        <form className="hp-page-search" onSubmit={(event) => event.preventDefault()}>
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by hospital, location or specialty"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search hospitals"
          />
          {search && (
            <button
              className="hp-search-clear"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      <section className="hp-page-toolbar" aria-label="Hospital filters">
        <div className="hp-location-note">
          <span className="hp-location-icon"><MapPin size={18} /></span>
          <span className="hp-page-location-content">
            <small>Browse hospitals</small>
            <strong>Find a facility for your needs</strong>
          </span>
          <ChevronDown size={16} className="hp-location-chevron" />
        </div>

        <div className="hp-page-categories">
          {[
            { label: "All hospitals", value: "all" },
            { label: "Multi-specialty", value: "multispecialty" },
            { label: "General", value: "general" },
            { label: "Specialty", value: "specialty" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={category === item.value ? "active" : ""}
              onClick={() => setCategory(item.value)}
              aria-pressed={category === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="hp-page-list">
        <div className="hp-page-list-heading">
          <div>
            <span className="hp-section-kicker">DISCOVER CARE</span>
            <h2>Hospitals near you</h2>
            <p>
              {loading
                ? "Finding hospitals…"
                : `${filteredHospitals.length} ${filteredHospitals.length === 1 ? "hospital" : "hospitals"} found`}
            </p>
          </div>

          <label className="hp-sort-control">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort hospitals">
              <option value="newest">Recently added</option>
              <option value="name">Hospital name</option>
              <option value="emergency">Emergency available</option>
            </select>
          </label>
        </div>

        {loading && (
          <div className="hp-page-empty" role="status">
            <div className="hp-loading-mark"><Building2 size={25} /></div>
            <h3>Loading hospitals</h3>
            <p>Fetching hospital details for you.</p>
          </div>
        )}

        {!loading && error && (
          <div className="hp-page-empty hp-error-state">
            <h3>Unable to load hospitals</h3>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}

        {!loading && !error && (
          filteredHospitals.length ? (
            <div className="hp-page-grid">
              {filteredHospitals.map((hospital) => (
                <article className="hp-page-card" key={hospital.id}>
                  <div className="hp-page-image">
                    {hospital.image ? (
                      <img
                        src={hospital.image}
                        alt={`${hospital.name} facility`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove("hp-hidden");
                        }}
                      />
                    ) : null}
                    <div className={`hp-page-image-placeholder ${hospital.image ? "hp-hidden" : ""}`}>
                      <Building2 size={38} strokeWidth={1.5} />
                      <span>Hospital image</span>
                    </div>
                    <span className="hp-image-shade" />
                    {hospital.emergencyAvailable && (
                      <span className="hp-page-badge"><ShieldCheck size={13} /> Emergency care</span>
                    )}
                    {hospital.type && <span className="hp-type-badge">{hospital.type}</span>}
                  </div>

                  <div className="hp-page-card-content">
                    <h3 title={hospital.name}>{hospital.name}</h3>

                    <div className="hp-card-location">
                      <MapPin size={16} />
                      <span>{hospital.location}</span>
                    </div>

                    {hospital.specialties.length > 0 ? (
                      <div className="hp-specialty-list" aria-label="Specialties">
                        {hospital.specialties.slice(0, 3).map((specialty) => (
                          <span className="hp-specialty-chip" key={specialty}>{specialty}</span>
                        ))}
                        {hospital.specialties.length > 3 && (
                          <span className="hp-specialty-more">+{hospital.specialties.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <div className="hp-card-info">
                        <Stethoscope size={15} />
                        <span>Contact hospital for available specialties</span>
                      </div>
                    )}

                    <div className="hp-card-footer">
                      <button
                        type="button"
                        className="hp-page-view-button"
                        onClick={() => window.location.assign(`/hospitals/${hospital.id}`)}
                      >
                        View details <ArrowRight size={16} />
                      </button>
                      <a
                        className={`hp-page-call-button ${!hospital.phone ? "is-disabled" : ""}`}
                        href={hospital.phone ? `tel:${hospital.phone}` : undefined}
                        aria-label={hospital.phone ? `Call ${hospital.name}` : "Phone number unavailable"}
                        aria-disabled={!hospital.phone}
                        onClick={(event) => { if (!hospital.phone) event.preventDefault(); }}
                      >
                        <Phone size={17} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hp-page-empty">
              <div className="hp-loading-mark"><Search size={24} /></div>
              <h3>No hospitals found</h3>
              <p>Try a different name, location, specialty, or category.</p>
              <button type="button" onClick={() => { setSearch(""); setCategory("all"); }}>
                Clear filters
              </button>
            </div>
          )
        )}
      </section>
    </main>
  );
}

export default Hospitals;
