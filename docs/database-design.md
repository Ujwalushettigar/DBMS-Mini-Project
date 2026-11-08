# Database Design and Normalization Document
## Government Recruitment Examination Management System (GREMS)

This document provides a comprehensive academic overview of the relational database design, data dictionary, integrity constraints, and normalization principles (up to Third Normal Form - 3NF) for the Government Recruitment Examination Management System.

---

## 1. Relational Data Dictionary

The database consists of **exactly 9 normalized relational tables** operating in PostgreSQL on Supabase:

### Table 1: `profiles`
- **Purpose**: Bridges Supabase Authentication (`auth.users`) with application-level role-based authorization (RBAC).
- **Primary Key**: `id` (UUID, references `auth.users(id)` ON DELETE CASCADE).
- **Columns**:
  - `id` (UUID, PK, NOT NULL)
  - `email` (VARCHAR(255), UNIQUE, NOT NULL)
  - `role` (VARCHAR(20), NOT NULL, CHECK: `'admin'` or `'candidate'`, default: `'candidate'`)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Security Rule**: Role cannot be altered via client registration. New users default to `candidate`. Admin role provisioning is handled through secure database updates by the system administrator.

### Table 2: `candidates`
- **Purpose**: Stores verified personal and demographic profile records of examination candidates.
- **Primary Key**: `candidate_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `candidate_id` (UUID, PK)
  - `user_id` (UUID, UNIQUE, NOT NULL, FK -> `profiles(id)` ON DELETE CASCADE)
  - `candidate_number` (VARCHAR(30), UNIQUE, NOT NULL) - Formatted official registration code (e.g., `CND-2026-1001`)
  - `full_name` (VARCHAR(100), NOT NULL)
  - `date_of_birth` (DATE, NOT NULL)
  - `gender` (VARCHAR(20), NOT NULL, CHECK: `'Male'`, `'Female'`, `'Other'`, `'Prefer not to say'`)
  - `phone_number` (VARCHAR(15), NOT NULL)
  - `address` (TEXT, NOT NULL)
  - `city` (VARCHAR(100), NOT NULL)
  - `state` (VARCHAR(100), NOT NULL)
  - `pincode` (VARCHAR(10), NOT NULL)
  - `category` (VARCHAR(30), NOT NULL, CHECK: `'General'`, `'OBC'`, `'SC'`, `'ST'`, `'EWS'`)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 3: `educational_qualifications`
- **Purpose**: Stores historical academic achievements for candidates (supports 1-to-many relationship).
- **Primary Key**: `qualification_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `qualification_id` (UUID, PK)
  - `candidate_id` (UUID, NOT NULL, FK -> `candidates(candidate_id)` ON DELETE CASCADE)
  - `qualification_level` (VARCHAR(50), NOT NULL, CHECK: `'SSLC'`, `'PUC'`, `'Diploma'`, `'Undergraduate'`, `'Postgraduate'`, `'Other'`)
  - `institution_name` (VARCHAR(150), NOT NULL)
  - `board_or_university` (VARCHAR(150), NOT NULL)
  - `passing_year` (INTEGER, NOT NULL, CHECK between 1960 and 2035)
  - `percentage` (NUMERIC(5,2), NOT NULL, CHECK between 0.00 and 100.00)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 4: `examinations`
