import { useMemo, useState } from "react";
import {
  Search, CalendarDays, CheckCircle, XCircle, Clock, Eye, Sparkles,
  TrendingUp, UserRound, Stethoscope, MapPin, Video, Building2,
  Filter, X, AlertCircle, FileText, CalendarClock, CheckCheck,
} from "lucide-react";
import "./ManageAppointments.css";

const initialAppointments = [
  {
    id: 1,
    patient: "Rahul Sharma",
    doctor: "Dr. Amit Kumar",
    hospital: "City Care Hospital",
    date: "2026-10-16",
    time: "10:30 AM",
    type: "In-person",
    status: "Confirmed",
  },
  {
    id: 2,
    patient: "Priya Singh",
    doctor: "Dr. Neha Sharma",
    hospital: "Sunrise Hospital",
    date: "2026-10-16",
    time: "11:00 AM",
    type: "Online",
    status: "Pending",
  },
  {
    id: 3,
    patient: "Aman Verma",
    doctor: "Dr. Rahul Verma",
    hospital: "Green Life Hospital",
    date: "2026-10-17",
    time: "12:00 PM",
    type: "In-person",
    status: "Completed",
  },
  {
    id: 4,
    patient: "Neha Kumari",
    doctor: "Dr. Priya Singh",
    hospital: "Health First Hospital",
    date: "2026-10-18",
    time: "02:00 PM",
    type: "Online",
    status: "Cancelled",
  },
];

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

const STATS = [
  { key: "total", label: "Total", icon: CalendarDays, tone: "teal" },
  { key: "pending", label: "Pending", icon: Clock, tone: "amber" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, tone: "blue" },
  { key: "completed", label: "Completed", icon: TrendingUp, tone: "green" },
];

