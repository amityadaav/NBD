import React, { useMemo } from "react";
import {
  CalendarDays, Clock, HeartPulse, MapPin, Search, Stethoscope,
  UserRound, FileText, ArrowRight, Plus, Activity, TrendingUp,
  Sparkles, ShieldCheck, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const appointments = [
  {
    id: 1,
    doctor: "Dr. Rahul Sharma",
    specialty: "Cardiologist",
    date: "20 Oct 2026",
    time: "10:30 AM",
    status: "Confirmed",
    initials: "RS",
  },
  {
    id: 2,
    doctor: "Dr. Priya Verma",
    specialty: "Dermatologist",
    date: "23 Oct 2026",
    time: "12:00 PM",
    status: "Pending",
    initials: "PV",
  },
];

const quickActions = [
  {
    title: "Find a Doctor",
    description: "Search doctors by specialty",
    icon: Stethoscope,
    path: "/find-doctors",
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
    title: "My Profile",
    description: "Manage your personal details",
    icon: UserRound,
    path: "/user/profile",
    tone: "purple",
  },
];

function UserDashboard() {
  const navigate = useNavigate();

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

  return (
    <div className="ud-dashboard">
      {/* ---------- Hero Header ---------- */}
      <div className="ud-hero">
        <div className="ud-hero-glow" aria-hidden="true" />
        <div className="ud-hero-content">
          <div className="ud-hero-left">
            <span className="ud-eyebrow">
              <Sparkles size={11} /> Patient Portal
            </span>
            <h1>Welcome back, {userName}!</h1>
            <p>
              Manage your healthcare, appointments and medical information
              from one place.
            </p>
          </div>

          <button
            className="ud-hero-btn"
            onClick={() => navigate("/find-doctors")}
          >
            <Plus size={18} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <section className="ud-stats">
        <article className="ud-stat-card" style={{ "--stagger": "0ms" }}>
          <div className="ud-stat-icon ud-teal">
            <CalendarDays size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Upcoming Appointments</p>
            <h2>{appointments.length}</h2>
            <span>Scheduled visits</span>
          </div>
        </article>

        <article className="ud-stat-card" style={{ "--stagger": "60ms" }}>
          <div className="ud-stat-icon ud-blue">
            <Activity size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Completed Visits</p>
            <h2>0</h2>
            <span>Your visit history</span>
          </div>
        </article>

        <article className="ud-stat-card" style={{ "--stagger": "120ms" }}>
          <div className="ud-stat-icon ud-purple">
            <FileText size={22} />
          </div>
          <div className="ud-stat-body">
            <p>Medical Records</p>
            <h2>0</h2>
            <span>Your health documents</span>
          </div>
        </article>
      </section>

      {/* ---------- Main Grid ---------- */}
      <section className="ud-main-grid">
        {/* Appointments List */}
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

          {appointments.length > 0 ? (
            <div className="ud-appointment-list">
              {appointments.map((appointment) => (
                <article className="ud-appointment" key={appointment.id}>
                  <div className="ud-doctor-avatar">
                    {appointment.initials}
                  </div>

                  <div className="ud-appointment-info">
                    <h3>{appointment.doctor}</h3>
                    <p>{appointment.specialty}</p>
                    <div className="ud-appointment-meta">
                      <span><CalendarDays size={14} /> {appointment.date}</span>
                      <span><Clock size={14} /> {appointment.time}</span>
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
            </div>
          )}
        </div>

        {/* Health Card */}
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
            onClick={() => navigate("/find-doctors")}
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

      {/* ---------- Footer ---------- */}
      <footer className="ud-footer">
        <MapPin size={15} />
        <span>NearbyDoctor — Your health, our priority.</span>
      </footer>
    </div>
  );
}

export default UserDashboard;