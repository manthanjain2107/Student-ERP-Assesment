import { AlertCircle, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "../components/common/ConfirmationModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { extractApiError } from "../services/api";
import { deleteStudent, getStudentById } from "../services/studentService";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  getInitials,
} from "../utils/studentHelpers";

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudentById(id);
      setStudent(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleConfirmDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      await deleteStudent(student.id);
      showToast({
        type: "success",
        title: "Student Deleted",
        message: `${student.full_name} (${student.admission_number}) has been deleted.`,
      });
      navigate("/students");
    } catch (err) {
      showToast({
        type: "error",
        title: "Deletion Failed",
        message: extractApiError(err).message,
      });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner label="Loading student profile..." />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="card">
        <div className="state-box">
          <div className="state-icon error">
            <AlertCircle size={22} />
          </div>
          <h3 className="state-title">Student record not available</h3>
          <p className="state-description">
            {error || "The requested student could not be found."}
          </p>
          <Link to="/students" className="btn btn-secondary">
            <ArrowLeft size={15} />
            <span>Back to Students</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-toolbar">
        <Link to="/students" className="btn btn-secondary">
          <ArrowLeft size={15} />
          <span>Back to Students</span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to={`/students/${student.id}/edit`} className="btn btn-primary">
            <Pencil size={15} />
            <span>Edit Student</span>
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body profile-banner">
          <div className="profile-identity">
            <div className="profile-avatar">{getInitials(student.full_name)}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>
                {student.full_name}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  flexWrap: "wrap",
                  color: "var(--color-text-secondary)",
                  fontSize: 13,
                }}
              >
                <span className="mono">{student.admission_number}</span>
                <span>•</span>
                <span className="badge badge-blue">
                  {student.class_name} — Section {student.section}
                </span>
                <span>•</span>
                <span>ID #{student.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Student & Admission Information</h3>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-item">
                <div className="detail-label">Student ID</div>
                <div className="detail-value mono">#{student.id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Admission Number</div>
                <div className="detail-value mono">{student.admission_number}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">
                  {formatDisplayDate(student.date_of_birth)}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gender</div>
                <div className="detail-value">{student.gender}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Class</div>
                <div className="detail-value">{student.class_name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Section</div>
                <div className="detail-value">{student.section}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Admission Date</div>
                <div className="detail-value">
                  {formatDisplayDate(student.admission_date)}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">
                  {formatDisplayDateTime(student.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Parent/Guardian & Contact Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-item full">
                <div className="detail-label">Parent / Guardian Name</div>
                <div className="detail-value">{student.guardian_name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Number</div>
                <div className="detail-value">{student.contact_number}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email Address</div>
                <div className="detail-value">{student.email || "Not provided"}</div>
              </div>
              <div className="detail-item full">
                <div className="detail-label">Residential Address</div>
                <div className="detail-value">{student.address}</div>
              </div>
              <div className="detail-item full">
                <div className="detail-label">Record Created At</div>
                <div className="detail-value">
                  {formatDisplayDateTime(student.created_at)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete ${student.full_name} (${student.admission_number})? This action cannot be undone.`}
        confirmLabel="Delete Student"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
      />
    </div>
  );
}
