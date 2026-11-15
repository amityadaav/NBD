import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Calendar, ShieldCheck, Bell, Lock, Save,
  Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Globe,
} from "lucide-react";
import "./Settings.css";

const EMPTY_PROFILE = {
  fullname: "",
  email: "",
  phone: "",
  gender: "prefer_not_to_say",
  dateOfBirth: "",
  city: "",
  state: "",
};

const EMPTY_PREFS = {
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  prescriptionAlerts: true,
  language: "en",
  theme: "system",
};

export default function Settings() {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [prefsMsg, setPrefsMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [error, setError] = useState(null);

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load settings");
        }
        const u = data.user;
        setProfile({
          fullname: u.fullname || "",
          email: u.email || "",
          phone: u.phone || "",
          gender: u.gender || "prefer_not_to_say",
          dateOfBirth: u.dateOfBirth
            ? new Date(u.dateOfBirth).toISOString().slice(0, 10)
            : "",
          city: u.city || "",
          state: u.state || "",
        });
        setPrefs({ ...EMPTY_PREFS, ...(u.preferences || {}) });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate]);

  const handleProfileChange = (f, v) =>
    setProfile((p) => ({ ...p, [f]: v }));
  const handlePrefChange = (f, v) => setPrefs((p) => ({ ...p, [f]: v }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: profile.fullname,
          phone: profile.phone,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth || null,
          city: profile.city,
          state: profile.state,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setProfileMsg({ type: "success", text: "Profile updated." });

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, fullname: profile.fullname })
      );
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePrefsSave = async (e) => {
    e.preventDefault();
    setPrefsMsg(null);
    setSavingPrefs(true);
    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPrefsMsg({ type: "success", text: "Preferences saved." });
    } catch (err) {
      setPrefsMsg({ type: "error", text: err.message });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setSavingPassword(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/settings/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(pw),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPasswordMsg({ type: "success", text: "Password changed." });
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="st-page">
        <div className="st-loading">
          <Loader2 className="spin" size={32} />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="st-page">
      <div className="st-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, notifications and security.</p>
      </div>

      {error && (
        <div className="st-banner st-banner-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="st-tabs">
        <button
          className={`st-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} /> Profile
        </button>
        <button
          className={`st-tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell size={16} /> Notifications
        </button>
        <button
          className={`st-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={16} /> Security
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="st-card">
          <h2>
            <User size={18} /> Personal Information
          </h2>

          {profileMsg && (
            <div className={`st-banner st-banner-${profileMsg.type}`}>
              {profileMsg.type === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {profileMsg.text}
            </div>
          )}

          <div className="st-grid-2">
            <div className="st-field">
              <label><User size={12} /> Full Name</label>
              <input
                type="text"
                value={profile.fullname}
                onChange={(e) => handleProfileChange("fullname", e.target.value)}
                required
              />
            </div>
            <div className="st-field">
              <label><Mail size={12} /> Email</label>
              <input type="email" value={profile.email} disabled />
            </div>
            <div className="st-field">
              <label><Phone size={12} /> Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                placeholder="10-digit number"
              />
            </div>
            <div className="st-field">
              <label><Calendar size={12} /> Date of Birth</label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) =>
                  handleProfileChange("dateOfBirth", e.target.value)
                }
              />
            </div>
            <div className="st-field">
              <label><User size={12} /> Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => handleProfileChange("gender", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div className="st-field">
              <label><MapPin size={12} /> City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleProfileChange("city", e.target.value)}
              />
            </div>
            <div className="st-field">
              <label><MapPin size={12} /> State</label>
              <input
                type="text"
                value={profile.state}
                onChange={(e) => handleProfileChange("state", e.target.value)}
              />
            </div>
          </div>

          <div className="st-actions">
            <button
              type="submit"
              className="st-save-btn"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="spin" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "notifications" && (
        <form onSubmit={handlePrefsSave} className="st-card">
          <h2>
            <Bell size={18} /> Notification Preferences
          </h2>

          {prefsMsg && (
            <div className={`st-banner st-banner-${prefsMsg.type}`}>
              {prefsMsg.type === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {prefsMsg.text}
            </div>
          )}

          <div className="st-toggle-list">
            {[
              {
                key: "emailNotifications",
                label: "Email notifications",
                desc: "Receive account updates via email",
              },
              {
                key: "smsNotifications",
                label: "SMS notifications",
                desc: "Get text messages for critical updates",
              },
              {
                key: "appointmentReminders",
                label: "Appointment reminders",
                desc: "Get reminded 24 hours before your visit",
              },
              {
                key: "prescriptionAlerts",
                label: "Prescription alerts",
                desc: "Be notified when a doctor issues a prescription",
              },
            ].map((item) => (
              <label className="st-toggle-row" key={item.key}>
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </div>
                <span className="st-switch">
                  <input
                    type="checkbox"
                    checked={!!prefs[item.key]}
                    onChange={(e) =>
                      handlePrefChange(item.key, e.target.checked)
                    }
                  />
                  <span className="st-switch-track" />
                </span>
              </label>
            ))}
          </div>

          <div className="st-grid-2 st-mt">
            <div className="st-field">
              <label><Globe size={12} /> Language</label>
              <select
                value={prefs.language}
                onChange={(e) => handlePrefChange("language", e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
            <div className="st-field">
              <label>Theme</label>
              <select
                value={prefs.theme}
                onChange={(e) => handlePrefChange("theme", e.target.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <div className="st-actions">
            <button
              type="submit"
              className="st-save-btn"
              disabled={savingPrefs}
            >
              {savingPrefs ? (
                <>
                  <Loader2 className="spin" size={15} /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "security" && (
        <form onSubmit={handlePasswordSave} className="st-card">
          <h2>
            <ShieldCheck size={18} /> Change Password
          </h2>

          {passwordMsg && (
            <div className={`st-banner st-banner-${passwordMsg.type}`}>
              {passwordMsg.type === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {passwordMsg.text}
            </div>
          )}

          <div className="st-field">
            <label><KeyRound size={12} /> Current Password</label>
            <div className="st-pw-wrap">
              <input
                type={showCurrent ? "text" : "password"}
                value={pw.currentPassword}
                onChange={(e) =>
                  setPw((p) => ({ ...p, currentPassword: e.target.value }))
                }
                required
              />
              <button
                type="button"
                className="st-pw-toggle"
                onClick={() => setShowCurrent((v) => !v)}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="st-grid-2">
            <div className="st-field">
              <label><Lock size={12} /> New Password</label>
              <div className="st-pw-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  value={pw.newPassword}
                  onChange={(e) =>
                    setPw((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="st-pw-toggle"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="st-field">
              <label><Lock size={12} /> Confirm New Password</label>
              <div className="st-pw-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pw.confirmPassword}
                  onChange={(e) =>
                    setPw((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="st-pw-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="st-hint">
            <ShieldCheck size={14} />
            <span>Use a strong password with letters, numbers and symbols.</span>
          </div>

          <div className="st-actions">
            <button
              type="submit"
              className="st-save-btn"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <>
                  <Loader2 className="spin" size={15} /> Updating...
                </>
              ) : (
                <>
                  <Lock size={15} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}