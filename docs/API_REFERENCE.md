# API Endpoint Reference — School ERP Student Management

**Base URL:** `http://localhost:8000`  
**Interactive Swagger UI:** `http://localhost:8000/docs`  
**OpenAPI JSON:** `http://localhost:8000/openapi.json`  
**Content-Type:** `application/json`

---

## Summary Table

| Method | Endpoint | Purpose | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check API and MySQL database connectivity | `200 OK` | `503` |
| `GET` | `/api/students` | List, search, filter, and paginate students | `200 OK` | `422`, `503`, `500` |
| `GET` | `/api/students/stats` | Get aggregate counts & distinct class/section filters | `200 OK` | `503`, `500` |
| `GET` | `/api/students/{student_id}` | Get single student details | `200 OK` | `404`, `422`, `503` |
| `POST` | `/api/students` | Register a new student | `201 Created` | `409`, `422`, `503` |
| `PUT` | `/api/students/{student_id}` | Update existing student details | `200 OK` | `404`, `409`, `422`, `503` |
| `DELETE` | `/api/students/{student_id}` | Permanently delete a student record | `200 OK` | `404`, `422`, `503` |

---

## 1. Health Check

### `GET /api/health`

Verifies that the FastAPI server and configured MySQL database connection are operational.

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Error (`503 Service Unavailable`):**
```json
{
  "status": "unhealthy",
  "database": "disconnected"
}
```

---

## 2. List, Search, and Filter Students

### `GET /api/students`

Retrieves paginated student records using database-side SQLAlchemy queries. All search and filter parameters can be combined.

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` (optional) | `null` | Case-insensitive partial match on `full_name` or `admission_number` |
| `admission_number` | `string` (optional) | `null` | Case-insensitive exact admission number lookup |
| `class_name` | `string` (optional) | `null` | Filter by class (e.g., `Class 8`) |
| `section` | `string` (optional) | `null` | Filter by section (e.g., `A`) |
| `page` | `integer` (`>= 1`) | `1` | 1-indexed page number |
| `limit` | `integer` (`1..100`) | `10` | Number of records per page |

**Example Request:**
```http
GET /api/students?search=Aarav&class_name=Class%208&section=A&page=1&limit=10
```

**Response (`200 OK`):**
```json
{
  "items": [
    {
      "id": 1,
      "full_name": "Aarav Sharma",
      "admission_number": "ADM-2026-001",
      "date_of_birth": "2012-05-14",
      "gender": "Male",
      "class_name": "Class 8",
      "section": "A",
      "guardian_name": "Rajesh Sharma",
      "contact_number": "+91 9876543210",
      "email": "rajesh.sharma@example.com",
      "address": "42 MG Road, Bengaluru",
      "admission_date": "2026-04-01",
      "created_at": "2026-11-25T10:30:00",
      "updated_at": "2026-11-25T10:30:00"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

---

## 3. Student Summary Statistics & Filter Options

### `GET /api/students/stats`

Returns live aggregate metrics for the dashboard and distinct class/section values for dropdown filters.

**Response (`200 OK`):**
```json
{
  "total_students": 12,
  "total_classes": 4,
  "total_sections": 3,
  "recent_admissions": 5,
  "classes": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "sections": ["A", "B", "C"]
}
```

---

## 4. Get Student Details by ID

### `GET /api/students/{student_id}`

**Path Parameters:**
- `student_id` (`integer >= 1`) — Numeric student ID.

**Response (`200 OK`):**
```json
{
  "id": 1,
  "full_name": "Aarav Sharma",
  "admission_number": "ADM-2026-001",
  "date_of_birth": "2012-05-14",
  "gender": "Male",
  "class_name": "Class 8",
  "section": "A",
  "guardian_name": "Rajesh Sharma",
  "contact_number": "+91 9876543210",
  "email": "rajesh.sharma@example.com",
  "address": "42 MG Road, Bengaluru",
  "admission_date": "2026-04-01",
  "created_at": "2026-11-25T10:30:00",
  "updated_at": "2026-11-25T10:30:00"
}
```

**Error (`404 Not Found`):**
```json
{
  "detail": "Student with ID 999 was not found."
}
```

---

## 5. Register a New Student

### `POST /api/students`

**Request Body:**
```json
{
  "full_name": "Aarav Sharma",
  "admission_number": "ADM-2026-001",
  "date_of_birth": "2012-05-14",
  "gender": "Male",
  "class_name": "Class 8",
  "section": "A",
  "guardian_name": "Rajesh Sharma",
  "contact_number": "+91 9876543210",
  "email": "rajesh.sharma@example.com",
  "address": "42 MG Road, Bengaluru",
  "admission_date": "2026-04-01"
}
```

- `email` is optional (`null` or `""` stored as `null`).
- `admission_date` defaults to today's date if omitted.

**Response (`201 Created`):** Returns the created `StudentResponse` object.

**Error (`409 Conflict` — Duplicate Admission Number):**
```json
{
  "detail": "A student with admission number 'ADM-2026-001' already exists."
}
```

**Error (`422 Unprocessable Content` — Validation Error):**
```json
{
  "detail": "Validation failed. Please review the submitted fields.",
  "errors": [
    {
      "field": "contact_number",
      "message": "Value error, Contact number must contain between 7 and 15 digits."
    }
  ]
}
```

---

## 6. Update an Existing Student

### `PUT /api/students/{student_id}`

Updates one or more fields of an existing student record.

**Request Body Example:**
```json
{
  "class_name": "Class 9",
  "section": "B",
  "contact_number": "+91 9988776655"
}
```

**Response (`200 OK`):** Returns the updated `StudentResponse` object.

**Error Codes:** `404` (student not found), `409` (admission number belongs to another student), `422` (validation failure or empty update payload).

---

## 7. Delete a Student

### `DELETE /api/students/{student_id}`

Permanently removes a student record from the database.

**Response (`200 OK`):**
```json
{
  "message": "Student with ID 1 was deleted successfully.",
  "id": 1
}
```

**Error (`404 Not Found`):**
```json
{
  "detail": "Student with ID 1 was not found."
}
```
