import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, RefreshCw, CheckCircle, XCircle, Clock, Users, Sparkles,
  Eye, Stethoscope, Building2, Mail, Award, X, AlertCircle, Filter,
  TrendingUp, BadgeCheck, ShieldX, UserRound, FileText, CheckCheck,
} from "lucide-react";
import api from "../../services/api";
import "./ManageDoctors.css";

const getDoctorName = (doctor) =>
  doctor.fullname || doctor.name || doctor.fullName || "Unknown Doctor";

const getDoctorId = (doctor) => doctor._id || doctor.id;

const getStatus = (doctor) => {
  const status = doctor.verificationStatus || "Pending";
  if (status === "Verified") return "Approved";
  return status;
};

const getHospitalName = (doctor) => {
  if (typeof doctor.hospitalId === "object") {
    return doctor.hospitalId?.hospitalName || "N/A";
  }
  return doctor.hospitalName || "N/A";
};

const getInitials = (name = "") =>
  name.replace(/^Dr\.?\s+/i, "")
    .split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "D";

const STATUS_CLASS = {
  Approved: "md-approved",
  Pending: "md-pending",
  "Under Review": "md-under-review",
  Rejected: "md-rejected",
};

const STAT_META = [
  { key: "total", label: "Loaded Doctors", icon: Users, tone: "teal" },
  { key: "pending", label: "Pending Review", icon: Clock, tone: "amber" },
  { key: "approved", label: "Approved", icon: BadgeCheck, tone: "green" },
  { key: "rejected", label: "Rejected", icon: ShieldX, tone: "red" },
];

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Modal state
  const [detailsDoctor, setDetailsDoctor] = useState(null);
  const [reviewDoctor, setReviewDoctor] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // "verify" | "reject"
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewError, setReviewError] = useState("");

  const fetchDoctors = useCallback(async (background = false) => {
    try {
      setError("");
      if (background) setRefreshing(true);
      else setLoading(true);

      const response = await api.get("/admin/doctors", { params: { limit: 100 } });
      const list = response.data?.doctors;

      if (!Array.isArray(list)) throw new Error("Invalid doctors response from server.");
      setDoctors(list);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError("Session expired. Please login again.");
      else if (status === 403) setError("Access denied. You are not authorized.");
      else setError(err.response?.data?.message || err.message || "Failed to fetch doctors.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Derived counts
  const counts = useMemo(() => {
    const total = doctors.length;
    const pending = doctors.filter((d) => ["Pending", "Under Review"].includes(getStatus(d))).length;
    const approved = doctors.filter((d) => getStatus(d) === "Approved").length;
    const rejected = doctors.filter((d) => getStatus(d) === "Rejected").length;
    const approvalRate = total ? Math.round((approved / total) * 100) : 0;
    return { total, pending, approved, rejected, approvalRate };
  }, [doctors]);

  // Filtered list
  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const name = getDoctorName(doctor).toLowerCase();
      const email = (doctor.email || "").toLowerCase();
      const specialty = (doctor.specialty || doctor.specialization || "").toLowerCase();
      const hospital = getHospitalName(doctor).toLowerCase();
      const matchesSearch = !q || [name, email, specialty, hospital].some((v) => v.includes(q));
      const matchesStatus = statusFilter === "All" || getStatus(doctor) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [doctors, search, statusFilter]);

  const hasFilters = Boolean(search.trim()) || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  // Open review modal
  const openReview = (doctor, action) => {
    setReviewDoctor(doctor);
    setReviewAction(action);
    setRejectionReason("");
    setReviewError("");
  };

  const closeReview = () => {
    if (processingId !== null) return;
    setReviewDoctor(null);
    setReviewAction(null);
    setRejectionReason("");
    setReviewError("");
  };

  // Submit review
  const submitReview = async () => {
    if (!reviewDoctor || !reviewAction) return;
    const id = getDoctorId(reviewDoctor);
    if (!id) { setError("Doctor ID is missing."); return; }

    let body;
    if (reviewAction === "verify") {
      body = { status: "Approved" };
    } else {
      if (!rejectionReason.trim()) {
        setReviewError("Please provide a reason for rejection.");
        return;
      }
      body = { status: "Rejected", rejectionReason: rejectionReason.trim() };
    }

    try {
      setError("");
      setNotice("");
      setProcessingId(id);

      const response = await api.patch(`/admin/doctors/${id}/review`, body);
      setNotice(response.data?.message || "Doctor review completed successfully.");
      closeReview();
      await fetchDoctors(true);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to update doctor status.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="md-page">
        <div className="md-hero-skeleton" />
        <div className="md-stats-skeleton">
          {[0, 1, 2, 3].map((i) => <div key={i} className="md-skeleton-card" />)}
        </div>
        <div className="md-skeleton-table" />
      </div>
    );
  }

  return (
    <div className="md-page">
      {/* ---------- Hero header ---------- */}
      <div className="md-hero">
        <div className="md-hero-glow" aria-hidden="true" />
        <div className="md-hero-main">
          <div className="md-hero-icon">
            <Stethoscope size={22} />
          </div>
          <div className="md-hero-text">
            <span className="md-eyebrow">
              <Sparkles size={11} /> Administration
            </span>
            <h1>Manage Doctors</h1>
            <p>
              Review doctor registrations and verification status.
              {counts.pending > 0 && (
                <span className="md-hero-highlight">
                  <Clock size={12} /> {counts.pending} pending
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="md-hero-refresh"
          onClick={() => fetchDoctors(true)}
          disabled={refreshing || processingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "md-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="md-alert md-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="md-alert md-success" role="status">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="md-stats">
        {STAT_META.map(({ key, label, icon: Icon, tone }, i) => (
          <div key={key} className="md-stat-card" style={{ "--stagger": `${i * 40}ms` }}>
            <div className={`md-stat-icon md-icon-${tone}`}>
              <Icon size={18} />
            </div>
            <div className="md-stat-body">
              <p>{label}</p>
              <h2>{counts[key]}</h2>
            </div>
            {key === "approved" && counts.total > 0 && (
              <small className="md-stat-meta">{counts.approvalRate}% approved</small>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="md-toolbar">
        <div className="md-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor, email, hospital…"
            aria-label="Search doctors"
          />
          {search && (
            <button
              type="button"
              className="md-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="md-toolbar-right">
          <div className="md-filter-wrap">
            <Filter size={14} className="md-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter doctors by status"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {hasFilters && (
            <button type="button" className="md-clear-filters" onClick={resetFilters}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ---------- Table card ---------- */}
      <div className="md-table-card">
        <div className="md-table-heading">
          <div>
            <h2>Doctor Directory</h2>
            <p>
              {filteredDoctors.length} matching doctor{filteredDoctors.length === 1 ? "" : "s"}
              {hasFilters && <span className="md-filter-hint"> · filtered</span>}
            </p>
          </div>
          <span className="md-table-badge">
            <Users size={11} /> {counts.total} total
          </span>
        </div>

        <div className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Hospital</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="md-empty">
                      <Users size={30} />
                      <h3>No doctors found</h3>
                      <p>
                        {hasFilters
                          ? "Try clearing your search or filter."
                          : "Doctors will appear here once registered."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => {
                  const id = getDoctorId(doctor);
                  const status = getStatus(doctor);
                  const isProcessing = processingId === id;
                  const canReview = ["Pending", "Under Review"].includes(status);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="md-doctor">
                          <div className="md-avatar">
                            {getInitials(getDoctorName(doctor))}
                          </div>
                          <div className="md-doctor-meta">
                            <strong>{getDoctorName(doctor)}</strong>
                            <span>
                              <Mail size={10} /> {doctor.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="md-specialty-pill">
                          {doctor.specialty || doctor.specialization || "N/A"}
                        </span>
                      </td>

                      <td>
                        <span className="md-hospital-cell">
                          <Building2 size={12} /> {getHospitalName(doctor)}
                        </span>
                      </td>

                      <td>
                        <span className="md-exp-cell">
                          <Award size={12} /> {doctor.experience ?? 0} yrs
                        </span>
                      </td>

                      <td>
                        <span className={`md-badge ${STATUS_CLASS[status] || "md-pending"}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="md-actions">
                          <button
                            className="md-view-btn"
                            title="View details"
                            aria-label={`View ${getDoctorName(doctor)}`}
                            onClick={() => setDetailsDoctor(doctor)}
                          >
                            <Eye size={15} />
                          </button>

                          {canReview ? (
                            <>
                              <button
                                className="md-approve"
                                disabled={isProcessing}
                                onClick={() => openReview(doctor, "verify")}
                                title="Approve doctor"
                              >
                                {isProcessing ? (
                                  <RefreshCw size={13} className="md-spin" />
                                ) : (
                                  <><CheckCircle size={13} /> Approve</>
                                )}
                              </button>

                              <button
                                className="md-reject"
                                disabled={isProcessing}
                                onClick={() => openReview(doctor, "reject")}
                                title="Reject doctor"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="md-no-action">
                              <CheckCheck size={12} /> Reviewed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md-footer">
          Showing <strong>{filteredDoctors.length}</strong> of <strong>{counts.total}</strong> doctors
          {hasFilters && <span className="md-footer-hint"> · filters active</span>}
        </div>
      </div>

      {/* ---------- Details modal ---------- */}
      {detailsDoctor && (
        <div className="md-modal-backdrop" onClick={() => setDetailsDoctor(null)}>
          <section
            className="md-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="md-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-hero">
              <div className="md-modal-hero-top">
                <div>
                  <span className="md-modal-eyebrow">Doctor Profile</span>
                  <h3 id="md-details-title">{getDoctorName(detailsDoctor)}</h3>
                </div>
                <button
                  className="md-close-btn"
                  onClick={() => setDetailsDoctor(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="md-modal-hero-body">
                <span className={`md-badge ${STATUS_CLASS[getStatus(detailsDoctor)] || "md-pending"}`}>
                  {getStatus(detailsDoctor)}
                </span>
                <div className="md-modal-hero-stats">
                  <span className="md-hero-stat">
                    <Stethoscope size={12} />
                    <strong>{detailsDoctor.specialty || detailsDoctor.specialization || "N/A"}</strong>
                  </span>
                  <span className="md-hero-stat">
                    <Award size={12} />
                    <strong>{detailsDoctor.experience ?? 0} yrs</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="md-modal-body">
              <div className="md-modal-section">
                <h5>Contact</h5>
                <div className="md-modal-line">
                  <Mail size={14} /> <span>{detailsDoctor.email || "N/A"}</span>
                </div>
              </div>

              <div className="md-modal-section">
                <h5>Hospital</h5>
                <div className="md-modal-line">
                  <Building2 size={14} /> <span>{getHospitalName(detailsDoctor)}</span>
                </div>
              </div>

              {detailsDoctor.rejectionReason && (
                <div className="md-modal-section">
                  <h5>Rejection Reason</h5>
                  <div className="md-rejection-box">
                    <AlertCircle size={14} />
                    <p>{detailsDoctor.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md-modal-actions">
              {["Pending", "Under Review"].includes(getStatus(detailsDoctor)) && (
                <>
                  <button
                    className="md-approve-lg"
                    onClick={() => { setDetailsDoctor(null); openReview(detailsDoctor, "verify"); }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    className="md-reject-lg"
                    onClick={() => { setDetailsDoctor(null); openReview(detailsDoctor, "reject"); }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              <button className="md-secondary-btn" onClick={() => setDetailsDoctor(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ---------- Review modal ---------- */}
      {reviewDoctor && reviewAction && (
        <div className="md-modal-backdrop" onClick={closeReview}>
          <section
            className="md-modal md-modal-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="md-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-hero">
              <div className="md-modal-hero-top">
                <div>
                  <span className="md-modal-eyebrow">
                    {reviewAction === "verify" ? "Approve Doctor" : "Reject Doctor"}
                  </span>
                  <h3 id="md-review-title">{getDoctorName(reviewDoctor)}</h3>
                </div>
                <button
                  className="md-close-btn"
                  onClick={closeReview}
                  aria-label="Close"
                  disabled={processingId !== null}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="md-modal-body">
              {reviewAction === "verify" ? (
                <p className="md-review-text">
                  Approving <strong>{getDoctorName(reviewDoctor)}</strong> will grant
                  them access to accept patient appointments. This action can be
                  reverted later by rejecting the doctor.
                </p>
              ) : (
                <>
                  <p className="md-review-text">
                    Please provide a clear reason for rejecting{" "}
                    <strong>{getDoctorName(reviewDoctor)}</strong>. This will be
                    shared with the doctor.
                  </p>

                  <div className="md-field">
                    <label htmlFor="md-rejection-reason">Rejection Reason *</label>
                    <textarea
                      id="md-rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => { setRejectionReason(e.target.value); setReviewError(""); }}
                      rows={4}
                      placeholder="e.g. Medical registration number could not be verified."
                      autoFocus
                    />
                  </div>
                </>
              )}

              {reviewError && (
                <div className="md-modal-error" role="alert">
                  <AlertCircle size={14} /> {reviewError}
                </div>
              )}
            </div>

            <div className="md-modal-actions">
              <button
                className="md-secondary-btn"
                onClick={closeReview}
                disabled={processingId !== null}
              >
                Cancel
              </button>
              <button
                className={reviewAction === "verify" ? "md-approve-lg" : "md-reject-lg"}
                onClick={submitReview}
                disabled={processingId !== null}
              >
                {processingId !== null ? (
                  <><RefreshCw size={14} className="md-spin" /> Saving…</>
                ) : reviewAction === "verify" ? (
                  <><CheckCircle size={14} /> Approve</>
                ) : (
                  <><XCircle size={14} /> Reject</>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}