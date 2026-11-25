"""SQLAlchemy CRUD and database-side search/filter operations for Students."""

from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentStatsResponse, StudentUpdate


class DuplicateAdmissionNumberError(Exception):
    """Raised when attempting to persist a duplicate admission number."""

    def __init__(self, admission_number: str) -> None:
        self.admission_number = admission_number
        super().__init__(
            f"A student with admission number '{admission_number}' already exists."
        )


class InvalidStudentDataError(Exception):
    """Raised when cross-field business rules fail against persisted state."""


def _escape_like(term: str) -> str:
    """Escape SQL LIKE wildcard characters in user-supplied search terms."""
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    """Fetch a single student record by primary key."""
    return db.query(Student).filter(Student.id == student_id).first()


def get_student_by_admission_number(
    db: Session,
    admission_number: str,
    exclude_student_id: Optional[int] = None,
) -> Optional[Student]:
    """Fetch a student by admission number (case-insensitive), optionally excluding an ID."""
    normalized = admission_number.strip().lower()
    query = db.query(Student).filter(func.lower(Student.admission_number) == normalized)
    if exclude_student_id is not None:
        query = query.filter(Student.id != exclude_student_id)
    return query.first()


def get_students(
    db: Session,
    *,
    search: Optional[str] = None,
    admission_number: Optional[str] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> tuple[list[Student], int]:
    """Execute database-side search, filtering, and pagination on Student records."""
    query = db.query(Student)

    if search and search.strip():
        escaped = _escape_like(search.strip())
        pattern = f"%{escaped}%"
        query = query.filter(
            or_(
                Student.full_name.ilike(pattern, escape="\\"),
                Student.admission_number.ilike(pattern, escape="\\"),
            )
        )

    if admission_number and admission_number.strip():
        query = query.filter(
            func.lower(Student.admission_number) == admission_number.strip().lower()
        )

    if class_name and class_name.strip():
        query = query.filter(
            func.lower(Student.class_name) == class_name.strip().lower()
        )

    if section and section.strip():
        query = query.filter(
            func.lower(Student.section) == section.strip().lower()
        )

    total = query.count()
    offset = (page - 1) * limit
    items = (
        query.order_by(Student.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create_student(db: Session, payload: StudentCreate) -> Student:
    """Create and persist a new Student record."""
    if get_student_by_admission_number(db, payload.admission_number):
        raise DuplicateAdmissionNumberError(payload.admission_number)

    student = Student(**payload.model_dump())
    db.add(student)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateAdmissionNumberError(payload.admission_number) from exc
    db.refresh(student)
    return student


def update_student(
    db: Session,
    student_id: int,
    payload: StudentUpdate,
) -> Optional[Student]:
    """Update an existing Student record; returns None if not found."""
    student = get_student_by_id(db, student_id)
    if not student:
        return None

    updates = payload.model_dump(exclude_unset=True)

    # Validate date relationship against persisted record when only one date changes
    effective_dob = updates.get("date_of_birth", student.date_of_birth)
    effective_admission_date = updates.get("admission_date", student.admission_date)
    if effective_admission_date < effective_dob:
        raise InvalidStudentDataError(
            "Admission date cannot be earlier than date of birth."
        )

    new_adm_num = updates.get("admission_number")
    if new_adm_num and get_student_by_admission_number(
        db,
        new_adm_num,
        exclude_student_id=student_id,
    ):
        raise DuplicateAdmissionNumberError(new_adm_num)

    for field, value in updates.items():
        setattr(student, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        conflict_adm = updates.get("admission_number", student.admission_number)
        raise DuplicateAdmissionNumberError(conflict_adm) from exc
    db.refresh(student)
    return student


def delete_student(db: Session, student_id: int) -> bool:
    """Delete a Student record by ID; returns False if the record does not exist."""
    student = get_student_by_id(db, student_id)
    if not student:
        return False
    db.delete(student)
    db.commit()
    return True


def get_student_stats(db: Session) -> StudentStatsResponse:
    """Compute live aggregate statistics and distinct filter options from the DB."""
    total_students = db.query(func.count(Student.id)).scalar() or 0
    recent_cutoff = date.today() - timedelta(days=30)
    recent_admissions = (
        db.query(func.count(Student.id))
        .filter(Student.admission_date >= recent_cutoff)
        .scalar()
        or 0
    )

    class_rows = (
        db.query(Student.class_name)
        .distinct()
        .order_by(Student.class_name.asc())
        .all()
    )
    section_rows = (
        db.query(Student.section)
        .distinct()
        .order_by(Student.section.asc())
        .all()
    )

    classes = [row[0] for row in class_rows]
    sections = [row[0] for row in section_rows]

    return StudentStatsResponse(
        total_students=total_students,
        total_classes=len(classes),
        total_sections=len(sections),
        recent_admissions=recent_admissions,
        classes=classes,
        sections=sections,
    )
