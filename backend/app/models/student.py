"""SQLAlchemy ORM model for Student records."""

from datetime import date
from sqlalchemy import Column, Date, DateTime, Index, Integer, String, Text, func

from app.database import Base


class Student(Base):
    """Database model representing an enrolled student in the School ERP."""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    full_name = Column(String(150), nullable=False, index=True)
    admission_number = Column(String(50), nullable=False, unique=True, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    class_name = Column(String(50), nullable=False, index=True)
    section = Column(String(20), nullable=False, index=True)
    guardian_name = Column(String(150), nullable=False)
    contact_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=False)
    admission_date = Column(Date, nullable=False, default=date.today)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        Index("idx_students_class_section", "class_name", "section"),
    )
