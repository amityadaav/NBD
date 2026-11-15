import { useCallback, useEffect, useState } from "react";
import {
  Search, Stethoscope, Users, CheckCircle, Clock, Eye, Phone, Mail, X,
  Plus, Pencil, Trash2, Power, ChevronLeft, ChevronRight, AlertCircle,
  BadgeCheck, Filter, IndianRupee, Calendar, UserX, RefreshCw, Sparkles,
  GraduationCap, Award,
} from "lucide-react";
import api from "../../services/api";
import "./HospitalDoctors.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LIMIT = 10;

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  qualification: "",
  experience: "0",
  consultationFee: "",
  medicalRegistrationNumber: "",
  availableDays: [],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getStatusClass = (status) => {
  switch (status) {
    case "Approved": return "hd-status-verified";
    case "Pending": return "hd-status-pending";
    case "Rejected": return "hd-status-rejected";
    default: return "";
  }
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "N/A";
  return `₹${num.toLocaleString("en-IN")}`;
};

function HospitalDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState({ total: 0, approved: 0, pending: 0 });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [busy, setBusy] = useState(false);

  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter !== "All") params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get("/hospital-admin/doctors", { params });
      setDoctors(data.doctors || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load doctors."));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  const fetchCounts = useCallback(async () => {
    const results = await Promise.allSettled([
      api.get("/hospital-admin/doctors", { params: { limit: 1 } }),
      api.get("/hospital-admin/doctors", { params: { limit: 1, status: "Approved" } }),
      api.get("/hospital-admin/doctors", { params: { limit: 1, status: "Pending" } }),
    ]);
    const read = (r) => (r.status === "fulfilled" ? Number(r.value.data?.total ?? 0) : 0);
    setCounts({ total: read(results[0]), approved: read(results[1]), pending: read(results[2]) });
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const refreshAll = async () => {
    await Promise.all([fetchDoctors(), fetchCounts()]);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setFormMode("add");
  };

  const openEdit = (doctor) => {
    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialty: doctor.specialty || "",
      qualification: doctor.qualification || "",
      experience: String(doctor.experience ?? 0),
      consultationFee: String(doctor.consultationFee ?? ""),
      medicalRegistrationNumber: doctor.medicalRegistrationNumber || "",
      availableDays: doctor.availableDays || [],
    });
    setFormError("");
    setSelectedDoctor(doctor);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (saving) return;
    setFormMode(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFormError("");
  };

  const toggleDay = (day) => {
    setForm((previous) => ({
      ...previous,
      availableDays: previous.availableDays.includes(day)
        ? previous.availableDays.filter((d) => d !== day)
        : [...previous.availableDays, day],
    }));
    setFormError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (form.availableDays.length === 0) {
      setFormError("Select at least one available day.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      specialty: form.specialty.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience || 0),
      consultationFee: Number(form.consultationFee),
      availableDays: DAYS.filter((d) => form.availableDays.includes(d)),
    };

    setSaving(true);
    setFormError("");

    try {
      let response;
      if (formMode === "add") {
        payload.medicalRegistrationNumber = form.medicalRegistrationNumber.trim();
        response = await api.post("/hospital-admin/doctors", payload);
      } else {
        response = await api.patch(`/hospital-admin/doctors/${selectedDoctor._id}`, payload);
      }
      setNotice(response.data?.message || "Saved successfully.");
      setFormMode(null);
      setSelectedDoctor(null);
      await refreshAll();
    } catch (err) {
      setFormError(getErrorMessage(err, "Unable to save doctor."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (doctor) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.patch(`/hospital-admin/doctors/${doctor._id}/status`, {
        isActive: !doctor.isActive,
      });
      setNotice(data.message || "Doctor updated.");
      setSelectedDoctor(data.doctor || null);
      await refreshAll();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update doctor status."));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (doctor) => {
    if (busy) return;
    if (!window.confirm(`Remove ${doctor.name} from your hospital? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.delete(`/hospital-admin/doctors/${doctor._id}`);
      setNotice(data.message || "Doctor removed.");
      setSelectedDoctor(null);
      await refreshAll();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to remove doctor."));
    } finally {
      setBusy(false);
    }
  };

  const hasActiveFilters = statusFilter !== "All" || debouncedSearch;

  return (
    <div className="hd-page">
      {/* ---------- Header ---------- */}
      <div className="hd-header">
        <div className="hd-header-left">
          <span className="hd-eyebrow">
            <Stethoscope size={12} /> Team Management
          </span>
          <h2>My Doctors</h2>
          <p>View and manage doctors associated with your hospital.</p>
        </div>

        <div className="hd-header-actions">
          <button
            type="button"
            className="hd-icon-btn"
            onClick={refreshAll}
            disabled={loading}
            aria-label="Refresh doctors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "hd-spin" : ""} />
          </button>
          <button type="button" className="hd-add-btn" onClick={openAdd}>
            <Plus size={17} /> Add Doctor
          </button>
        </div>
      </div>

      {error && (
        <div className="hd-message hd-message-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="hd-message hd-message-success" role="status">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="hd-stats">
        <div className="hd-stat-card">
          <div className="hd-stat-icon hd-stat-teal"><Users size={22} /></div>
          <div className="hd-stat-body">
            <p>Total Doctors</p>
            <h3>{counts.total}</h3>
          </div>
        </div>

        <div className="hd-stat-card">
          <div className="hd-stat-icon hd-stat-green"><BadgeCheck size={22} /></div>
          <div className="hd-stat-body">
            <p>Approved Doctors</p>
            <h3>{counts.approved}</h3>
          </div>
        </div>

        <div className="hd-stat-card">
          <div className="hd-stat-icon hd-stat-orange"><Clock size={22} /></div>
          <div className="hd-stat-body">
            <p>Pending Approval</p>
            <h3>{counts.pending}</h3>
          </div>
        </div>
      </div>

      {/* ---------- Panel ---------- */}
      <section className="hd-panel">
        <div className="hd-panel-heading">
          <div>
            <h3>Doctors Directory</h3>
            <p>
              {total} doctor{total === 1 ? "" : "s"} found
              {hasActiveFilters && <span className="hd-filter-hint"> · filtered</span>}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="hd-clear-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setPage(1);
              }}
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        <div className="hd-filters">
          <div className="hd-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name or specialty…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search doctors"
            />
            {search && (
              <button
                type="button"
                className="hd-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="hd-select-wrap">
            <Filter size={15} className="hd-select-icon" />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="hd-table-wrapper">
          <table className="hd-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hd-skeleton-row">
                    <td colSpan="6"><div className="hd-skeleton-line" /></td>
                  </tr>
                ))
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="hd-empty">
                    <div className="hd-empty-state">
                      <UserX size={32} />
                      <p>No doctors found</p>
                      <small>Try changing your search or filters.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <div className="hd-doctor-cell">
                        <div className="hd-doctor-avatar">
                          {getInitials(doctor.name)}
                        </div>
                        <div className="hd-doctor-meta">
                          <strong>{doctor.name}</strong>
                          <small>{doctor.email || "No email"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="hd-specialty-pill">{doctor.specialty}</span>
                    </td>

                    <td>
                      <div className="hd-experience">
                        <Award size={14} />
                        <span>{doctor.experience} yrs</span>
                      </div>
                    </td>

                    <td>
                      {doctor.phone ? (
                        <a className="hd-phone-link" href={`tel:${doctor.phone}`}>
                          <Phone size={14} /> {doctor.phone}
                        </a>
                      ) : (
                        <span className="hd-muted-text">N/A</span>
                      )}
                    </td>

                    <td>
                      <span className={`hd-status ${getStatusClass(doctor.verificationStatus)}`}>
                        {doctor.verificationStatus}
                      </span>
                      {doctor.verificationStatus === "Approved" && (
                        <small className={`hd-active-text ${doctor.isActive ? "hd-active-on" : "hd-active-off"}`}>
                          <span className="hd-active-dot" /> {doctor.isActive ? "Active" : "Inactive"}
                        </small>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="hd-view-btn"
                        onClick={() => setSelectedDoctor(doctor)}
                        aria-label={`View ${doctor.name}`}
                      >
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="hd-pager">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="hd-pager-label">
              Page <strong>{page}</strong> of {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ---------- Details modal ---------- */}
      {selectedDoctor && formMode === null && (
        <div className="hd-modal-backdrop" onClick={() => setSelectedDoctor(null)}>
          <section
            className="hd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hd-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hd-modal-hero">
              <div className="hd-modal-avatar-wrap">
                <div className="hd-modal-avatar">
                  {getInitials(selectedDoctor.name)}
                </div>
                <span className={`hd-modal-badge ${getStatusClass(selectedDoctor.verificationStatus)}`}>
                  {selectedDoctor.verificationStatus}
                </span>
              </div>
              <button
                type="button"
                className="hd-close-btn hd-close-floating"
                onClick={() => setSelectedDoctor(null)}
                aria-label="Close doctor details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="hd-modal-body">
              <h4>{selectedDoctor.name}</h4>
              <p className="hd-modal-specialty">{selectedDoctor.specialty}</p>

              <div className="hd-quick-stats">
                <div className="hd-quick-stat">
                  <Award size={16} />
                  <strong>{selectedDoctor.experience}</strong>
                  <small>Years</small>
                </div>
                <div className="hd-quick-stat">
                  <IndianRupee size={16} />
                  <strong>{formatCurrency(selectedDoctor.consultationFee)}</strong>
                  <small>Fee</small>
                </div>
                <div className="hd-quick-stat">
                  <Calendar size={16} />
                  <strong>{(selectedDoctor.availableDays || []).length}</strong>
                  <small>Days</small>
                </div>
              </div>

              <div className="hd-detail-section">
                <h5>Contact</h5>
                <div className="hd-detail-row">
                  <Mail size={16} /><span>{selectedDoctor.email || "No email"}</span>
                </div>
                <div className="hd-detail-row">
                  <Phone size={16} /><span>{selectedDoctor.phone || "No phone"}</span>
                </div>
              </div>

              <div className="hd-detail-section">
                <h5>Professional Details</h5>
                <div className="hd-detail-row">
                  <GraduationCap size={16} />
                  <span>{selectedDoctor.qualification || "Not specified"}</span>
                </div>
                <div className="hd-detail-row">
                  <BadgeCheck size={16} />
                  <span>
                    Registration: {selectedDoctor.medicalRegistrationNumber || "N/A"}
                  </span>
                </div>
                <div className="hd-detail-row">
                  <Calendar size={16} />
                  <span>
                    {(selectedDoctor.availableDays || []).join(", ") || "No days set"}
                  </span>
                </div>
              </div>

              {selectedDoctor.verificationStatus === "Rejected" && selectedDoctor.rejectionReason && (
                <div className="hd-rejection">
                  <strong>Rejection reason:</strong> {selectedDoctor.rejectionReason}
                </div>
              )}
              {selectedDoctor.verificationStatus === "Pending" && (
                <div className="hd-hint">
                  <Clock size={14} /> Waiting for Main Admin approval.
                </div>
              )}
            </div>

            <div className="hd-modal-actions">
              <button
                type="button"
                className="hd-secondary-btn"
                disabled={busy}
                onClick={() => openEdit(selectedDoctor)}
              >
                <Pencil size={15} /> Edit
              </button>

              {selectedDoctor.verificationStatus === "Approved" && (
                <button
                  type="button"
                  className={selectedDoctor.isActive ? "hd-reject-btn" : "hd-verify-btn"}
                  disabled={busy}
                  onClick={() => handleToggleActive(selectedDoctor)}
                >
                  <Power size={15} /> {selectedDoctor.isActive ? "Deactivate" : "Activate"}
                </button>
              )}

              <button
                type="button"
                className="hd-reject-btn"
                disabled={busy}
                onClick={() => handleDelete(selectedDoctor)}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ---------- Add / edit modal ---------- */}
      {formMode && (
        <div className="hd-modal-backdrop" onClick={closeForm}>
          <section
            className="hd-modal hd-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hd-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hd-modal-header">
              <div>
                <h3 id="hd-form-title">
                  <Sparkles size={16} className="hd-title-icon" />
                  {formMode === "add" ? "Add Doctor" : "Edit Doctor"}
                </h3>
                <p>
                  {formMode === "add"
                    ? "New doctors need Main Admin approval before they can be activated."
                    : "Registration number cannot be changed."}
                </p>
              </div>
              <button type="button" className="hd-close-btn" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="hd-form-grid">
                <div className="hd-field">
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" name="name" value={form.name} onChange={handleFormChange} required />
                </div>

                <div className="hd-field">
                  <label htmlFor="specialty">Specialty *</label>
                  <input id="specialty" name="specialty" value={form.specialty} onChange={handleFormChange} required />
                </div>

                <div className="hd-field">
                  <label htmlFor="qualification">Qualification *</label>
                  <input
                    id="qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleFormChange}
                    placeholder="MBBS, MD"
                    required
                  />
                </div>

                <div className="hd-field">
                  <label htmlFor="medicalRegistrationNumber">Medical Registration No. *</label>
                  <input
                    id="medicalRegistrationNumber"
                    name="medicalRegistrationNumber"
                    value={form.medicalRegistrationNumber}
                    onChange={handleFormChange}
                    readOnly={formMode === "edit"}
                    required
                  />
                </div>

                <div className="hd-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} />
                </div>

                <div className="hd-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Enter a 10-digit phone number"
                    value={form.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="hd-field">
                  <label htmlFor="experience">Experience (years)</label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="hd-field">
                  <label htmlFor="consultationFee">Consultation Fee (₹) *</label>
                  <input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    min="0"
                    value={form.consultationFee}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="hd-field hd-full-width">
                  <label>Available Days *</label>
                  <div className="hd-days">
                    {DAYS.map((day) => (
                      <label
                        key={day}
                        className={`hd-day ${form.availableDays.includes(day) ? "hd-day-on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.availableDays.includes(day)}
                          onChange={() => toggleDay(day)}
                        />
                        {day.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="hd-message hd-message-error hd-message-inline" role="alert">
                  <AlertCircle size={15} /> <span>{formError}</span>
                </div>
              )}

              <div className="hd-modal-actions">
                <button type="button" className="hd-secondary-btn" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="hd-verify-btn" disabled={saving}>
                  {saving ? (
                    <><RefreshCw size={14} className="hd-spin" /> Saving…</>
                  ) : formMode === "add" ? (
                    <><Plus size={14} /> Add Doctor</>
                  ) : (
                    <><CheckCircle size={14} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default HospitalDoctors;