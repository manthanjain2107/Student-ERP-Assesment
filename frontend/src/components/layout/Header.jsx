import { Menu, UserPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ROUTE_TITLES = [
  { match: (p) => p === "/dashboard", title: "Dashboard", subtitle: "Overview of student enrollment and recent activity" },
  { match: (p) => p === "/students", title: "Students", subtitle: "Browse, search, filter, and manage student records" },
  { match: (p) => p === "/students/add", title: "Add Student", subtitle: "Register a new student into the school database" },
  { match: (p) => /^\/students\/\d+\/edit$/.test(p), title: "Edit Student", subtitle: "Update existing student and guardian details" },
  { match: (p) => /^\/students\/\d+$/.test(p), title: "Student Profile", subtitle: "Complete academic and guardian information" },
];

export default function Header({ onOpenSidebar }) {
  const { pathname } = useLocation();
  const current = ROUTE_TITLES.find((item) => item.match(pathname)) || {
    title: "School ERP",
    subtitle: "Student Management Module",
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="header-title">{current.title}</h1>
          <p className="header-subtitle">{current.subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {pathname !== "/students/add" && (
          <Link to="/students/add" className="btn btn-primary">
            <UserPlus size={15} />
            <span>Add Student</span>
          </Link>
        )}
      </div>
    </header>
  );
}