- **Purpose**: Stores public notifications and eligibility details for government recruitment exams.
- **Primary Key**: `examination_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `examination_id` (UUID, PK)
  - `examination_code` (VARCHAR(30), UNIQUE, NOT NULL) - e.g., `SSC-CGL-2026`, `UPSC-CSE-2026`
  - `examination_name` (VARCHAR(150), NOT NULL)
  - `conducting_authority` (VARCHAR(150), NOT NULL) - e.g., `Staff Selection Commission`
  - `description` (TEXT)
  - `eligibility_criteria` (TEXT)
  - `application_start_date` (DATE, NOT NULL)
  - `application_end_date` (DATE, NOT NULL)
  - `examination_date` (DATE, NOT NULL)
  - `application_fee` (NUMERIC(10,2), DEFAULT 0.00, CHECK >= 0.00)
  - `total_vacancies` (INTEGER, NOT NULL, CHECK >= 0)
  - `examination_status` (VARCHAR(20), NOT NULL, DEFAULT `'draft'`, CHECK: `'draft'`, `'published'`, `'closed'`, `'completed'`)
  - `created_by` (UUID, FK -> `profiles(id)` ON DELETE SET NULL)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Date Constraints**:
  - `application_end_date >= application_start_date`
  - `examination_date >= application_end_date`

### Table 5: `exam_centers`
- **Purpose**: Master list of accredited physical venues with aggregate seating capacities.
- **Primary Key**: `center_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `center_id` (UUID, PK)
  - `center_code` (VARCHAR(30), UNIQUE, NOT NULL) - e.g., `DEL-CNTR-01`
  - `center_name` (VARCHAR(150), NOT NULL)
  - `address` (TEXT, NOT NULL)
  - `city` (VARCHAR(100), NOT NULL)
  - `state` (VARCHAR(100), NOT NULL)
  - `pincode` (VARCHAR(10), NOT NULL)
  - `contact_number` (VARCHAR(15))
  - `total_capacity` (INTEGER, NOT NULL, CHECK > 0)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 6: `examination_centers` (Junction Table)
- **Purpose**: Implements the **Many-to-Many ($M:N$)** relationship between `examinations` and `exam_centers`.
- **Composite Primary Key**: `(examination_id, center_id)`
- **Columns**:
  - `examination_id` (UUID, NOT NULL, FK -> `examinations(examination_id)` ON DELETE CASCADE)
  - `center_id` (UUID, NOT NULL, FK -> `exam_centers(center_id)` ON DELETE CASCADE)
  - `allocated_capacity` (INTEGER, NOT NULL, CHECK > 0)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Capacity Integrity**: Enforced via PostgreSQL trigger `trg_check_center_allocation` ensuring `allocated_capacity <= exam_centers.total_capacity`.

### Table 7: `applications`
- **Purpose**: Tracks application submissions, payment state, and review lifecycle.
- **Primary Key**: `application_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `application_id` (UUID, PK)
  - `application_number` (VARCHAR(40), UNIQUE, NOT NULL) - e.g., `APP-2026-0001`
  - `candidate_id` (UUID, NOT NULL, FK -> `candidates(candidate_id)` ON DELETE RESTRICT)
  - `examination_id` (UUID, NOT NULL, FK -> `examinations(examination_id)` ON DELETE RESTRICT)
  - `center_id` (UUID, FK -> `exam_centers(center_id)` ON DELETE SET NULL)
  - `applied_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `application_status` (VARCHAR(30), NOT NULL, DEFAULT `'submitted'`, CHECK: `'submitted'`, `'under_review'`, `'accepted'`, `'rejected'`, `'withdrawn'`)
  - `payment_status` (VARCHAR(20), NOT NULL, DEFAULT `'pending'`, CHECK: `'pending'`, `'paid'`, `'waived'`)
  - `remarks` (TEXT)
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Critical DBMS Constraint**: `UNIQUE(candidate_id, examination_id)` strictly prohibits duplicate applications from the same candidate for an exam notice.

### Table 8: `admit_cards`
- **Purpose**: Official examination hall tickets generated exclusively for `accepted` applications.
- **Primary Key**: `admit_card_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `admit_card_id` (UUID, PK)
  - `application_id` (UUID, UNIQUE, NOT NULL, FK -> `applications(application_id)` ON DELETE CASCADE)
  - `admit_card_number` (VARCHAR(40), UNIQUE, NOT NULL) - e.g., `AC-2026-0001`
  - `roll_number` (VARCHAR(40), UNIQUE, NOT NULL) - e.g., `ROLL-SSC-10001`
  - `issue_date` (DATE, NOT NULL)
  - `reporting_time` (TIME, NOT NULL)
  - `examination_instructions` (TEXT)
  - `admit_card_file_url` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 9: `results`
- **Purpose**: Scores, ranks, and final qualification status published by the recruitment board.
- **Primary Key**: `result_id` (UUID, DEFAULT gen_random_uuid()).
- **Columns**:
  - `result_id` (UUID, PK)
  - `application_id` (UUID, UNIQUE, NOT NULL, FK -> `applications(application_id)` ON DELETE CASCADE)
  - `marks_obtained` (NUMERIC(7,2), NOT NULL, CHECK >= 0.00)
  - `maximum_marks` (NUMERIC(7,2), NOT NULL, CHECK > 0.00)
  - `rank` (INTEGER, CHECK > 0)
  - `result_status` (VARCHAR(20), NOT NULL, CHECK: `'pass'`, `'fail'`, `'withheld'`)
  - `published_at` (TIMESTAMP WITH TIME ZONE)
  - `remarks` (TEXT)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **Marks Range Constraint**: `CHECK (marks_obtained <= maximum_marks)`

---

## 2. Relational Cardinalities and Multiplicities

1. **`profiles` $\leftrightarrow$ `candidates` (1 : 1)**
   - One user account possesses at most one candidate demographic dossier (`UNIQUE(user_id)`).
2. **`candidates` $\leftrightarrow$ `educational_qualifications` (1 : N)**
   - A single candidate records multiple qualifications (SSLC, PUC, Degree, PG).
3. **`candidates` $\leftrightarrow$ `applications` (1 : N)**
   - A candidate submits separate applications for different examinations over their eligibility window.
4. **`examinations` $\leftrightarrow$ `applications` (1 : N)**
   - An examination receives thousands of candidate applications.
5. **`examinations` $\leftrightarrow$ `exam_centers` (M : N via `examination_centers`)**
   - An examination is administered across many test centers, and an exam center hosts multiple distinct examinations.
6. **`applications` $\leftrightarrow$ `admit_cards` (1 : 0..1)**
   - An accepted application receives exactly one hall ticket (`UNIQUE(application_id)`).
7. **`applications` $\leftrightarrow$ `results` (1 : 0..1)**
   - An examined application yields exactly one published result record (`UNIQUE(application_id)`).

---

## 3. Database Normalization Analysis (1NF to 3NF)

### First Normal Form (1NF)
- **Requirement**: Atomic values in each column; no repeating groups; explicit primary keys.
- **Compliance**:
  - Candidate details do not store multiple degrees in a comma-delimited string; instead, degrees are broken into independent records in `educational_qualifications`.
  - Venue addresses and examination details are split into distinct atomic attributes (`city`, `state`, `pincode`).
  - Every table possesses an explicit primary key (UUID or composite).

### Second Normal Form (2NF)
- **Requirement**: Must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial functional dependencies on composite keys).
- **Compliance**:
  - In `examination_centers` where composite key `(examination_id, center_id)` is utilized, the only non-key attribute is `allocated_capacity`, which depends on BOTH the examination and the center.
  - Center details (`center_name`, `total_capacity`) are not stored in the junction table, preventing partial dependency anomalies.
  - All other 8 tables use surrogate single-attribute primary keys (`UUID`), automatically satisfying 2NF.

### Third Normal Form (3NF)
- **Requirement**: Must be in 2NF, and no transitive dependencies ($X \rightarrow Y$ where $Y \rightarrow Z$, with $X$ as PK).
- **Compliance**:
  - In `applications`, we store only `candidate_id`, `examination_id`, and `center_id`. Candidate name, category, examination title, fee, and venue address are NOT copied into `applications`. They are resolved via relational SQL joins.
  - In `admit_cards`, only `application_id` is stored. Exam dates and venue details are not duplicated.
  - In `results`, only `application_id` and test marks are stored. Eliminates data redundancy and modification anomalies.

---

## 4. Referential Integrity and Cascade Rules

| Parent Entity | Child Entity | Foreign Key Column | On Delete Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `candidates` | `user_id` | `CASCADE` | Removing a user account cleans up candidate profile. |
| `candidates` | `educational_qualifications` | `candidate_id` | `CASCADE` | Academic entries belong strictly to candidate profile. |
| `candidates` | `applications` | `candidate_id` | `RESTRICT` | Candidates with active exam applications cannot be deleted. |
| `examinations` | `applications` | `examination_id` | `RESTRICT` | Active exams with applicants cannot be accidentally purged. |
| `examinations` | `examination_centers` | `examination_id` | `CASCADE` | Removing an exam drops venue allocations. |
| `exam_centers` | `examination_centers` | `center_id` | `CASCADE` | Deleting a center unlinks exam allocations. |
| `applications` | `admit_cards` | `application_id` | `CASCADE` | Withdrawn or canceled application voids admit card. |
| `applications` | `results` | `application_id` | `CASCADE` | Removing an application cleans up score entry. |

