import { useMemo, useState } from "react";
import {
  User, LockKeyhole, Bell, Save, ShieldCheck, Sparkles, KeyRound,
  Eye, EyeOff, CheckCircle, AlertCircle, Info, Building2, CalendarDays,
  Mail, Check, X, RotateCcw, ShieldAlert, TrendingUp,
} from "lucide-react";
import "./AdminSettings.css";

const NOTIF_KEY = "adminNotificationPrefs";

const defaultNotifications = {
  hospitalRequests: true,
  appointmentUpdates: true,
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
    key: "hospitalRequests",
    title: "Hospital Registration Requests",
    text: "Receive updates about new hospital registrations.",
    icon: Building2,
  },
  {
    key: "appointmentUpdates",
    title: "Appointment Updates",
    text: "Receive updates about appointment activity.",
    icon: CalendarDays,
  },
  {
    key: "emailNotifications",
    title: "Email Notifications",
    text: "Receive supported notifications by email.",
    icon: Mail,
  },
];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "", checks: [] };
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase", ok: /[A-Z]/.test(password) },
    { label: "Contains lowercase", ok: /[a-z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  let label = "Weak", color = "weak";
  if (passed >= 5) { label = "Strong"; color = "strong"; }
  else if (passed >= 3) { label = "Fair"; color = "fair"; }
  return { score: passed, label, color, checks };
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "A";

function AdminSettings() {
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@nearbydoctor.com",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState(loadNotifications);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const strength = useMemo(() => getPasswordStrength(passwords.newPassword), [passwords.newPassword]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMessage("");
  };

  const togglePasswordVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMessageType("success");
    setMessage("Profile form submitted. Connect the backend API to save changes.");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      setMessageType("error");
      setMessage("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setMessageType("error");
      setMessage("New password and confirm password do not match.");
      return;
    }
    setMessageType("success");
    setMessage("Password form validated. Connect the backend API to update it.");
    setPasswords({ current: "", newPassword: "", confirm: "" });
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = () => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
      setMessageType("success");
      setMessage("Preferences saved on this device.");
    } catch {
      setMessageType("error");
      setMessage("Unable to save preferences.");
    }
  };

  const resetNotifications = () => {
    setNotifications(defaultNotifications);
    setMessage("");
  };

  const enabledCount = Object.values(notifications).filter(Boolean).length;
  const initials = getInitials(profile.name);

  return (
    <div className="admin-settings-page">
      {/* ---------- Hero header ---------- */}
      <div className="as-hero">
        <div className="as-hero-glow" aria-hidden="true" />
        <div className="as-hero-main">
          <div className="as-hero-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="as-hero-text">
            <span className="as-eyebrow">
              <Sparkles size={11} /> Account
            </span>
            <h2>Admin Settings</h2>
            <p>Manage your account and preferences.</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`as-message ${messageType === "error" ? "as-message-error" : ""}`}
          role={messageType === "error" ? "alert" : "status"}
        >
          {messageType === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>{message}</span>
        </div>
      )}

      {/* ---------- Profile ---------- */}
      <section className="as-card">
        <div className="as-card-header">
          <div className="as-heading-icon as-heading-teal">
            <User size={20} />
          </div>
          <div className="as-heading-text">
            <h3>Profile Information</h3>
            <p>Update your admin account details.</p>
          </div>

          {/* Live preview avatar */}
          <div className="as-profile-preview">
            <span className="as-profile-preview-avatar">{initials}</span>
            <div>
              <strong>{profile.name || "Admin"}</strong>
              <small>{profile.email || "admin@nearbydoctor.com"}</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="as-form-grid">
            <div className="as-field">
              <label htmlFor="admin-name">Full Name</label>
              <input
                id="admin-name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="as-field">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="as-field as-full-width">
              <label htmlFor="admin-phone">Phone Number</label>
              <input
                id="admin-phone"
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="as-form-actions">
            <button className="as-primary-btn" type="submit">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Password ---------- */}
      <section className="as-card">
        <div className="as-card-header">
          <div className="as-heading-icon as-heading-blue">
            <LockKeyhole size={20} />
          </div>
          <div className="as-heading-text">
            <h3>Change Password</h3>
            <p>Choose a strong password for your account.</p>
          </div>
          <span className="as-badge as-badge-blue">
            <ShieldCheck size={11} /> Secure
          </span>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="as-form-grid">
            <div className="as-field as-full-width">
              <label htmlFor="current-password">Current Password</label>
              <div className="as-password-input">
                <KeyRound size={15} className="as-input-icon" />
                <input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="as-password-toggle"
                  onClick={() => togglePasswordVisibility("current")}
                  aria-label={showPasswords.current ? "Hide password" : "Show password"}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="as-field">
              <label htmlFor="new-password">New Password</label>
              <div className="as-password-input">
                <KeyRound size={15} className="as-input-icon" />
                <input
                  id="new-password"
                  type={showPasswords.newPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="as-password-toggle"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                >
                  {showPasswords.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="as-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="as-password-input">
                <KeyRound size={15} className="as-input-icon" />
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="as-password-toggle"
                  onClick={() => togglePasswordVisibility("confirm")}
                  aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {passwords.newPassword && (
            <div className="as-strength">
              <div className="as-strength-header">
                <span>Password strength</span>
                <strong className={`as-strength-label as-strength-${strength.color}`}>
                  {strength.label}
                </strong>
              </div>
              <div className="as-strength-bar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`as-strength-segment ${i <= strength.score ? `as-strength-${strength.color}` : ""}`}
                  />
                ))}
              </div>
              <div className="as-strength-checks">
                {strength.checks.map((c) => (
                  <span key={c.label} className={`as-check ${c.ok ? "as-check-ok" : ""}`}>
                    {c.ok ? <Check size={10} /> : <X size={10} />}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="as-hint-row">
            <Info size={14} />
            <p>Use a unique password you don't reuse on other sites.</p>
          </div>

          <div className="as-form-actions">
            <button className="as-primary-btn" type="submit">
              <ShieldCheck size={16} /> Update Password
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Notifications ---------- */}
      <section className="as-card">
        <div className="as-card-header">
          <div className="as-heading-icon as-heading-amber">
            <Bell size={20} />
          </div>
          <div className="as-heading-text">
            <h3>Notification Preferences</h3>
            <p>Choose which updates you want to receive.</p>
          </div>
          <span className="as-badge as-badge-amber">
            {enabledCount} / {PREFERENCES.length} active
          </span>
        </div>

        <div className="as-notification-list">
          {PREFERENCES.map(({ key, title, text, icon: Icon }) => (
            <div className="as-notification-row" key={key}>
              <div className="as-notification-icon">
                <Icon size={16} />
              </div>
              <div className="as-notification-text">
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
              <label className="as-switch" aria-label={`Toggle ${title}`}>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                />
                <span className="as-switch-track">
                  <span className="as-switch-thumb" />
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="as-form-actions as-notification-actions">
          <button type="button" className="as-secondary-btn" onClick={resetNotifications}>
            <RotateCcw size={15} /> Reset
          </button>
          <button type="button" className="as-primary-btn" onClick={handleSaveNotifications}>
            <Save size={15} /> Save Preferences
          </button>
        </div>
      </section>

      {/* ---------- Security note ---------- */}
      <section className="as-security-note">
        <div className="as-security-icon">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3>Account Security</h3>
          <p>
            Keep your login credentials private. Never share your password with other
            staff. Only authorized users should access administrative records.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AdminSettings;