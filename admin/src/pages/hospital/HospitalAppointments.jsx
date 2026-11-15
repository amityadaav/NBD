import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, CalendarDays, Clock, CheckCircle, XCircle, Eye, UserRound,
  Stethoscope, X, ChevronLeft, ChevronRight, AlertCircle, RefreshCw,
  Sparkles, IndianRupee, Video, MapPin, Phone, Mail, FileText, Filter,
  CalendarClock, TrendingUp, User, Pill,
} from "lucide-react";
import api from "../../services/api";
import "./HospitalAppointments.css";

const LIMIT = 10;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getStatusClass = (status) => {
  switch (status) {
    case "Pending": return "ha-status-pending";
    case "Confirmed": return "ha-status-confirmed";
    case "Completed": return "ha-status-completed";
    case "Cancelled": return "ha-status-cancelled";
    default: return "";
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const shortId = (id) => `APT-${String(id).slice(-6).toUpperCase()}`;

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `₹${num.toLocaleString("en-IN")}`;
};

const isVideoType = (type) => /video|online|tele/i.test(type || "");

function HospitalAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [counts, setCounts] = useState({
    total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
  });

  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter !== "All") params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (doctorFilter !== "All") params.doctorId = doctorFilter;

      const { data } = await api.get("/hospital-admin/appointments", { params });
      setAppointments(data.appointments || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load appointments."));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFilter, doctorFilter]);

  const fetchCounts = useCallback(async () => {
    const results = await Promise.allSettled([
      api.get("/hospital-admin/appointments", { params: { limit: 1 } }),
      api.get("/hospital-admin/appointments", { params: { limit: 1, status: "Pending" } }),
      api.get("/hospital-admin/appointments", { params: { limit: 1, status: "Confirmed" } }),
      api.get("/hospital-admin/appointments", { params: { limit: 1, status: "Completed" } }),
      api.get("/hospital-admin/appointments", { params: { limit: 1, status: "Cancelled" } }),
    ]);
    const read = (r) => (r.status === "fulfilled" ? Number(r.value.data?.total ?? 0) : 0);
    setCounts({
      total: read(results[0]),
      pending: read(results[1]),
      confirmed: read(results[2]),
      completed: read(results[3]),
      cancelled: read(results[4]),
    });
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await api.get("/hospital-admin/doctors", { params: { limit: 100 } });
      setDoctors(data.doctors || []);
    } catch {
      setDoctors([]);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  useEffect(() => {
    if (!selectedAppointment) setConfirmCancel(false);
  }, [selectedAppointment]);

  const refreshAll = async () => {
    await Promise.all([fetchAppointments(), fetchCounts(), fetchDoctors()]);
  };

  const changeStatus = async (appointment, newStatus) => {
    if (updating) return;

    setUpdating(true);
    setError("");
    setNotice("");

    try {
      const { data } = await api.patch(
        `/hospital-admin/appointments/${appointment._id}/status`,
        { status: newStatus }
      );
      setNotice(data.message || `Appointment marked as ${newStatus}.`);
      setSelectedAppointment(null);
      setConfirmCancel(false);
      await refreshAll();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update appointment."));
    } finally {
      setUpdating(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setDateFilter("");
    setDoctorFilter("All");
    setPage(1);
  };

  const hasFilters = statusFilter !== "All" || dateFilter || doctorFilter !== "All";

  const completionRate = useMemo(() => {
    const effective = counts.total - (counts.cancelled || 0);
    if (!effective) return 0;
    return Math.round((counts.completed / effective) * 100);
  }, [counts]);

  return (
    <div className="ha-page">
      {/* ---------- Page header ---------- */}
      <div className="ha-page-header">
        <div className="ha-header-left">
          <span className="ha-eyebrow">
            <CalendarClock size={12} /> Appointments
          </span>
          <h2>Appointment Directory</h2>
          <p>Review, confirm and manage all patient bookings for your hospital.</p>
        </div>

        <div className="ha-header-actions">
          <button
            type="button"
            className="ha-write-prescription-btn"
            onClick={() => navigate("/hospital/prescriptions/new")}
          >
            <Pill size={15} /> Write Prescription
          </button>

          <button
            type="button"
            className="ha-icon-btn"
            onClick={refreshAll}
            disabled={loading}
            aria-label="Refresh appointments"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "ha-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="ha-message ha-message-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="ha-message ha-message-success" role="status" aria-live="polite">
          <CheckCircle size={15} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Stat cards ---------- */}
      <div className="ha-stats">
        <div className="ha-stat-card">
          <div className="ha-stat-icon ha-icon-teal"><CalendarDays size={22} /></div>
          <div className="ha-stat-body">
            <p>Total</p>
            <h3>{counts.total}</h3>
          </div>
        </div>

        <div className="ha-stat-card">
          <div className="ha-stat-icon ha-icon-orange"><Clock size={22} /></div>
          <div className="ha-stat-body">
            <p>Pending</p>
            <h3>{counts.pending}</h3>
          </div>
        </div>

        <div className="ha-stat-card">
          <div className="ha-stat-icon ha-icon-blue"><CheckCircle size={22} /></div>
          <div className="ha-stat-body">
            <p>Confirmed</p>
            <h3>{counts.confirmed}</h3>
          </div>
        </div>

        <div className="ha-stat-card">
          <div className="ha-stat-icon ha-icon-green"><TrendingUp size={22} /></div>
          <div className="ha-stat-body">
            <p>Completed</p>
            <h3>{counts.completed}</h3>
            {counts.total > 0 && (
              <small className="ha-stat-meta">{completionRate}% completion</small>
            )}
          </div>
        </div>
      </div>

      <section className="ha-panel">
        <div className="ha-panel-header">
          <div>
            <h3>All Appointments</h3>
            <p>
              {total} appointment{total === 1 ? "" : "s"} found
              {hasFilters && <span className="ha-filter-hint"> · filtered</span>}
            </p>
          </div>

          {hasFilters && (
            <button type="button" className="ha-clear-btn" onClick={resetFilters}>
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        <div className="ha-filters">
          <div className="ha-select-wrap">
            <Filter size={15} className="ha-select-icon" />
            <select
              aria-label="Filter by doctor"
              value={doctorFilter}
              onChange={(event) => { setDoctorFilter(event.target.value); setPage(1); }}
            >
              <option value="All">All Doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <input
            className="ha-date-filter"
            type="date"
            aria-label="Filter by appointment date"
            value={dateFilter}
            onChange={(event) => { setDateFilter(event.target.value); setPage(1); }}
          />

          <div className="ha-select-wrap">
            <Filter size={15} className="ha-select-icon" />
            <select
              aria-label="Filter by appointment status"
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="ha-table-wrapper">
          <table className="ha-table">
            <thead>
              <tr>
                <th>Appointment</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="ha-skeleton-row">
                    <td colSpan="8"><div className="ha-skeleton-line" /></td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ha-empty">
                    <div className="ha-empty-state">
                      <CalendarDays size={32} />
                      <p>No appointments found</p>
                      <small>Try changing the filters.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong className="ha-appointment-id">
                        {shortId(appointment._id)}
                      </strong>
                    </td>

                    <td>
                      <div className="ha-person-cell">
                        <div className="ha-person-avatar">
                          {getInitials(appointment.patientName)}
                        </div>
                        <div className="ha-person-meta">
                          <strong>{appointment.patientName}</strong>
                          <small>{appointment.patientPhone}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="ha-person-cell">
                        <div className="ha-doctor-avatar">
                          <Stethoscope size={16} />
                        </div>
                        <div className="ha-person-meta">
                          <strong>{appointment.doctorId?.name || "N/A"}</strong>
                          <small>{appointment.doctorId?.specialty || ""}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="ha-date-text">
                        {formatDate(appointment.appointmentDate)}
                      </strong>
                      <small className="ha-time">
                        <Clock size={11} /> {formatTime(appointment.appointmentTime)}
                      </small>
                    </td>

                    <td>
                      <span className={`ha-type-pill ${isVideoType(appointment.appointmentType) ? "ha-type-video" : ""}`}>
                        {isVideoType(appointment.appointmentType) ? (
                          <><Video size={12} /> {appointment.appointmentType}</>
                        ) : (
                          appointment.appointmentType
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="ha-fee">
                        <IndianRupee size={12} />
                        {Number(appointment.consultationFee || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td>
                      <span className={`ha-status ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>

                    <td>
                      <div className="ha-row-actions">
                        <button
                          type="button"
                          className="ha-view-btn"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setConfirmCancel(false);
                          }}
                          aria-label={`View appointment ${shortId(appointment._id)}`}
                        >
                          <Eye size={15} /> View
                        </button>

                        {["Confirmed", "Completed"].includes(appointment.status) && (
                          <button
                            type="button"
                            className="ha-view-btn ha-view-btn-accent"
                            onClick={() =>
                              navigate(
                                `/hospital/prescriptions/new?appointmentId=${appointment._id}`
                              )
                            }
                            title="Write prescription"
                            aria-label="Write prescription"
                          >
                            <Pill size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="ha-pager">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="ha-pager-label">
              Page <strong>{page}</strong> of {pages}
            </span>
            <button type="button" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ---------- Details modal ---------- */}
      {selectedAppointment && (
        <div className="ha-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <section
            className="ha-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ha-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ha-modal-hero">
              <div className="ha-modal-hero-top">
                <div>
                  <span className="ha-modal-eyebrow">Appointment</span>
                  <h3 id="ha-modal-title">{shortId(selectedAppointment._id)}</h3>
                </div>
                <button
                  type="button"
                  className="ha-close-btn ha-close-floating"
                  aria-label="Close details"
                  onClick={() => setSelectedAppointment(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ha-modal-hero-body">
                <span className={`ha-status ${getStatusClass(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
                <div className="ha-modal-hero-stats">
                  <div className="ha-hero-stat">
                    <CalendarDays size={14} />
                    <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
                  </div>
                  <div className="ha-hero-stat">
                    <Clock size={14} />
                    <strong>{formatTime(selectedAppointment.appointmentTime)}</strong>
                  </div>
                  <div className="ha-hero-stat">
                    {isVideoType(selectedAppointment.appointmentType)
                      ? <Video size={14} />
                      : <MapPin size={14} />}
                    <strong>{selectedAppointment.appointmentType}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="ha-modal-body">
              <div className="ha-modal-section">
                <h5>Patient</h5>
                <div className="ha-modal-person">
                  <div className="ha-person-avatar ha-person-avatar-lg">
                    {getInitials(selectedAppointment.patientName)}
                  </div>
                  <div>
                    <strong>{selectedAppointment.patientName}</strong>
                    <div className="ha-contact-row">
                      <span><Phone size={12} /> {selectedAppointment.patientPhone}</span>
                      {selectedAppointment.patientEmail && (
                        <span><Mail size={12} /> {selectedAppointment.patientEmail}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ha-modal-section">
                <h5>Doctor</h5>
                <div className="ha-modal-person">
                  <div className="ha-doctor-avatar ha-person-avatar-lg">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <strong>{selectedAppointment.doctorId?.name || "N/A"}</strong>
                    <div className="ha-contact-row">
                      <span>{selectedAppointment.doctorId?.specialty || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div className="ha-modal-section">
                  <h5>Reason for Visit</h5>
                  <div className="ha-reason-box">
                    <FileText size={14} />
                    <p>{selectedAppointment.reason}</p>
                  </div>
                </div>
              )}

              <div className="ha-modal-section ha-modal-fee">
                <div>
                  <h5>Consultation Fee</h5>
                  <span className="ha-fee-large">
                    {formatCurrency(selectedAppointment.consultationFee)}
                  </span>
                </div>
              </div>
            </div>

            <div className="ha-modal-actions">
              {["Confirmed", "Completed"].includes(selectedAppointment.status) && !confirmCancel && (
                <button
                  type="button"
                  className="ha-prescribe-btn"
                  disabled={updating}
                  onClick={() =>
                    navigate(
                      `/hospital/prescriptions/new?appointmentId=${selectedAppointment._id}`
                    )
                  }
                >
                  <Pill size={16} /> Write Prescription
                </button>
              )}

              {confirmCancel ? (
                <div className="ha-confirm-cancel">
                  <span className="ha-confirm-cancel-text">Cancel this appointment?</span>
                  <button
                    type="button"
                    className="ha-secondary-btn"
                    disabled={updating}
                    onClick={() => setConfirmCancel(false)}
                  >
                    No, keep it
                  </button>
                  <button
                    type="button"
                    className="ha-cancel-btn"
                    disabled={updating}
                    onClick={() => changeStatus(selectedAppointment, "Cancelled")}
                  >
                    {updating ? (
                      <><RefreshCw size={14} className="ha-spin" /> Cancelling…</>
                    ) : (
                      <><XCircle size={14} /> Yes, cancel</>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {selectedAppointment.status === "Pending" && (
                    <button
                      type="button"
                      className="ha-confirm-btn"
                      disabled={updating}
                      onClick={() => changeStatus(selectedAppointment, "Confirmed")}
                    >
                      {updating ? (
                        <><RefreshCw size={14} className="ha-spin" /> Confirming…</>
                      ) : (
                        <><CheckCircle size={16} /> Confirm</>
                      )}
                    </button>
                  )}

                  {selectedAppointment.status === "Confirmed" && (
                    <button
                      type="button"
                      className="ha-complete-btn"
                      disabled={updating}
                      onClick={() => changeStatus(selectedAppointment, "Completed")}
                    >
                      {updating ? (
                        <><RefreshCw size={14} className="ha-spin" /> Saving…</>
                      ) : (
                        <><CheckCircle size={16} /> Mark Completed</>
                      )}
                    </button>
                  )}

                  {["Pending", "Confirmed"].includes(selectedAppointment.status) && (
                    <button
                      type="button"
                      className="ha-cancel-btn"
                      disabled={updating}
                      onClick={() => setConfirmCancel(true)}
                    >
                      <XCircle size={16} /> Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default HospitalAppointments;