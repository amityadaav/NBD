import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Bell, Clock, Stethoscope, LayoutDashboard, Users,
  CalendarDays, Hospital, Settings, ChevronDown, LogOut, User, X,
  Command, CheckCheck, Sparkles, ArrowRight,
} from "lucide-react";
import useHospitalAlerts from "../../hooks/useHospitalAlerts";
import "./HospitalNavbar.css";

const PAGE_META = {
  "/hospital/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/hospital/doctors": { title: "Manage Doctors", icon: Users },
  "/hospital/appointments": { title: "Manage Appointments", icon: CalendarDays },
  "/hospital/profile": { title: "Hospital Profile", icon: Hospital },
  "/hospital/settings": { title: "Hospital Settings", icon: Settings },
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const getInitials = (name = "") => {
  const cleaned = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "");
  return (
    cleaned.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() ||
    "A"
  );
};

function HospitalNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingAppointments, pendingDoctors, latestAppointments = [], hospitalName } =
    useHospitalAlerts();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const user = useMemo(readUser, []);
  const adminName = user.fullname || user.name || "Hospital Admin";
  const adminEmail = user.email || "";

  const meta = PAGE_META[location.pathname] || PAGE_META["/hospital/dashboard"];
  const PageIcon = meta.icon;
  const totalAlerts = pendingAppointments + pendingDoctors;
  const cleanHospitalName = (hospitalName || "").trim();

  // Close dropdowns on outside click
  useEffect(() => {
    if (!notifOpen && !profileOpen) return undefined;

    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notifOpen, profileOpen]);

  // Escape closes all, Cmd/Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close everything on navigation
  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const go = (path) => {
    setNotifOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    navigate(`/hospital/doctors?search=${encodeURIComponent(text)}`);
    setQuery("");
    searchInputRef.current?.blur();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="hospital-navbar">
      {/* ---------- Left: page context ---------- */}
      <div className="hospital-navbar-left">
        <div className="hospital-navbar-page-icon">
          <PageIcon size={20} />
        </div>
        <div className="hospital-navbar-heading">
          <h1>{meta.title}</h1>
          <p>{cleanHospitalName || "Manage your hospital operations"}</p>
        </div>
      </div>

      {/* ---------- Right cluster ---------- */}
      <div className="hospital-navbar-right">
        {/* Search */}
        <form
          className={`hospital-navbar-search ${searchFocused ? "is-focused" : ""}`}
          onSubmit={handleSearch}
          role="search"
        >
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search doctors…"
            aria-label="Search doctors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {query ? (
            <button
              type="button"
              className="hospital-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hospital-search-kbd" aria-hidden="true">
              <Command size={10} /> K
            </kbd>
          )}
        </form>

        {/* Notifications */}
        <div className="hospital-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className={`hospital-navbar-icon-btn ${notifOpen ? "is-active" : ""}`}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            aria-label={`Notifications${totalAlerts ? `, ${totalAlerts} pending` : ""}`}
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            aria-controls="hospital-notif-menu"
          >
            <Bell size={18} />
            {totalAlerts > 0 && (
              <span className="hospital-notif-dot" aria-hidden="true">
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            )}
          </button>

          {notifOpen && (
            <div id="hospital-notif-menu" className="hospital-notif-menu" role="menu">
              <div className="hospital-notif-header">
                <div>
                  <span className="hospital-notif-title">Notifications</span>
                  {totalAlerts > 0 && (
                    <span className="hospital-notif-count">{totalAlerts} pending</span>
                  )}
                </div>
              </div>

              {totalAlerts === 0 ? (
                <div className="hospital-notif-empty">
                  <div className="hospital-notif-empty-icon">
                    <CheckCheck size={22} />
                  </div>
                  <strong>You're all caught up</strong>
                  <small>New alerts will appear here.</small>
                </div>
              ) : (
                <div className="hospital-notif-list">
                  {pendingAppointments > 0 && (
                    <button
                      type="button"
                      className="hospital-notif-item"
                      role="menuitem"
                      onClick={() => go("/hospital/appointments")}
                    >
                      <div className="hospital-notif-item-icon hospital-notif-amber">
                        <Clock size={16} />
                      </div>
                      <div className="hospital-notif-item-text">
                        <strong>
                          {pendingAppointments} appointment
                          {pendingAppointments > 1 ? "s" : ""} to confirm
                        </strong>
                        {latestAppointments[0]?.patientName && (
                          <small>Latest: {latestAppointments[0].patientName}</small>
                        )}
                      </div>
                    </button>
                  )}

                  {pendingDoctors > 0 && (
                    <button
                      type="button"
                      className="hospital-notif-item"
                      role="menuitem"
                      onClick={() => go("/hospital/doctors")}
                    >
                      <div className="hospital-notif-item-icon hospital-notif-teal">
                        <Stethoscope size={16} />
                      </div>
                      <div className="hospital-notif-item-text">
                        <strong>
                          {pendingDoctors} doctor
                          {pendingDoctors > 1 ? "s" : ""} awaiting approval
                        </strong>
                        <small>Reviewed by the Main Admin</small>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {totalAlerts > 0 && (
                <div className="hospital-notif-footer">
                  <button
                    type="button"
                    className="hospital-notif-see-all"
                    onClick={() => go("/hospital/appointments")}
                  >
                    View all alerts <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hospital-navbar-divider" aria-hidden="true" />

        {/* Profile */}
        <div className="hospital-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`hospital-navbar-profile ${profileOpen ? "is-active" : ""}`}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-label={`Profile: ${adminName}`}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-controls="hospital-profile-menu"
          >
            <span className="hospital-profile-avatar">
              {getInitials(adminName)}
            </span>

            <span className="hospital-profile-text">
              <strong>{adminName}</strong>
              <small>Hospital Administrator</small>
            </span>

            <ChevronDown
              size={14}
              className={`hospital-profile-chevron ${profileOpen ? "is-open" : ""}`}
            />
          </button>

          {profileOpen && (
            <div id="hospital-profile-menu" className="hospital-profile-menu" role="menu">
              <div className="hospital-profile-menu-header">
                <span className="hospital-profile-avatar hospital-profile-avatar-lg">
                  {getInitials(adminName)}
                </span>
                <div>
                  <strong>{adminName}</strong>
                  <small>{adminEmail || "Hospital Administrator"}</small>
                </div>
              </div>

              <div className="hospital-profile-menu-list">
                <button
                  type="button"
                  className="hospital-profile-menu-item"
                  role="menuitem"
                  onClick={() => go("/hospital/profile")}
                >
                  <User size={15} /> My Profile
                </button>
                <button
                  type="button"
                  className="hospital-profile-menu-item"
                  role="menuitem"
                  onClick={() => go("/hospital/settings")}
                >
                  <Settings size={15} /> Settings
                </button>
              </div>

              <div className="hospital-profile-menu-footer">
                <button
                  type="button"
                  className="hospital-profile-menu-item hospital-profile-logout"
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

export default HospitalNavbar;