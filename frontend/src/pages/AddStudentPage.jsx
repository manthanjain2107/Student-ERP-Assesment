import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentForm from "../components/students/StudentForm";
import { useToast } from "../context/ToastContext";
import { extractApiError } from "../services/api";
import { createStudent } from "../services/studentService";

export default function AddStudentPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setServerError("");
    setServerFieldErrors({});
    try {
      const created = await createStudent(payload);
      showToast({
        type: "success",
        title: "Student Registered",
        message: `${created.full_name} (${created.admission_number}) was added successfully.`,
      });
      navigate("/students");
    } catch (err) {
      const parsed = extractApiError(err);
      setServerError(parsed.message);
      setServerFieldErrors(parsed.fieldErrors);
      showToast({
        type: "error",
        title: "Registration Failed",
        message: parsed.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h2 className="page-heading">Register New Student</h2>
          <p className="page-description">
            Fill in the mandatory fields marked with * to enroll a student.
          </p>
        </div>
        <Link to="/students" className="btn btn-secondary">
          <ArrowLeft size={15} />
          <span>Back to Students</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <StudentForm
            isEdit={false}
            isSubmitting={isSubmitting}
            serverError={serverError}
            serverFieldErrors={serverFieldErrors}
            submitLabel="Register Student"
            onSubmit={handleSubmit}
            onCancel={() => navigate("/students")}
          />
        </div>
      </div>
    </div>
  );
}
