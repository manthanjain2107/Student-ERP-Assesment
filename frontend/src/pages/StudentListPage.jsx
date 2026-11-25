import { AlertCircle, RefreshCw, RotateCcw, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmationModal from "../components/common/ConfirmationModal";
import EmptyState from "../components/common/EmptyState";
import FilterDropdown from "../components/common/FilterDropdown";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SearchBar from "../components/common/SearchBar";
import StudentTable from "../components/students/StudentTable";
import { useToast } from "../context/ToastContext";
import { extractApiError } from "../services/api";
import {
  deleteStudent,
  getStudentFilters,
  getStudents,
} from "../services/studentService";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
  mergeOptionLists,
} from "../utils/studentHelpers";

const PAGE_LIMIT = 10;

export default function StudentListPage() {
  const { showToast } = useToast();
  const latestRequestId = useRef(0);

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const [classOptions, setClassOptions] = useState(CLASS_OPTIONS);
  const [sectionOptions, setSectionOptions] = useState(SECTION_OPTIONS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input so API queries run smoothly without firing on every keystroke
  useEffect(() => {
    if (searchInput === debouncedSearch) return undefined;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const filters = await getStudentFilters();
      setClassOptions(mergeOptionLists(CLASS_OPTIONS, filters.classes));
      setSectionOptions(mergeOptionLists(SECTION_OPTIONS, filters.sections));
    } catch {
      // Fall back to standard options if filter endpoint request fails independently
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await getStudents({
        search: debouncedSearch,
        class_name: classFilter,
        section: sectionFilter,
        page,
        limit: PAGE_LIMIT,
      });
      if (requestId !== latestRequestId.current) return;
      setStudents(data.items || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 0);
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      setError(extractApiError(err).message);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, classFilter, sectionFilter, page]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleClassChange = (value) => {
    setClassFilter(value);
    setPage(1);
  };

  const handleSectionChange = (value) => {
    setSectionFilter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setClassFilter("");
    setSectionFilter("");
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      showToast({
        type: "success",
        title: "Student Deleted",
        message: `${deleteTarget.full_name} (${deleteTarget.admission_number}) has been removed.`,
      });
      const wasLastOnPage = students.length === 1 && page > 1;
      setDeleteTarget(null);
      loadFilterOptions();
      if (wasLastOnPage) {
        setPage((prev) => prev - 1);
      } else {
        fetchStudents();
      }
    } catch (err) {
      showToast({
        type: "error",
        title: "Deletion Failed",
        message: extractApiError(err).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    debouncedSearch.trim() || classFilter || sectionFilter
  );

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h2 className="page-heading">Student Directory</h2>
          <p className="page-description">
            Search, filter, view, edit, and manage registered students.
          </p>
        </div>
        <Link to="/students/add" className="btn btn-primary">
          <UserPlus size={15} />
          <span>Add Student</span>
        </Link>
      </div>

      <div className="card">
        <div className="filters-bar">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by student name or admission number..."
          />
          <FilterDropdown
            value={classFilter}
            onChange={handleClassChange}
            options={classOptions}
            placeholder="All Classes"
            ariaLabel="Filter by class"
          />
          <FilterDropdown
            value={sectionFilter}
            onChange={handleSectionChange}
            options={sectionOptions}
            placeholder="All Sections"
            ariaLabel="Filter by section"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters && !searchInput}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading students..." />
        ) : error ? (
          <div className="state-box">
            <div className="state-icon error">
              <AlertCircle size={22} />
            </div>
            <h3 className="state-title">Failed to load students</h3>
            <p className="state-description">{error}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchStudents}
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? "No matching students found"
                : "No students registered yet"
            }
            description={
              hasActiveFilters
                ? "Try adjusting your search query or clearing the class/section filters."
                : "Register your first student to populate the school directory."
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={14} />
                  <span>Clear Filters</span>
                </button>
              ) : (
                <Link to="/students/add" className="btn btn-primary">
                  <UserPlus size={15} />
                  <span>Add Student</span>
                </Link>
              )
            }
          />
        ) : (
          <StudentTable
            students={students}
            total={total}
            page={page}
            limit={PAGE_LIMIT}
            totalPages={totalPages}
            onPageChange={setPage}
            onDeleteClick={setDeleteTarget}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Student Record"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete ${deleteTarget.full_name} (${deleteTarget.admission_number})? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Student"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
}
