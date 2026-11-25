import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDisplayDate } from "../../utils/studentHelpers";

export default function StudentTable({
  students = [],
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 0,
  onPageChange,
  onDeleteClick,
}) {
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Admission Number</th>
              <th>Class</th>
              <th>Section</th>
              <th>Parent/Guardian Name</th>
              <th>Contact Number</th>
              <th>Admission Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="mono">#{student.id}</td>
                <td>
                  <Link
                    to={`/students/${student.id}`}
                    style={{ fontWeight: 600, color: "var(--color-primary)" }}
                  >
                    {student.full_name}
                  </Link>
                </td>
                <td>
                  <span className="mono">{student.admission_number}</span>
                </td>
                <td>{student.class_name}</td>
                <td>
                  <span className="badge badge-blue">{student.section}</span>
                </td>
                <td>{student.guardian_name}</td>
                <td>{student.contact_number}</td>
                <td>{formatDisplayDate(student.admission_date)}</td>
                <td>
                  <div className="table-actions">
                    <Link
                      to={`/students/${student.id}`}
                      className="btn-icon"
                      title="View student"
                      aria-label={`View ${student.full_name}`}
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      to={`/students/${student.id}/edit`}
                      className="btn-icon"
                      title="Edit student"
                      aria-label={`Edit ${student.full_name}`}
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      type="button"
                      className="btn-icon danger"
                      title="Delete student"
                      aria-label={`Delete ${student.full_name}`}
                      onClick={() => onDeleteClick(student)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="pagination-bar">
          <div>
            Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of{" "}
            <strong>{total}</strong> student{total === 1 ? "" : "s"}
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <span style={{ padding: "0 6px" }}>
              Page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
