# GREMS Database Architecture & SQL Execution Guide
**Project:** Government Recruitment Examination Management System (GREMS)  
**DBMS Engine:** PostgreSQL 15+ / Supabase Compatible  
**Folder Path:** `database/`  

---

## 1. Directory Structure & File Manifest

| File | Purpose | Description |
| :--- | :--- | :--- |
| **`create_tables.sql`** | DDL (Schema) | Full Data Definition Language script creating all 9 tables, primary keys, foreign keys, unique constraints, check constraints, indexes, and generated columns. |
| **`functions.sql`** | PL/pgSQL Code | Triggers and stored functions for timestamp updating, date ordering, publication validation, and concurrency-safe venue quota enforcement. |
| **`insert_data.sql`** | DML (Sample Data) | Complete, realistic, and idempotent dataset with 5+ candidates, qualifications, 4 national exams, 5 testing centers, venue allocations, applications, admit cards, and published results. |
| **`crud_operations.sql`**| DML (CRUD) | Clean, documented examples of Create (INSERT), Read (SELECT), Update (UPDATE), and Delete (DELETE) operations for viva demonstration. |
| **`queries.sql`** | Relational SQL | 18 multi-table queries demonstrating INNER JOIN, LEFT JOIN, N:M resolution, GROUP BY, HAVING, subqueries, and statistical aggregations. |
| **`relationships.md`** | Architecture Spec | In-depth Entity-Relationship (ER) documentation, Mermaid ER diagram, 1:1, 1:N, N:M junction resolution, and 3NF/BCNF normalization proof. |
| **`README.md`** | Quickstart Guide | This execution roadmap and step-by-step verification instructions. |

---

## 2. Step-by-Step Execution Order

Follow this strict chronological order when setting up the database in **Supabase SQL Editor** or standard **PostgreSQL (psql)**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Execute `database/create_tables.sql`                     │
│ -> Creates all 9 tables, indexes, generated columns, and RLS   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ Step 2: Execute `database/functions.sql`                         │
│ -> Creates timestamp triggers, date checks & capacity locks     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ Step 3: Provision Demonstration Accounts                        │
│ -> In Supabase: Run `npm run seed:users` from `backend/`        │
│    (Or let `insert_data.sql` provision demo users if local)     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ Step 4: Execute `database/insert_data.sql`                       │
│ -> Populates realistic Indian recruitment dataset idempotently  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ Step 5: Execute Queries from `database/queries.sql`              │
│ -> Run relational joins, analytical aggregates, and lab reports │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. How to Execute in Supabase SQL Editor

1. Open your Supabase Dashboard: `https://supabase.com/dashboard/project/quvrsljpowzorglclwuc`
2. In the left navigation menu, click **SQL Editor**.
3. Click **+ New Query**.
4. Open [create_tables.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/create_tables.sql), copy its entire contents, paste into the editor, and click **Run** (green button).
5. Open a new query tab, copy and execute [functions.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/functions.sql).
6. To populate users:
   * From your terminal, run:
     ```powershell
     cd backend
     npm.cmd run seed:users
     ```
7. Open another query tab, copy and execute [insert_data.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/insert_data.sql).
8. Verify everything using the queries in the next section.

---

## 4. Verification Queries

### A. Verify All Nine Tables Exist
```sql
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
*Expected Rows:* `admit_cards`, `applications`, `candidates`, `educational_qualifications`, `examination_centers`, `examinations`, `exam_centers`, `profiles`, `results`.

### B. Verify Table Row Counts
```sql
SELECT 'profiles' AS entity, COUNT(*) AS count FROM public.profiles
UNION ALL
SELECT 'candidates', COUNT(*) FROM public.candidates
UNION ALL
SELECT 'educational_qualifications', COUNT(*) FROM public.educational_qualifications
UNION ALL
SELECT 'examinations', COUNT(*) FROM public.examinations
UNION ALL
SELECT 'exam_centers', COUNT(*) FROM public.exam_centers
UNION ALL
SELECT 'examination_centers', COUNT(*) FROM public.examination_centers
UNION ALL
SELECT 'applications', COUNT(*) FROM public.applications
UNION ALL
SELECT 'admit_cards', COUNT(*) FROM public.admit_cards
UNION ALL
SELECT 'results', COUNT(*) FROM public.results;
```

### C. Verify Generated Column (`percentage` on `results`)
```sql
SELECT 
    result_id, 
    marks_obtained, 
    maximum_marks, 
    percentage 
FROM public.results;
```
*Verification:* Confirm that `percentage = (marks_obtained / maximum_marks) * 100` matches automatically without manual computation.

### D. Verify Concurrency-Safe Venue Capacity Trigger
```sql
-- Attempting to over-allocate beyond center physical capacity throws an exception:
INSERT INTO public.examination_centers (examination_id, center_id, allocated_capacity)
VALUES (
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    10000 -- Exceeds 600 total capacity
);
-- Result: [ERROR] Allocation exceeds center physical capacity!
```

---

## 5. Testing CRUD Operations

Open [crud_operations.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/crud_operations.sql) and execute individual queries:
* **Section A (INSERT):** Run to test candidate profile creation, exam notifications, and admit card generations.
* **Section B (SELECT):** Run to test filtered candidate lists and published results.
* **Section C (UPDATE):** Run to test status changes (`draft` -> `published`, `submitted` -> `accepted`).
* **Section D (DELETE):** Run to test referential constraints (e.g. attempting to delete a candidate who has applications is rejected by foreign key RESTRICT).

---

## 6. Testing Relational Queries

Open [queries.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries.sql) and execute queries 1 through 18:
* **Query 1 - 5:** Basic and multi-table inner joins.
* **Query 6:** Identifies candidates who registered but haven't applied using `LEFT JOIN ... WHERE application_id IS NULL`.
* **Query 9 - 10:** Aggregate statistics (`COUNT`, `GROUP BY`).
* **Query 11:** Subquery finding the most competitive examination notice.
* **Query 14:** Exam score distribution metrics (`AVG`, `MAX`, `MIN`).
* **Query 15:** Top 5 candidate merit list ranking (`LIMIT 5`, `ORDER BY percentage DESC`).
* **Query 18:** Correlated subquery finding candidates performing above their examination's average score.

---

## 7. Viva Voce Quick Reference Guide

* **Q1: Why is `percentage` a generated column instead of a normal column?**  
  *Answer:* Storing computed values as standard columns risks data anomalies if `marks_obtained` is updated without recalculating the percentage. PostgreSQL `GENERATED ALWAYS AS (...) STORED` guarantees 100% mathematical consistency at the database engine level.
* **Q2: How does the schema prevent a candidate from applying twice for the same exam?**  
  *Answer:* Table `applications` enforces a composite unique constraint: `CONSTRAINT unique_candidate_exam UNIQUE (candidate_id, examination_id)`.
* **Q3: How is the Many-to-Many relationship between examinations and centers handled?**  
  *Answer:* Resolved via the junction table `examination_centers` with composite primary key `(examination_id, center_id)` and an attribute `allocated_capacity` indicating seat quota.
* **Q4: Why does `applications` use RESTRICT on candidate deletion instead of CASCADE?**  
  *Answer:* Public recruitment exams require legal audit trails. If a candidate attempts to delete their account while active applications exist, `RESTRICT` prevents deletion to preserve application history.
