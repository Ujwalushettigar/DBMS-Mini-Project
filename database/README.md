# Government Recruitment Examination Management System (GREMS)
### Database Architecture, Supabase Security & Practical Laboratory Manual

**Course:** CS522L5C – Database Management System Laboratory  
**Database Engine:** PostgreSQL 15+ via Supabase Cloud  
**Application Tech Stack:** React.js (Vite) + Tailwind CSS + Node.js (Express.js) + Supabase Auth

---

## 1. Project Database Overview

The **Government Recruitment Examination Management System (GREMS)** database is an enterprise-grade relational database structured in **Third Normal Form (3NF)**. It handles the complete recruitment lifecycle for public service examinations:

- **Security & Authentication**: Connected directly with Supabase Auth (`auth.users`) to enforce strict Role-Based Access Control (RBAC).
- **Aspirant Management**: Personal dossiers, demographic records, reservation categories, and multi-tier educational qualifications.
- **Examination Lifecycle**: Notification publication, application periods, vacancies, physical test centers, and capacity quota allocation.
- **Examination Conduction**: One-click application submissions, document scrutiny, official hall ticket / admit card generation, and marksheet merit list publication.

> [!NOTE]
> All sample records provided in this repository are **fictional demonstration records** created solely for academic DBMS laboratory evaluation and software demonstration. They do not represent real individuals or government recruitment processes.

---

## 2. Database Folder Structure

The `database/` folder is organized into three core SQL files:

```text
database/
│
├── schema/
│   └── create_tables.sql       # Pure DDL: 9 tables, indexes, functions, triggers, and RLS policies
│
├── sample_data/
│   └── insert_data.sql         # Complete demonstration dataset with prerequisite validation
│
├── queries/
│   └── queries.sql             # 6 DBMS Lab experiments with 29 queries, problem statements and real outputs
│
└── README.md                   # Complete database architectural documentation and setup guide
```

---

## 3. The Nine Core Relational Tables

| # | Table Name | Primary Key | Key Relationships | Purpose |
|:--|:---|:---|:---|:---|
| 1 | `public.profiles` | `id` (UUID) | References `auth.users(id)` ON DELETE CASCADE | Bridges Supabase Auth with application roles (`admin`, `candidate`). |
| 2 | `public.candidates` | `candidate_id` (UUID) | 1:1 with `public.profiles(id)` ON DELETE CASCADE | Personal demographic details, reservation categories, contact numbers, and addresses. |
| 3 | `public.educational_qualifications` | `qualification_id` (UUID) | N:1 with `public.candidates(candidate_id)` ON DELETE CASCADE | Historical academic qualifications (`SSLC`, `PUC`, `B.E.`). |
| 4 | `public.examinations` | `examination_id` (UUID) | 1:N with `applications`, 1:N with `examination_centers` | Recruitment notices, conducting authorities, dates, fees, vacancies, and statuses. |
| 5 | `public.exam_centers` | `center_id` (UUID) | 1:N with `examination_centers` | Physical examination venues, geographic locations, and maximum seating capacities. |
| 6 | `public.examination_centers` | Composite `(examination_id, center_id)` | Junction linking `examinations` and `exam_centers` | Many-to-many junction table assigning designated test centers and allocated quotas per examination. |
| 7 | `public.applications` | `application_id` (UUID) | N:1 with `candidates`, N:1 with `examinations`, composite FK to `examination_centers` | Candidate application submissions, scrutiny status (`submitted`, `approved`), and payment tracking. |
| 8 | `public.admit_cards` | `admit_card_id` (UUID) | 1:1 with `public.applications(application_id)` ON DELETE CASCADE | Official hall tickets issued to approved applicants with unique roll numbers and reporting schedules. |
| 9 | `public.results` | `result_id` (UUID) | 1:1 with `public.applications(application_id)` ON DELETE CASCADE | Official candidate evaluation scorecards, marks obtained, ranks, and pass/fail statuses. |

---

## 4. Entity Cardinality & Relationships

