import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, FileText, Stethoscope, Pill,
  User, Settings, LogOut, HeartPulse, X, HelpCircle,
} from "lucide-react";
import "./UserSidebar.css";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U";

function UserSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = readUser();
  const userName = user.fullname || user.name || "Patient";
  const initials = getInitials(userName);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Overview", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "My Appointments", path: "/user/appointments", icon: CalendarDays },
    { name: "Medical Records", path: "/user/records", icon: FileText },
    { name: "Find Doctors", path: "/user/doctors", icon: Stethoscope },
    { name: "Prescriptions", path: "/user/prescriptions", icon: Pill },
  ];

  const bottomItems = [
    { name: "My Profile", path: "/user/profile", icon: User },
    { name: "Settings", path: "/user/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="us-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`us-sidebar ${isOpen ? "is-open" : ""}`}>
        {/* Mobile Close */}
        <button className="us-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        {/* Brand */}
        <div className="us-brand">
          <div className="us-brand-icon">
            <HeartPulse size={22} strokeWidth={2.2} />
          </div>
          <div className="us-brand-text">
            <h2>NearbyDoctor</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        {/* User Card */}
        <div className="us-user-card">
          <div className="us-avatar">{initials}</div>
          <div className="us-user-info">
            <strong>{userName}</strong>
            <span>Patient</span>
          </div>
        </div>

        {/* Primary Nav */}
        <p className="us-heading">Main Menu</p>
        <nav className="us-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `us-link ${isActive ? "active" : ""}`}
            >
              <item.icon size={18} strokeWidth={1.9} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Secondary Nav */}
        <p className="us-heading us-heading-sub">Account</p>
        <nav className="us-nav">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `us-link ${isActive ? "active" : ""}`}
            >
              <item.icon size={18} strokeWidth={1.9} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="us-bottom">
          <div className="us-help-card">
            <div className="us-help-icon"><HelpCircle size={18} /></div>
            <div className="us-help-text">
              <strong>Need Help?</strong>
              <span>Contact Support</span>
            </div>
          </div>

          <button className="us-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;