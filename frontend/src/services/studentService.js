import api from "./api";

/**
 * Fetch paginated students with optional search and class/section filters.
 */
export async function getStudents(params = {}) {
  const cleanParams = {};
  if (params.search?.trim()) cleanParams.search = params.search.trim();
  if (params.admission_number?.trim()) {
    cleanParams.admission_number = params.admission_number.trim();
  }
  if (params.class_name?.trim()) cleanParams.class_name = params.class_name.trim();
  if (params.section?.trim()) cleanParams.section = params.section.trim();
  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;

  const response = await api.get("/api/students", { params: cleanParams });
  return response.data;
}

/**
 * Fetch live aggregate statistics and distinct class/section filter options.
 */
export async function getStudentStats() {
  const response = await api.get("/api/students/stats");
  return response.data;
}

/**
 * Fetch distinct class and section filter options from the backend.
 */
export async function getStudentFilters() {
  const stats = await getStudentStats();
  return {
    classes: stats.classes || [],
    sections: stats.sections || [],
  };
}

/**
 * Fetch a single student profile by numeric ID.
 */
export async function getStudentById(studentId) {
  const response = await api.get(`/api/students/${studentId}`);
  return response.data;
}

/**
 * Register a new student record.
 */
export async function createStudent(payload) {
  const response = await api.post("/api/students", payload);
  return response.data;
}

/**
 * Update an existing student record by ID.
 */
export async function updateStudent(studentId, payload) {
  const response = await api.put(`/api/students/${studentId}`, payload);
  return response.data;
}

/**
 * Permanently delete a student record by ID.
 */
export async function deleteStudent(studentId) {
  const response = await api.delete(`/api/students/${studentId}`);
  return response.data;
}
