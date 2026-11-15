import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Hospital, MapPin, Phone, Mail, Globe, Save, RotateCcw, Lock,
  AlertCircle, CheckCircle, Sparkles, BedDouble, CalendarClock,
  Stethoscope, Ambulance, Siren, Building2, ShieldCheck, BadgeCheck,
  User, Pencil, Info,
} from "lucide-react";
import api from "../../services/api";
import "./HospitalProfile.css";

const specialtyOptions = [
  "Cardiology", "Dermatology", "ENT", "General Medicine", "Gynecology",
  "Neurology", "Ophthalmology", "Orthopedics", "Pediatrics", "Radiology",
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const toForm = (h) => ({
  hospitalName: h.hospitalName || "",
  hospitalType: h.hospitalType || "",
  ownershipType: h.ownershipType || "",
  email: h.email || "",
  establishmentYear: h.establishmentYear ?? "",
  phone: h.phone || "",
  alternatePhone: h.alternatePhone || "",
  website: h.website || "",
  description: h.description || "",
  totalBeds: String(h.totalBeds ?? 0),
  street: h.address?.street || "",
  area: h.address?.area || "",
  city: h.address?.city || "",
  state: h.address?.state || "",
  pincode: h.address?.pincode || "",
  specialties: Array.isArray(h.specialties) ? h.specialties : [],
  emergencyAvailable: Boolean(h.emergencyAvailable),
  ambulanceAvailable: Boolean(h.ambulanceAvailable),
});

const getStatusPillClass = (status) => {
  switch (status) {
    case "Approved": return "hp-status-approved";
    case "Pending": return "hp-status-pending";
    case "Rejected": return "hp-status-rejected";
    default: return "hp-status-default";
  }
};

function HospitalProfile() {
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hospital-admin/profile");
      setOriginal(data.hospital);
      setForm(toForm(data.hospital));
      setMessage("");
    } catch (err) {
      setMessageType("error");
      setMessage(getErrorMessage(err, "Unable to load hospital profile."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  };

  const handleSpecialtyChange = (specialty) => {
    setForm((previous) => ({
      ...previous,
      specialties: previous.specialties.includes(specialty)
        ? previous.specialties.filter((item) => item !== specialty)
        : [...previous.specialties, specialty],
    }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),
        website: form.website.trim(),
        description: form.description.trim(),
        totalBeds: Number(form.totalBeds || 0),
        specialties: form.specialties,
        emergencyAvailable: form.emergencyAvailable,
        ambulanceAvailable: form.ambulanceAvailable,
        address: {
          street: form.street.trim(),
          area: form.area.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      };

      const { data } = await api.patch("/hospital-admin/profile", payload);

      setOriginal(data.hospital);
      setForm(toForm(data.hospital));
      setMessageType("success");
      setMessage(data.message || "Hospital profile updated successfully.");
    } catch (err) {
      setMessageType("error");
      setMessage(getErrorMessage(err, "Unable to save changes."));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (original) setForm(toForm(original));
    setMessage("");
  };

  // Detect unsaved changes
  const isDirty = useMemo(() => {
    if (!original || !form) return false;
    const baseline = toForm(original);
    return JSON.stringify(baseline) !== JSON.stringify(form);
  }, [original, form]);

  if (loading) {
    return (
      <div className="hp-page">
        <div className="hp-skeleton-header" />
        <div className="hp-skeleton-card" />
        <div className="hp-skeleton-card" />
        <div className="hp-skeleton-card" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="hp-page">
        <div className="hp-message hp-message-error" role="alert">
          <AlertCircle size={15} /> <span>{message || "Profile not available."}</span>
        </div>
      </div>
    );
  }

  const allSpecialties = [...new Set([...specialtyOptions, ...form.specialties])];
  const status = original?.verificationStatus || "Profile";
  const fullAddress = [form.street, form.area, form.city, form.state, form.pincode]
    .filter(Boolean).join(", ");

  return (
    <div className="hp-page">
      {/* ---------- Hero header ---------- */}
      <div className="hp-hero">
        <div className="hp-hero-glow" aria-hidden="true" />

        <div className="hp-hero-main">
          <div className="hp-hero-icon">
            <Hospital size={26} />
          </div>
          <div className="hp-hero-text">
            <span className="hp-eyebrow">
              <Sparkles size={11} /> Hospital Profile
            </span>
            <h2>{form.hospitalName || "Your Hospital"}</h2>
            <p className="hp-hero-meta">
              {form.hospitalType && (
                <span><Building2 size={12} /> {form.hospitalType}</span>
              )}
              {form.ownershipType && (
                <span><ShieldCheck size={12} /> {form.ownershipType}</span>
              )}
              {form.city && (
                <span><MapPin size={12} /> {form.city}{form.state ? `, ${form.state}` : ""}</span>
              )}
            </p>
          </div>
        </div>

        <div className="hp-hero-right">
          <span className={`hp-status-pill ${getStatusPillClass(status)}`}>
            {status === "Approved" ? <BadgeCheck size={13} /> : <Info size={13} />}
            {status}
          </span>
        </div>
      </div>

      {/* ---------- Summary strip ---------- */}
      <div className="hp-summary">
        <div className="hp-summary-item">
          <div className="hp-summary-icon hp-summary-icon-teal">
            <BedDouble size={18} />
          </div>
          <div>
            <span className="hp-summary-label">Total Beds</span>
            <strong className="hp-summary-value">{form.totalBeds || 0}</strong>
          </div>
        </div>

        <div className="hp-summary-item">
          <div className="hp-summary-icon hp-summary-icon-blue">
            <Stethoscope size={18} />
          </div>
          <div>
            <span className="hp-summary-label">Specialties</span>
            <strong className="hp-summary-value">{form.specialties.length}</strong>
          </div>
        </div>

        <div className="hp-summary-item">
          <div className="hp-summary-icon hp-summary-icon-amber">
            <CalendarClock size={18} />
          </div>
          <div>
            <span className="hp-summary-label">Established</span>
            <strong className="hp-summary-value">{form.establishmentYear || "—"}</strong>
          </div>
        </div>

        <div className="hp-summary-item">
          <div className="hp-summary-icon hp-summary-icon-green">
            {form.emergencyAvailable ? <Siren size={18} /> : <Ambulance size={18} />}
          </div>
          <div>
            <span className="hp-summary-label">Facilities</span>
            <strong className="hp-summary-value">
              {[form.emergencyAvailable, form.ambulanceAvailable].filter(Boolean).length}
              <small> / 2</small>
            </strong>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`hp-message ${messageType === "error" ? "hp-message-error" : ""}`}
          role={messageType === "error" ? "alert" : "status"}
        >
          {messageType === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ---------- Basic Information ---------- */}
        <section className="hp-card">
          <div className="hp-card-heading">
            <div className="hp-heading-icon"><Hospital size={20} /></div>
            <div className="hp-heading-text">
              <h3>Basic Information</h3>
              <p>
                <Lock size={12} /> Name, type, email and year can only be changed by the Main Admin.
              </p>
            </div>
          </div>

          <div className="hp-form-grid">
            <div className="hp-field">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input id="hospitalName" value={form.hospitalName} readOnly />
            </div>

            <div className="hp-field">
              <label htmlFor="hospitalType">Hospital Type</label>
              <input id="hospitalType" value={form.hospitalType} readOnly />
            </div>

            <div className="hp-field">
              <label htmlFor="ownershipType">Ownership</label>
              <input id="ownershipType" value={form.ownershipType} readOnly />
            </div>

            <div className="hp-field">
              <label htmlFor="establishmentYear">Established Year</label>
              <input id="establishmentYear" value={form.establishmentYear} readOnly />
            </div>

            <div className="hp-field">
              <label htmlFor="totalBeds">
                Total Beds
                <span className="hp-editable-badge"><Pencil size={9} /> editable</span>
              </label>
              <input
                id="totalBeds"
                name="totalBeds"
                type="number"
                min="0"
                value={form.totalBeds}
                onChange={handleChange}
              />
            </div>

            <div className="hp-field hp-full-width">
              <label htmlFor="description">
                Hospital Description
                <span className="hp-char-count">{form.description.length} / 2000</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                maxLength="2000"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your hospital's services, facilities, and what makes it unique…"
              />
            </div>
          </div>
        </section>

        {/* ---------- Contact Information ---------- */}
        <section className="hp-card">
          <div className="hp-card-heading">
            <div className="hp-heading-icon"><Phone size={20} /></div>
            <div className="hp-heading-text">
              <h3>Contact Information</h3>
              <p>How patients can reach your hospital</p>
            </div>
          </div>

          <div className="hp-form-grid">
            <div className="hp-field">
              <label htmlFor="email"><Mail size={13} /> Email Address</label>
              <input id="email" type="email" value={form.email} readOnly />
            </div>

            <div className="hp-field">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]{10}"
                maxLength="10"
                value={form.phone}
                onChange={handleChange}
                title="Enter a 10-digit phone number"
                placeholder="10-digit number"
                required
              />
            </div>

            <div className="hp-field">
              <label htmlFor="alternatePhone">Alternate Phone</label>
              <input
                id="alternatePhone"
                name="alternatePhone"
                type="tel"
                pattern="[0-9]{10}"
                maxLength="10"
                value={form.alternatePhone}
                onChange={handleChange}
                title="Enter a 10-digit phone number"
                placeholder="Optional"
              />
            </div>

            <div className="hp-field">
              <label htmlFor="website"><Globe size={13} /> Website</label>
              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </section>

        {/* ---------- Address ---------- */}
        <section className="hp-card">
          <div className="hp-card-heading">
            <div className="hp-heading-icon"><MapPin size={20} /></div>
            <div className="hp-heading-text">
              <h3>Hospital Address</h3>
              <p>{fullAddress || "Add your hospital's location details"}</p>
            </div>
          </div>

          <div className="hp-form-grid">
            <div className="hp-field hp-full-width">
              <label htmlFor="street">Street *</label>
              <input id="street" name="street" value={form.street} onChange={handleChange} required />
            </div>

            <div className="hp-field">
              <label htmlFor="area">Area *</label>
              <input id="area" name="area" value={form.area} onChange={handleChange} required />
            </div>

            <div className="hp-field">
              <label htmlFor="city">City *</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} required />
            </div>

            <div className="hp-field">
              <label htmlFor="state">State *</label>
              <input id="state" name="state" value={form.state} onChange={handleChange} required />
            </div>

            <div className="hp-field">
              <label htmlFor="pincode">PIN Code *</label>
              <input
                id="pincode"
                name="pincode"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength="6"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN"
                required
              />
            </div>
          </div>
        </section>

        {/* ---------- Specialties ---------- */}
        <section className="hp-card">
          <div className="hp-card-heading">
            <div className="hp-heading-icon"><Stethoscope size={20} /></div>
            <div className="hp-heading-text">
              <h3>Medical Specialties</h3>
              <p>
                {form.specialties.length > 0
                  ? `${form.specialties.length} selected`
                  : "Select the specialties available at your hospital"}
              </p>
            </div>
            {form.specialties.length > 0 && (
              <span className="hp-count-badge">{form.specialties.length}</span>
            )}
          </div>

          <div className="hp-specialties">
            {allSpecialties.map((specialty) => (
              <label
                className={`hp-specialty-option ${form.specialties.includes(specialty) ? "hp-specialty-on" : ""}`}
                key={specialty}
              >
                <input
                  type="checkbox"
                  checked={form.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                />
                <span>{specialty}</span>
              </label>
            ))}
          </div>
        </section>

        {/* ---------- Facilities ---------- */}
        <section className="hp-card">
          <div className="hp-card-heading">
            <div className="hp-heading-icon"><Siren size={20} /></div>
            <div className="hp-heading-text">
              <h3>Facilities &amp; Services</h3>
              <p>Indicate the services your hospital provides</p>
            </div>
          </div>

          <div className="hp-facilities">
            <label className={`hp-facility-option ${form.emergencyAvailable ? "hp-facility-on" : ""}`}>
              <div className="hp-facility-icon hp-facility-icon-red">
                <Siren size={20} />
              </div>
              <input
                type="checkbox"
                name="emergencyAvailable"
                checked={form.emergencyAvailable}
                onChange={handleChange}
              />
              <span>
                <strong>Emergency Services</strong>
                <small>24/7 emergency care available</small>
              </span>
            </label>

            <label className={`hp-facility-option ${form.ambulanceAvailable ? "hp-facility-on" : ""}`}>
              <div className="hp-facility-icon hp-facility-icon-blue">
                <Ambulance size={20} />
              </div>
              <input
                type="checkbox"
                name="ambulanceAvailable"
                checked={form.ambulanceAvailable}
                onChange={handleChange}
              />
              <span>
                <strong>Ambulance Service</strong>
                <small>Ambulance facility available</small>
              </span>
            </label>
          </div>
        </section>

        {/* ---------- Sticky action bar ---------- */}
        <div className={`hp-form-actions ${isDirty ? "hp-form-actions-dirty" : ""}`}>
          {isDirty && (
            <span className="hp-unsaved-hint">
              <span className="hp-unsaved-dot" /> Unsaved changes
            </span>
          )}
          <div className="hp-actions-buttons">
            <button
              type="button"
              className="hp-reset-btn"
              onClick={handleReset}
              disabled={saving || !isDirty}
            >
              <RotateCcw size={16} /> Reset
            </button>

            <button type="submit" className="hp-save-btn" disabled={saving || !isDirty}>
              <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HospitalProfile;