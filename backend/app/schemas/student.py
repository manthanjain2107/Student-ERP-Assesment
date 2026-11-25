"""Pydantic request and response schemas for Student Management APIs."""

from datetime import date, datetime
import re
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

ADMISSION_NUMBER_PATTERN = re.compile(r"^[A-Za-z0-9/_-]+$")
CONTACT_NUMBER_PATTERN = re.compile(r"^[+]?[0-9\s\-()]{7,20}$")
ALLOWED_GENDERS = {"male": "Male", "female": "Female", "other": "Other"}
MIN_VALID_DOB = date(1950, 1, 1)


def _clean_required_text(
    value: object,
    field_label: str,
    min_length: int,
    max_length: int,
) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_label} must be a valid text value.")
    cleaned = " ".join(value.strip().split())
    if len(cleaned) < min_length:
        raise ValueError(
            f"{field_label} must be at least {min_length} character(s)."
        )
    if len(cleaned) > max_length:
        raise ValueError(
            f"{field_label} must not exceed {max_length} characters."
        )
    return cleaned


def _validate_admission_number_value(value: object) -> str:
    cleaned = _clean_required_text(value, "Admission number", 2, 50)
    if not ADMISSION_NUMBER_PATTERN.match(cleaned):
        raise ValueError(
            "Admission number may only contain letters, numbers, hyphens (-), "
            "underscores (_), or slashes (/)."
        )
    return cleaned.upper()


def _validate_gender_value(value: object) -> str:
    cleaned = _clean_required_text(value, "Gender", 1, 20)
    normalized = ALLOWED_GENDERS.get(cleaned.lower())
    if not normalized:
        raise ValueError("Gender must be one of: Male, Female, Other.")
    return normalized


def _validate_contact_number_value(value: object) -> str:
    cleaned = _clean_required_text(value, "Contact number", 7, 20)
    if not CONTACT_NUMBER_PATTERN.match(cleaned):
        raise ValueError(
            "Contact number must contain 7 to 15 digits and may include +, spaces, hyphens, or parentheses."
        )
    digits = re.sub(r"\D", "", cleaned)
    if not (7 <= len(digits) <= 15):
        raise ValueError("Contact number must contain between 7 and 15 digits.")
    return cleaned


def _validate_dob_value(value: date) -> date:
    today = date.today()
    if value > today:
        raise ValueError("Date of birth cannot be in the future.")
    if value < MIN_VALID_DOB:
        raise ValueError("Date of birth must be on or after 1950-01-01.")
    return value


def _normalize_optional_email(value: object) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None
    return value  # type: ignore[return-value]


class StudentCreate(BaseModel):
    """Schema for registering a new student."""

    full_name: str = Field(..., description="Full name of the student", examples=["Aarav Sharma"])
    admission_number: str = Field(
        ...,
        description="Unique school admission number",
        examples=["ADM-2026-001"],
    )
    date_of_birth: date = Field(..., description="Student date of birth (YYYY-MM-DD)", examples=["2012-05-14"])
    gender: str = Field(..., description="Gender (Male, Female, Other)", examples=["Male"])
    class_name: str = Field(..., description="Enrolled class or grade", examples=["Class 8"])
    section: str = Field(..., description="Class section", examples=["A"])
    guardian_name: str = Field(..., description="Parent or legal guardian name", examples=["Rajesh Sharma"])
    contact_number: str = Field(..., description="Parent/guardian contact number", examples=["+91 9876543210"])
    email: Optional[EmailStr] = Field(
        default=None,
        description="Optional parent/student email address",
        examples=["rajesh.sharma@example.com"],
    )
    address: str = Field(..., description="Residential address", examples=["42 MG Road, Bengaluru"])
    admission_date: Optional[date] = Field(
        default=None,
        description="Date of admission (defaults to today if omitted)",
        examples=["2026-04-01"],
    )

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, value: object) -> str:
        return _clean_required_text(value, "Full name", 2, 150)

    @field_validator("admission_number", mode="before")
    @classmethod
    def validate_admission_number(cls, value: object) -> str:
        return _validate_admission_number_value(value)

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date) -> date:
        return _validate_dob_value(value)

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, value: object) -> str:
        return _validate_gender_value(value)

    @field_validator("class_name", mode="before")
    @classmethod
    def validate_class_name(cls, value: object) -> str:
        return _clean_required_text(value, "Class", 1, 50)

    @field_validator("section", mode="before")
    @classmethod
    def validate_section(cls, value: object) -> str:
        return _clean_required_text(value, "Section", 1, 20).upper()

    @field_validator("guardian_name", mode="before")
    @classmethod
    def validate_guardian_name(cls, value: object) -> str:
        return _clean_required_text(value, "Parent/Guardian name", 2, 150)

    @field_validator("contact_number", mode="before")
    @classmethod
    def validate_contact_number(cls, value: object) -> str:
        return _validate_contact_number_value(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> Optional[str]:
        return _normalize_optional_email(value)

    @field_validator("address", mode="before")
    @classmethod
    def validate_address(cls, value: object) -> str:
        return _clean_required_text(value, "Address", 5, 1000)

    @model_validator(mode="after")
    def validate_dates_and_defaults(self) -> "StudentCreate":
        if self.admission_date is None:
            self.admission_date = date.today()
        if self.admission_date < self.date_of_birth:
            raise ValueError("Admission date cannot be earlier than date of birth.")
        return self


class StudentUpdate(BaseModel):
    """Schema for updating an existing student record."""

    full_name: Optional[str] = Field(default=None, examples=["Aarav Sharma"])
    admission_number: Optional[str] = Field(default=None, examples=["ADM-2026-001"])
    date_of_birth: Optional[date] = Field(default=None, examples=["2012-05-14"])
    gender: Optional[str] = Field(default=None, examples=["Male"])
    class_name: Optional[str] = Field(default=None, examples=["Class 9"])
    section: Optional[str] = Field(default=None, examples=["B"])
    guardian_name: Optional[str] = Field(default=None, examples=["Rajesh Sharma"])
    contact_number: Optional[str] = Field(default=None, examples=["+91 9876543210"])
    email: Optional[EmailStr] = Field(default=None, examples=["rajesh.sharma@example.com"])
    address: Optional[str] = Field(default=None, examples=["42 MG Road, Bengaluru"])
    admission_date: Optional[date] = Field(default=None, examples=["2026-04-01"])

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, value: object) -> str:
        if value is None:
            raise ValueError("Full name cannot be null.")
        return _clean_required_text(value, "Full name", 2, 150)

    @field_validator("admission_number", mode="before")
    @classmethod
    def validate_admission_number(cls, value: object) -> str:
        if value is None:
            raise ValueError("Admission number cannot be null.")
        return _validate_admission_number_value(value)

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: Optional[date]) -> date:
        if value is None:
            raise ValueError("Date of birth cannot be null.")
        return _validate_dob_value(value)

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, value: object) -> str:
        if value is None:
            raise ValueError("Gender cannot be null.")
        return _validate_gender_value(value)

    @field_validator("class_name", mode="before")
    @classmethod
    def validate_class_name(cls, value: object) -> str:
        if value is None:
            raise ValueError("Class cannot be null.")
        return _clean_required_text(value, "Class", 1, 50)

    @field_validator("section", mode="before")
    @classmethod
    def validate_section(cls, value: object) -> str:
        if value is None:
            raise ValueError("Section cannot be null.")
        return _clean_required_text(value, "Section", 1, 20).upper()

    @field_validator("guardian_name", mode="before")
    @classmethod
    def validate_guardian_name(cls, value: object) -> str:
        if value is None:
            raise ValueError("Parent/Guardian name cannot be null.")
        return _clean_required_text(value, "Parent/Guardian name", 2, 150)

    @field_validator("contact_number", mode="before")
    @classmethod
    def validate_contact_number(cls, value: object) -> str:
        if value is None:
            raise ValueError("Contact number cannot be null.")
        return _validate_contact_number_value(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> Optional[str]:
        return _normalize_optional_email(value)

    @field_validator("address", mode="before")
    @classmethod
    def validate_address(cls, value: object) -> str:
        if value is None:
            raise ValueError("Address cannot be null.")
        return _clean_required_text(value, "Address", 5, 1000)

    @field_validator("admission_date")
    @classmethod
    def validate_admission_date(cls, value: Optional[date]) -> date:
        if value is None:
            raise ValueError("Admission date cannot be null.")
        return value

    @model_validator(mode="after")
    def validate_dates(self) -> "StudentUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided to update.")
        if (
            self.date_of_birth is not None
            and self.admission_date is not None
            and self.admission_date < self.date_of_birth
        ):
            raise ValueError("Admission date cannot be earlier than date of birth.")
        return self


class StudentResponse(BaseModel):
    """Schema representing a persisted student record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    admission_number: str
    date_of_birth: date
    gender: str
    class_name: str
    section: str
    guardian_name: str
    contact_number: str
    email: Optional[str] = None
    address: str
    admission_date: date
    created_at: datetime
    updated_at: datetime


class PaginatedStudentsResponse(BaseModel):
    """Paginated response wrapper for student listing and search/filter queries."""

    items: list[StudentResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class StudentDeleteResponse(BaseModel):
    """Confirmation payload returned when a student record is deleted."""

    message: str
    id: int


class StudentStatsResponse(BaseModel):
    """Aggregate student metrics for dashboard summary cards and filter options."""

    total_students: int
    total_classes: int
    total_sections: int
    recent_admissions: int
    classes: list[str]
    sections: list[str]
