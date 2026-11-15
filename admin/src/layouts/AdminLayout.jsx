import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";
import "./AdminLayout.css";

function AdminLayout() {
  const location = useLocation();
  const contentRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for a subtle navbar shadow
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;

    const onScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Reset scroll to top on route change (feels like a real app)
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className={`admin-layout ${scrolled ? "is-scrolled" : ""}`}>
      <Sidebar />

      <div className="admin-main">
        <Navbar />

        <main className="admin-content" ref={contentRef}>
          <div className="admin-content-inner" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;