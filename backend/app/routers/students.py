"""FastAPI REST endpoints for Student Management."""

import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.crud.student import (
    DuplicateAdmissionNumberError,
    InvalidStudentDataError,
    create_student,
    delete_student,
    get_student_by_id,
    get_student_stats,
    get_students,
    update_student,
)
from app.database import get_db
from app.schemas.student import (
    PaginatedStudentsResponse,
    StudentCreate,
    StudentDeleteResponse,
    StudentResponse,
    StudentStatsResponse,
    StudentUpdate,
)

router = APIRouter(
    prefix="/api/students",
    tags=["Students"],
)


@router.get(
    "/stats",
    response_model=StudentStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student summary statistics",
    description="Returns aggregate counts (total students, classes, sections, recent admissions) and distinct class/section filter values from the database.",
)
def read_student_stats(db: Session = Depends(get_db)) -> StudentStatsResponse:
    return get_student_stats(db)


@router.get(
    "",
    response_model=PaginatedStudentsResponse,
    status_code=status.HTTP_200_OK,
    summary="List, search, and filter students",
    description=(
        "Retrieve paginated student records from the database with optional combined "
        "search (by student name or admission number), exact admission number lookup, "
        "class filter, and section filter."
    ),
)
def list_students(
    search: Optional[str] = Query(
        default=None,
        description="Search by student full name or admission number (partial, case-insensitive)",
        examples=["Aarav"],
    ),
    admission_number: Optional[str] = Query(
        default=None,
        description="Exact admission number lookup (case-insensitive)",
        examples=["ADM-2026-001"],
    ),
    class_name: Optional[str] = Query(
        default=None,
        description="Filter students by class name",
        examples=["Class 8"],
    ),
    section: Optional[str] = Query(
        default=None,
        description="Filter students by section",
        examples=["A"],
    ),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(default=10, ge=1, le=100, description="Records per page (1-100)"),
    db: Session = Depends(get_db),
) -> PaginatedStudentsResponse:
    items, total = get_students(
        db,
        search=search,
        admission_number=admission_number,
        class_name=class_name,
        section=section,
        page=page,
        limit=limit,
    )
    total_pages = math.ceil(total / limit) if total > 0 else 0
    return PaginatedStudentsResponse(
        items=[StudentResponse.model_validate(student) for student in items],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student details by ID",
    description="Fetch complete profile details for a single student by their numeric ID.",
    responses={404: {"description": "Student not found"}},
)
def read_student(
    student_id: int = Path(..., ge=1, description="Numeric ID of the student"),
    db: Session = Depends(get_db),
) -> StudentResponse:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} was not found.",
        )
    return StudentResponse.model_validate(student)


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student",
    description="Validate and persist a new student record. Enforces unique admission numbers.",
    responses={
        409: {"description": "Duplicate admission number"},
        422: {"description": "Validation error"},
    },
)
def register_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
) -> StudentResponse:
    try:
        student = create_student(db, payload)
    except DuplicateAdmissionNumberError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return StudentResponse.model_validate(student)


@router.put(
    "/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing student",
    description="Update an existing student's details by ID. Validates fields and enforces unique admission numbers.",
    responses={
        404: {"description": "Student not found"},
        409: {"description": "Duplicate admission number"},
        422: {"description": "Validation error"},
    },
)
def edit_student(
    payload: StudentUpdate,
    student_id: int = Path(..., ge=1, description="Numeric ID of the student"),
    db: Session = Depends(get_db),
) -> StudentResponse:
    try:
        student = update_student(db, student_id, payload)
    except DuplicateAdmissionNumberError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except InvalidStudentDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} was not found.",
        )
    return StudentResponse.model_validate(student)


@router.delete(
    "/{student_id}",
    response_model=StudentDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a student",
    description="Permanently delete a student record from the database by ID.",
    responses={404: {"description": "Student not found"}},
)
def remove_student(
    student_id: int = Path(..., ge=1, description="Numeric ID of the student"),
    db: Session = Depends(get_db),
) -> StudentDeleteResponse:
    deleted = delete_student(db, student_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} was not found.",
        )
    return StudentDeleteResponse(
        message=f"Student with ID {student_id} was deleted successfully.",
        id=student_id,
    )
