"""Isolated automated API and ORM integration tests for the Student Management backend.

Uses an isolated temporary SQLite test database via FastAPI dependency overrides
so development/production MySQL records are never modified or deleted.
"""

from datetime import date, timedelta

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.student import Student


@pytest.fixture(scope="module")
def test_env(tmp_path_factory):
    """Create an isolated temporary database and override FastAPI get_db."""
    db_dir = tmp_path_factory.mktemp("erp_test_db")
    db_file = db_dir / "isolated_test.db"
    test_engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, TestingSessionLocal

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def _student_payload(suffix: str, **overrides) -> dict:
    payload = {
        "full_name": f"Test Student {suffix}",
        "admission_number": f"ADM-TEST-{suffix}",
        "date_of_birth": "2012-06-15",
        "gender": "Male",
        "class_name": "Class 8",
        "section": "A",
        "guardian_name": f"Guardian {suffix}",
        "contact_number": "+91 9876543210",
        "email": f"student.{suffix.lower()}@example.com",
        "address": "123 Academic Lane, Bengaluru",
        "admission_date": "2026-04-01",
    }
    payload.update(overrides)
    return payload


def test_swagger_and_cors_headers(test_env):
    client, _ = test_env
    docs_res = client.get("/docs")
    assert docs_res.status_code == 200

    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    assert "/api/students" in openapi_res.json()["paths"]

    cors_res = client.options(
        "/api/students",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert cors_res.status_code == 200
    assert cors_res.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_create_students_and_optional_email(test_env):
    client, _ = test_env

    res1 = client.post(
        "/api/students",
        json=_student_payload("001", full_name="Aarav Verma"),
    )
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["full_name"] == "Aarav Verma"
    assert data1["admission_number"] == "ADM-TEST-001"
    assert data1["email"] == "student.001@example.com"
    assert data1["created_at"] and data1["updated_at"]

    res2 = client.post(
        "/api/students",
        json=_student_payload(
            "002",
            full_name="Diya Nair",
            gender="female",
            class_name="Class 9",
            section="b",
            email="",
        ),
    )
    assert res2.status_code == 201
    data2 = res2.json()
    assert data2["email"] is None
    assert data2["gender"] == "Female"
    assert data2["section"] == "B"


def test_pagination_and_listing(test_env):
    client, _ = test_env
    res3 = client.post(
        "/api/students",
        json=_student_payload(
            "003",
            full_name="Aarav Mehta",
            class_name="Class 8",
            section="B",
        ),
    )
    assert res3.status_code == 201

    page1 = client.get("/api/students", params={"page": 1, "limit": 2})
    assert page1.status_code == 200
    body1 = page1.json()
    assert body1["total"] == 3
    assert body1["page"] == 1
    assert body1["limit"] == 2
    assert body1["total_pages"] == 2
    assert len(body1["items"]) == 2

    page2 = client.get("/api/students", params={"page": 2, "limit": 2})
    assert page2.status_code == 200
    assert len(page2.json()["items"]) == 1


def test_get_and_update_student(test_env):
    client, _ = test_env
    list_res = client.get("/api/students", params={"admission_number": "ADM-TEST-001"})
    student_id = list_res.json()["items"][0]["id"]

    get_res = client.get(f"/api/students/{student_id}")
    assert get_res.status_code == 200
    assert get_res.json()["full_name"] == "Aarav Verma"

    put_res = client.put(
        f"/api/students/{student_id}",
        json={
            "class_name": "Class 10",
            "section": "C",
            "contact_number": "9988776655",
        },
    )
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["class_name"] == "Class 10"
    assert updated["section"] == "C"
    assert updated["contact_number"] == "9988776655"


def test_search_filter_combined_and_empty_results(test_env):
    client, _ = test_env

    # Search by name
    res_name = client.get("/api/students", params={"search": "Aarav"})
    assert res_name.status_code == 200
    assert res_name.json()["total"] == 2

    # Search by admission number
    res_adm = client.get("/api/students", params={"search": "ADM-TEST-002"})
    assert res_adm.status_code == 200
    assert res_adm.json()["total"] == 1
    assert res_adm.json()["items"][0]["full_name"] == "Diya Nair"

    # Filter by class
    res_cls = client.get("/api/students", params={"class_name": "Class 9"})
    assert res_cls.status_code == 200
    assert res_cls.json()["total"] == 1

    # Filter by section
    res_sec = client.get("/api/students", params={"section": "b"})
    assert res_sec.status_code == 200
    assert res_sec.json()["total"] == 2

    # Combined search + class + section
    res_combined = client.get(
        "/api/students",
        params={"search": "Aarav", "class_name": "Class 8", "section": "B"},
    )
    assert res_combined.status_code == 200
    assert res_combined.json()["total"] == 1
    assert res_combined.json()["items"][0]["admission_number"] == "ADM-TEST-003"

    # Empty search results
    res_empty = client.get("/api/students", params={"search": "NO_SUCH_STUDENT"})
    assert res_empty.status_code == 200
    assert res_empty.json()["total"] == 0
    assert res_empty.json()["items"] == []


def test_sql_injection_and_wildcard_resilience(test_env):
    client, _ = test_env
    for payload in ["' OR '1'='1", "%", "_", "'; DROP TABLE students; --"]:
        res = client.get("/api/students", params={"search": payload})
        assert res.status_code == 200
        assert res.json()["total"] == 0


def test_duplicate_admission_number_and_db_constraint(test_env):
    client, TestingSessionLocal = test_env

    # API POST duplicate (case-insensitive) -> 409
    dup_post = client.post(
        "/api/students",
        json=_student_payload("001", admission_number="adm-test-001"),
    )
    assert dup_post.status_code == 409

    # API PUT duplicate -> 409
    student_id = client.get(
        "/api/students", params={"admission_number": "ADM-TEST-001"}
    ).json()["items"][0]["id"]
    dup_put = client.put(
        f"/api/students/{student_id}",
        json={"admission_number": "ADM-TEST-002"},
    )
    assert dup_put.status_code == 409

    # Direct DB constraint enforcement via SQLAlchemy
    db = TestingSessionLocal()
    try:
        duplicate_row = Student(
            full_name="Constraint Check",
            admission_number="ADM-TEST-001",
            date_of_birth=date(2012, 1, 1),
            gender="Male",
            class_name="Class 8",
            section="A",
            guardian_name="Guardian",
            contact_number="9876543210",
            email=None,
            address="123 Constraint Road",
            admission_date=date(2026, 4, 1),
        )
        db.add(duplicate_row)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
    finally:
        db.close()


def test_missing_student_and_invalid_inputs(test_env):
    client, _ = test_env

    assert client.get("/api/students/999999").status_code == 404
    assert client.put("/api/students/999999", json={"full_name": "Ghost"}).status_code == 404
    assert client.delete("/api/students/999999").status_code == 404
    assert client.get("/api/students/0").status_code == 422

    # Invalid fields on POST -> 422
    future_dob = (date.today() + timedelta(days=5)).isoformat()
    bad_post = client.post(
        "/api/students",
        json={
            "full_name": " ",
            "admission_number": "BAD ADM!",
            "date_of_birth": future_dob,
            "gender": "Unknown",
            "class_name": "",
            "section": "",
            "guardian_name": "X",
            "contact_number": "123",
            "email": "bad-email",
            "address": "12",
        },
    )
    assert bad_post.status_code == 422
    assert len(bad_post.json()["errors"]) >= 5

    # Empty PUT body -> 422
    student_id = client.get(
        "/api/students", params={"admission_number": "ADM-TEST-001"}
    ).json()["items"][0]["id"]
    assert client.put(f"/api/students/{student_id}", json={}).status_code == 422

    # PUT admission_date earlier than persisted DOB -> 422
    bad_date_put = client.put(
        f"/api/students/{student_id}",
        json={"admission_date": "2005-01-01"},
    )
    assert bad_date_put.status_code == 422


def test_stats_and_delete_student(test_env):
    client, _ = test_env

    stats_res = client.get("/api/students/stats")
    assert stats_res.status_code == 200
    assert stats_res.json()["total_students"] == 3

    student_id = client.get(
        "/api/students", params={"admission_number": "ADM-TEST-001"}
    ).json()["items"][0]["id"]

    del_res = client.delete(f"/api/students/{student_id}")
    assert del_res.status_code == 200
    assert client.get(f"/api/students/{student_id}").status_code == 404

    stats_after = client.get("/api/students/stats")
    assert stats_after.json()["total_students"] == 2
