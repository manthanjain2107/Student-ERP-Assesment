import { GraduationCap, LayoutDashboard, UserPlus, Users, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();

  const isStudentsSection =
    pathname === "/students" ||
    (pathname.startsWith("/students/") && pathname !== "/students/add");

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="brand-identity">
            <div className="brand-logo">
              <GraduationCap size={19} />
            </div>
            <div>
              <div className="brand-name">EduCore ERP</div>
              <div className="brand-subtitle">Student Management</div>
            </div>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Academics</div>

          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/students"
            onClick={onClose}
            className={() => `nav-link ${isStudentsSection ? "active" : ""}`}
          >
            <Users size={17} />
            <span>Students</span>
          </NavLink>

          <NavLink
            to="/students/add"
            end
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <UserPlus size={17} />
            <span>Add Student</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>School ERP Module v1.0</div>
        </div>
      </aside>
    </>
  );
}