function ManageAppointments() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesSearch =
        !query ||
        a.patient.toLowerCase().includes(query) ||
        a.doctor.toLowerCase().includes(query) ||
        a.hospital.toLowerCase().includes(query);
      const matchesFilter = filter === "All" || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [appointments, search, filter]);

  const counts = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "Pending").length;
    const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    return { total, pending, confirmed, completed, completionRate };
  }, [appointments]);

  const hasFilters = Boolean(search.trim()) || filter !== "All";

  const resetFilters = () => {
    setSearch("");
    setFilter("All");
  };

  const updateStatus = (id, status) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    // Keep the modal in sync if it's open
    setSelectedAppointment((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev
    );
  };

  const canConfirm = (a) => a.status === "Pending";
  const canComplete = (a) => a.status === "Confirmed";
  const canCancel = (a) => ["Pending", "Confirmed"].includes(a.status);

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
              {counts.pending > 0 && (
                <span className="ma-hero-highlight">
                  <Clock size={12} /> {counts.pending} pending
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="ma-hero-total">
          <CalendarDays size={16} />
          <span>
            <strong>{counts.total}</strong> total
          </span>
        </div>
      </div>

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
              <h3>{counts[key]}</h3>
            </div>
            {key === "completed" && counts.total > 0 && (
              <small className="ma-stat-meta">{counts.completionRate}% completion</small>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Card ---------- */}
      <div className="ma-card">
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
                onChange={(e) => setFilter(e.target.value)}
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
              {filteredAppointments.length === 0 ? (
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
                filteredAppointments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="ma-user-cell">
                        <span className="ma-user-avatar">
                          {getInitials(a.patient)}
                        </span>
                        <div className="ma-user-meta">
                          <strong>{a.patient}</strong>
                          <small>
                            <Stethoscope size={10} /> {a.doctor}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="ma-hospital-cell">
                        <Building2 size={13} />
                        <span>{a.hospital}</span>
                      </div>
                    </td>

                    <td>
                      <div className="ma-date-cell">
                        <strong>{formatDate(a.date)}</strong>
                        <small>
                          <Clock size={10} /> {a.time}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className={`ma-type ${isVideoType(a.type) ? "ma-type-video" : ""}`}>
                        {isVideoType(a.type) ? (
                          <><Video size={11} /> {a.type}</>
                        ) : a.type}
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
                          aria-label={`View appointment for ${a.patient}`}
                          onClick={() => setSelectedAppointment(a)}
                        >
                          <Eye size={16} />
                        </button>

                        {canConfirm(a) && (
                          <button
                            className="ma-confirm-btn"
                            title="Confirm appointment"
                            aria-label={`Confirm appointment for ${a.patient}`}
                            onClick={() => updateStatus(a.id, "Confirmed")}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {canComplete(a) && (
                          <button
                            className="ma-complete-btn"
                            title="Mark completed"
                            aria-label={`Mark appointment for ${a.patient} completed`}
                            onClick={() => updateStatus(a.id, "Completed")}
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}

                        {canCancel(a) && (
                          <button
                            className="ma-cancel-btn"
                            title="Cancel appointment"
                            aria-label={`Cancel appointment for ${a.patient}`}
                            onClick={() => updateStatus(a.id, "Cancelled")}
                          >
                            <XCircle size={16} />
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

        <div className="ma-footer">
          <span>
            Showing <strong>{filteredAppointments.length}</strong> of{" "}
            <strong>{appointments.length}</strong> appointments
          </span>
          {hasFilters && <span className="ma-footer-hint">· filters active</span>}
        </div>
      </div>

      {/* ---------- Details modal ---------- */}
      {selectedAppointment && (
        <div
          className="ma-modal-backdrop"
          onClick={() => setSelectedAppointment(null)}
        >
          <section
            className="ma-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ma-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ma-modal-hero">
              <div className="ma-modal-hero-top">
                <div>
                  <span className="ma-modal-eyebrow">Appointment</span>
                  <h3 id="ma-modal-title">
                    APT-{String(selectedAppointment.id).padStart(4, "0")}
                  </h3>
                </div>
                <button
                  type="button"
                  className="ma-close-btn"
                  onClick={() => setSelectedAppointment(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ma-modal-hero-body">
                <span className={`ma-status ${selectedAppointment.status.toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
                <div className="ma-modal-hero-stats">
                  <span className="ma-hero-stat">
                    <CalendarDays size={12} />
                    <strong>{formatDate(selectedAppointment.date)}</strong>
                  </span>
                  <span className="ma-hero-stat">
                    <Clock size={12} />
                    <strong>{selectedAppointment.time}</strong>
                  </span>
                  <span className="ma-hero-stat">
                    {isVideoType(selectedAppointment.type) ? <Video size={12} /> : <MapPin size={12} />}
                    <strong>{selectedAppointment.type}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="ma-modal-body">
              <div className="ma-modal-section">
                <h5>Patient</h5>
                <div className="ma-modal-person">
                  <span className="ma-user-avatar ma-user-avatar-lg">
                    {getInitials(selectedAppointment.patient)}
                  </span>
                  <div>
                    <strong>{selectedAppointment.patient}</strong>
                  </div>
                </div>
              </div>

              <div className="ma-modal-section">
                <h5>Doctor</h5>
                <div className="ma-modal-person">
                  <span className="ma-user-avatar ma-user-avatar-lg ma-avatar-teal">
                    {getInitials(selectedAppointment.doctor)}
                  </span>
                  <div>
                    <strong>{selectedAppointment.doctor}</strong>
                  </div>
                </div>
              </div>

              <div className="ma-modal-section">
                <h5>Hospital</h5>
                <div className="ma-modal-line">
                  <Building2 size={14} />
                  <span>{selectedAppointment.hospital}</span>
                </div>
              </div>
            </div>

            <div className="ma-modal-actions">
              {canConfirm(selectedAppointment) && (
                <button
                  type="button"
                  className="ma-confirm-btn-lg"
                  onClick={() => updateStatus(selectedAppointment.id, "Confirmed")}
                >
                  <CheckCircle size={15} /> Confirm
                </button>
              )}
              {canComplete(selectedAppointment) && (
                <button
                  type="button"
                  className="ma-complete-btn-lg"
                  onClick={() => updateStatus(selectedAppointment.id, "Completed")}
                >
                  <CheckCheck size={15} /> Mark Completed
                </button>
              )}
              {canCancel(selectedAppointment) && (
                <button
                  type="button"
                  className="ma-cancel-btn-lg"
                  onClick={() => updateStatus(selectedAppointment.id, "Cancelled")}
                >
                  <XCircle size={15} /> Cancel
                </button>
              )}
              <button
                type="button"
                className="ma-secondary-btn"
                onClick={() => setSelectedAppointment(null)}
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