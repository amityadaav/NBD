import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill, Stethoscope, CalendarDays, FileText, Loader2, AlertCircle,
  ChevronDown, ChevronUp, ClipboardList,
} from "lucide-react";
import "./MyPrescriptions.css";

const STATUS_CLASS = {
  Active: "mp-status-active",
  Completed: "mp-status-completed",
  Expired: "mp-status-expired",
};

function MyPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:5000/api/user/prescriptions",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load prescriptions");
        }

        setPrescriptions(data.prescriptions || []);
      } catch (err) {
        console.error("Prescriptions fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [navigate]);

  const toggle = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="mp-page">
      <div className="mp-header">
        <div>
          <h1>My Prescriptions</h1>
          <p>View medicines and instructions prescribed by your doctors.</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mp-state">
          <Loader2 className="spin" size={32} />
          <p>Loading prescriptions...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mp-state mp-error">
          <AlertCircle size={28} />
          <p>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && prescriptions.length === 0 && (
        <div className="mp-state">
          <ClipboardList size={36} />
          <h3>No prescriptions yet</h3>
          <p>Prescriptions issued by your doctors will appear here.</p>
          <button
            className="mp-book-btn mp-book-btn--outline"
            onClick={() => navigate("/user/doctors")}
          >
            <Stethoscope size={16} /> Find a Doctor
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && prescriptions.length > 0 && (
        <div className="mp-list">
          {prescriptions.map((p) => {
            const isOpen = !!expanded[p._id];
            return (
              <article className="mp-card" key={p._id}>
                <div
                  className="mp-card-head"
                  onClick={() => toggle(p._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && toggle(p._id)
                  }
                >
                  <div className="mp-doctor-avatar">
                    {p.doctorImage ? (
                      <img src={p.doctorImage} alt={p.doctorName} />
                    ) : (
                      p.doctorName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    )}
                  </div>

                  <div className="mp-info">
                    <h3>{p.doctorName}</h3>
                    <span className="mp-specialty">
                      <Stethoscope size={13} /> {p.specialty}
                    </span>
                    <div className="mp-meta">
                      <span>
                        <CalendarDays size={13} /> Issued:{" "}
                        {formatDate(p.issuedDate)}
                      </span>
                      <span>
                        <Pill size={13} /> {p.medicines?.length || 0}{" "}
                        {p.medicines?.length === 1 ? "medicine" : "medicines"}
                      </span>
                    </div>
                  </div>

                  <div className="mp-side">
                    <span className={`mp-status ${STATUS_CLASS[p.status] || ""}`}>
                      {p.status}
                    </span>
                    <span className="mp-chevron">
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="mp-card-body">
                    {p.diagnosis && (
                      <div className="mp-block">
                        <h4>
                          <FileText size={14} /> Diagnosis
                        </h4>
                        <p>{p.diagnosis}</p>
                      </div>
                    )}

                    {p.medicines?.length > 0 && (
                      <div className="mp-block">
                        <h4>
                          <Pill size={14} /> Medicines
                        </h4>
                        <div className="mp-medicines">
                          {p.medicines.map((m, i) => (
                            <div className="mp-medicine" key={i}>
                              <div className="mp-med-name">{m.name}</div>
                              <div className="mp-med-tags">
                                {m.dosage && (
                                  <span className="mp-tag">{m.dosage}</span>
                                )}
                                {m.frequency && (
                                  <span className="mp-tag">{m.frequency}</span>
                                )}
                                {m.duration && (
                                  <span className="mp-tag">{m.duration}</span>
                                )}
                              </div>
                              {m.instructions && (
                                <p className="mp-med-instructions">
                                  {m.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.notes && (
                      <div className="mp-block">
                        <h4>Notes</h4>
                        <p>{p.notes}</p>
                      </div>
                    )}

                    {p.followUpDate && (
                      <div className="mp-block mp-followup">
                        <CalendarDays size={14} />
                        <span>
                          Follow-up on {formatDate(p.followUpDate)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyPrescriptions;