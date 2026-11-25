"""Pydantic schemas package."""

from app.schemas.student import (
    PaginatedStudentsResponse,
    StudentCreate,
    StudentDeleteResponse,
    StudentResponse,
    StudentStatsResponse,
    StudentUpdate,
)

__all__ = [
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "PaginatedStudentsResponse",
    "StudentDeleteResponse",
    "StudentStatsResponse",
]
