import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Normalize Axios/FastAPI error responses into a predictable shape
 * containing a human-readable message and field-level errors if present.
 */
export function extractApiError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    const fieldErrors = {};

    if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        if (item?.field && item?.message) {
          fieldErrors[item.field] = item.message;
        }
      }
    } else if (Array.isArray(data?.detail)) {
      for (const item of data.detail) {
        const loc = Array.isArray(item?.loc)
          ? item.loc.filter((part) => part !== "body").join(".")
          : "";
        if (loc && item?.msg) {
          fieldErrors[loc] = item.msg;
        }
      }
    }

    let message =
      typeof data?.detail === "string"
        ? data.detail
        : "Request could not be completed. Please verify your input.";

    if (status === 409) {
      fieldErrors.admission_number = message;
    } else if (status === 503) {
      message =
        typeof data?.detail === "string"
          ? data.detail
          : "Database service is currently unavailable. Please try again later.";
    } else if (status >= 500) {
      message = "An unexpected server error occurred. Please try again later.";
    }

    return {
      status,
      message,
      fieldErrors,
    };
  }

  if (error?.request) {
    return {
      status: 0,
      message:
        "Unable to reach the backend server. Please verify the API is running.",
      fieldErrors: {},
    };
  }

  return {
    status: 0,
    message: error?.message || "An unexpected error occurred.",
    fieldErrors: {},
  };
}

export default api;
