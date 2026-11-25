# School ERP — Student Management Module

A full-stack Student Management Module for a School ERP system built with **React (Vite)**, **FastAPI**, **SQLAlchemy ORM**, and **MySQL 8.0**. Designed with clean separation between frontend UI, REST API services, validation schemas, and database persistence.

---

## Overview

The module enables school administrators to manage student enrollment records end-to-end against a real MySQL database—supporting live enrollment analytics, registration with uniqueness validation, profile viewing, record editing, deletion with confirmation, and server-side search and filtering.

---

## Features

- **Dashboard (`/dashboard`):** Live enrollment metrics (total students, active classes, active sections, recent admissions in the last 30 days), class-wise enrollment breakdown, recently added students, and quick registration button.
- **Student Directory (`/students`):** Paginated table displaying Student ID, Student Name, Admission Number, Class, Section, Parent/Guardian Name, Contact Number, Admission Date, and View/Edit/Delete actions.
- **Database-Side Search & Filtering:** Debounced search by student name or admission number, class filter, section filter, and combined filters executed via SQLAlchemy ORM queries.
- **Student Registration (`/students/add`):** Client-side and server-side validation, required field indicators, duplicate admission number rejection (`409 Conflict`), and toast notifications.
- **Student Profile (`/students/:id`):** Complete student, admission, guardian, and contact details with Edit, Delete, and Back actions.
- **Edit Student (`/students/:id/edit`):** Pre-populated form updating records via `PUT /api/students/{id}`.
- **Delete Confirmation:** Accessible confirmation modal supporting `Cancel` and `Escape` key dismissal before executing `DELETE /api/students/{id}`.
- **Interactive API Docs:** OpenAPI / Swagger UI at `/docs`.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Axios, Lucide React, HTML5, CSS3 |
| **Backend** | Python, FastAPI, Pydantic v2 (`email-validator`), SQLAlchemy 2.x, Uvicorn, python-dotenv |
| **Database** | MySQL 8.0 (`PyMySQL` + `cryptography`), environment-configured via `DATABASE_URL` |
| **Testing** | Pytest, FastAPI `TestClient`, HTTPX |

---

## Architecture Overview

```text
┌────────────────────────────────────┐
│  React + Vite Frontend (:5173)     │
│  Pages → Services (Axios)          │
└─────────────────┬──────────────────┘
                  │ HTTP / JSON (REST /api/*)
                  ▼
┌────────────────────────────────────┐
│  FastAPI Backend (:8000)           │
│  Routers → Pydantic Schemas        │
│          → SQLAlchemy CRUD & ORM   │
└─────────────────┬──────────────────┘
                  │ Parameterized SQL (PyMySQL)
                  ▼
┌────────────────────────────────────┐
│  MySQL 8.0 Database (:3306)        │
│  Database: school_erp              │
│  Table: students                   │
└────────────────────────────────────┘
```

- The React frontend never connects directly to MySQL; all reads and mutations flow through REST APIs defined in `frontend/src/services/studentService.js`.
- All backend credentials and CORS origins are configured via environment variables (`backend/.env` and `frontend/.env`).

---

## Folder Structure

```text
Student erp/
├── .gitignore
├── README.md
├── docs/
│   └── API_REFERENCE.md            # Detailed endpoint reference & payloads
├── database/
│   └── schema.sql                  # MySQL 8.0 database & table DDL
├── backend/
│   ├── .env.example                # Backend environment variable template
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, error handlers, /api/health
│   │   ├── config.py               # Environment settings loader (python-dotenv)
│   │   ├── database.py             # SQLAlchemy engine, SessionLocal, init_db
│   │   ├── models/
│   │   │   └── student.py          # Student ORM model
│   │   ├── schemas/
│   │   │   └── student.py          # Pydantic request/response schemas & validators
│   │   ├── crud/
│   │   │   └── student.py          # SQLAlchemy CRUD, search, filter & stats queries
│   │   └── routers/
│   │       └── students.py         # /api/students REST endpoints
│   └── tests/
│       └── test_students_api.py    # Isolated automated API & ORM tests
└── frontend/
    ├── .env.example                # Frontend environment variable template
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                 # React Router configuration
        ├── context/
        │   └── ToastContext.jsx
        ├── services/
        │   ├── api.js              # Axios instance & error normalization
        │   └── studentService.js   # Student REST client
        ├── utils/
        │   └── studentHelpers.js   # Date formatting & client validation
        ├── styles/
        │   ├── variables.css
        │   └── global.css
        ├── components/
        │   ├── common/             # StatCard, SearchBar, FilterDropdown, ConfirmationModal, LoadingSpinner, EmptyState, ToastNotification
        │   ├── layout/             # MainLayout, Sidebar, Header
        │   └── students/           # StudentTable, StudentForm
        └── pages/                  # DashboardPage, StudentListPage, AddStudentPage, EditStudentPage, StudentDetailPage, NotFoundPage
```

