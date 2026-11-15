import { useCallback, useEffect, useState } from "react";
import {
  Search, CalendarDays, CheckCircle, XCircle, Clock, Eye, Sparkles,
  TrendingUp, Stethoscope, MapPin, Video, Building2, Filter, X, 
  AlertCircle, CalendarClock, CheckCheck, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import api from "../../services/api";
import "./ManageAppointments.css";

const getInitials = (name = "") =>
  name.replace(/^Dr\.?\s+/i, "")
    .split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

const isVideoType = (type) => /online|video|tele/i.test(type || "");

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return "Session expired. Please log in again.";
  if (error.response?.status === 403) return "Access denied. Admin privileges required.";
  if (error.code === "ERR_NETWORK") return "Cannot connect to the backend.";
  return error.message || fallback;
};

const STATS = [
  { key: "total", label: "Total", icon: CalendarDays, tone: "teal" },
  { key: "pending", label: "Pending", icon: Clock, tone: "amber" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, tone: "blue" },
  { key: "completed", label: "Completed", icon: TrendingUp, tone: "green" },
];

function ManageAppointments() {
  // Data State
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // UI State
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAppointments = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/appointments", {
        params: { 
          status: filter, 
          search: query, 
          page, 
          limit: 20 
        },
      });
      
      setAppointments(data.appointments || []);
      setStats(data.statistics || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch appointments."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const hasFilters = Boolean(query) || filter !== "All";

  const resetFilters = () => {
    setSearch("");
    setFilter("All");
    setPage(1);
  };

  // Open Details Modal
  const viewAppointment = async (apt) => {
    setError("");
    setDetailsLoading(true);
    setSelectedAppointment({ ...apt, _loading: true });
    
    try {
      const { data } = await api.get(`/admin/appointments/${apt._id}`);
      setSelectedAppointment(data.appointment);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load appointment details."));
      setSelectedAppointment(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update Status (Confirm, Complete, Cancel)
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      const endpoint = status === "Cancelled" 
        ? `/admin/appointments/${id}/cancel`
        : `/admin/appointments/${id}/status`;

      const { data } = await api.patch(endpoint, status === "Cancelled" ? {} : { status });
      
      setNotice(data.message || `Appointment marked as ${status.toLowerCase()}.`);
      
      // Update local list
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, status } : a));
      
      // Sync modal if open
      if (selectedAppointment?._id === id) {
        setSelectedAppointment((prev) => ({ ...prev, status }));
      }
      
      // Refresh background stats
      await fetchAppointments(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update appointment status."));
    } finally {
      setUpdatingId(null);
    }
  };

  // Validation helpers matching backend transitions
  const canConfirm = (s) => s === "Pending";
  const canComplete = (s) => s === "Confirmed";
  const canCancel = (s) => ["Pending", "Confirmed"].includes(s);

  return (
    <div className="manage-appointments-page">
      {/* ---------- Hero header ---------- */}
      <div className="ma-hero">
        <div className="ma-hero-glow" aria-hidden="true" />
        <div className="ma-hero-main">
          <div className="ma-hero-icon">
            <CalendarClock size={22} />
          </div>
          <div className="ma-hero-text">
            <span className="ma-eyebrow">
              <Sparkles size={11} /> Appointments
            </span>
            <h2>Manage Appointments</h2>
            <p>
              View and manage patient appointments across hospitals.
              {stats.pending > 0 && (
                <span className="ma-hero-highlight">
                  <Clock size={12} /> {stats.pending} pending
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="ma-hero-refresh"
          onClick={() => fetchAppointments(true)}
          disabled={loading || refreshing || updatingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "ma-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="ma-alert ma-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
          <button type="button" className="ma-alert-retry" onClick={() => fetchAppointments()} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      {notice && (
        <div className="ma-alert ma-success" role="status">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="ma-stats">
        {STATS.map(({ key, label, icon: Icon, tone }, i) => (
          <div
            key={key}
            className="ma-stat"
            style={{ "--stagger": `${i * 40}ms` }}
          >
            <div className={`ma-stat-icon ma-icon-${tone}`}>
              <Icon size={18} />
            </div>
            <div className="ma-stat-body">
              <span>{label}</span>
              <h3>{loading ? "…" : stats[key]}</h3>
            </div>
            {key === "completed" && stats.total > 0 && (
              <small className="ma-stat-meta">
                {Math.round((stats.completed / stats.total) * 100)}% completion
              </small>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Card ---------- */}
      <div className="ma-cards">
        <div className="ma-toolbar">
          <div className="ma-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search patient, doctor or hospital…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search appointments"
            />
            {search && (
              <button
                type="button"
                className="ma-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="ma-toolbar-right">
            <div className="ma-filter-wrap">
              <Filter size={14} className="ma-filter-icon" />
              <select
                className="ma-filter"
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                aria-label="Filter appointments by status"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                className="ma-clear-filters"
                onClick={resetFilters}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="ma-table-wrapper">
          <table className="ma-table">
            <thead>
              <tr>
                <th>Patient / Doctor</th>
                <th>Hospital</th>
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="ma-skeleton-row">
                    <td colSpan="6"><div className="ma-skeleton-line" /></td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="ma-empty">
                    <div className="ma-empty-state">
                      <CalendarDays size={30} />
                      <p>No appointments found</p>
                      <small>
                        {hasFilters
                          ? "Try clearing your search or filters."
                          : "New bookings will appear here."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((a) => {
                  const patientName = a.patientName || "N/A";
                  const doctorName = a.doctorId?.name || "N/A";
                  const hospitalName = a.hospitalId?.hospitalName || "N/A";
                  const type = a.appointmentType || "In-person";

                  return (
                    <tr key={a._id}>
                      <td>
                        <div className="ma-user-cell">
                          <span className="ma-user-avatar">
                            {getInitials(patientName)}
                          </span>
                          <div className="ma-user-meta">
                            <strong>{patientName}</strong>
                            <small>
                              <Stethoscope size={10} /> {doctorName}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="ma-hospital-cell">
                          <Building2 size={13} />
                          <span>{hospitalName}</span>
                        </div>
                      </td>

                      <td>
                        <div className="ma-date-cell">
                          <strong>{formatDate(a.appointmentDate)}</strong>
                          <small>
                            <Clock size={10} /> {a.appointmentTime || "N/A"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className={`ma-type ${isVideoType(type) ? "ma-type-video" : ""}`}>
                          {isVideoType(type) ? (
                            <><Video size={11} /> {type}</>
                          ) : type}
                        </span>
                      </td>

                      <td>
                        <span className={`ma-status ${a.status.toLowerCase()}`}>
                          {a.status}
                        </span>
                      </td>

                      <td>
                        <div className="ma-actions">
                          <button
                            className="ma-view-btn"
                            title="View appointment"
                            onClick={() => viewAppointment(a)}
                          >
                            <Eye size={16} />
                          </button>

                          {canConfirm(a.status) && (
                            <button
                              className="ma-confirm-btn"
                              title="Confirm appointment"
                              disabled={updatingId !== null}
                              onClick={() => updateStatus(a._id, "Confirmed")}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {canComplete(a.status) && (
                            <button
                              className="ma-complete-btn"
                              title="Mark completed"
                              disabled={updatingId !== null}
                              onClick={() => updateStatus(a._id, "Completed")}
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}

                          {canCancel(a.status) && (
                            <button
                              className="ma-cancel-btn"
                              title="Cancel appointment"
                              disabled={updatingId !== null}
                              onClick={() => updateStatus(a._id, "Cancelled")}
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          {updatingId === a._id && (
                            <RefreshCw size={13} className="ma-spin" style={{ marginLeft: 4 }} />
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

        <div className="ma-footer">
          <span>
            Showing <strong>{appointments.length}</strong> of{" "}
            <strong>{pagination.total}</strong> appointments
          </span>
          {hasFilters && <span className="ma-footer-hint">· filters active</span>}

          {pagination.totalPages > 1 && (
            <div className="ma-pager">
              <button
                type="button"
                className="ma-pager-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="ma-pager-label">
                Page <strong>{pagination.page}</strong> of {pagination.totalPages}
              </span>
              <button
                type="button"
                className="ma-pager-btn"
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
      {selectedAppointment && (
        <div
          className="ma-modal-backdrop"
          onClick={() => !updatingId && setSelectedAppointment(null)}
        >
          <section
            className="ma-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ma-modal-hero">
              <div className="ma-modal-hero-top">
                <div>
                  <span className="ma-modal-eyebrow">Appointment Details</span>
                  <h3 id="ma-modal-title">
                    {selectedAppointment._id ? `APT-${selectedAppointment._id.slice(-6).toUpperCase()}` : "Loading…"}
                  </h3>
                </div>
                <button
                  type="button"
                  className="ma-close-btn"
                  onClick={() => setSelectedAppointment(null)}
                  disabled={updatingId !== null}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ma-modal-hero-body">
                <span className={`ma-status ${selectedAppointment.status?.toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
                <div className="ma-modal-hero-stats">
                  <span className="ma-hero-stat">
                    <CalendarDays size={12} />
                    <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
                  </span>
                  <span className="ma-hero-stat">
                    <Clock size={12} />
                    <strong>{selectedAppointment.appointmentTime}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="ma-modal-body">
              {detailsLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)" }}>
                  <RefreshCw size={18} className="ma-spin" /> Loading details…
                </div>
              ) : (
                <>
                  <div className="ma-modal-section">
                    <h5>Patient</h5>
                    <div className="ma-modal-person">
                      <span className="ma-user-avatar ma-user-avatar-lg">
                        {getInitials(selectedAppointment.patientName)}
                      </span>
                      <div>
                        <strong>{selectedAppointment.patientName}</strong>
                        <small style={{ display: "block", color: "var(--muted-foreground)" }}>
                          {selectedAppointment.patientEmail || selectedAppointment.patientPhone || "No contact info"}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="ma-modal-section">
                    <h5>Doctor</h5>
                    <div className="ma-modal-person">
                      <span className="ma-user-avatar ma-user-avatar-lg ma-avatar-teal">
                        {getInitials(selectedAppointment.doctorId?.name)}
                      </span>
                      <div>
                        <strong>{selectedAppointment.doctorId?.name || "N/A"}</strong>
                        <small style={{ display: "block", color: "var(--muted-foreground)" }}>
                          {selectedAppointment.doctorId?.specialty || "General"}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="ma-modal-section">
                    <h5>Hospital</h5>
                    <div className="ma-modal-line">
                      <Building2 size={14} />
                      <span>{selectedAppointment.hospitalId?.hospitalName || "N/A"}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="ma-modal-actions">
              {canConfirm(selectedAppointment.status) && (
                <button
                  type="button"
                  className="ma-confirm-btn-lg"
                  disabled={updatingId !== null}
                  onClick={() => updateStatus(selectedAppointment._id, "Confirmed")}
                >
                  <CheckCircle size={15} /> Confirm
                </button>
              )}
              {canComplete(selectedAppointment.status) && (
                <button
                  type="button"
                  className="ma-complete-btn-lg"
                  disabled={updatingId !== null}
                  onClick={() => updateStatus(selectedAppointment._id, "Completed")}
                >
                  <CheckCheck size={15} /> Mark Completed
                </button>
              )}
              {canCancel(selectedAppointment.status) && (
                <button
                  type="button"
                  className="ma-cancel-btn-lg"
                  disabled={updatingId !== null}
                  onClick={() => updateStatus(selectedAppointment._id, "Cancelled")}
                >
                  <XCircle size={15} /> Cancel
                </button>
              )}
              <button
                type="button"
                className="ma-secondary-btn"
                onClick={() => setSelectedAppointment(null)}
                disabled={updatingId !== null}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManageAppointments;