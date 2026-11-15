import { useCallback, useEffect, useState } from "react";
import {
  Stethoscope, UserCheck, Clock, CalendarDays, CheckCircle, CalendarCheck,
  RefreshCw, MapPin, AlertCircle, ArrowRight, Building2, TrendingUp,
  Activity, ChevronRight, Sparkles,
} from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";
import "./HospitalDashboard.css";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const apptCount = (result) =>
  result.status === "fulfilled" ? Number(result.value.data?.total ?? 0) : 0;

const statusClass = (status) =>
  `hdb-status hdb-status-${String(status || "").toLowerCase()}`;

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

const HospitalDashboard = () => {
  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    pendingDoctors: 0,
  });
  const [apptStats, setApptStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const fetchDashboard = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    setWarning("");

    const results = await Promise.allSettled([
      api.get("/hospital-admin/dashboard"),
      api.get("/hospital-admin/doctors", { params: { limit: 5 } }),
      api.get("/hospital-admin/appointments", { params: { limit: 5 } }),
      api.get("/hospital-admin/appointments", { params: { status: "Pending", limit: 1 } }),
      api.get("/hospital-admin/appointments", { params: { status: "Confirmed", limit: 1 } }),
      api.get("/hospital-admin/appointments", { params: { status: "Completed", limit: 1 } }),
    ]);

    if (results[0].status === "rejected") {
      setError(getErrorMessage(results[0].reason, "Unable to load hospital dashboard."));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const main = results[0].value.data;
    setHospital(main.hospital);
    setStats({
      totalDoctors: Number(main.stats?.totalDoctors ?? 0),
      activeDoctors: Number(main.stats?.activeDoctors ?? 0),
      pendingDoctors: Number(main.stats?.pendingDoctors ?? 0),
    });

    setRecentDoctors(
      results[1].status === "fulfilled" ? results[1].value.data?.doctors || [] : []
    );

    if (results[2].status === "fulfilled") {
      setRecentAppointments(results[2].value.data?.appointments || []);
    } else {
      setRecentAppointments([]);
    }

    setApptStats({
      total: apptCount(results[2]),
      pending: apptCount(results[3]),
      confirmed: apptCount(results[4]),
      completed: apptCount(results[5]),
    });

    if (results.slice(1).some((r) => r.status === "rejected")) {
      setWarning("Some dashboard sections could not be loaded. Try refreshing.");
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="hdb-page">
        <div className="hdb-skeleton-hero" />
        <div className="hdb-skeleton-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="hdb-skeleton-card" />
          ))}
        </div>
        <div className="hdb-skeleton-panel" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hdb-page">
        <div className="hdb-alert hdb-alert-error" role="alert">
          <AlertCircle size={18} /> {error}
        </div>
        <button
          type="button"
          className="hdb-refresh-btn"
          onClick={() => fetchDashboard()}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  const cards = [
    ["Total Doctors", stats.totalDoctors, Stethoscope, "#1d4ed8", "All doctors in your hospital"],
    ["Active Doctors", stats.activeDoctors, UserCheck, "#15803d", "Approved and accepting patients"],
    ["Pending Doctors", stats.pendingDoctors, Clock, "#b45309", "Awaiting Main Admin approval"],
    ["Total Appointments", apptStats.total, CalendarDays, "#0f766e", "All bookings"],
    ["Pending Appointments", apptStats.pending, Clock, "#7c3aed", "Need your confirmation"],
    ["Confirmed", apptStats.confirmed, CalendarCheck, "#0891b2", "Upcoming visits"],
    ["Completed", apptStats.completed, CheckCircle, "#15803d", "Finished visits"],
  ];

  const city = hospital?.address?.city;
  const completionRate = apptStats.total
    ? Math.round((apptStats.completed / apptStats.total) * 100)
    : 0;

  return (
    <div className="hdb-page">
      {/* ---------- Hero greeting band ---------- */}
      <div className="hdb-hero">
        <div className="hdb-hero-glow" aria-hidden="true" />
        <div className="hdb-hero-left">
          <span className="hdb-hero-eyebrow">
            <Sparkles size={12} /> Welcome back
          </span>
          <h2>{hospital?.hospitalName || "Hospital Dashboard"}</h2>
          <p className="hdb-hero-meta">
            <span><MapPin size={13} /> {city || "Location not set"}</span>
            <span className="hdb-hero-sep" />
            <span><Building2 size={13} /> Hospital Admin</span>
          </p>
        </div>

        <button
          type="button"
          className="hdb-hero-refresh"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "hdb-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ---------- Alerts ---------- */}
      {warning && (
        <div className="hdb-alert hdb-alert-warning" role="status">
          <AlertCircle size={18} /> {warning}
        </div>
      )}

      {apptStats.pending > 0 && (
        <div className="hdb-alert hdb-alert-info" role="status">
          <Clock size={18} />
          <span>
            <strong>{apptStats.pending}</strong> appointment{apptStats.pending > 1 ? "s" : ""} waiting for confirmation.
          </span>
          <ArrowRight size={16} className="hdb-alert-arrow" />
        </div>
      )}

      {stats.pendingDoctors > 0 && (
        <div className="hdb-alert hdb-alert-warning" role="status">
          <Clock size={18} />
          <span>
            <strong>{stats.pendingDoctors}</strong> doctor{stats.pendingDoctors > 1 ? "s are" : " is"} awaiting Main Admin approval.
          </span>
          <ArrowRight size={16} className="hdb-alert-arrow" />
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div className="hdb-stats">
        {cards.map(([title, value, icon, color, caption], i) => (
          <div key={title} className="hdb-stat-item" style={{ "--stagger": `${i * 40}ms` }}>
            <StatCard
              title={title}
              value={Number(value).toLocaleString("en-IN")}
              icon={icon}
              color={color}
              change={caption}
            />
          </div>
        ))}
      </div>

      {/* ---------- Quick insight strip ---------- */}
      <div className="hdb-insights">
        <div className="hdb-insight">
          <div className="hdb-insight-icon hdb-insight-icon-teal">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="hdb-insight-label">Completion Rate</span>
            <strong className="hdb-insight-value">{completionRate}%</strong>
          </div>
          <div className="hdb-insight-bar">
            <span style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="hdb-insight">
          <div className="hdb-insight-icon hdb-insight-icon-blue">
            <Activity size={18} />
          </div>
          <div>
            <span className="hdb-insight-label">Active Doctors</span>
            <strong className="hdb-insight-value">
              {stats.activeDoctors}
              <small> / {stats.totalDoctors}</small>
            </strong>
          </div>
          <div className="hdb-insight-bar">
            <span
              style={{
                width: `${stats.totalDoctors ? (stats.activeDoctors / stats.totalDoctors) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ---------- Sections ---------- */}
      <div className="hdb-sections">
        {/* Recent appointments */}
        <section className="hdb-panel">
          <div className="hdb-panel-header">
            <div>
              <h3>Recent Appointments</h3>
              <p>Latest patient bookings</p>
            </div>
            <span className="hdb-panel-badge">
              <CalendarDays size={12} /> {recentAppointments.length} shown
            </span>
          </div>

          <div className="hdb-table-wrapper">
            <table className="hdb-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="hdb-empty">
                      <div className="hdb-empty-state">
                        <CalendarDays size={28} />
                        <p>No appointments yet</p>
                        <small>New bookings will appear here.</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <div className="hdb-cell-user">
                          <span className="hdb-avatar">
                            {getInitials(a.patientName)}
                          </span>
                          <div>
                            <strong>{a.patientName}</strong>
                            <small>{a.patientPhone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{a.doctorId?.name || "N/A"}</strong>
                        <small>{a.doctorId?.specialty || ""}</small>
                      </td>
                      <td>
                        <strong>{formatDate(a.appointmentDate)}</strong>
                        {a.appointmentTime && (
                          <small>{formatTime(a.appointmentTime)}</small>
                        )}
                      </td>
                      <td>
                        <span className={statusClass(a.status)}>{a.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent doctors */}
        <section className="hdb-panel">
          <div className="hdb-panel-header">
            <div>
              <h3>Recently Added Doctors</h3>
              <p>Newest doctors in your hospital</p>
            </div>
            <span className="hdb-panel-badge">
              <UserCheck size={12} /> {recentDoctors.length}
            </span>
          </div>

          <div className="hdb-doctor-list">
            {recentDoctors.length === 0 ? (
              <div className="hdb-empty-state">
                <Stethoscope size={28} />
                <p>No doctors added yet</p>
                <small>New doctors will show up here.</small>
              </div>
            ) : (
              recentDoctors.map((d) => (
                <div className="hdb-doctor" key={d._id}>
                  <div className="hdb-doctor-icon">
                    <Stethoscope size={20} />
                  </div>
                  <div className="hdb-doctor-info">
                    <strong>{d.name}</strong>
                    <small>{d.specialty || "Specialty not set"}</small>
                  </div>
                  <span className={statusClass(d.verificationStatus)}>
                    {d.verificationStatus}
                  </span>
                  <ChevronRight size={16} className="hdb-doctor-chevron" />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HospitalDashboard;