---

## Prerequisites

- **Python** 3.10+ (verified on Python 3.14)
- **Node.js** 18+ and **npm** (verified on Node v24.19 / npm 11.17)
- **MySQL Server** 8.0+
- **Git**

---

## Database Setup

1. Start your local **MySQL 8.0** service (`MySQL80` on Windows via `services.msc`).
2. *(Optional)* Run the SQL schema file directly:
   ```powershell
   mysql -u root -p < database/schema.sql
   ```
   *(The FastAPI backend also runs `init_db()` on startup to create the `school_erp` database and `students` table automatically if they do not yet exist, without deleting existing records.)*

---

## Backend Installation & Configuration

```powershell
cd "backend"
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` with your local MySQL credentials:

```env
APP_NAME=School ERP - Student Management API
APP_VERSION=1.0.0
ENVIRONMENT=development
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/school_erp?charset=utf8mb4
DB_ECHO=false
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> **Note:** URL-encode special characters inside passwords (for example, `@` → `%40`). To switch to PostgreSQL, update `DATABASE_URL` and install a PostgreSQL driver such as `psycopg2-binary`.

---

## Frontend Installation & Configuration

```powershell
cd "frontend"
npm install
copy .env.example .env
```

Verify `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Running the Application

Open two terminals from the project root:

**Terminal 1 — Backend (FastAPI):**
```powershell
cd "backend"
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend (React + Vite):**
```powershell
cd "frontend"
npm run dev
```

- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
- **Health Check:** `http://localhost:8000/api/health`
- **Swagger UI:** `http://localhost:8000/docs`

---

## API Endpoint Documentation

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for full request parameters, sample payloads, responses, and error schemas.

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API and database health check |
| `GET` | `/api/students` | List, search, filter, and paginate students |
| `GET` | `/api/students/stats` | Dashboard metrics & distinct filter values |
| `GET` | `/api/students/{student_id}` | Get student details by ID |
| `POST` | `/api/students` | Register a new student |
| `PUT` | `/api/students/{student_id}` | Update an existing student |
| `DELETE` | `/api/students/{student_id}` | Delete a student record |

---

## Testing & Verification

### Automated Backend Tests (Isolated Test Database)

Runs against a temporary isolated SQLite test database so development MySQL records are never modified:

```powershell
cd "backend"
.\.venv\Scripts\pytest.exe -v
```

### Frontend Production Build Check

```powershell
cd "frontend"
npm run build
```

---

## Screenshots

Capture screenshots of the running application and place them in `docs/screenshots/` for submission:

- `dashboard.png` — Dashboard overview with live enrollment cards, class breakdown, and recent admissions
- `student-listing.png` — Student Directory table with search bar, class/section filters, and pagination
- `add-student.png` — Student registration form with validation indicators
- `student-details.png` — Individual student profile layout
- `edit-student.png` — Pre-populated Edit Student form
- `swagger-docs.png` — FastAPI Swagger UI (`/docs`)

---

## Screenshots

Capture screenshots of the running application and place them in `docs/screenshots/` for submission:

- `dashboard.png` — Dashboard overview with live enrollment cards, class breakdown, and recent admissions
- `student-listing.png` — Student Directory table with search bar, class/section filters, and pagination
- `add-student.png` — Student registration form with validation indicators
- `student-details.png` — Individual student profile layout
- `edit-student.png` — Pre-populated Edit Student form
- `swagger-docs.png` — FastAPI Swagger UI (`/docs`)

