import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, LogOut, Settings, Command } from "lucide-react";
import "./UserNavbar.css";

function UserNavbar() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.fullname || user.name || "Patient";
  const initials = userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="un-navbar">
      {/* Search */}
      <div className={`un-search ${searchFocused ? "is-focused" : ""}`}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search doctors, clinics, symptoms..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {!searchFocused && (
          <kbd className="un-kbd"><Command size={10} /> K</kbd>
        )}
      </div>

      {/* Right Actions */}
      <div className="un-actions">
        <button className="un-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="un-badge" />
        </button>

        <div className="un-divider" />

        {/* Profile Dropdown */}
        <div className="un-profile-wrap" ref={dropdownRef}>
          <button
            className={`un-profile-btn ${profileOpen ? "is-active" : ""}`}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="un-avatar">{initials}</div>
            <div className="un-user-info">
              <strong>{userName}</strong>
              <span>Patient Account</span>
            </div>
          </button>

          {profileOpen && (
            <div className="un-dropdown">
              <div className="un-dropdown-header">
                <strong>{userName}</strong>
                <span>{user.email || "patient@example.com"}</span>
              </div>
              <div className="un-dropdown-list">
                <Link to="/user/profile" className="un-dropdown-item">
                  <User size={15} /> My Profile
                </Link>
                <Link to="/user/settings" className="un-dropdown-item">
                  <Settings size={15} /> Settings
                </Link>
              </div>
              <div className="un-dropdown-footer">
                <button className="un-dropdown-item un-logout" onClick={handleLogout}>
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

export default UserNavbar;