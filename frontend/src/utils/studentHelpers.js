export const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

export const GENDER_OPTIONS = ["Male", "Female", "Other"];

const ADMISSION_NUMBER_REGEX = /^[A-Za-z0-9/_-]+$/;
const CONTACT_REGEX = /^[+]?[0-9\s\-()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDisplayDateTime(dateTimeString) {
  if (!dateTimeString) return "—";
  const parsed = new Date(dateTimeString);
  if (Number.isNaN(parsed.getTime())) return dateTimeString;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function mergeOptionLists(baseList, dynamicList = []) {
  const seen = new Set(baseList.map((item) => item.toLowerCase()));
  const merged = [...baseList];
  for (const item of dynamicList) {
    if (item && !seen.has(item.toLowerCase())) {
      seen.add(item.toLowerCase());
      merged.push(item);
    }
  }
  return merged;
}

/**
 * Client-side validation mirroring backend Pydantic rules for immediate feedback.
 */
export function validateStudentForm(values) {
  const errors = {};
  const fullName = values.full_name?.trim() || "";
  const admissionNumber = values.admission_number?.trim() || "";
  const dob = values.date_of_birth || "";
  const admissionDate = values.admission_date || "";
  const gender = values.gender?.trim() || "";
  const className = values.class_name?.trim() || "";
  const section = values.section?.trim() || "";
  const guardianName = values.guardian_name?.trim() || "";
  const contactNumber = values.contact_number?.trim() || "";
  const email = values.email?.trim() || "";
  const address = values.address?.trim() || "";

  if (fullName.length < 2) {
    errors.full_name = "Full name must be at least 2 characters.";
  } else if (fullName.length > 150) {
    errors.full_name = "Full name must not exceed 150 characters.";
  }

  if (admissionNumber.length < 2) {
    errors.admission_number = "Admission number is required (min 2 characters).";
  } else if (admissionNumber.length > 50) {
    errors.admission_number = "Admission number must not exceed 50 characters.";
  } else if (!ADMISSION_NUMBER_REGEX.test(admissionNumber)) {
    errors.admission_number =
      "Use only letters, numbers, hyphens (-), underscores (_), or slashes (/).";
  }

  if (!dob) {
    errors.date_of_birth = "Date of birth is required.";
  } else {
    const today = getTodayIsoDate();
    if (dob > today) {
      errors.date_of_birth = "Date of birth cannot be in the future.";
    } else if (dob < "1950-01-01") {
      errors.date_of_birth = "Date of birth must be on or after 1950-01-01.";
    }
  }

  if (admissionDate && dob && admissionDate < dob) {
    errors.admission_date = "Admission date cannot be earlier than date of birth.";
  }

  if (!GENDER_OPTIONS.includes(gender)) {
    errors.gender = "Please select a valid gender.";
  }

  if (!className) {
    errors.class_name = "Please select a class.";
  }

  if (!section) {
    errors.section = "Please select a section.";
  }

  if (guardianName.length < 2) {
    errors.guardian_name = "Parent/Guardian name must be at least 2 characters.";
  } else if (guardianName.length > 150) {
    errors.guardian_name = "Parent/Guardian name must not exceed 150 characters.";
  }

  if (!contactNumber) {
    errors.contact_number = "Contact number is required.";
  } else {
    const digitCount = contactNumber.replace(/\D/g, "").length;
    if (!CONTACT_REGEX.test(contactNumber) || digitCount < 7 || digitCount > 15) {
      errors.contact_number = "Enter a valid phone number (7 to 15 digits).";
    }
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (address.length < 5) {
    errors.address = "Address must be at least 5 characters.";
  } else if (address.length > 1000) {
    errors.address = "Address must not exceed 1000 characters.";
  }

  return errors;
}
