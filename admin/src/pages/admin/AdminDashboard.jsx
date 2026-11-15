import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Hospital, Stethoscope, Users, CalendarDays, CheckCircle, XCircle,
  Clock, RefreshCw, Sparkles, MapPin, CalendarClock, TrendingUp,
  ArrowRight, AlertCircle, CheckCircle2, UserRound, Activity, Search,
} from "lucide-react";

import api from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";
import ConfirmDialog from "../../components/dashboard/ConfirmDialog";
import "./AdminDashboard.css";

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return "Session expired. Please log in again.";
  if (error.response?.status === 403) return "Access denied. Please log in with the correct admin account.";
  return error.message || fallback;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

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
  return formatDate(value);
};

const getHospitalLocation = (address) => {
  if (typeof address === "string") return address || "N/A";
  if (address && typeof address === "object") {
    return (
      [address.area, address.city, address.state]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(", ") || "N/A"
    );
  }
  return "N/A";
};

const getArray = (result, key) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.[key])) return result.data[key];
  return [];
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

/* ---------- Dialog text helpers ---------- */
const getEntityLabel = (entity) =>
  entity?.name || entity?.patient || entity?.hospitalName || "this item";

const getDialogTitle = ({ action, type }) => {
  if (!type || !action) return "";
  const verb =
    action === "approve" ? "Approve" :
    action === "reject" ? "Reject" : "Delete";
  const noun = type.charAt(0).toUpperCase() + type.slice(1);
  return `${verb} ${noun}?`;
};

const getDialogMessage = ({ action, type, entity }) => {
  if (!entity) return "";
  const label = getEntityLabel(entity);
  if (action === "approve") {
    if (type === "appointment") {
      return `You are about to confirm the appointment for "${label}". Both parties will be notified.`;
    }
    return `You are about to approve "${label}". They will be activated on the platform.`;
  }
  if (action === "reject") {
    if (type === "appointment") {
      return `You are about to cancel the appointment for "${label}". This action cannot be undone.`;
    }
    return `You are about to reject "${label}". This action cannot be undone and they will be notified.`;
  }
  return `You are about to delete "${label}". This action cannot be undone.`;
};

const getDialogConfirmLabel = ({ action, type }) => {
  if (action === "approve") return type === "appointment" ? "Confirm Appointment" : "Approve";
  if (action === "reject") return type === "appointment" ? "Cancel Appointment" : "Reject";
  return "Delete";
};

const EMPTY_STATS = {
  totalHospitals: 0,
  pendingHospitals: 0,
  totalDoctors: 0,
  pendingDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
  completedAppointments: 0,
};

// [stats key, title, icon, color, caption]
const CARDS = [
  ["totalHospitals", "Total Hospitals", Hospital, "#0f766e", "Registered hospitals"],
  ["pendingHospitals", "Pending Hospitals", Clock, "#d97706", "Awaiting approval"],
  ["totalDoctors", "Total Doctors", Stethoscope, "#2563eb", "Registered doctors"],
  ["pendingDoctors", "Pending Doctors", Clock, "#9333ea", "Awaiting verification"],
  ["totalPatients", "Total Patients", Users, "#7c3aed", "Registered patients"],
  ["totalAppointments", "Total Appointments", CalendarDays, "#ea580c", "All appointments"],
  ["pendingAppointments", "Pending Appointments", Clock, "#d97706", "Awaiting confirmation"],
  ["completedAppointments", "Completed Appointments", CheckCircle, "#16a34a", "Completed bookings"],
];

