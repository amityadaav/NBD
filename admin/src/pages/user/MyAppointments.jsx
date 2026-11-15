import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Stethoscope, FileText,
  Loader2, AlertCircle, XCircle, CheckCircle2, Hourglass, Plus,
} from "lucide-react";
import "./MyAppointments.css";

const STATUS_CONFIG = {
  Pending:   { icon: Hourglass,  color: "pending",   label: "Pending" },
  Confirmed: { icon: CheckCircle2, color: "confirmed", label: "Confirmed" },
  Cancelled: { icon: XCircle,    color: "cancelled", label: "Cancelled" },
  Completed: { icon: CheckCircle2, color: "completed", label: "Completed" },
};

function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAppointments = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/user/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load appointments");
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Appointments fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const filtered =
    filter === "All"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  return (
    <div className="ma-page">
      {/* Header */}
      <div className="ma-header">
        <div>
          <h1>My Appointments</h1>
          <p>View and manage all your doctor consultations.</p>
        </div>
        <button
          className="ma-book-btn"
          onClick={() => navigate("/user/doctors")}
        >
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {/* Filter tabs */}
      <div className="ma-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`ma-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            {tab !== "All" && (
              <span className="ma-tab-count">
                {appointments.filter((a) => a.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="ma-state">
          <Loader2 className="spin" size={32} />
          <p>Loading appointments...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="ma-state ma-error">
          <AlertCircle size={28} />
          <p>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="ma-state">
          <CalendarDays size={36} />
          <h3>No {filter !== "All" ? filter.toLowerCase() : ""} appointments</h3>
          <p>Book a consultation with a doctor to get started.</p>
          <button
            className="ma-book-btn"
            onClick={() => navigate("/user/doctors")}
          >
            <Plus size={18} /> Find a Doctor
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="ma-list">
          {filtered.map((appt) => {
            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.Pending;
            const StatusIcon = cfg.icon;

            return (
              <article className="ma-card" key={appt._id}>
                <div className="ma-card-main">
                  <div className="ma-doctor-avatar">
                    {appt.doctorImage ? (
                      <img src={appt.doctorImage} alt={appt.doctorName} />
                    ) : (
                      appt.doctorName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    )}
                  </div>

                  <div className="ma-doctor-info">
                    <h3>{appt.doctorName}</h3>
                    <span className="ma-specialty">
                      <Stethoscope size={13} /> {appt.specialty}
                    </span>

                    <div className="ma-meta">
                      <span><CalendarDays size={14} /> {formatDate(appt.date)}</span>
                      <span><Clock size={14} /> {appt.time}</span>
                      {appt.hospitalName && (
                        <span>
                          <MapPin size={14} /> {appt.hospitalName}
                          {appt.hospitalCity ? `, ${appt.hospitalCity}` : ""}
                        </span>
                      )}
                    </div>

                    {appt.reason && (
                      <p className="ma-reason">
                        <FileText size={13} /> {appt.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ma-card-side">
                  <span className={`ma-status ma-status-${cfg.color}`}>
                    <StatusIcon size={14} /> {cfg.label}
                  </span>
                  <div className="ma-type">Type: {appt.type}</div>
                  <div className="ma-fee">₹{appt.fee}</div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;