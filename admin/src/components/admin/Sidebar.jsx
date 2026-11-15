import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Hospital, Stethoscope, Users, CalendarDays,
  Settings, LogOut, HeartPulse, HelpCircle, Activity, PanelLeftClose, PanelLeft, X, Ticket
} from "lucide-react";
import "./Sidebar.css";

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

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  hospital_admin: "Hospital Admin",
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "SA";

function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const user = useMemo(readUser, []);
  const displayName = user.fullname || user.name || "Super Admin";
  const displayRole = ROLE_LABELS[user.role] || "Super Admin";
  const initials = getInitials(displayName);

  const primaryNav = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Hospitals", path: "/admin/hospitals", icon: Hospital },
    { name: "Blood Donations", path: "/admin/blood-donations", icon: HeartPulse },
    { name: "Doctors", path: "/admin/doctors", icon: Stethoscope },
    { name: "Patients", path: "/admin/patients", icon: Users },
    { name: "Appointments", path: "/admin/appointments", icon: CalendarDays },
    { name: "Support Tickets", path: "/admin/support-tickets", icon: Ticket }, // <-- ADDED HERE
  ];

  const secondaryNav = [
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile toggle button (rendered outside the aside so it stays visible) */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <PanelLeft size={20} />
      </button>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${mobileOpen ? "is-mobile-open" : ""} ${collapsed ? "is-collapsed" : ""}`}
      >
        {/* Mobile close button */}
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={closeMobile}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HeartPulse size={22} strokeWidth={2.2} />
          </div>

          <div className="sidebar-brand-text">
            <h2>NearbyDoctor</h2>
            <span>Healthcare Platform</span>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {/* Admin Identity Card */}
        <div className="sidebar-admin-card">
          <div className="sidebar-admin-avatar">{initials}</div>
          <div className="sidebar-admin-info">
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>
          <span className="sidebar-status-dot" title="Online" />
        </div>

        {/* Primary nav */}
        <p className="sidebar-heading">Main Menu</p>

        <nav className="sidebar-nav">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
                onClick={closeMobile}
                title={collapsed ? item.name : undefined}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={1.9} />
                </span>
                <span className="sidebar-link-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary nav */}
        <p className="sidebar-heading sidebar-heading-sub">Settings</p>

        <nav className="sidebar-nav">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
                onClick={closeMobile}
                title={collapsed ? item.name : undefined}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={1.9} />
                </span>
                <span className="sidebar-link-label">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <div className="sidebar-help-icon">
              <HelpCircle size={17} />
            </div>

            <div className="sidebar-help-text">
              <strong>Need help?</strong>
              <p>Check docs or contact support</p>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} />
            <span className="sidebar-link-label">Logout</span>
          </button>

          <div className="sidebar-footer">
            <span className="sidebar-footer-brand">
              <Activity size={11} /> NearbyDoctor Admin
            </span>
            <span>v2.4.0 · Platform</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;