import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarPlus,
  Layers,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatCard from "../components/common/StatCard";
import { extractApiError } from "../services/api";
import { getStudents, getStudentStats } from "../services/studentService";
import { formatDisplayDate } from "../utils/studentHelpers";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [classBreakdown, setClassBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, firstPage] = await Promise.all([
        getStudentStats(),
        getStudents({ page: 1, limit: 100 }),
      ]);

      let allStudents = [...(firstPage.items || [])];
      const totalPages = firstPage.total_pages || 1;
      if (totalPages > 1) {
        const remainingRequests = [];
        for (let p = 2; p <= totalPages; p += 1) {
          remainingRequests.push(getStudents({ page: p, limit: 100 }));
        }
        const remainingPages = await Promise.all(remainingRequests);
        for (const pageData of remainingPages) {
          allStudents = allStudents.concat(pageData.items || []);
        }
      }

      const countsMap = new Map();
      for (const student of allStudents) {
        const cls = student.class_name || "Unassigned";
        countsMap.set(cls, (countsMap.get(cls) || 0) + 1);
      }

      const breakdown = Array.from(countsMap.entries())
        .map(([className, count]) => ({ className, count }))
        .sort((a, b) => b.count - a.count || a.className.localeCompare(b.className));

      setStats(statsData);
      setRecentStudents((firstPage.items || []).slice(0, 5));
      setClassBreakdown(breakdown);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner label="Loading dashboard metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="state-box">
          <div className="state-icon error">
            <AlertCircle size={22} />
          </div>
          <h3 className="state-title">Unable to load dashboard</h3>
          <p className="state-description">{error}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadDashboard}
          >
            <RefreshCw size={15} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const totalStudents = stats?.total_students ?? 0;

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h2 className="page-heading">Student Enrollment Overview</h2>
          <p className="page-description">
            Live metrics synchronized directly from the student database.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/students" className="btn btn-secondary">
            <span>View All Students</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/students/add" className="btn btn-primary">
            <UserPlus size={15} />
            <span>Quick Add Student</span>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Students"
          value={totalStudents}
          helper={totalStudents === 0 ? "No records yet" : "Enrolled records"}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Active Classes"
          value={stats?.total_classes ?? 0}
          helper="Distinct grades/classes"
          icon={BookOpen}
          tone="green"
        />
        <StatCard
          label="Active Sections"
          value={stats?.total_sections ?? 0}
          helper="Distinct class sections"
          icon={Layers}
          tone="slate"
        />
        <StatCard
          label="Recent Admissions (30d)"
          value={stats?.recent_admissions ?? 0}
          helper="Admitted in the last 30 days"
          icon={CalendarPlus}
          tone="amber"
        />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Students by Class</h3>
              <p className="card-subtitle">Distribution across active classes</p>
            </div>
          </div>
          <div className="card-body">
            {classBreakdown.length === 0 ? (
              <EmptyState
                title="No class data available"
                description="Register students to view enrollment distribution by class."
              />
            ) : (
              <div className="class-breakdown-list">
                {classBreakdown.map((item) => {
                  const percentage =
                    totalStudents > 0
                      ? Math.round((item.count / totalStudents) * 100)
                      : 0;
                  return (
                    <div key={item.className} className="class-breakdown-item">
                      <div className="class-breakdown-meta">
                        <span style={{ fontWeight: 500 }}>{item.className}</span>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          <strong>{item.count}</strong> ({percentage}%)
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recently Added Students</h3>
              <p className="card-subtitle">Latest student registrations</p>
            </div>
            {recentStudents.length > 0 && (
              <Link
                to="/students"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-primary)",
                }}
              >
                View all
              </Link>
            )}
          </div>
          <div className="card-body">
            {recentStudents.length === 0 ? (
              <EmptyState
                title="No students registered yet"
                description="Get started by adding your first student record to the system."
                action={
                  <Link to="/students/add" className="btn btn-primary">
                    <UserPlus size={15} />
                    <span>Add First Student</span>
                  </Link>
                }
              />
            ) : (
              <div className="recent-list">
                {recentStudents.map((student) => (
                  <div key={student.id} className="recent-item">
                    <div style={{ minWidth: 0 }}>
                      <Link
                        to={`/students/${student.id}`}
                        style={{ fontWeight: 600, color: "var(--color-text)" }}
                      >
                        {student.full_name}
                      </Link>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          marginTop: 2,
                        }}
                      >
                        <span className="mono">{student.admission_number}</span>{" "}
                        • {student.class_name} ({student.section})
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <div>{formatDisplayDate(student.admission_date)}</div>
                      <Link
                        to={`/students/${student.id}`}
                        style={{ color: "var(--color-primary)", fontWeight: 500 }}
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
