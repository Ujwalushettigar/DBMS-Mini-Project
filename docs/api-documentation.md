# REST API Specification Document
## Government Recruitment Examination Management System (GREMS)

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT token obtained from Supabase Auth passed in header: `Authorization: Bearer <TOKEN>`

---

## 1. Authentication APIs (`/api/auth`)

### `POST /api/auth/register`
Registers a new candidate user account in Supabase Auth, assigns the `'candidate'` role, and creates the candidate demographic profile.
- **Access**: Public (Candidates only. Public requests cannot register as Admin).
- **Request Body**:
  ```json
  {
    "email": "aspirant@example.com",
    "password": "Password@123",
    "full_name": "Rohan Kumar",
    "date_of_birth": "1998-05-15",
    "gender": "Male",
    "phone_number": "9876543210",
    "address": "Flat 302, Green Park",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001",
    "category": "General"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Candidate account registered successfully.",
    "data": {
      "user": { "id": "uuid", "email": "aspirant@example.com", "role": "candidate" },
      "candidate": { "candidate_id": "uuid", "candidate_number": "CND-2026-1001", "full_name": "Rohan Kumar" },
      "token": "jwt_access_token"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates an existing candidate or admin via Supabase Auth credentials.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aspirant@example.com",
    "password": "Password@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": { "id": "uuid", "email": "aspirant@example.com", "role": "candidate" },
      "candidate": { "candidate_id": "uuid", "full_name": "Rohan Kumar" },
      "token": "jwt_access_token"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves currently authenticated session profile.
- **Access**: Authenticated (`candidate` or `admin`)
- **Response `200 OK`**: User profile and linked candidate record.

### `POST /api/auth/logout`
Terminates user session.
- **Access**: Authenticated

---

## 2. Candidate APIs (`/api/candidates`)

### `GET /api/candidates`
Lists all candidate records.
- **Access**: Admin only
- **Query Params**: `search`, `category`, `city`, `page`, `limit`

### `GET /api/candidates/:id`
Retrieves single candidate dossier with qualifications.
- **Access**: Admin OR Candidate (owner of record)

### `PUT /api/candidates/:id`
Updates candidate demographic and contact information.
- **Access**: Admin OR Candidate (owner)

### `DELETE /api/candidates/:id`
Deletes a candidate record (prohibited if active applications exist due to `ON DELETE RESTRICT`).
- **Access**: Admin only

---

## 3. Educational Qualification APIs (`/api/qualifications`)

### `GET /api/qualifications`
Retrieves qualifications list (candidates get their own; admin can pass `candidate_id`).
- **Access**: Authenticated

### `POST /api/qualifications`
Adds an academic qualification (SSLC, PUC, Diploma, Undergraduate, Postgraduate, Other).
- **Access**: Candidate (for own profile) or Admin
- **Request Body**:
  ```json
  {
    "candidate_id": "uuid",
    "qualification_level": "Undergraduate",
    "institution_name": "BMS College of Engineering",
    "board_or_university": "VTU",
    "passing_year": 2020,
    "percentage": 82.50
  }
  ```

### `PUT /api/qualifications/:id`
Updates qualification information.
- **Access**: Candidate (owner) or Admin

### `DELETE /api/qualifications/:id`
Deletes a qualification record.
- **Access**: Candidate (owner) or Admin

---

## 4. Examination APIs (`/api/examinations`)

### `GET /api/examinations`
Lists examination notifications.
- **Access**: Public / Authenticated (Public users see `published`, `closed`, `completed`; Admin sees all including `draft`).
- **Query Params**: `status`, `search`

### `GET /api/examinations/:id`
Retrieves detailed examination information including designated exam centers.
- **Access**: Public / Authenticated

### `POST /api/examinations`
Publishes a new recruitment examination notice.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "examination_code": "SSC-CGL-2026",
    "examination_name": "Combined Graduate Level Examination 2026",
    "conducting_authority": "Staff Selection Commission",
    "description": "Recruitment for Group B and Group C non-technical posts.",
    "eligibility_criteria": "Bachelor Degree from recognized university.",
    "application_start_date": "2026-03-01",
    "application_end_date": "2026-04-15",
    "examination_date": "2026-06-20",
    "application_fee": 100.00,
    "total_vacancies": 8400,
    "examination_status": "published"
  }
  ```

### `PUT /api/examinations/:id`
Modifies examination dates, vacancies, or status.
- **Access**: Admin only

### `DELETE /api/examinations/:id`
Removes an examination (fails if applications exist).
- **Access**: Admin only

---

## 5. Examination Center APIs (`/api/centers`)

### `GET /api/centers`
Lists accredited physical venues.
- **Access**: Authenticated

### `POST /api/centers`
Adds a new examination center venue.
- **Access**: Admin only

### `POST /api/centers/assign`
Associates an exam center with an examination and sets allocated capacity in the `examination_centers` junction table.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "examination_id": "uuid",
    "center_id": "uuid",
    "allocated_capacity": 450
  }
  ```

---

## 6. Application APIs (`/api/applications`)

### `GET /api/applications`
Lists applications (Candidate views only their own; Admin views all).
- **Access**: Authenticated
- **Query Params**: `examination_id`, `status`

### `POST /api/applications`
Submits an examination application.
- **Access**: Candidate only
- **Request Body**:
  ```json
  {
    "examination_id": "uuid",
    "center_id": "uuid"
  }
  ```
- **DBMS Constraint Handled**: Rejects with `409 Conflict` if candidate has already applied for this examination.
- **Date Validation**: Ensures current date is within `application_start_date` and `application_end_date`.

### `PUT /api/applications/:id/status`
Reviews application (Approve, Reject, Under Review, Assign Center, Add Remarks).
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "application_status": "accepted",
    "center_id": "uuid",
    "remarks": "Eligibility documents verified."
  }
  ```

---

## 7. Admit Card APIs (`/api/admit-cards`)

### `GET /api/admit-cards`
Lists admit cards (Candidates see their own; Admin sees all).
- **Access**: Authenticated

### `GET /api/admit-cards/:id`
Fetches complete printable hall ticket with candidate name, exam date, roll number, venue address, and reporting time.
- **Access**: Candidate (owner) or Admin

### `POST /api/admit-cards/generate`
Generates admit card for an accepted application.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "application_id": "uuid",
    "reporting_time": "08:30:00",
    "examination_instructions": "Bring original Photo ID. Carry printed admit card."
  }
  ```

---

## 8. Result APIs (`/api/results`)

### `GET /api/results`
Lists results (Candidates see published results for their exams; Admin sees all).
- **Access**: Authenticated / Public

### `POST /api/results`
Inputs marks, max marks, rank, and pass/fail verdict.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "application_id": "uuid",
    "marks_obtained": 86.50,
    "maximum_marks": 100.00,
    "rank": 4,
    "result_status": "pass",
    "remarks": "Recommended for appointment."
  }
  ```

### `PUT /api/results/:id/publish`
Publishes scorecard to candidates.
- **Access**: Admin only

---

## 9. Dashboard Analytics APIs (`/api/dashboard`)

### `GET /api/dashboard/admin`
Calculates aggregated administrative KPIs:
- `total_candidates`, `total_examinations`, `total_applications`, `pending_applications`, `accepted_applications`, `rejected_applications`, `total_centers`, `results_published`.
- Recent applications and upcoming exams.
- **Access**: Admin only

### `GET /api/dashboard/candidate`
Calculates candidate-specific KPIs:
- `total_applications`, `pending_applications`, `accepted_applications`, `available_examinations`, `admit_cards_count`, `published_results_count`.
- **Access**: Candidate only