function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [appointments, setAppointments] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Generic dialog state — works for hospitals, doctors, appointments, etc.
  const [dialog, setDialog] = useState({
    open: false,
    type: null,
    action: null,
    entity: null,
    reason: "",
  });

  const fetchDashboard = useCallback(async (options = {}) => {
    const silent = options.silent === true;

    if (silent) setRefreshing(true);
    else {
      setLoading(true);
      setError("");
    }

    try {
      const results = await Promise.allSettled([
        api.get("/admin/dashboard"),
        api.get("/admin/hospitals/pending"),
        api.get("/admin/appointments", { params: { limit: 5 } }),
      ]);

      const errors = [];

      if (results[0].status === "fulfilled") {
        const result = results[0].value.data;
        const data =
          result.dashboard || result.data?.dashboard || result.data || result.stats || result;
        const appt = data.appointmentStats || {};
        const flat = {
          ...data,
          pendingAppointments: appt.pending ?? data.pendingAppointments,
          completedAppointments: appt.completed ?? data.completedAppointments,
        };
        const next = {};
        Object.keys(EMPTY_STATS).forEach((key) => {
          next[key] = Number(flat[key] ?? 0);
        });
        setStats(next);
      } else {
        console.error("Dashboard stats error:", results[0].reason);
        errors.push(`Statistics: ${getErrorMessage(results[0].reason, "Unable to load statistics.")}`);
      }

      if (results[1].status === "fulfilled") {
        const data = getArray(results[1].value.data, "hospitals");
        setPendingHospitals(
          data.map((hospital) => ({
            ...hospital,
            id: hospital._id || hospital.id,
            name: hospital.hospitalName || hospital.name || "Unnamed Hospital",
            location: getHospitalLocation(hospital.address),
            date: hospital.createdAt,
          }))
        );
      } else {
        console.error("Pending hospitals error:", results[1].reason);
        errors.push(`Hospitals: ${getErrorMessage(results[1].reason, "Unable to load pending hospitals.")}`);
      }

      if (results[2].status === "fulfilled") {
        const data = getArray(results[2].value.data, "appointments");
        setAppointments(
          data.slice(0, 5).map((appointment) => ({
            ...appointment,
            id: appointment._id || appointment.id,
            patient: appointment.patientName || "N/A",
            doctor: appointment.doctorId?.name || "N/A",
            date: appointment.appointmentDate,
            time: appointment.appointmentTime || "N/A",
            status: String(appointment.status || "Pending"),
          }))
        );
      } else {
        console.error("Appointments error:", results[2].reason);
        errors.push(`Appointments: ${getErrorMessage(results[2].reason, "Unable to load appointments.")}`);
      }

      setError(errors.length ? errors.join(" ") : "");
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(getErrorMessage(err, "Unable to load dashboard."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ---- Step 1: open dialog (called by every button) ----
  const requestAction = (type, action, entity) => {
    if (updatingId !== null) return;
    setError("");
    setNotice("");
    setDialog({ open: true, type, action, entity, reason: "" });
  };

  // ---- Step 2: close dialog ----
  const cancelAction = () => {
    if (updatingId !== null) return;
    setDialog({ open: false, type: null, action: null, entity: null, reason: "" });
  };

  // ---- Step 3: run the real API call ----
  const confirmAction = async () => {
    const { type, action, entity, reason } = dialog;
    if (!entity) return;

    // Validation: reject/delete flows need a reason
    if ((action === "reject" || action === "delete") && !reason.trim()) {
      setError("A reason is required to proceed.");
      return;
    }

    setUpdatingId(entity.id);
    setError("");
    setNotice("");

    try {
      let response;

      if (type === "hospital") {
        const status = action === "approve" ? "Verified" : "Rejected";
        const body = { status };
        if (action === "reject") body.rejectionReason = reason.trim();
        response = await api.patch(`/admin/hospitals/${entity.id}/review`, body);

        setPendingHospitals((prev) => prev.filter((h) => h.id !== entity.id));
      }

      if (type === "doctor") {
        const status = action === "approve" ? "Verified" : "Rejected";
        const body = { status };
        if (action === "reject") body.rejectionReason = reason.trim();
        response = await api.patch(`/admin/doctors/${entity.id}/review`, body);

        // If you later add a pendingDoctors list, filter it here:
        // setPendingDoctors((prev) => prev.filter((d) => d.id !== entity.id));
      }

      if (type === "appointment") {
        if (action === "approve") {
          response = await api.patch(`/admin/appointments/${entity.id}/confirm`);
        } else if (action === "reject") {
          response = await api.patch(`/admin/appointments/${entity.id}/cancel`, {
            reason: reason.trim(),
          });
        }
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === entity.id
              ? { ...a, status: action === "approve" ? "Confirmed" : "Cancelled" }
              : a
          )
        );
      }

      setNotice(
        response?.data?.message ||
        `${getEntityLabel(entity)} ${action === "approve" ? "approved" : "rejected"}.`
      );
      setDialog({ open: false, type: null, action: null, entity: null, reason: "" });
      await fetchDashboard({ silent: true });
    } catch (err) {
      console.error(`${type} ${action} error:`, err.response?.data || err.message);
      setError(getErrorMessage(err, `Unable to ${action} ${type}.`));
    } finally {
      setUpdatingId(null);
    }
  };

  // Derived insight metrics
  const insights = useMemo(() => {
    const apptCompletion = stats.totalAppointments
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
      : 0;
    const hospitalApproval = stats.totalHospitals
      ? Math.round(((stats.totalHospitals - stats.pendingHospitals) / stats.totalHospitals) * 100)
      : 0;
    const doctorVerification = stats.totalDoctors
      ? Math.round(((stats.totalDoctors - stats.pendingDoctors) / stats.totalDoctors) * 100)
      : 0;
    return { apptCompletion, hospitalApproval, doctorVerification };
  }, [stats]);

  const totalPending = stats.pendingHospitals + stats.pendingDoctors + stats.pendingAppointments;

  return (
    <div className="dashboard-page">
      {/* ---------- Hero header ---------- */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-glow" aria-hidden="true" />
        <div className="dashboard-hero-left">
          <span className="dashboard-eyebrow">
            <Sparkles size={11} /> Overview
          </span>
          <h2>Dashboard Overview</h2>
          <p>
            Monitor your NearbyDoctor platform
            {totalPending > 0 && (
              <span className="dashboard-hero-highlight">
                <Activity size={12} /> {totalPending} action{totalPending > 1 ? "s" : ""} pending
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          className="dashboard-hero-refresh"
          onClick={() => fetchDashboard({ silent: true })}
          disabled={loading || refreshing || updatingId !== null}
        >
          <RefreshCw size={15} className={refreshing ? "dashboard-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="dashboard-notice" role="status">
          <CheckCircle2 size={16} /> <span>{notice}</span>
        </div>
      )}

      {/* ---------- Insight strip ---------- */}
      {!loading && (
        <div className="dashboard-insights">
          <div className="dashboard-insight">
            <div className="dashboard-insight-icon dashboard-insight-teal">
              <Hospital size={16} />
            </div>
            <div className="dashboard-insight-body">
              <span className="dashboard-insight-label">Hospital Approval</span>
              <strong className="dashboard-insight-value">{insights.hospitalApproval}%</strong>
            </div>
            <div className="dashboard-insight-bar">
              <span style={{ width: `${insights.hospitalApproval}%` }} />
            </div>
          </div>

          <div className="dashboard-insight">
            <div className="dashboard-insight-icon dashboard-insight-blue">
              <Stethoscope size={16} />
            </div>
            <div className="dashboard-insight-body">
              <span className="dashboard-insight-label">Doctor Verification</span>
              <strong className="dashboard-insight-value">{insights.doctorVerification}%</strong>
            </div>
            <div className="dashboard-insight-bar">
              <span style={{ width: `${insights.doctorVerification}%` }} />
            </div>
          </div>

          <div className="dashboard-insight">
            <div className="dashboard-insight-icon dashboard-insight-green">
              <TrendingUp size={16} />
            </div>
            <div className="dashboard-insight-body">
              <span className="dashboard-insight-label">Appt. Completion</span>
              <strong className="dashboard-insight-value">{insights.apptCompletion}%</strong>
            </div>
            <div className="dashboard-insight-bar">
              <span style={{ width: `${insights.apptCompletion}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="dashboard-stats">
        {CARDS.map(([key, title, icon, color, change], i) => (
          <div key={key} className="dashboard-stat-wrap" style={{ "--stagger": `${i * 35}ms` }}>
            <StatCard
              title={title}
              value={loading ? "…" : stats[key].toLocaleString("en-IN")}
              icon={icon}
              color={color}
              change={change}
            />
          </div>
        ))}
      </div>

      {/* ---------- Sections ---------- */}
      <div className="dashboard-sections">
        {/* Recent appointments */}
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Appointments</h3>
              <p>Latest patient bookings</p>
            </div>
            <span className="panel-badge panel-badge-blue">
              <CalendarDays size={11} /> {appointments.length} shown
            </span>
          </div>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="dashboard-skeleton-row">
                      <td colSpan="5"><div className="dashboard-skeleton-line" /></td>
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="dashboard-empty-cell">
                      <div className="dashboard-empty">
                        <CalendarDays size={26} />
                        <p>No appointments yet</p>
                        <small>New bookings will appear here.</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => {
                    const st = appointment.status.toLowerCase();
                    const canConfirm = st === "pending";
                    const canCancel = st === "pending" || st === "confirmed";
                    return (
                      <tr key={appointment.id}>
                        <td>
                          <div className="dashboard-user-cell">
                            <span className="dashboard-user-avatar">
                              {getInitials(appointment.patient)}
                            </span>
                            <strong>{appointment.patient}</strong>
                          </div>
                        </td>
                        <td>
                          <strong>{appointment.doctor}</strong>
                        </td>
                        <td>
                          <div className="dashboard-date-cell">
                            <strong>{formatDate(appointment.date)}</strong>
                            <small><Clock size={10} /> {appointment.time}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`appointment-status ${st}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          <div className="hospital-actions">
                            <button
                              type="button"
                              className="approve-btn"
                              title="Confirm appointment"
                              aria-label={`Confirm appointment for ${appointment.patient}`}
                              disabled={updatingId !== null || !canConfirm}
                              onClick={() => requestAction("appointment", "approve", appointment)}
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              type="button"
                              className="reject-btn"
                              title="Cancel appointment"
                              aria-label={`Cancel appointment for ${appointment.patient}`}
                              disabled={updatingId !== null || !canCancel}
                              onClick={() => requestAction("appointment", "reject", appointment)}
                            >
                              <XCircle size={15} />
                            </button>
                            {updatingId === appointment.id && (
                              <RefreshCw size={13} className="dashboard-spin hospital-saving" />
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
        </section>

        {/* Pending hospitals */}
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Pending Approvals</h3>
              <p>New hospital registrations</p>
            </div>
            <span className={`panel-badge ${pendingHospitals.length ? "panel-badge-amber" : "panel-badge-muted"}`}>
              <Clock size={11} /> {loading ? "…" : pendingHospitals.length} pending
            </span>
          </div>

          <div className="pending-hospital-list">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="pending-hospital">
                  <div className="dashboard-skeleton-line" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                  <div className="hospital-details">
                    <div className="dashboard-skeleton-line" style={{ width: "65%", height: 14, marginBottom: 8 }} />
                    <div className="dashboard-skeleton-line" style={{ width: "45%", height: 12 }} />
                  </div>
                </div>
              ))
            ) : pendingHospitals.length === 0 ? (
              <div className="dashboard-empty">
                <CheckCircle2 size={28} />
                <p>All caught up</p>
                <small>No pending hospital approvals right now.</small>
              </div>
            ) : (
              pendingHospitals.map((hospital) => (
                <div className="pending-hospital" key={hospital.id}>
                  <div className="hospital-icon">
                    <Hospital size={20} />
                  </div>

                  <div className="hospital-details">
                    <h4>{hospital.name}</h4>
                    <p><MapPin size={11} /> {hospital.location}</p>
                    <small><CalendarClock size={10} /> Applied {timeAgo(hospital.date)}</small>
                  </div>

                  <div className="hospital-actions">
                    <button
                      type="button"
                      className="approve-btn"
                      title="Approve"
                      aria-label={`Approve ${hospital.name}`}
                      disabled={updatingId !== null}
                      onClick={() => requestAction("hospital", "approve", hospital)}
                    >
                      <CheckCircle size={16} />
                    </button>

                    <button
                      type="button"
                      className="reject-btn"
                      title="Reject"
                      aria-label={`Reject ${hospital.name}`}
                      disabled={updatingId !== null}
                      onClick={() => requestAction("hospital", "reject", hospital)}
                    >
                      <XCircle size={16} />
                    </button>

                    {updatingId === hospital.id && (
                      <RefreshCw size={13} className="dashboard-spin hospital-saving" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ---------- Unified confirmation dialog for ALL actions ---------- */}
      <ConfirmDialog
        open={dialog.open}
        variant={
          dialog.action === "approve"
            ? "success"
            : dialog.action === "reject" || dialog.action === "delete"
            ? "danger"
            : "default"
        }
        title={getDialogTitle(dialog)}
        message={getDialogMessage(dialog)}
        confirmLabel={getDialogConfirmLabel(dialog)}
        cancelLabel="Cancel"
        loading={updatingId !== null}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      >
        {(dialog.action === "reject" || dialog.action === "delete") && (
          <label>
            Reason <span style={{ color: "hsl(0 72% 46%)" }}>*</span>
            <textarea
              value={dialog.reason}
              onChange={(e) => setDialog((d) => ({ ...d, reason: e.target.value }))}
              placeholder={`Explain why you are ${
                dialog.action === "delete" ? "deleting" : "rejecting"
              } this ${dialog.type}…`}
              disabled={updatingId !== null}
              autoFocus
            />
          </label>
        )}
      </ConfirmDialog>
    </div>
  );
}

export default AdminDashboard;