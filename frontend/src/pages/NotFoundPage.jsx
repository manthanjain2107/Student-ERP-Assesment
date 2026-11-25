import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="card">
      <div className="state-box">
        <div className="state-icon">
          <FileQuestion size={24} />
        </div>
        <h2 className="state-title">Page Not Found</h2>
        <p className="state-description">
          The route you requested does not exist in the School ERP Student Management module.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/students" className="btn btn-secondary">
            View Students
          </Link>
        </div>
      </div>
    </div>
  );
}
