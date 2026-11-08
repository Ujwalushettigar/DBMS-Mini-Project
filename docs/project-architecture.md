# Project Architecture and Technical Specification
## Government Recruitment Examination Management System (GREMS)

---

## 1. Project Introduction and Objectives
The **Government Recruitment Examination Management System (GREMS)** is a full-stack, database-centric enterprise web application built as an academic DBMS mini-project. The system manages the complete lifecycle of competitive public sector recruitment examinations:
1. Publishing job notifications with eligibility constraints.
2. Managing candidate registration and multi-tiered educational qualifications.
3. Processing exam applications with constraint enforcement against duplicates.
4. Allocating accredited exam center venues using many-to-many junction mappings.
5. Batch generating official hall tickets (admit cards) with unique roll numbers.
6. Recording verified examination scores and declaring merit ranks.

---

## 2. Limitations of Existing Systems vs. Proposed Architecture

| Traditional / Legacy Process | Proposed GREMS Relational Architecture |
| :--- | :--- |
| Paper forms and disjointed departmental spreadsheets. | Centralized ACID-compliant PostgreSQL database hosted on Supabase. |
| Vulnerable to duplicate submissions by same candidate. | Database-level `UNIQUE(candidate_id, examination_id)` constraint. |
| Center over-allocation beyond venue seating limits. | Junction table `examination_centers` with automated capacity trigger checks. |
| Inconsistent marks and non-atomic qualification storage. | Strict 3NF normalization with CHECK constraints on percentages and marks. |
| Unsecured administrative operations. | Role-Based Access Control (RBAC) enforced via Supabase JWT and Row Level Security. |

---

## 3. Three-Tier Architectural Overview

```text
+--------------------------------------------------------------------------+
|                       PRESENTATION LAYER (CLIENT)                        |
|   React.js 18 + Vite + Tailwind CSS + React Router DOM + Lucide Icons     |
|   - Public Portal: Announcements, Exam Notices, About, Login, Register   |
|   - Candidate Dashboard: Applications, Qualifications, Admit Card Print  |
|   - Admin Dashboard: Candidates, Exam CRUD, Venue Assign, Marks Entry    |
+------------------------------------+-------------------------------------+
                                     |
                          HTTPS / REST API (JSON)
                                     |
+------------------------------------v-------------------------------------+
|                       APPLICATION SERVER LAYER                           |
|                      Node.js + Express.js API                            |
|   - Auth Middleware: Supabase JWT validation & Role checks (Admin/Cand)  |
|   - Controllers: Candidate, Exam, Application, Admit Card, Result        |
|   - Data Validation: Date sequence, capacity bounds, duplicate guards    |
|   - Services: Supabase Client SDK / Modular Database Layer               |
+------------------------------------+-------------------------------------+
                                     |
                          PostgreSQL Connection / RLS
                                     |
+------------------------------------v-------------------------------------+
|                         DATABASE LAYER                                   |
|                      Supabase PostgreSQL 15+                             |
|   - 9 Relational Tables (UUID PKs, Composite PKs, Foreign Keys)          |
|   - Triggers: updated_at maintenance, capacity validation, auth sync     |
|   - Row Level Security (RLS) Policies on all 9 tables                    |
|   - Performance B-Tree Indexes on foreign keys and search columns        |
+--------------------------------------------------------------------------+
```

---

## 4. End-to-End Workflow Data Flows

### A. Candidate Registration & Profile Creation
1. Candidate fills registration form with email, password, and demographic details.
2. Backend invokes Supabase Auth to create an `auth.users` record.
3. PostgreSQL trigger `on_auth_user_created` creates a record in `profiles` with role `'candidate'`.
4. Backend creates corresponding `candidates` row with generated `candidate_number`.
5. JWT token is returned, redirecting the user to the Candidate Dashboard.

### B. Examination Application Submission
1. Candidate views published examination notice.
2. Candidate selects an exam and preferred exam center.
3. Backend validates:
   - Current date is between `application_start_date` and `application_end_date`.
   - `examination_status` is `'published'`.
   - Selected center is associated with the exam in `examination_centers`.
4. Application is inserted into `applications` table. If duplicate, database raises unique constraint violation `uq_candidate_examination`, returning `409 Conflict`.

### C. Application Review & Admit Card Generation
1. Admin reviews candidate application and marks status as `'accepted'`.
2. Admin assigns an examination center venue.
3. Admin clicks "Generate Admit Card".
4. Backend verifies application is accepted and center is assigned.
5. Unique `admit_card_number` and `roll_number` are generated and inserted into `admit_cards`.
6. Candidate downloads/prints official hall ticket.

### D. Result Publication & Merit List
1. Admin enters `marks_obtained`, `maximum_marks`, and `rank` for candidate application.
2. Constraint `marks_obtained <= maximum_marks` is enforced by PostgreSQL.
3. Admin marks result as published (`published_at = NOW()`).
4. Candidate views official scorecard in their dashboard.

---

## 5. Security and Role-Based Authorization Model

1. **Role Separation**:
   - `admin`: Has global read/write access to examinations, exam centers, candidate dossiers, application review, admit card generation, and results entry.
   - `candidate`: Restricted strictly to viewing public exams, managing their own profile and qualifications, submitting applications, and accessing their own issued admit cards and published results.
2. **Server-Side Token Verification**:
   - Every protected route passes through `authenticateToken` middleware which verifies the Supabase JWT.
   - Admin routes pass through `requireAdmin` middleware checking `req.user.role === 'admin'`.
3. **Database-Level Row Level Security (RLS)**:
   - Supabase RLS policies ensure that even if client-side code is tampered with, PostgreSQL restricts access based on `auth.uid() = user_id`.
4. **Service-Role Key Isolation**:
   - The Supabase Service-Role key is strictly kept in the Node.js backend environment (`backend/.env`) and never exposed to the frontend.

