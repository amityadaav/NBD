import React, { useMemo, useState, useEffect } from "react";
import {
  CalendarDays, Clock, HeartPulse, MapPin, Stethoscope,
  UserRound, FileText, ArrowRight, Plus, Activity, TrendingUp,
  Sparkles, ChevronRight, Loader2, AlertCircle, Pill,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const quickActions = [
  {
    title: "Find a Doctor",
    description: "Search doctors by specialty",
    icon: Stethoscope,
    path: "/user/doctors",
    tone: "teal",
  },
  {
    title: "My Appointments",
    description: "View and manage bookings",
    icon: CalendarDays,
    path: "/user/appointments",
    tone: "blue",
  },
  {
    title: "My Prescriptions",
    description: "See medicines prescribed to you",
    icon: Pill,
    path: "/user/prescriptions",
    tone: "purple",
  },
];

function UserDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, records: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("user") ||
        localStorage.getItem("user") ||
        "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const userName = storedUser?.fullname || storedUser?.name || "Patient";
  const firstName = userName.split(" ")[0];
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Date-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "http://localhost:5000/api/user/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        setAppointments(data.appointments || []);
        setStats(data.stats || { upcoming: 0, completed: 0, records: 0 });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Format date only — no time contamination
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format backend `time` string ("10:30" or "10:30 AM") to 12-hour display
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const match = /^(\d{1,2}):(\d{2})/.exec(timeStr);
    if (!match) return timeStr;
    const d = new Date();
    d.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "DR";

  return (
    <div className="ud-dashboard">
      {/* ---------- Hero ---------- */}
      <div className="ud-hero">
        <div className="ud-hero-glow" aria-hidden="true" />
        <div className="ud-hero-content">
          <div className="ud-hero-left">
            <span className="ud-eyebrow">
              <Sparkles size={11} /> Patient Portal
            </span>
            <h1>
              {greeting}, {firstName}!
            </h1>
            <p>
              Manage your healthcare, appointments and medical information
              from one place.
            </p>
          </div>

          <button
            className="ud-hero-btn"
            onClick={() => navigate("/user/doctors")}
          >
            <Plus size={18} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* ---------- Error ---------- */}
      {error && (
        <div className="ud-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <section className="ud-stats">
        <article
          className="ud-stat-card ud-stat-clickable"
          style={{ "--stagger": "0ms" }}
          onClick={() => navigate("/user/appointments")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            navigate("/user/appointments")
          }
        >
          <div className="ud-stat-icon ud-teal">
            <CalendarDays size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Upcoming Appointments</p>
            <h2>
              {loading ? (
                <Loader2 className="spin" size={24} />
              ) : (
                stats.upcoming
              )}
            </h2>
            <span>Scheduled visits</span>
          </div>
        </article>

        <article
          className="ud-stat-card ud-stat-clickable"
          style={{ "--stagger": "60ms" }}
          onClick={() => navigate("/user/appointments")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            navigate("/user/appointments")
          }
        >
          <div className="ud-stat-icon ud-blue">
            <Activity size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Completed Visits</p>
            <h2>
              {loading ? (
                <Loader2 className="spin" size={24} />
              ) : (
                stats.completed
              )}
            </h2>
            <span>Your visit history</span>
          </div>
        </article>

        <article
          className="ud-stat-card ud-stat-clickable"
          style={{ "--stagger": "120ms" }}
          onClick={() => navigate("/user/records")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            navigate("/user/records")
          }
        >
          <div className="ud-stat-icon ud-purple">
            <FileText size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Medical Records</p>
            <h2>
              {loading ? (
                <Loader2 className="spin" size={24} />
              ) : (
                stats.records
              )}
            </h2>
            <span>Your health documents</span>
          </div>
        </article>
      </section>

      {/* ---------- Main Grid ---------- */}
      <section className="ud-main-grid">
        <div className="ud-panel ud-appointments">
          <div className="ud-panel-heading">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Keep track of your scheduled doctor visits.</p>
            </div>
            <button
              className="ud-text-btn"
              onClick={() => navigate("/user/appointments")}
            >
              View all <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="ud-loading">
              <Loader2 className="spin" size={28} />
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="ud-appointment-list">
              {appointments.slice(0, 3).map((appointment) => (
                <article
                  className="ud-appointment"
                  key={appointment._id || appointment.id}
                >
                  <div className="ud-doctor-avatar">
                    {getInitials(appointment.doctorName)}
                  </div>

                  <div className="ud-appointment-info">
                    <h3>{appointment.doctorName}</h3>
                    <p>{appointment.specialty}</p>
                    <div className="ud-appointment-meta">
                      <span>
                        <CalendarDays size={14} /> {formatDate(appointment.date)}
                      </span>
                      {appointment.time && (
                        <span>
                          <Clock size={14} /> {formatTime(appointment.time)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`ud-status ${
                      appointment.status === "Confirmed"
                        ? "ud-confirmed"
                        : "ud-pending"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="ud-empty">
              <CalendarDays size={32} />
              <h3>No appointments yet</h3>
              <p>Book a consultation with a doctor to get started.</p>
              <button
                className="ud-outline-btn"
                onClick={() => navigate("/user/doctors")}
                style={{ marginTop: 16 }}
              >
                Find a Doctor <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        <aside className="ud-panel ud-health-card">
          <div className="ud-health-icon">
            <HeartPulse size={26} />
          </div>
          <h2>Your health matters</h2>
          <p>
            Find the right doctor and take the next step toward better
            healthcare.
          </p>
          <button
            className="ud-outline-btn"
            onClick={() => navigate("/user/doctors")}
          >
            Find a Doctor <ArrowRight size={15} />
          </button>
        </aside>
      </section>

      {/* ---------- Quick Actions ---------- */}
      <section className="ud-panel ud-actions-panel">
        <div className="ud-panel-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Everything you need, just a click away.</p>
          </div>
        </div>

        <div className="ud-actions-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                className="ud-action-card"
                key={action.title}
                onClick={() => navigate(action.path)}
              >
                <span className={`ud-action-icon ud-icon-${action.tone}`}>
                  <Icon size={22} />
                </span>
                <span className="ud-action-text">
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>
                <ChevronRight className="ud-action-arrow" size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <footer className="ud-footer">
        <MapPin size={15} />
        <span>NearbyDoctor — Your health, our priority.</span>
      </footer>
    </div>
  );
}

export default UserDashboard;