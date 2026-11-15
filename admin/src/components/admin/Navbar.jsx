import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Bell, Stethoscope, ChevronDown, LogOut, User, Settings,
  LayoutDashboard, Building2, Users, CalendarDays, CheckCheck, X,
  Command, Sparkles, Clock, Info,
} from "lucide-react";
import "./Navbar.css";

const PAGE_META = {
  "/admin/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/admin/hospitals": { title: "Manage Hospitals", icon: Building2 },
  "/admin/doctors": { title: "Manage Doctors", icon: Users },
  "/admin/patients": { title: "Manage Patients", icon: User },
  "/admin/appointments": { title: "Manage Appointments", icon: CalendarDays },
  "/admin/settings": { title: "Settings", icon: Settings },
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  hospital_admin: "Hospital Admin",
};

const readUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
    );
  } catch {
    return {};
  }
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "A";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const user = useMemo(readUser, []);
  const displayName = user.fullname || user.name || "Admin";
  const displayRole = ROLE_LABELS[user.role] || "Administrator";
  const displayEmail = user.email || "admin@nearbydoctor.com";
  const initials = getInitials(displayName);

  const meta = PAGE_META[location.pathname] || PAGE_META["/admin/dashboard"];

  // Close dropdowns on outside click
  useEffect(() => {
    if (!profileOpen && !notifOpen) return undefined;

    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen, notifOpen]);

  // Keyboard shortcuts: Escape closes, Cmd/Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
        searchRef.current?.blur();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const go = (path) => {
    setProfileOpen(false);
    setNotifOpen(false);
    navigate(path);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    navigate(`/admin/doctors?search=${encodeURIComponent(text)}`);
    setQuery("");
    searchRef.current?.blur();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-navbar">
      {/* ---------- Left: page context ---------- */}
      <div className="navbar-heading">
        <div className="navbar-mobile-brand">
          <span className="navbar-brand-icon">
            <Stethoscope size={18} />
          </span>
          <span>NearbyDoctor</span>
        </div>

        <div className="navbar-title">
          <h1>{meta.title}</h1>
          <p>
            Welcome back, <strong>{displayName}</strong>
          </p>
        </div>
      </div>

      {/* ---------- Right: actions ---------- */}
      <div className="navbar-actions">
        {/* Search */}
        <form
          className={`navbar-search ${searchFocused ? "is-focused" : ""}`}
          onSubmit={handleSearch}
          role="search"
        >
          <Search size={17} />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search anything…"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {query ? (
            <button
              type="button"
              className="navbar-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="search-shortcut">
              <Command size={10} /> K
            </kbd>
          )}
        </form>

        {/* Notifications */}
        <div className="navbar-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className={`navbar-icon-btn ${notifOpen ? "is-active" : ""}`}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="notification-dot" />
          </button>

          {notifOpen && (
            <div className="navbar-notif-menu" role="menu">
              <div className="navbar-notif-header">
                <span className="navbar-notif-title">Notifications</span>
                <span className="navbar-notif-badge">New</span>
              </div>

              <div className="navbar-notif-list">
                <div className="navbar-notif-item">
                  <div className="navbar-notif-item-icon navbar-notif-teal">
                    <Building2 size={15} />
                  </div>
                  <div className="navbar-notif-item-text">
                    <strong>New hospital registered</strong>
                    <small>2 minutes ago</small>
                  </div>
                </div>

                <div className="navbar-notif-item">
                  <div className="navbar-notif-item-icon navbar-notif-amber">
                    <Clock size={15} />
                  </div>
                  <div className="navbar-notif-item-text">
                    <strong>3 appointments pending review</strong>
                    <small>15 minutes ago</small>
                  </div>
                </div>

                <div className="navbar-notif-item">
                  <div className="navbar-notif-item-icon navbar-notif-blue">
                    <Info size={15} />
                  </div>
                  <div className="navbar-notif-item-text">
                    <strong>System update available</strong>
                    <small>1 hour ago</small>
                  </div>
                </div>
              </div>

              <div className="navbar-notif-footer">
                <button
                  type="button"
                  className="navbar-notif-see-all"
                  onClick={() => go("/admin/dashboard")}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="navbar-divider" aria-hidden="true" />

        {/* Profile */}
        <div className="navbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`navbar-profile ${profileOpen ? "is-active" : ""}`}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="profile-avatar">{initials}</span>

            <span className="profile-info">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </span>

            <ChevronDown
              className={`profile-chevron ${profileOpen ? "is-open" : ""}`}
              size={15}
            />
          </button>

          {profileOpen && (
            <div className="navbar-profile-menu" role="menu">
              <div className="navbar-profile-menu-header">
                <span className="profile-avatar profile-avatar-lg">{initials}</span>
                <div>
                  <strong>{displayName}</strong>
                  <small>{displayEmail}</small>
                </div>
              </div>

              <div className="navbar-profile-menu-list">
                <button
                  type="button"
                  className="navbar-profile-menu-item"
                  role="menuitem"
                  onClick={() => go("/admin/settings")}
                >
                  <User size={15} /> My Profile
                </button>
                <button
                  type="button"
                  className="navbar-profile-menu-item"
                  role="menuitem"
                  onClick={() => go("/admin/settings")}
                >
                  <Settings size={15} /> Settings
                </button>
              </div>

              <div className="navbar-profile-menu-footer">
                <button
                  type="button"
                  className="navbar-profile-menu-item navbar-profile-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;