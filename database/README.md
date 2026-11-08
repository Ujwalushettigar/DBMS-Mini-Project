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
│   └── queries.sql             # 15 clearly numbered practical DBMS lab experiments
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

Follow this exact sequential order when deploying the project on Supabase:

### Step 1: Ensure Supabase Auth is Configured
Ensure Email Provider is enabled in your Supabase Dashboard under **Authentication** -> **Providers**.

### Step 2: Execute `create_tables.sql` in Supabase SQL Editor
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy the entire contents of [`database/schema/create_tables.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/schema/create_tables.sql).
3. Click **Run**. This initializes all 9 tables, indexes, triggers, and Row Level Security policies.

### Step 3: Register the Four Demonstration Accounts via Supabase Auth
Before running the sample data script, the following 4 demo accounts must be registered through your application's signup page (`/register`) or directly via Supabase Auth:

| Account Type | Email | Default Initial Role |
|:---|:---|:---|
| **Administrator** | `admin.demo@example.com` | `candidate` (promoted in Step 4) |
| **Candidate 1** | `rahul.demo@example.com` | `candidate` |
| **Candidate 2** | `priya.demo@example.com` | `candidate` |
| **Candidate 3** | `arjun.demo@example.com` | `candidate` |

The `on_auth_user_created` trigger will automatically populate their entries in `public.profiles`.

### Step 4: Promote the Administrator Account
In the Supabase SQL Editor, manually promote the admin account using:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin.demo@example.com';
```

### Step 5: Execute `insert_data.sql`
1. Open [`database/sample_data/insert_data.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/sample_data/insert_data.sql).
2. Copy the entire file and paste it into the Supabase SQL Editor.
3. Click **Run**.
   - The script first executes a **Validation Block** verifying that all four demo accounts exist in `public.profiles`. If any are missing, it halts with a clear error listing the missing accounts.
   - Once validated, it populates all nine tables within a safe transaction.

### Step 6: Execute and Test Laboratory Queries from `queries.sql`
Open [`database/queries/queries.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries/queries.sql) and execute individual queries in the Supabase SQL Editor to test and demonstrate DBMS laboratory concepts.

---

## 8. Summary of Demonstration Dataset in `insert_data.sql`

| Entity | Records | Key Details & Identifiers |
|:---|:---:|:---|
| **`candidates`** | 3 | Rahul Sharma (`CAND2027001`), Priya Nair (`CAND2027002`), Arjun Patel (`CAND2027003`). |
| **`educational_qualifications`** | 8 | SSLC, PUC, and B.E. records with realistic boards, institutions, and percentages. |
| **`examinations`** | 3 | `KSGRE2027` (KPSC - 250 vac, ₹500), `CGCRE2027` (SSC - 500 vac, ₹300), `NASPE2027` (UPSC - 100 vac, ₹100). |
| **`exam_centers`** | 3 | Bengaluru (`BLR-GFGC-01`), Mangaluru (`MNG-UCOL-02`), Mumbai (`MUM-GEC-03`). |
| **`examination_centers`** | 7 | Center-to-exam allocations with valid quotas within total venue capacities. |
| **`applications`** | 4 | `APP2027001` (Approved), `APP2027002` (Approved), `APP2027003` (Approved), `APP2027004` (Submitted/Pending). |
| **`admit_cards`** | 3 | Hall tickets with unique roll numbers: `ROLL2027101`, `ROLL2027102`, `ROLL2027201`. |
| **`results`** | 3 | Realistic scores: 92.50 (Rank 1, Arjun), 86.50 (Rank 1, Rahul), 78.00 (Rank 2, Priya). |

---

## 9. Practical Queries Manual Organization (`queries.sql`)

[`database/queries/queries.sql`](file:///C:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries/queries.sql) contains **15 clearly numbered sections**:

1. **Basic SELECT Queries and Filtering**: Projections, predicates, pattern searches with `ILIKE`.
2. **UPDATE and DELETE Operations**: Predicate-scoped DML updates inside safe `BEGIN ... ROLLBACK` blocks.
3. **Traditional Joins Using WHERE Conditions**: Comma-separated Cartesian products with join filters.
4. **INNER JOIN, LEFT JOIN, and Multi-Table Joins**: ANSI SQL join operations linking up to 4 entities.
5. **Nested Queries and Subqueries**: Scalar, multi-row, and correlated subqueries.
6. **Aggregate Functions**: Columnar aggregations with `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`.
7. **GROUP BY and HAVING**: Grouping calculations and post-aggregation condition filtering.
8. **Date Operations and BETWEEN**: PostgreSQL `DATE` literals, intervals, and quarterly filtering.
9. **UNION, UNION ALL, and EXCEPT**: Relational set operations (with `EXCEPT` replacing Oracle `MINUS`).
10. **EXISTS and NOT EXISTS**: Semi-joins, anti-joins, and universal quantification (relational division).
11. **Highest and Second-Highest Marks**: Nested subquery formulations without relying on `LIMIT`.
12. **Views and View-Based Queries**: 4 reusable database views (`view_candidate_application_summary`, `view_examination_scrutiny_metrics`, `view_published_merit_list`, `view_exam_center_utilization`).
13. **Ranking using RANK() and Window Functions**: `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()` partitioned by examination.
14. **ALTER TABLE and Constraint Demonstrations**: Demonstrating `ADD COLUMN`, `ADD CONSTRAINT`, and `information_schema` catalog queries.
15. **PostgreSQL Range Partitioning Demonstration**: Practical queries demonstrating partition pruning on the demonstration table `examination_archives_partitioned`.
