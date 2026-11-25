"""CRUD operations package."""

from app.crud.student import (
    DuplicateAdmissionNumberError,
    InvalidStudentDataError,
    create_student,
    delete_student,
    get_student_by_admission_number,
    get_student_by_id,
    get_student_stats,
    get_students,
    update_student,
)

__all__ = [
    "DuplicateAdmissionNumberError",
    "InvalidStudentDataError",
    "get_students",
    "get_student_by_id",
    "get_student_by_admission_number",
    "create_student",
    "update_student",
    "delete_student",
    "get_student_stats",
]
