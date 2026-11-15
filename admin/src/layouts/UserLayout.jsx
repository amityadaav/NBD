import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X, Stethoscope } from "lucide-react";
import UserNavbar from "../components/user/UserNavbar";
import UserSidebar from "../components/user/UserSidebar";
import "./UserLayout.css";

function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const contentRef = useRef(null);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="user-layout">
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="user-layout-main">
        {/* Mobile Header */}
        <header className="user-mobile-header">
          <button
            type="button"
            className="user-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="user-mobile-brand">
            <Stethoscope size={18} />
            <span>NearbyDoctor</span>
          </div>
        </header>

        <UserNavbar />

        <main className="user-layout-content" ref={contentRef}>
          <div className="user-content-inner" key={location.pathname}>
            <Outlet />
          </div>
        </main>

        <footer className="user-layout-footer">
          <p>© {new Date().getFullYear()} NearbyDoctor. Your health, our priority.</p>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="user-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export default UserLayout;