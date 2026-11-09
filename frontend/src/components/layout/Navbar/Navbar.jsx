
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Plus ,Stethoscope} from "lucide-react";
import Button from "../../common/Button/Button";
import "./Navbar.css";

export const NAV = [
  ["/find-doctors", "Find Doctors"],
  ["/specialties", "Specialties"],
  ["/hospitals", "Hospitals"],
  ["/book-appointment", "Appointments"],
  ["/list-your-clinic", "List Your Hospitals"],
  ["/blood-donation", "Blood Donation"],
  ["/about", "About"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
            <div className="brand-icon">
              <Stethoscope size={20} />
            </div>

            <h3>NearBy<span>Doctor</span></h3>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="nav-actions">

          <Button
            as={Link}
            to="/login"
            className="auth-btn"
          >
            Login
          </Button>

        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <nav className="mobile-menu">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/login"
            onClick={closeMenu}
          >
            Login
          </NavLink>

          <NavLink
            to="/signup"
            onClick={closeMenu}
          >
            Sign Up
          </NavLink>

          <Link
            to="/find-doctors"
            className="full"
            onClick={closeMenu}
          >
            Find a Doctor
          </Link>
        </nav>
      )}
    </header>
  );
}