- **`profiles` ──(1:1)──► `candidates`**: Each authenticated user profile corresponds to at most one candidate demographic dossier.
- **`candidates` ──(1:N)──► `educational_qualifications`**: One candidate can register multiple educational qualifications (SSLC, PUC, B.E., etc.).
- **`candidates` ──(1:N)──► `applications`**: One candidate can apply for multiple distinct examinations.
- **`examinations` ──(1:N)──► `applications`**: One examination receives many candidate applications.
- **`examinations` ◄──(M:N)──► `exam_centers` (via `examination_centers`)**: An examination can be conducted across multiple physical venues; each venue can host multiple examinations.
- **`applications` ──(1:1)──► `admit_cards`**: An approved application generates at most one official hall ticket.
- **`applications` ──(1:1)──► `results`**: An evaluated application generates at most one official scorecard.

---

## 5. Automatic Profile Creation Trigger & Security

When a user signs up using Supabase Auth, Supabase creates a record in `auth.users`.

An automated PostgreSQL trigger function [`handle_new_user()`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/schema/create_tables.sql#L154-L180) runs immediately:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'candidate', -- Strict: users cannot assign themselves admin role at signup
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;
```

### Security Guarantees:
- **`SECURITY DEFINER` with fixed `search_path = public, auth`**: Eliminates search-path hijacking vulnerabilities.
- **Default Role Enforcement**: New profiles always receive `role = 'candidate'`. User metadata provided during registration is never trusted for role assignment.
- **No Automatic Candidate Record**: Candidates must complete their personal details through the application profile wizard.

---

## 6. Row Level Security (RLS) & Access Control

Row Level Security is enabled across **all 9 public tables**. Access rules are enforced directly by the PostgreSQL engine using `auth.uid()` and the helper function [`public.is_admin()`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/schema/create_tables.sql#L231-L245):

- **Helper Function**:
  ```sql
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, auth
  AS $$
      SELECT EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
      );
  $$;
  ```
- **Candidates**:
  - Can read and update their own `profiles` record (role changes are blocked by `CHECK` expressions).
  - Can read, create, and update their own `candidates` record.
  - Can read, create, update, and delete their own `educational_qualifications`.
  - Can view all published `examinations` and available `exam_centers`.
  - Can submit, view, and withdraw their own `applications`.
  - Can view only `admit_cards` and `results` linked to their own applications.
  - Cannot read, modify, or delete records belonging to other candidates.
- **Administrators**:
  - Full management rights across all tables (examinations, centers, application scrutinies, hall ticket generation, and result evaluations).

---

## 7. Supabase Setup & Execution Order

Follow this exact sequential 4-step order when deploying the project on Supabase:

### Step 1: Execute `create_tables.sql` in Supabase SQL Editor
1. Open the **SQL Editor** in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Copy the entire contents of [`database/schema/create_tables.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/schema/create_tables.sql).
3. Click **Run**. This initializes all 9 relational tables, declarative partition tables, indexes, triggers (including automatic profiles, timestamps, and capacity validation), and Row Level Security policies.

### Step 2: Seed the Demonstration Accounts
Run the automated user seeder from your project backend:

```bash
cd backend
npm run seed:users
```

This uses the Supabase Admin API (`service_role` key from `backend/.env`) to:
- Create `admin@gov.in` (Password: `Admin@123`, confirmed, promoted to `admin` in `public.profiles`).
- Create `rahul.sharma@example.com` (Password: `Candidate@123`, confirmed).
- Create `priya.patel@example.com` (Password: `Candidate@123`, confirmed).
- Create `amit.kumar@example.com` (Password: `Candidate@123`, confirmed).

*(Alternatively, you can register these accounts manually via your app's `/register` page and run `UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@gov.in';` in the Supabase SQL Editor).*

### Step 3: Execute `insert_data.sql` in Supabase SQL Editor
1. Open [`database/sample_data/insert_data.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/sample_data/insert_data.sql).
2. Copy the entire file and paste it into the Supabase SQL Editor.
3. Click **Run**.
   - The script first executes a validation block verifying that all 4 demo accounts exist in `public.profiles`.
   - Once validated, it populates all nine tables idempotently with 2027 recruitment notices, centers, allocations, applications, admit cards, and published results.

### Step 4: Execute Laboratory Queries from `queries.sql`
Open [`database/queries/queries.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries/queries.sql) and run the script in your SQL client or Supabase SQL Editor to test, demonstrate, and verify DBMS laboratory exercises.

---

## 8. Summary of Demonstration Dataset in `insert_data.sql`

| Entity | Records | Key Details & Identifiers |
|:---|:---:|:---|
| **`candidates`** | 3 | Rahul Sharma (`CND-2027-00101`), Priya Patel (`CND-2027-00102`), Amit Kumar (`CND-2027-00103`). |
| **`educational_qualifications`** | 8 | SSLC, PUC, and Undergraduate records across CBSE, ICSE, Karnataka State Board, and DTU/VTU universities. |
| **`examinations`** | 3 | Scheduled for 2027: `SSC-CGL-2027` (8,400 vac, ₹100), `UPSC-CSE-2027` (1,056 vac, ₹100), `RRB-NTPC-2027` (11,558 vac, ₹250). |
| **`exam_centers`** | 4 | New Delhi (`DEL-KV-101`, cap: 600), Bengaluru (`BLR-GAC-201`, cap: 500), Lucknow (`LKO-NP-301`, cap: 450), Mumbai (`MUM-GEC-401`, cap: 550). |
| **`examination_centers`** | 7 | Designated center allocations per examination with seat quotas strictly within venue physical capacities. |
| **`applications`** | 4 | `APP-2027-0001` (Accepted), `APP-2027-0002` (Accepted), `APP-2027-0003` (Accepted), `APP-2027-0004` (Submitted/Pending Review). |
| **`admit_cards`** | 3 | Hall tickets with unique roll numbers: `ROLL-SSCCGL-27001`, `ROLL-SSCCGL-27002`, `ROLL-RRBNTPC-27001`. |
| **`results`** | 3 | Published merit scorecards: 86.50% (Rank 1, Rahul), 78.00% (Rank 2, Priya), 92.50% (Rank 1, Amit). |

---

## 9. DBMS Laboratory Practical Queries Manual (`queries.sql`)

[`database/queries/queries.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries/queries.sql) is organized strictly according to the college DBMS Laboratory Manual (**CS522L5C**). It follows the academic pedagogy: **Problem Statement ➔ Schema/Data Solutions ➔ Numbered Queries ➔ Real Output**.

The manual contains **5 lab experiments with 23 queries (plus Experiment 6 with 6 additional queries)**, totaling **29 queries**:

1. **Experiment 1**: Candidates, examinations, centers and applications (traditional joins, max/min, union, delete with cascade) — 5 queries
2. **Experiment 2**: Examination details, delete with cascade, partition and view — 5 queries
3. **Experiment 3**: Candidate details, view, update and categorisation of results (CASE) — 5 queries
4. **Experiment 4**: Nested queries, NOT EXISTS, NOT IN, GROUP BY ... HAVING — 5 queries
5. **Experiment 5**: Triggers and functions (capacity validation, auto-result evaluation, seats_left function) — 3 programs
6. **Experiment 6**: Additional queries (pattern matching with `LIKE`, scalar `AVG` subquery, set difference with `EXCEPT`, anti-join with `NOT EXISTS`, relational division, and DDL constraints) — 6 queries

### How to Run the Lab Queries

- **psql CLI (Recommended)**:
  ```bash
  psql -X -f database/queries/queries.sql
  ```
  Runs the entire file from start to finish. You will see exactly one intentional error line during Experiment 5 (`ERROR: Allocation of 700 seats exceeds the capacity 600 of center X4`), which proves the capacity trigger works.
- **pgAdmin / DBeaver**:
  Open `database/queries/queries.sql` in the Query Tool and execute the complete script.
- **Supabase SQL Editor**:
  Supabase displays only the result of the *last* statement in a multi-query batch. To inspect each query in Supabase, execute queries individually or in sections, making sure to prepend:
  ```sql
  SET search_path TO grems_lab;
  ```
- **Schema Isolation Guarantee**:
  All tables, views, functions, triggers, and partitioned tables in `queries.sql` are created in an isolated schema called **`grems_lab`**. The operational application tables in `public` schema are never touched. The script is fully idempotent: it drops and recreates `grems_lab` at the top of each run.
