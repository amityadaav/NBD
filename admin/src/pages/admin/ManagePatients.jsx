import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Users, Eye, UserCheck, UserX, RefreshCw, Sparkles, Mail, Phone,
  CalendarDays, Clock, AlertCircle, CheckCircle, Filter, X, ChevronLeft,
  ChevronRight, UserRound, Activity, TrendingUp, UserCog, Ban,
} from "lucide-react";
import api from "../../services/api";
import "./ManagePatients.css";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  (error.response?.status === 403
    ? "Access denied. Super admin only."
    : error.message || fallback);

const fmt = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const timeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmt(value);
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "P";

const STAT_META = [
  { key: "total", label: "Total Patients", icon: Users, tone: "teal" },
  { key: "active", label: "Active Patients", icon: UserCheck, tone: "green" },
  { key: "inactive", label: "Inactive Patients", icon: UserX, tone: "red" },
];

function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Toggle confirmation modal
  const [togglePatient, setTogglePatient] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPatients = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/patients", {
        params: { status: filter, search: query, page, limit: 20 },
      });
      setPatients(data.patients || []);
      setStats(data.statistics || { total: 0, active: 0, inactive: 0 });
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch patients."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const hasFilters = Boolean(query) || filter !== "All";

  const resetFilters = () => {
    setSearch("");
    setFilter("All");
    setPage(1);
  };

  const openToggle = (patient) => {
    setTogglePatient(patient);
  };

  const closeToggle = () => {
    if (updatingId !== null) return;
    setTogglePatient(null);
  };

  const confirmToggle = async () => {
    if (!togglePatient) return;

    const next = !togglePatient.isActive;
    setUpdatingId(togglePatient._id);
    setError("");
    setNotice("");

    try {
      const { data } = await api.patch(
        `/admin/patients/${togglePatient._id}/status`,
        { isActive: next }
      );
      setNotice(data.message || `${togglePatient.fullname} ${next ? "activated" : "deactivated"}.`);
      setTogglePatient(null);
      // Keep selected in sync
      setSelected((prev) =>
        prev && prev._id === togglePatient._id ? { ...prev, isActive: next } : prev
      );
      await fetchPatients(true);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update patient."));
      setTogglePatient(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeRate = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.active / stats.total) * 100);
  }, [stats]);

  return (
    <div className="manage-patients-page">
      {/* ---------- Hero header ---------- */}
      <div className="mp-hero">
        <div className="mp-hero-glow" aria-hidden="true" />
        <div className="mp-hero-main">
          <div className="mp-hero-icon">
            <UserRound size={22} />
          </div>
          <div className="mp-hero-text">
            <span className="mp-eyebrow">
              <Sparkles size={11} /> Administration
            </span>
            <h1>Manage Patients</h1>
            <p>
              View and manage registered patient accounts.
              {stats.inactive > 0 && (
                <span className="mp-hero-highlight">
                  <Ban size={12} /> {stats.inactive} inactive
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="mp-hero-refresh"
          onClick={() => fetchPatients(true)}
          disabled={loading || refreshing || updatingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "mp-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mp-alert mp-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="mp-alert mp-success" role="status">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="mp-stats">
        {STAT_META.map(({ key, label, icon: Icon, tone }, i) => (
          <div key={key} className="mp-stat-card" style={{ "--stagger": `${i * 40}ms` }}>
            <div className={`mp-stat-icon mp-icon-${tone}`}>
              <Icon size={18} />
            </div>
            <div className="mp-stat-body">
              <p>{label}</p>
              <h2>{loading ? "…" : stats[key]}</h2>
            </div>
            {key === "active" && stats.total > 0 && (
              <small className="mp-stat-meta">{activeRate}% active</small>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Card ---------- */}
      <div className="mp-card">
        <div className="mp-toolbar">
          <div className="mp-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search patients"
            />
            {search && (
              <button
                type="button"
                className="mp-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="mp-toolbar-right">
            <div className="mp-filter-wrap">
              <Filter size={14} className="mp-filter-icon" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter patients by status"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {hasFilters && (
              <button type="button" className="mp-clear-filters" onClick={resetFilters}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Appointments</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="mp-skeleton-row">
                    <td colSpan="6"><div className="mp-skeleton-line" /></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="mp-empty">
                    <div className="mp-empty-state">
                      <Users size={30} />
                      <p>No patients found</p>
                      <small>
                        {hasFilters
                          ? "Try clearing your search or filter."
                          : "Registered patients will appear here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const status = patient.isActive ? "Active" : "Inactive";
                  return (
                    <tr key={patient._id}>
                      <td>
                        <div className="mp-patient-cell">
                          <div className={`mp-avatar ${patient.isActive ? "" : "mp-avatar-muted"}`}>
                            {getInitials(patient.fullname)}
                          </div>
                          <div className="mp-patient-meta">
                            <strong>{patient.fullname}</strong>
                            <small><Mail size={10} /> {patient.email || "N/A"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="mp-phone-cell">
                          <Phone size={12} /> {patient.phone || "N/A"}
                        </span>
                      </td>

                      <td>
                        <span className="mp-appt-cell">
                          <CalendarDays size={12} /> {patient.appointments ?? 0}
                        </span>
                      </td>

                      <td>
                        <span className="mp-date-cell" title={fmt(patient.createdAt)}>
                          {timeAgo(patient.createdAt)}
                        </span>
                      </td>

                      <td>
                        <span className={`mp-status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="mp-actions">
                          <button
                            className="mp-view-btn"
                            title="View patient"
                            aria-label={`View ${patient.fullname}`}
                            onClick={() => setSelected(patient)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            className={patient.isActive ? "mp-deactivate-btn" : "mp-activate-btn"}
                            title={patient.isActive ? "Deactivate patient" : "Activate patient"}
                            aria-label={`${patient.isActive ? "Deactivate" : "Activate"} ${patient.fullname}`}
                            disabled={updatingId !== null}
                            onClick={() => openToggle(patient)}
                          >
                            {updatingId === patient._id ? (
                              <RefreshCw size={13} className="mp-spin" />
                            ) : patient.isActive ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mp-footer">
          <span>
            Showing <strong>{patients.length}</strong> of <strong>{pagination.total}</strong> patients
            {hasFilters && <span className="mp-footer-hint"> · filters active</span>}
          </span>

          {pagination.totalPages > 1 && (
            <div className="mp-pager">
              <button
                type="button"
                className="mp-pager-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="mp-pager-label">
                Page <strong>{pagination.page}</strong> of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                className="mp-pager-btn"
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
        <div className="mp-modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="mp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mp-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-hero">
              <div className="mp-modal-hero-top">
                <div className="mp-modal-hero-identity">
                  <div className={`mp-modal-avatar ${selected.isActive ? "" : "mp-avatar-muted"}`}>
                    {getInitials(selected.fullname)}
                  </div>
                  <div>
                    <span className="mp-modal-eyebrow">Patient Profile</span>
                    <h3 id="mp-details-title">{selected.fullname}</h3>
                  </div>
                </div>
                <button
                  className="mp-close-btn"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mp-modal-hero-body">
                <span className={`mp-status ${selected.isActive ? "active" : "inactive"}`}>
                  {selected.isActive ? "Active" : "Inactive"}
                </span>
                <div className="mp-modal-hero-stats">
                  <span className="mp-hero-stat">
                    <CalendarDays size={12} />
                    <strong>{selected.appointments ?? 0} appt{selected.appointments === 1 ? "" : "s"}</strong>
                  </span>
                  <span className="mp-hero-stat">
                    <Clock size={12} />
                    <strong>Joined {timeAgo(selected.createdAt)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="mp-modal-body">
              <div className="mp-modal-section">
                <h5>Contact</h5>
                <div className="mp-modal-line">
                  <Mail size={14} /> <span>{selected.email || "N/A"}</span>
                </div>
                <div className="mp-modal-line">
                  <Phone size={14} /> <span>{selected.phone || "N/A"}</span>
                </div>
              </div>

              <div className="mp-modal-section">
                <h5>Activity</h5>
                <div className="mp-modal-line">
                  <CalendarDays size={14} />
                  <span>{selected.appointments ?? 0} total appointment{selected.appointments === 1 ? "" : "s"}</span>
                </div>
                <div className="mp-modal-line">
                  <Clock size={14} />
                  <span>Registered on {fmt(selected.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mp-modal-actions">
              <button
                type="button"
                className={selected.isActive ? "mp-deactivate-lg" : "mp-activate-lg"}
                disabled={updatingId !== null}
                onClick={() => { setSelected(null); openToggle(selected); }}
              >
                {selected.isActive ? (
                  <><UserX size={14} /> Deactivate</>
                ) : (
                  <><UserCheck size={14} /> Activate</>
                )}
              </button>
              <button
                type="button"
                className="mp-secondary-btn"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ---------- Toggle confirmation modal ---------- */}
      {togglePatient && (
        <div className="mp-modal-backdrop" onClick={closeToggle}>
          <section
            className="mp-modal mp-modal-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mp-toggle-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-hero">
              <div className="mp-modal-hero-top">
                <div>
                  <span className="mp-modal-eyebrow">
                    {togglePatient.isActive ? "Deactivate Patient" : "Activate Patient"}
                  </span>
                  <h3 id="mp-toggle-title">{togglePatient.fullname}</h3>
                </div>
                <button
                  className="mp-close-btn"
                  onClick={closeToggle}
                  aria-label="Close"
                  disabled={updatingId !== null}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mp-modal-body">
              <p className="mp-confirm-text">
                {togglePatient.isActive ? (
                  <>
                    Deactivating <strong>{togglePatient.fullname}</strong> will prevent them from
                    booking new appointments or accessing their account. Their existing records
                    will be preserved. You can reactivate them at any time.
                  </>
                ) : (
                  <>
                    Activating <strong>{togglePatient.fullname}</strong> will restore their access
                    to book appointments and use their account.
                  </>
                )}
              </p>
            </div>

            <div className="mp-modal-actions">
              <button
                type="button"
                className="mp-secondary-btn"
                onClick={closeToggle}
                disabled={updatingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className={togglePatient.isActive ? "mp-deactivate-lg" : "mp-activate-lg"}
                onClick={confirmToggle}
                disabled={updatingId !== null}
              >
                {updatingId !== null ? (
                  <><RefreshCw size={14} className="mp-spin" /> Saving…</>
                ) : togglePatient.isActive ? (
                  <><UserX size={14} /> Deactivate</>
                ) : (
                  <><UserCheck size={14} /> Activate</>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManagePatients;