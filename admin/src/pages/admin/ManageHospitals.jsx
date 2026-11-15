import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Hospital, CheckCircle, XCircle, Clock, Eye, RefreshCw, X,
  FileText, Sparkles, MapPin, Phone, Mail, Building2, TrendingUp,
  AlertCircle, Filter, ChevronLeft, ChevronRight, BadgeCheck, ShieldX,
  CalendarDays, Users, BedDouble, UserRound, ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import "./ManageHospitals.css";

const DISPLAY = {
  Verified: "Approved",
  Pending: "Pending",
  "Under Review": "Pending",
  Rejected: "Rejected",
};

const getLocation = (a) =>
  a && typeof a === "object"
    ? [a.area, a.city, a.state].filter(Boolean).join(", ") || "N/A"
    : "N/A";

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return "Session expired. Please log in again.";
  if (error.response?.status === 403) return "Access denied. Please log in with a super_admin account.";
  if (error.code === "ERR_NETWORK") return "Cannot connect to the backend.";
  return error.message || fallback;
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "H";

const STATUS_CLASS = {
  Pending: "mh-pending",
  Approved: "mh-approved",
  Rejected: "mh-rejected",
};

const STAT_META = [
  { key: "total", label: "Total Hospitals", icon: Hospital, tone: "teal" },
  { key: "pending", label: "Pending", icon: Clock, tone: "amber" },
  { key: "verified", label: "Approved", icon: BadgeCheck, tone: "green" },
  { key: "rejected", label: "Rejected", icon: ShieldX, tone: "red" },
];

