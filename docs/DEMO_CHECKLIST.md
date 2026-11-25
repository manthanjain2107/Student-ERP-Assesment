# School ERP – Demonstration Checklist

Use this checklist during your live demo or self-review to verify every feature works end-to-end.

## Pre-Demo Setup

- [ ] MySQL 8.0 service is running (`Get-Service MySQL80` → Status: Running)
- [ ] Backend started: `uvicorn app.main:app --reload` (runs on http://localhost:8000)
- [ ] Frontend started: `npm run dev` (runs on http://localhost:5173)
- [ ] Browser open at http://localhost:5173

---

## Step 1 – Health Check

- [ ] Open http://localhost:8000/api/health
- [ ] Response: `{"status": "ok", "database": "connected"}`
- [ ] Open http://localhost:8000/docs — Swagger UI loads and lists all endpoints

---

## Step 2 – Dashboard

- [ ] Navigate to Dashboard (`/dashboard`)
- [ ] "Total Students" card shows correct count from database
- [ ] "Students by Class" section lists classes present in the database (or shows empty state if DB is empty)
- [ ] "Recently Added Students" table lists last 5 students (or empty state)
- [ ] "Quick Add Student" button navigates to the Add Student form

---

## Step 3 – Student Registration

- [ ] Navigate to Students → Add Student (`/students/add`)
- [ ] Submit the form **empty** — all required-field validation errors appear
- [ ] Enter an **invalid email** (e.g. `notanemail`) — email validation error appears
- [ ] Enter an **invalid contact number** (e.g. `abc`) — contact number validation error appears
- [ ] Fill in all fields correctly and submit
- [ ] Success notification appears
- [ ] Page redirects to Student Listing or Student Details
- [ ] New student appears in the list

**Test data (use for demo):**

| Field             | Value                  |
|-------------------|------------------------|
| Full Name         | Riya Sharma            |
| Admission Number  | ADM-2024-001           |
| Date of Birth     | 2010-04-15             |
| Gender            | Female                 |
| Class             | 5                      |
| Section           | A                      |
| Guardian Name     | Priya Sharma           |
| Contact Number    | 9876543210             |
| Email             | riya@example.com       |
| Address           | 12 MG Road, Mumbai     |
| Admission Date    | (today's date)         |

---

## Step 4 – Duplicate Admission Number

- [ ] Attempt to register another student with the **same admission number** (`ADM-2024-001`)
- [ ] Error message: "Admission number already exists" (or similar)
- [ ] No duplicate record created in the database

---

## Step 5 – Student Listing

- [ ] Navigate to Students (`/students`)
- [ ] Table displays all registered students
- [ ] Columns visible: ID, Name, Admission No., Class, Section, Gender, Contact, Actions
- [ ] Pagination controls appear when more than 10 students exist

---

## Step 6 – Search by Name

- [ ] Type part of a student's name in the search box (e.g. `Riya`)
- [ ] Table updates with matching results (debounced — slight delay is expected)
- [ ] Clear the search — full list restores

---

## Step 7 – Search by Admission Number

- [ ] Type `ADM-2024-001` in the search box
- [ ] Matching student appears
- [ ] Type a non-existent number — "No students found" empty state appears

---

## Step 8 – Filter by Class and Section

- [ ] Select Class `5` from the class dropdown — only Class 5 students appear
- [ ] Select Section `A` from the section dropdown — only Class 5 Section A students appear
- [ ] Combine with a name search — results narrow correctly
- [ ] Reset all filters — full list restores

---

## Step 9 – Student Details

- [ ] Click the **View** (eye) icon on any student row
- [ ] Student Details page (`/students/:id`) loads
- [ ] All fields display the correct saved values
- [ ] Edit and Delete buttons are present

---

## Step 10 – Edit Student

- [ ] Click the **Edit** button from the Details page (or the edit icon in the list)
- [ ] Edit form (`/students/:id/edit`) loads with all fields pre-populated
- [ ] Change the address field and save
- [ ] Success notification appears
- [ ] Details page reflects the updated value
- [ ] Database record is updated (verify via `/api/students/:id` or Swagger)

---

## Step 11 – Delete Student

- [ ] Click the **Delete** (trash) icon in the student list
- [ ] Confirmation dialog appears: "Are you sure you want to delete this student?"
- [ ] Press **Cancel** — student is **not** deleted, dialog closes
- [ ] Click Delete again → Confirm
- [ ] Student disappears from the list
- [ ] Record is removed from the database

---

## Step 12 – API / Swagger Verification

- [ ] Open http://localhost:8000/docs
- [ ] `GET /api/students` — execute, returns paginated list
- [ ] `POST /api/students` — create a student via Swagger
- [ ] `GET /api/students/{id}` — retrieve by ID
- [ ] `PUT /api/students/{id}` — update a field
- [ ] `DELETE /api/students/{id}` — delete the student
- [ ] `GET /api/students/stats` — returns total and class breakdown
- [ ] All endpoints return appropriate HTTP status codes (200, 201, 404, 422)

---

## Post-Demo Notes

- Backend tests: `pytest tests/ -v` → **9/9 PASSED**
- Frontend build: `npm run build` → **Build successful**
- No credentials are committed to Git (`.env` files are git-ignored)
