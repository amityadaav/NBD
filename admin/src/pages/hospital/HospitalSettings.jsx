import { useMemo, useState } from "react";
import {
  Settings, LockKeyhole, Bell, ShieldCheck, Eye, EyeOff, Save, RotateCcw,
  AlertCircle, CheckCircle, Sparkles, KeyRound, Mail, Smartphone, CalendarDays,
  Stethoscope, Info, Check, X, ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import "./HospitalSettings.css";

const NOTIF_KEY = "hospitalNotificationPrefs";

const defaultNotifications = {
  newAppointment: true,
  appointmentUpdates: true,
  doctorUpdates: true,
  emailNotifications: false,
};

const loadNotifications = () => {
  try {
    return { ...defaultNotifications, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}") };
  } catch {
    return defaultNotifications;
  }
};

const PREFERENCES = [
  {
    key: "newAppointment",
    title: "New Appointments",
    text: "Receive updates when a new appointment is booked.",
    icon: CalendarDays,
  },
  {
    key: "appointmentUpdates",
    title: "Appointment Updates",
    text: "Receive changes to appointment status and schedules.",
    icon: Bell,
  },
  {
    key: "doctorUpdates",
    title: "Doctor Updates",
    text: "Receive notifications about doctor records.",
    icon: Stethoscope,
  },
  {
    key: "emailNotifications",
    title: "Email Notifications",
    text: "Receive supported notifications through email.",
    icon: Mail,
  },
];

// Password strength scoring
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", checks: [] };
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase", ok: /[A-Z]/.test(password) },
    { label: "Contains lowercase", ok: /[a-z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  let label = "Weak";
  let color = "weak";
  if (passed >= 5) { label = "Strong"; color = "strong"; }
  else if (passed >= 3) { label = "Fair"; color = "fair"; }
  return { score: passed, label, color, checks };
};

function HospitalSettings() {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const strength = useMemo(() => getPasswordStrength(passwords.newPassword), [passwords.newPassword]);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  };

  const togglePasswordVisibility = (field) =>
    setShowPasswords((previous) => ({ ...previous, [field]: !previous[field] }));

  const fail = (text) => {
    setMessageType("error");
    setMessage(text);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return fail("Please fill in all password fields.");
    }
    if (passwords.newPassword.length < 8) {
      return fail("New password must contain at least 8 characters.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return fail("New password and confirm password do not match.");
    }
    if (passwords.currentPassword === passwords.newPassword) {
      return fail("Your new password must differ from your current password.");
    }

    setSaving(true);
    try {
      const res = await api.patch("/hospital-admin/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setMessageType("success");
      setMessage(res.data?.message || "Password updated successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      fail(err.response?.data?.message || "Unable to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSubmit = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
      setMessageType("success");
      setMessage("Preferences saved on this device.");
    } catch {
      fail("Unable to save preferences.");
    }
  };

  const handleResetNotifications = () => {
    setNotifications(defaultNotifications);
    setMessage("");
  };

  const enabledCount = Object.values(notifications).filter(Boolean).length;

  const renderPasswordField = (name, label, placeholder) => (
    <div className="hs-field" key={name}>
      <label htmlFor={name}>{label}</label>

      <div className="hs-password-input">
        <KeyRound size={16} className="hs-input-icon" />
        <input
          id={name}
          name={name}
          type={showPasswords[name] ? "text" : "password"}
          value={passwords[name]}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          required
          minLength={name === "currentPassword" ? undefined : 8}
        />

        <button
          type="button"
          className="hs-password-toggle"
          onClick={() => togglePasswordVisibility(name)}
          aria-label={showPasswords[name] ? "Hide password" : "Show password"}
        >
          {showPasswords[name] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="hs-page">
      {/* ---------- Hero header ---------- */}
      <div className="hs-hero">
        <div className="hs-hero-glow" aria-hidden="true" />
        <div className="hs-hero-main">
          <div className="hs-hero-icon">
            <Settings size={24} />
          </div>
          <div>
            <span className="hs-eyebrow">
              <Sparkles size={11} /> Account
            </span>
            <h2>Hospital Settings</h2>
            <p>Manage your security and notification preferences.</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`hs-message hs-message-${messageType}`}
          role={messageType === "error" ? "alert" : "status"}
        >
          {messageType === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{message}</span>
        </div>
      )}

      {/* ---------- Change Password ---------- */}
      <section className="hs-card">
        <div className="hs-card-heading">
          <div className="hs-section-icon hs-lock-icon"><LockKeyhole size={20} /></div>
          <div className="hs-heading-text">
            <h3>Change Password</h3>
            <p>Update your hospital admin account password.</p>
          </div>
          <span className="hs-badge hs-badge-blue">
            <ShieldCheck size={12} /> Secure
          </span>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="hs-password-grid">
            {renderPasswordField("currentPassword", "Current Password", "Enter current password")}
            {renderPasswordField("newPassword", "New Password", "At least 8 characters")}
            {renderPasswordField("confirmPassword", "Confirm New Password", "Re-enter new password")}
          </div>

          {/* Password strength meter */}
          {passwords.newPassword && (
            <div className="hs-strength">
              <div className="hs-strength-header">
                <span>Password strength</span>
                <strong className={`hs-strength-label hs-strength-${strength.color}`}>
                  {strength.label}
                </strong>
              </div>
              <div className="hs-strength-bar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`hs-strength-segment ${
                      i <= strength.score ? `hs-strength-${strength.color}` : ""
                    }`}
                  />
                ))}
              </div>
              <div className="hs-strength-checks">
                {strength.checks.map((c) => (
                  <span key={c.label} className={`hs-check ${c.ok ? "hs-check-ok" : ""}`}>
                    {c.ok ? <Check size={11} /> : <X size={11} />}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="hs-hint-row">
            <Info size={14} />
            <p>Choose a strong, unique password that you do not use elsewhere.</p>
          </div>

          <div className="hs-actions">
            <button type="submit" className="hs-primary-btn" disabled={saving}>
              <ShieldCheck size={17} />
              {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Notification Preferences ---------- */}
      <section className="hs-card">
        <div className="hs-card-heading">
          <div className="hs-section-icon hs-bell-icon"><Bell size={20} /></div>
          <div className="hs-heading-text">
            <h3>Notification Preferences</h3>
            <p>Choose which updates you want to receive.</p>
          </div>
          <span className="hs-badge hs-badge-amber">
            {enabledCount} / {PREFERENCES.length} active
          </span>
        </div>

        <form onSubmit={handleNotificationSubmit}>
          <div className="hs-preference-list">
            {PREFERENCES.map(({ key, title, text, icon: Icon }) => (
              <div className="hs-preference-row" key={key}>
                <div className="hs-preference-icon">
                  <Icon size={18} />
                </div>

                <div className="hs-preference-text">
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>

                <label className="hs-switch" aria-label={`Toggle ${title}`}>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  />
                  <span className="hs-switch-track">
                    <span className="hs-switch-thumb" />
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="hs-actions hs-notification-actions">
            <button type="button" className="hs-secondary-btn" onClick={handleResetNotifications}>
              <RotateCcw size={16} /> Reset
            </button>
            <button type="submit" className="hs-primary-btn">
              <Save size={17} /> Save Preferences
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Security note ---------- */}
      <section className="hs-security-note">
        <div className="hs-security-icon">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h3>Account Security</h3>
          <p>
            Keep your login credentials private. Never share your password with other hospital
            staff. Only authorized users should access hospital records.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HospitalSettings;