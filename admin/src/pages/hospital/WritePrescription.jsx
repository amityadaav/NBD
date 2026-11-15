import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Pill, Plus, Trash2, Stethoscope, CalendarDays, Loader2,
  AlertCircle, CheckCircle2, ArrowLeft, User, Clock, FileText,
  Stethoscope as StethoscopeIcon, BadgeCheck, RotateCcw, Sparkles,
} from "lucide-react";
import "./WritePrescription.css";

const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function WritePrescription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get("appointmentId");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [apptError, setApptError] = useState(null);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [status, setStatus] = useState("Active");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const res = await fetch(
          "http://localhost:5000/api/hospital-admin/prescriptions/eligible-appointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load appointments");
        }

        const list = data.appointments || [];
        setAppointments(list);

        if (preselectId) {
          const found = list.find((a) => a._id === preselectId);
          if (found) setSelectedAppt(found);
        }
      } catch (err) {
        console.error(err);
        setApptError(err.message);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetchAppointments();
  }, [token, navigate, preselectId]);

  const addMedicine = () =>
    setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }]);

  const removeMedicine = (i) =>
    setMedicines((prev) => prev.filter((_, idx) => idx !== i));

  const updateMedicine = (i, field, value) =>
    setMedicines((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );

  const resetForm = () => {
    setSelectedAppt(null);
    setDiagnosis("");
    setMedicines([{ ...EMPTY_MEDICINE }]);
    setNotes("");
    setFollowUpDate("");
    setStatus("Active");
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedAppt) {
      setSubmitError("Please select an appointment first.");
      return;
    }
    if (!selectedAppt.patientId) {
      setSubmitError(
        "This patient has no user account. Cannot issue prescription."
      );
      return;
    }
    if (medicines.every((m) => !m.name.trim())) {
      setSubmitError("Please add at least one medicine.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        appointmentId: selectedAppt._id,
        patientId: selectedAppt.patientId,
        diagnosis,
        medicines: medicines.filter((m) => m.name.trim()),
        notes,
        followUpDate: followUpDate || null,
        status,
      };

      const res = await fetch(
        "http://localhost:5000/api/hospital-admin/prescriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to issue prescription");
      }

      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "P";

  return (
    <div className="wp-page">
      <button className="wp-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to appointments
      </button>

      <div className="wp-header">
        <div className="wp-header-main">
          <h1>Write Prescription</h1>
          <p>
            Select an appointment — the doctor and patient are recorded
            automatically.
          </p>
        </div>
      </div>

      {success && (
        <div className="wp-banner wp-banner-success">
          <CheckCircle2 size={18} />
          Prescription issued successfully.
        </div>
      )}

      {submitError && (
        <div className="wp-banner wp-banner-error">
          <AlertCircle size={18} />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="wp-form">
        {/* Step 1 — Appointment picker */}
        <section className="wp-section">
          <h2>
            <span className="wp-step">1</span> Select Appointment
          </h2>

          {loadingAppts && (
            <div className="wp-state">
              <Loader2 className="spin" size={24} />
              <p>Loading appointments...</p>
            </div>
          )}

          {!loadingAppts && apptError && (
            <div className="wp-state wp-error">
              <AlertCircle size={20} />
              <p>{apptError}</p>
            </div>
          )}

          {!loadingAppts && !apptError && appointments.length === 0 && (
            <div className="wp-state">
              <CalendarDays size={28} />
              <h3>No appointments found</h3>
              <p>Appointments at your hospital will appear here.</p>
            </div>
          )}

          {!loadingAppts && !apptError && appointments.length > 0 && (
            <div className="wp-appt-list">
              {appointments.map((a) => {
                const active = selectedAppt?._id === a._id;
                return (
                  <button
                    key={a._id}
                    type="button"
                    className={`wp-appt ${active ? "active" : ""}`}
                    onClick={() => setSelectedAppt(a)}
                  >
                    <div className="wp-appt-avatar">
                      {getInitials(a.patientName)}
                    </div>
                    <div className="wp-appt-info">
                      <div className="wp-appt-top">
                        <strong>{a.patientName}</strong>
                        <span className="wp-appt-status">{a.status}</span>
                      </div>
                      <span className="wp-appt-email">{a.patientEmail}</span>
                      <div className="wp-appt-meta">
                        <span>
                          <StethoscopeIcon size={12} /> {a.doctorName} —{" "}
                          {a.doctorSpecialty}
                        </span>
                        <span>
                          <CalendarDays size={12} /> {formatDate(a.date)}
                        </span>
                        <span>
                          <Clock size={12} /> {a.time}
                        </span>
                      </div>
                    </div>
                    {active && (
                      <span className="wp-appt-check">
                        <BadgeCheck size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected patient summary */}
        {selectedAppt && (
          <div className="wp-selected">
            <div className="wp-selected-avatar">
              {getInitials(selectedAppt.patientName)}
            </div>
            <div className="wp-selected-body">
              <span className="wp-selected-label">Prescribing for</span>
              <strong>{selectedAppt.patientName}</strong>
              <div className="wp-selected-meta">
                <span>
                  <StethoscopeIcon size={12} /> {selectedAppt.doctorName}
                </span>
                <span>
                  <CalendarDays size={12} /> {formatDate(selectedAppt.date)} ·{" "}
                  {selectedAppt.time}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Diagnosis */}
        <section className="wp-section">
          <h2>
            <span className="wp-step">2</span> Clinical Details
          </h2>

          <div className="wp-field">
            <label>Diagnosis</label>
            <input
              type="text"
              placeholder="e.g. Mild hypertension"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="wp-row">
            <div className="wp-field">
              <label>Follow-up Date (optional)</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="wp-field">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </section>

        {/* Step 3 — Medicines */}
        <section className="wp-section">
          <div className="wp-section-head">
            <h2>
              <span className="wp-step">3</span> Medicines
              <span className="wp-count">{medicines.length}</span>
            </h2>
            <button
              type="button"
              className="wp-add-btn"
              onClick={addMedicine}
            >
              <Plus size={15} /> Add Medicine
            </button>
          </div>

          <div className="wp-medicine-list">
            {medicines.map((m, i) => (
              <div className="wp-medicine" key={i}>
                <div className="wp-med-head">
                  <span className="wp-med-num">
                    <span className="wp-med-index">{i + 1}</span>
                    <Pill size={14} /> Medicine
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      className="wp-remove"
                      onClick={() => removeMedicine(i)}
                      title="Remove medicine"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="wp-field">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amlodipine"
                    value={m.name}
                    onChange={(e) =>
                      updateMedicine(i, "name", e.target.value)
                    }
                  />
                </div>

                <div className="wp-grid-3">
                  <div className="wp-field">
                    <label>Dosage</label>
                    <input
                      type="text"
                      placeholder="500mg"
                      value={m.dosage}
                      onChange={(e) =>
                        updateMedicine(i, "dosage", e.target.value)
                      }
                    />
                  </div>
                  <div className="wp-field">
                    <label>Frequency</label>
                    <input
                      type="text"
                      placeholder="Twice a day"
                      value={m.frequency}
                      onChange={(e) =>
                        updateMedicine(i, "frequency", e.target.value)
                      }
                    />
                  </div>
                  <div className="wp-field">
                    <label>Duration</label>
                    <input
                      type="text"
                      placeholder="5 days"
                      value={m.duration}
                      onChange={(e) =>
                        updateMedicine(i, "duration", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="wp-field">
                  <label>Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. After meals"
                    value={m.instructions}
                    onChange={(e) =>
                      updateMedicine(i, "instructions", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 4 — Notes */}
        <section className="wp-section">
          <h2>
            <span className="wp-step">4</span> Additional Notes
          </h2>
          <div className="wp-field">
            <textarea
              rows={3}
              placeholder="Any additional advice for the patient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </section>

        <div className="wp-actions">
          <button
            type="button"
            className="wp-cancel"
            onClick={resetForm}
            disabled={submitting}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            type="submit"
            className="wp-submit"
            disabled={submitting || !selectedAppt}
          >
            {submitting ? (
              <>
                <Loader2 className="spin" size={16} /> Issuing...
              </>
            ) : (
              <>
                <FileText size={16} /> Issue Prescription
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}