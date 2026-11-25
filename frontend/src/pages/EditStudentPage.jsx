import { AlertCircle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StudentForm from "../components/students/StudentForm";
import { useToast } from "../context/ToastContext";
import { extractApiError } from "../services/api";
import { getStudentById, updateStudent } from "../services/studentService";

export default function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getStudentById(id);
      setStudent(data);
    } catch (err) {
      setLoadError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setServerError("");
    setServerFieldErrors({});
    try {
      const updated = await updateStudent(id, payload);
      showToast({
        type: "success",
        title: "Student Updated",
        message: `${updated.full_name} (${updated.admission_number}) has been updated.`,
      });
      navigate(`/students/${id}`);
    } catch (err) {
      const parsed = extractApiError(err);
      setServerError(parsed.message);
      setServerFieldErrors(parsed.fieldErrors);
      showToast({
        type: "error",
        title: "Update Failed",
        message: parsed.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner label="Loading student details..." />
      </div>
    );
  }

  if (loadError || !student) {
    return (
      <div className="card">
        <div className="state-box">
          <div className="state-icon error">
            <AlertCircle size={22} />
          </div>
          <h3 className="state-title">Unable to load student</h3>
          <p className="state-description">
            {loadError || "Student record could not be found."}
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
        <div>
          <h2 className="page-heading">Edit Student — {student.full_name}</h2>
          <p className="page-description">
            Modify student or guardian details and save changes to the database.
          </p>
        </div>
        <Link to={`/students/${id}`} className="btn btn-secondary">
          <ArrowLeft size={15} />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <StudentForm
            initialValues={student}
            isEdit={true}
            isSubmitting={isSubmitting}
            serverError={serverError}
            serverFieldErrors={serverFieldErrors}
            submitLabel="Update Student"
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/students/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
