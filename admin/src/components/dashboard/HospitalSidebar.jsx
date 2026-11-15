import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Stethoscope, CalendarDays, Hospital, Settings, LogOut,
  HeartPulse, PanelLeft, PanelLeftClose, X, ShieldCheck, Sparkles,
} from "lucide-react";
import useHospitalAlerts from "../../hooks/useHospitalAlerts";
import "./HospitalSidebar.css";

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
    "HA"
  );
};

function HospitalSidebar() {
  const navigate = useNavigate();
  const { pendingAppointments, pendingDoctors, hospitalName } = useHospitalAlerts();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  const user = useMemo(readUser, []);
  const adminName = user.fullname || user.name || "Hospital Admin";
  const adminRole = "Hospital Administrator";
  const initials = getInitials(adminName);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { title: "Dashboard", path: "/hospital/dashboard", icon: LayoutDashboard },
    { title: "My Doctors", path: "/hospital/doctors", icon: Stethoscope, badge: pendingDoctors },
    { title: "Appointments", path: "/hospital/appointments", icon: CalendarDays, badge: pendingAppointments },
    { title: "Hospital Profile", path: "/hospital/profile", icon: Hospital },
    { title: "Settings", path: "/hospital/settings", icon: Settings },
  ];

  const totalPending = (pendingDoctors || 0) + (pendingAppointments || 0);
  const displayName = (hospitalName || "").trim() || "Hospital Panel";

  return (
    <>
      {/* Mobile toggle (rendered outside so it stays visible) */}
      <button
        type="button"
        className="hospital-sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <PanelLeft size={20} />
      </button>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="hospital-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`hospital-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
      >
        {/* Mobile close */}
        <button
          type="button"
          className="hospital-sidebar-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div className="hospital-sidebar-brand">
          <div className="hospital-brand-icon">
            <HeartPulse size={22} />
          </div>
          <div className="hospital-brand-text">
            <h2>NearbyDoctor</h2>
            <p title={displayName}>{displayName}</p>
          </div>
        </div>

        {/* Admin identity card */}
        <div className="hospital-sidebar-admin">
          <div className="hospital-sidebar-avatar">{initials}</div>
          <div className="hospital-sidebar-admin-info">
            <strong>{adminName}</strong>
            <span>{adminRole}</span>
          </div>
          <span className="hospital-sidebar-status" title="Online" aria-hidden="true" />
        </div>

        {/* Section label */}
        <div className="hospital-sidebar-label">
          Main Menu
          {totalPending > 0 && (
            <span className="hospital-sidebar-pending">{totalPending}</span>
          )}
        </div>

        {/* Nav */}
        <nav className="hospital-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasBadge = Number(item.badge) > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "hospital-nav-link active" : "hospital-nav-link"
                }
                title={collapsed ? item.title : undefined}
              >
                <span className="hospital-nav-icon">
                  <Icon size={19} />
                </span>
                <span className="hospital-nav-label">{item.title}</span>
                {hasBadge && (
                  <span
                    className="hospital-nav-badge"
                    aria-label={`${item.badge} pending`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="hospital-sidebar-bottom">
          <div className="hospital-sidebar-help">
            <div className="hospital-sidebar-help-icon">
              <Sparkles size={16} />
            </div>
            <div className="hospital-sidebar-help-text">
              <strong>NearbyDoctor</strong>
              <span>Hospital workspace</span>
            </div>
          </div>

          <button
            type="button"
            className="hospital-logout-btn"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} />
            <span className="hospital-nav-label">Logout</span>
          </button>

          <div className="hospital-sidebar-footer">
            <span><ShieldCheck size={11} /> Hospital Admin</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default HospitalSidebar;