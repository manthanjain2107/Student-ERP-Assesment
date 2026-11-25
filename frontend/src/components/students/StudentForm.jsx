import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CLASS_OPTIONS,
  GENDER_OPTIONS,
  SECTION_OPTIONS,
  getTodayIsoDate,
  mergeOptionLists,
  validateStudentForm,
} from "../../utils/studentHelpers";

const DEFAULT_VALUES = {
  full_name: "",
  admission_number: "",
  date_of_birth: "",
  gender: "",
  class_name: "",
  section: "",
  guardian_name: "",
  contact_number: "",
  email: "",
  address: "",
  admission_date: getTodayIsoDate(),
};

export default function StudentForm({
  initialValues = null,
  isEdit = false,
  isSubmitting = false,
  serverError = "",
  serverFieldErrors = {},
  submitLabel = "Save Student",
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...DEFAULT_VALUES,
    ...(initialValues || {}),
    email: initialValues?.email ?? "",
    admission_date: initialValues?.admission_date || getTodayIsoDate(),
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        ...DEFAULT_VALUES,
        ...initialValues,
        email: initialValues.email ?? "",
        admission_date: initialValues.admission_date || getTodayIsoDate(),
      });
    }
  }, [initialValues]);

  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const classOptions = mergeOptionLists(
    CLASS_OPTIONS,
    values.class_name ? [values.class_name] : []
  );
  const sectionOptions = mergeOptionLists(
    SECTION_OPTIONS,
    values.section ? [values.section] : []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateStudentForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      full_name: values.full_name.trim(),
      admission_number: values.admission_number.trim().toUpperCase(),
      date_of_birth: values.date_of_birth,
      gender: values.gender,
      class_name: values.class_name.trim(),
      section: values.section.trim().toUpperCase(),
      guardian_name: values.guardian_name.trim(),
      contact_number: values.contact_number.trim(),
      email: values.email.trim() || null,
      address: values.address.trim(),
      admission_date: values.admission_date || getTodayIsoDate(),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="alert-banner" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>{serverError}</div>
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title">Student Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Full Name<span className="required-star">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className={`form-control ${errors.full_name ? "is-invalid" : ""}`}
              value={values.full_name}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
              disabled={isSubmitting}
              required
            />
            {errors.full_name && (
              <span className="field-error">{errors.full_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="admission_number" className="form-label">
              Admission Number<span className="required-star">*</span>
            </label>
            <input
              id="admission_number"
              name="admission_number"
              type="text"
              className={`form-control ${errors.admission_number ? "is-invalid" : ""}`}
              value={values.admission_number}
              onChange={handleChange}
              placeholder="e.g. ADM-2026-001"
              disabled={isSubmitting}
              required
            />
            {errors.admission_number && (
              <span className="field-error">{errors.admission_number}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth" className="form-label">
              Date of Birth<span className="required-star">*</span>
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              max={getTodayIsoDate()}
              className={`form-control ${errors.date_of_birth ? "is-invalid" : ""}`}
              value={values.date_of_birth}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.date_of_birth && (
              <span className="field-error">{errors.date_of_birth}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="gender" className="form-label">
              Gender<span className="required-star">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className={`form-control ${errors.gender ? "is-invalid" : ""}`}
              value={values.gender}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.gender && (
              <span className="field-error">{errors.gender}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="class_name" className="form-label">
              Class<span className="required-star">*</span>
            </label>
            <select
              id="class_name"
              name="class_name"
              className={`form-control ${errors.class_name ? "is-invalid" : ""}`}
              value={values.class_name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select class</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.class_name && (
              <span className="field-error">{errors.class_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="section" className="form-label">
              Section<span className="required-star">*</span>
            </label>
            <select
              id="section"
              name="section"
              className={`form-control ${errors.section ? "is-invalid" : ""}`}
              value={values.section}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select section</option>
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.section && (
              <span className="field-error">{errors.section}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="admission_date" className="form-label">
              Admission Date
            </label>
            <input
              id="admission_date"
              name="admission_date"
              type="date"
              className={`form-control ${errors.admission_date ? "is-invalid" : ""}`}
              value={values.admission_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.admission_date && (
              <span className="field-error">{errors.admission_date}</span>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Parent / Guardian & Contact Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="guardian_name" className="form-label">
              Parent / Guardian Name<span className="required-star">*</span>
            </label>
            <input
              id="guardian_name"
              name="guardian_name"
              type="text"
              className={`form-control ${errors.guardian_name ? "is-invalid" : ""}`}
              value={values.guardian_name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Sharma"
              disabled={isSubmitting}
              required
            />
            {errors.guardian_name && (
              <span className="field-error">{errors.guardian_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contact_number" className="form-label">
              Contact Number<span className="required-star">*</span>
            </label>
            <input
              id="contact_number"
              name="contact_number"
              type="tel"
              className={`form-control ${errors.contact_number ? "is-invalid" : ""}`}
              value={values.contact_number}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              disabled={isSubmitting}
              required
            />
            {errors.contact_number && (
              <span className="field-error">{errors.contact_number}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="email" className="form-label">
              Email Address <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={values.email}
              onChange={handleChange}
              placeholder="e.g. parent@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              Residential Address<span className="required-star">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              value={values.address}
              onChange={handleChange}
              placeholder="Enter complete residential address"
              disabled={isSubmitting}
              required
            />
            {errors.address && (
              <span className="field-error">{errors.address}</span>
            )}
          </div>
        </div>
      </div>

      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEdit ? "Updating..." : "Registering...") : submitLabel}
        </button>
      </div>
    </form>
  );
}