function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Review modal
  const [reviewHospital, setReviewHospital] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // "Verified" | "Rejected"
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchHospitals = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/hospitals", {
        params: { status: filter, search: query, page, limit: 20 },
      });
      setHospitals(data.hospitals || []);
      setStats(data.statistics || { total: 0, pending: 0, verified: 0, rejected: 0 });
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch hospitals."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query, page]);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const isPending = (h) => ["Pending", "Under Review"].includes(h.verificationStatus);
  const hasFilters = Boolean(query) || filter !== "All";

  const resetFilters = () => {
    setSearch("");
    setFilter("All");
    setPage(1);
  };

  // Open review modal
  const openReview = (hospital, action) => {
    setReviewHospital(hospital);
    setReviewAction(action);
    setRejectionReason("");
    setReviewError("");
  };

  const closeReview = () => {
    if (updatingId !== null) return;
    setReviewHospital(null);
    setReviewAction(null);
    setRejectionReason("");
    setReviewError("");
  };

  const submitReview = async () => {
    if (!reviewHospital || !reviewAction) return;

    if (reviewAction === "Rejected" && !rejectionReason.trim()) {
      setReviewError("Please provide a reason for rejection.");
      return;
    }

    setUpdatingId(reviewHospital._id);
    setError("");
    setNotice("");
    setReviewError("");

    try {
      const body = { status: reviewAction };
      if (reviewAction === "Rejected") body.rejectionReason = rejectionReason.trim();

      const { data } = await api.patch(`/admin/hospitals/${reviewHospital._id}/review`, body);
      setNotice(data.message || "Hospital reviewed successfully.");
      closeReview();
      setSelected(null);
      await fetchHospitals(true);
    } catch (err) {
      setReviewError(getErrorMessage(err, "Unable to update hospital status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const viewHospital = async (hospital) => {
    setError("");
    setDetailsLoading(true);
    setSelected({ ...hospital, _loading: true });
    try {
      const { data } = await api.get(`/admin/hospitals/${hospital._id}`);
      setSelected(data.hospital);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load hospital details."));
      setSelected(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDocument = async (id, type, index = 0) => {
    try {
      const response = await api.get(`/admin/hospitals/${id}/document`, {
        params: { type, index },
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError("Unable to open this document. The file may be missing.");
    }
  };

  const approvalRate = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.verified / stats.total) * 100);
  }, [stats]);

  return (
    <div className="manage-hospitals-page">
      {/* ---------- Hero header ---------- */}
      <div className="mh-hero">
        <div className="mh-hero-glow" aria-hidden="true" />
        <div className="mh-hero-main">
          <div className="mh-hero-icon">
            <Building2 size={22} />
          </div>
          <div className="mh-hero-text">
            <span className="mh-eyebrow">
              <Sparkles size={11} /> Administration
            </span>
            <h1>Manage Hospitals</h1>
            <p>
              Review and manage hospital registrations.
              {stats.pending > 0 && (
                <span className="mh-hero-highlight">
                  <Clock size={12} /> {stats.pending} pending
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="mh-hero-refresh"
          onClick={() => fetchHospitals(true)}
          disabled={loading || refreshing || updatingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "mh-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mh-alert mh-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
          <button type="button" className="mh-alert-retry" onClick={() => fetchHospitals()} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      {notice && (
        <div className="mh-alert mh-success" role="status">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="mh-stats">
        {STAT_META.map(({ key, label, icon: Icon, tone }, i) => (
          <div key={key} className="mh-stat-card" style={{ "--stagger": `${i * 40}ms` }}>
            <div className={`mh-stat-icon mh-icon-${tone}`}>
              <Icon size={18} />
            </div>
            <div className="mh-stat-body">
              <p>{label}</p>
              <h2>{loading ? "…" : stats[key]}</h2>
            </div>
            {key === "verified" && stats.total > 0 && (
              <small className="mh-stat-meta">{approvalRate}% approved</small>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Card ---------- */}
      <div className="mh-card">
        <div className="mh-toolbar">
          <div className="mh-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search hospital, email, phone or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search hospitals"
            />
            {search && (
              <button type="button" className="mh-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="mh-toolbar-right">
            <div className="mh-filter-wrap">
              <Filter size={14} className="mh-filter-icon" />
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                aria-label="Filter hospitals by status"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {hasFilters && (
              <button type="button" className="mh-clear-filters" onClick={resetFilters}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="mh-table-wrapper">
          <table className="mh-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="mh-skeleton-row">
                    <td colSpan="5"><div className="mh-skeleton-line" /></td>
                  </tr>
                ))
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="mh-empty">
                    <div className="mh-empty-state">
                      <Hospital size={30} />
                      <p>No hospitals found</p>
                      <small>
                        {hasFilters
                          ? "Try clearing your search or filter."
                          : "Hospital registrations will appear here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => {
                  const label = DISPLAY[hospital.verificationStatus] || "Pending";
                  return (
                    <tr key={hospital._id}>
                      <td>
                        <div className="mh-hospital-cell">
                          <div className="mh-hospital-avatar">
                            {getInitials(hospital.hospitalName)}
                          </div>
                          <div className="mh-hospital-meta">
                            <strong>{hospital.hospitalName}</strong>
                            <small><Mail size={10} /> {hospital.email || "N/A"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mh-location-cell">
                          <MapPin size={12} /> {getLocation(hospital.address)}
                        </span>
                      </td>
                      <td>
                        <span className="mh-phone-cell">
                          <Phone size={12} /> {hospital.phone || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`mh-status ${STATUS_CLASS[label] || "mh-pending"}`}>
                          {label}
                        </span>
                      </td>
                      <td>
                        <div className="mh-actions">
                          <button
                            type="button"
                            className="mh-view-btn"
                            title="View hospital"
                            aria-label={`View ${hospital.hospitalName}`}
                            onClick={() => viewHospital(hospital)}
                          >
                            <Eye size={15} />
                          </button>

                          {isPending(hospital) && (
                            <>
                              <button
                                type="button"
                                className="mh-approve-btn"
                                title="Approve hospital"
                                disabled={updatingId !== null}
                                onClick={() => openReview(hospital, "Verified")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                type="button"
                                className="mh-reject-btn"
                                title="Reject hospital"
                                disabled={updatingId !== null}
                                onClick={() => openReview(hospital, "Rejected")}
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}

                          {updatingId === hospital._id && (
                            <RefreshCw size={13} className="mh-spin mh-saving" />
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

        <div className="mh-footer">
          <span>
            Showing <strong>{hospitals.length}</strong> of <strong>{pagination.total}</strong> hospitals
            {hasFilters && <span className="mh-footer-hint"> · filters active</span>}
          </span>

          {pagination.totalPages > 1 && (
            <div className="mh-pager">
              <button
                type="button"
                className="mh-pager-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="mh-pager-label">
                Page <strong>{pagination.page}</strong> of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                className="mh-pager-btn"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Details modal ---------- */}
      {selected && (
        <div className="mh-modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="mh-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mh-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mh-modal-hero">
              <div className="mh-modal-hero-top">
                <div>
                  <span className="mh-modal-eyebrow">Hospital Profile</span>
                  <h3 id="mh-details-title">{selected.hospitalName}</h3>
                </div>
                <button
                  className="mh-close-btn"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mh-modal-hero-body">
                <span className={`mh-status ${STATUS_CLASS[DISPLAY[selected.verificationStatus]] || "mh-pending"}`}>
                  {DISPLAY[selected.verificationStatus] || selected.verificationStatus}
                </span>
                <div className="mh-modal-hero-stats">
                  <span className="mh-hero-stat">
                    <MapPin size={12} />
                    <strong>{getLocation(selected.address)}</strong>
                  </span>
                  {selected.hospitalType && (
                    <span className="mh-hero-stat">
                      <Building2 size={12} />
                      <strong>{selected.hospitalType}</strong>
                    </span>
                  )}
                  {selected.totalBeds != null && (
                    <span className="mh-hero-stat">
                      <BedDouble size={12} />
                      <strong>{selected.totalBeds} beds</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mh-modal-body">
              {detailsLoading ? (
                <div className="mh-details-loading">
                  <RefreshCw size={18} className="mh-spin" /> Loading details…
                </div>
              ) : (
                <>
                  <div className="mh-modal-section">
                    <h5>Contact</h5>
                    <div className="mh-modal-line"><Mail size={14} /><span>{selected.email || "N/A"}</span></div>
                    <div className="mh-modal-line"><Phone size={14} /><span>{selected.phone || "N/A"}</span></div>
                  </div>

                  <div className="mh-modal-section">
                    <h5>Registration</h5>
                    <div className="mh-modal-line">
                      <BadgeCheck size={14} />
                      <span>{selected.registrationNumber || "N/A"}</span>
                    </div>
                    <div className="mh-modal-line">
                      <CalendarDays size={14} />
                      <span>
                        Applied {selected.createdAt
                          ? new Date(selected.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {selected.owner && (
                    <div className="mh-modal-section">
                      <h5>Owner</h5>
                      <div className="mh-modal-line">
                        <UserRound size={14} />
                        <span>
                          {selected.owner.name || "N/A"}
                          {selected.owner.designation ? ` · ${selected.owner.designation}` : ""}
                        </span>
                      </div>
                    </div>
                  )}

                  {selected.specialties?.length > 0 && (
                    <div className="mh-modal-section">
                      <h5>Specialties</h5>
                      <div className="mh-tag-list">
                        {selected.specialties.map((s) => (
                          <span key={s} className="mh-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.facilities?.length > 0 && (
                    <div className="mh-modal-section">
                      <h5>Facilities</h5>
                      <div className="mh-tag-list">
                        {selected.facilities.map((s) => (
                          <span key={s} className="mh-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.verificationStatus === "Rejected" && selected.rejectionReason && (
                    <div className="mh-modal-section">
                      <h5>Rejection Reason</h5>
                      <div className="mh-rejection-box">
                        <AlertCircle size={14} />
                        <p>{selected.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="mh-modal-section">
                    <h5>Documents</h5>
                    <div className="mh-doc-list">
                      {selected.documents?.registrationCertificate && (
                        <button
                          type="button"
                          className="mh-doc-btn"
                          onClick={() => openDocument(selected._id, "registrationCertificate")}
                        >
                          <FileText size={14} /> Registration Certificate <ExternalLink size={11} />
                        </button>
                      )}
                      {selected.documents?.ownerIdProof && (
                        <button
                          type="button"
                          className="mh-doc-btn"
                          onClick={() => openDocument(selected._id, "ownerIdProof")}
                        >
                          <FileText size={14} /> Owner ID Proof <ExternalLink size={11} />
                        </button>
                      )}
                      {(selected.documents?.additionalDocuments || []).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className="mh-doc-btn"
                          onClick={() => openDocument(selected._id, "additional", i)}
                        >
                          <FileText size={14} /> Additional {i + 1} <ExternalLink size={11} />
                        </button>
                      ))}
                      {!selected.documents?.registrationCertificate &&
                        !selected.documents?.ownerIdProof &&
                        !(selected.documents?.additionalDocuments || []).length && (
                          <p className="mh-no-docs">No documents uploaded.</p>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!detailsLoading && isPending(selected) && (
              <div className="mh-modal-actions">
                <button
                  type="button"
                  className="mh-reject-lg"
                  disabled={updatingId !== null}
                  onClick={() => { setSelected(null); openReview(selected, "Rejected"); }}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  type="button"
                  className="mh-approve-lg"
                  disabled={updatingId !== null}
                  onClick={() => { setSelected(null); openReview(selected, "Verified"); }}
                >
                  <CheckCircle size={14} /> Approve
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---------- Review modal ---------- */}
      {reviewHospital && reviewAction && (
        <div className="mh-modal-backdrop" onClick={closeReview}>
          <section
            className="mh-modal mh-modal-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mh-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mh-modal-hero">
              <div className="mh-modal-hero-top">
                <div>
                  <span className="mh-modal-eyebrow">
                    {reviewAction === "Verified" ? "Approve Hospital" : "Reject Hospital"}
                  </span>
                  <h3 id="mh-review-title">{reviewHospital.hospitalName}</h3>
                </div>
                <button
                  className="mh-close-btn"
                  onClick={closeReview}
                  aria-label="Close"
                  disabled={updatingId !== null}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mh-modal-body">
              {reviewAction === "Verified" ? (
                <p className="mh-review-text">
                  Approving <strong>{reviewHospital.hospitalName}</strong> will grant them access to
                  manage doctors and accept appointments. This action can be reverted later.
                </p>
              ) : (
                <>
                  <p className="mh-review-text">
                    Please provide a clear reason for rejecting <strong>{reviewHospital.hospitalName}</strong>.
                    This will be shared with the hospital admin.
                  </p>

                  <div className="mh-field">
                    <label htmlFor="mh-rejection-reason">Rejection Reason *</label>
                    <textarea
                      id="mh-rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => { setRejectionReason(e.target.value); setReviewError(""); }}
                      rows={4}
                      placeholder="e.g. Registration certificate could not be verified."
                      autoFocus
                    />
                  </div>
                </>
              )}

              {reviewError && (
                <div className="mh-modal-error" role="alert">
                  <AlertCircle size={14} /> {reviewError}
                </div>
              )}
            </div>

            <div className="mh-modal-actions">
              <button
                className="mh-secondary-btn"
                onClick={closeReview}
                disabled={updatingId !== null}
              >
                Cancel
              </button>
              <button
                className={reviewAction === "Verified" ? "mh-approve-lg" : "mh-reject-lg"}
                onClick={submitReview}
                disabled={updatingId !== null}
              >
                {updatingId !== null ? (
                  <><RefreshCw size={14} className="mh-spin" /> Saving…</>
                ) : reviewAction === "Verified" ? (
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

export default ManageHospitals;