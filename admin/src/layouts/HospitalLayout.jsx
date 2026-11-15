import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HospitalSidebar from "../components/dashboard/HospitalSidebar";
import HospitalNavbar from "../components/dashboard/HospitalNavbar";
import "./HospitalLayout.css";

function HospitalLayout() {
  const location = useLocation();
  const contentRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // <-- Added

  // Navbar shadow when content scrolls
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const onScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Reset scroll to top on route change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    // Add the class if the sidebar is collapsed
    <div className={`hospital-layout ${scrolled ? "is-scrolled" : ""} ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      {/* Pass the state and setter to the sidebar */}
      <HospitalSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      <div className="hospital-main">
        <HospitalNavbar />

        <main className="hospital-content" ref={contentRef}>
          <div className="hospital-content-inner" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalLayout;