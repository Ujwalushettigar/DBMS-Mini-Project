# Database Implementation Report: GREMS
**System:** Government Recruitment Examination Management System (GREMS)  
**DBMS Platform:** PostgreSQL 15+ / Supabase Relational Engine  
**Course Reference:** CS522L5C (DBMS Mini-Project & Technical Viva Documentation)  

---

## 1. Executive Summary & Database Overview

The **Government Recruitment Examination Management System (GREMS)** database is a robust, normalized relational database designed to govern the full lifecycle of competitive public recruitment examinations. Modeled after official recruitment portals such as the Union Public Service Commission (UPSC) and Staff Selection Commission (SSC), the system automates:

* **Authentication & Role Governance:** Strict partition between authentication identity credentials and applicant personal dossiers.
* **Academic Pedigree Tracking:** Normalization of multi-tier degrees and percentage criteria.
* **Recruitment Notification Management:** Publication of recruitment notifications, vacancies, application windows, and examination dates.
* **Venue Logistics & Capacity Control:** Resolution of many-to-many relationships between examinations and test venues, with concurrency-safe seat quotas.
* **Application Processing & Scrutiny:** Status transitions (`submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`) with duplicate prevention.
* **Hall Ticket Issuance:** Generating admit cards with unique roll numbers exclusively for approved candidates.
* **Evaluation & Merit List Publication:** Automated score percentage calculations, ranking, and public dissemination.

The architecture strictly adheres to **Third Normal Form (3NF)** and **Boyce-Codd Normal Form (BCNF)**, preventing update, insertion, and deletion anomalies.

---

## 2. Comprehensive Data Dictionary

### Table 1: `profiles`
*Purpose: Authentication entity storing role assignments.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | PK | - | Primary Key referencing `auth.users(id)` in Supabase Auth. |
| `email` | `VARCHAR(255)` | No | UK | - | Candidate/officer email address. |
| `role` | `VARCHAR(20)` | No | - | `'candidate'` | Authorization role: `'admin'` or `'candidate'`. |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Record modification timestamp. |

---

### Table 2: `candidates`
*Purpose: Verified personal, demographic, and contact dossier.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `candidate_id` | `UUID` | No | PK | `gen_random_uuid()` | Unique candidate surrogate primary key. |
| `user_id` | `UUID` | No | FK, UK | - | Foreign Key to `profiles.id` (1:1 relationship). |
| `candidate_number` | `VARCHAR(30)` | No | UK | - | Formatted identifier (e.g. `CND-2027-00101`). |
| `full_name` | `VARCHAR(100)` | No | - | - | Candidate's legal full name. |
| `date_of_birth` | `DATE` | No | - | - | Date of birth for age eligibility verification. |
| `gender` | `VARCHAR(20)` | Yes | - | - | Gender (`Male`, `Female`, `Transgender`, `Other`). |
| `phone_number` | `VARCHAR(15)` | No | - | - | Candidate mobile contact number. |
| `address` | `TEXT` | No | - | - | Residential street address. |
| `city` | `VARCHAR(100)` | No | - | - | City of residence. |
| `state` | `VARCHAR(100)` | No | - | - | State/Union Territory. |
| `pincode` | `VARCHAR(10)` | No | - | - | Postal PIN code. |
| `category` | `VARCHAR(30)` | Yes | - | `'General'` | Reservation category (`General`, `OBC`, `SC`, `ST`, `EWS`). |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Registration timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Profile update timestamp. |

---

### Table 3: `educational_qualifications`
*Purpose: Academic degrees and percentage marks for recruitment eligibility.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `qualification_id` | `UUID` | No | PK | `gen_random_uuid()` | Unique qualification primary key. |
| `candidate_id` | `UUID` | No | FK | - | Foreign Key referencing `candidates.candidate_id`. |
| `qualification_level` | `VARCHAR(50)` | No | - | - | Level (`SSLC`, `PUC`, `Undergraduate`, `Postgraduate`). |
| `institution_name` | `VARCHAR(150)` | No | - | - | School, college, or institute name. |
| `board_or_university`| `VARCHAR(150)` | No | - | - | Governing educational board or university. |
| `passing_year` | `INTEGER` | Yes | - | - | Year of course completion (1970–2035). |
| `percentage` | `NUMERIC(5,2)` | Yes | - | - | Aggregate percentage score (0.00–100.00). |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Record insertion timestamp. |

---

### Table 4: `examinations`
*Purpose: Official recruitment notification entity.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `examination_id` | `UUID` | No | PK | `gen_random_uuid()` | Unique examination surrogate key. |
| `examination_code` | `VARCHAR(30)` | No | UK | - | Official code (e.g. `UPSC-CSE-2027`). |
| `examination_name` | `VARCHAR(150)` | No | - | - | Full title of the recruitment examination. |
| `conducting_authority`| `VARCHAR(150)`| No | - | - | Commission (e.g. `UPSC`, `SSC`, `RRB`). |
| `description` | `TEXT` | Yes | - | - | Detailed scope and post designations. |
| `eligibility_criteria`| `TEXT` | Yes | - | - | Educational and age prerequisites. |
| `application_start_date`| `DATE` | No | - | - | Opening date for online application. |
| `application_end_date`| `DATE` | No | - | - | Last date to submit applications. |
| `examination_date` | `DATE` | No | - | - | Scheduled date of examination. |
| `application_fee` | `NUMERIC(10,2)`| Yes | - | `0.00` | Application fee amount in INR. |
| `total_vacancies` | `INTEGER` | No | - | - | Total sanctioned government vacancies. |
| `examination_status` | `VARCHAR(20)` | No | - | `'draft'` | Status (`draft`, `published`, `completed`, etc.). |
| `created_by` | `UUID` | Yes | FK | - | Foreign Key referencing `profiles.id` (admin). |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Last modification timestamp. |

---

### Table 5: `exam_centers`
*Purpose: Physical examination venues across cities and districts.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `center_id` | `UUID` | No | PK | `gen_random_uuid()` | Center surrogate key. |
| `center_code` | `VARCHAR(30)` | No | UK | - | Standard center code (e.g. `DEL-KV-101`). |
| `center_name` | `VARCHAR(150)` | No | - | - | Name of testing institution/college. |
| `address` | `TEXT` | No | - | - | Physical street address. |
| `city` | `VARCHAR(100)` | No | - | - | City name. |
| `state` | `VARCHAR(100)` | No | - | - | State name. |
| `pincode` | `VARCHAR(10)` | No | - | - | Postal PIN code. |
| `contact_number` | `VARCHAR(15)` | Yes | - | - | Venue supervisor contact phone. |
| `total_capacity` | `INTEGER` | No | - | - | Total physical seating capacity. |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Venue creation timestamp. |

---

### Table 6: `examination_centers` (Junction Table)
*Purpose: Resolves N:M relationship between examinations and exam_centers.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `examination_id` | `UUID` | No | PK, FK | - | Composite PK referencing `examinations`. |
| `center_id` | `UUID` | No | PK, FK | - | Composite PK referencing `exam_centers`. |
| `allocated_capacity` | `INTEGER` | No | - | - | Seat quota allocated for this specific exam. |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Mapping creation timestamp. |

---

### Table 7: `applications`
*Purpose: Candidate application submissions under official administrative scrutiny.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `application_id` | `UUID` | No | PK | `gen_random_uuid()` | Unique application primary key. |
| `application_number` | `VARCHAR(40)` | No | UK | - | Unique tracking number (e.g. `APP-2027-0001`). |
| `candidate_id` | `UUID` | No | FK | - | Foreign Key referencing `candidates`. |
| `examination_id` | `UUID` | No | FK | - | Foreign Key referencing `examinations`. |
| `center_id` | `UUID` | Yes | FK | - | Foreign Key referencing `exam_centers`. |
| `applied_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Application submission timestamp. |
| `application_status` | `VARCHAR(30)` | No | - | `'submitted'` | Status (`submitted`, `accepted`, `rejected`, etc.).|
| `payment_status` | `VARCHAR(20)` | Yes | - | `'pending'` | Payment status (`paid`, `pending`, `waived`). |
| `remarks` | `TEXT` | Yes | - | - | Scrutiny remarks and observations. |
| `updated_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Status update timestamp. |

*Unique Constraint:* `UNIQUE (candidate_id, examination_id)`  
*Composite Foreign Key:* `(examination_id, center_id) REFERENCES examination_centers(examination_id, center_id)`

---

### Table 8: `admit_cards`
*Purpose: Hall tickets generated for accepted candidates.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `admit_card_id` | `UUID` | No | PK | `gen_random_uuid()` | Admit card primary key. |
| `application_id` | `UUID` | No | FK, UK | - | 1:1 Foreign Key referencing `applications`. |
| `admit_card_number` | `VARCHAR(40)` | No | UK | - | Hall ticket number (e.g. `AC-2027-0001`). |
| `roll_number` | `VARCHAR(40)` | No | UK | - | Examination roll number (`ROLL-SSCCGL-27001`).|
| `issue_date` | `DATE` | No | - | - | Official date of issuance. |
| `reporting_time` | `TIME` | No | - | - | Morning/afternoon gate reporting time. |
| `examination_instructions`| `TEXT` | Yes | - | - | Mandatory instructions for candidate. |
| `admit_card_file_url`| `TEXT` | Yes | - | - | URL to generated PDF hall ticket. |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Hall ticket generation timestamp. |

---

### Table 9: `results`
*Purpose: Evaluated scorecards and merit rankings.*

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `result_id` | `UUID` | No | PK | `gen_random_uuid()` | Result primary key. |
| `application_id` | `UUID` | No | FK, UK | - | 1:1 Foreign Key referencing `applications`. |
| `marks_obtained` | `NUMERIC(7,2)` | No | - | - | Marks scored by candidate. |
| `maximum_marks` | `NUMERIC(7,2)` | No | - | - | Total maximum exam marks. |
| `percentage` | `NUMERIC(5,2)` | Yes | - | *STORED* | `ROUND((marks_obtained / NULLIF(max, 0)) * 100, 2)`.|
| `rank` | `INTEGER` | Yes | - | - | Merit list rank position. |
| `result_status` | `VARCHAR(20)` | No | - | - | Evaluation status (`pass`, `fail`, `withheld`). |
| `is_published` | `BOOLEAN` | Yes | - | `FALSE` | Dissemination visibility flag. |
| `published_at` | `TIMESTAMPTZ` | Yes | - | - | Scorecard publication timestamp. |
| `remarks` | `TEXT` | Yes | - | - | Administrative qualifying remarks. |
| `created_at` | `TIMESTAMPTZ` | Yes | - | `NOW()` | Scorecard creation timestamp. |

---

## 3. Normalization Proof & Analysis

### First Normal Form (1NF)
* Every attribute in every relation contains only atomic (indivisible) values.
* There are no repeating groups or multivalued attributes. For example, multiple educational degrees are not stored as comma-separated values in `candidates`; they are normalized into child rows in `educational_qualifications`.

### Second Normal Form (2NF)
* Meets all 1NF requirements.
* Every non-prime attribute is fully functionally dependent on the whole candidate key.
* In single-column primary key tables (`candidates`, `examinations`, `exam_centers`, `applications`, `admit_cards`, `results`), partial dependencies cannot exist.
* In the composite-key junction table `examination_centers(examination_id, center_id)`, the non-key attribute `allocated_capacity` depends on both the examination AND the center. It cannot depend on either individually. Hence, 2NF holds.

### Third Normal Form (3NF)
* Meets all 2NF requirements.
* Contains no transitive functional dependencies ($X \to Y$ where $Y$ is not a subset of a candidate key and $X$ is not a superkey).
* Candidate personal attributes (name, address, category) depend exclusively on `candidate_id` and are NOT duplicated in `applications`.
* Venue attributes (center name, city, address, total capacity) depend on `center_id` and are NOT duplicated in `applications` or `examination_centers`.

### Boyce-Codd Normal Form (BCNF)
* For every non-trivial functional dependency $X \to Y$, $X$ is a superkey.
* In all nine tables, every determinant is a superkey (`id`, `candidate_id`, `examination_code`, `center_code`, `application_number`, `admit_card_number`, `roll_number`). Therefore, the schema is in BCNF.

---

## 4. Concurrency & Business Rules Enforcement

1. **Physical Center Capacity Lock (`check_center_allocation_capacity`):**
   When allocating an exam to a center, the total seats allocated across all exams scheduled on that identical date cannot exceed `exam_centers.total_capacity`. The trigger executes `SELECT total_capacity FROM exam_centers ... FOR UPDATE` to serialize concurrent administrative allocations.
2. **Venue Allocation Quota Lock (`check_application_center_capacity`):**
   When an applicant applies or a center is assigned, the number of active applicants (`application_status NOT IN ('rejected', 'withdrawn')`) cannot exceed `examination_centers.allocated_capacity`. The trigger executes `SELECT allocated_capacity FROM examination_centers ... FOR UPDATE` to serialize simultaneous applications targeting the venue.
3. **Chronological Validity (`validate_examination_dates`):**
   Enforces `application_start_date <= application_end_date <= examination_date`.
4. **Result Publication Integrity (`validate_result_publication`):**
   Prevents setting `is_published = TRUE` before `marks_obtained` and final `result_status` are determined.

---

## 5. Relational Queries Summary

The companion SQL script [queries.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries.sql) implements 18 comprehensive queries:
* **Relational Joins:** Demonstrates 2-table, 3-table, and 4-table inner joins across candidates, applications, notifications, venues, and scorecards.
* **Outer Joins (LEFT JOIN):** Identifies inactive aspirants who have registered but never submitted applications.
* **Aggregation & Grouping:** Groups applicant counts per notification and computes venue utilization percentages.
* **Subqueries:** Scalar and set comparison subqueries (`>= ALL`) identifying high-demand examinations.
* **Correlated Subqueries:** Identifies high-performing aspirants scoring strictly above the mean score of their respective competitive examination.

---

## 6. Execution Instructions

1. **Schema DDL:** Run [create_tables.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/create_tables.sql) in Supabase SQL Editor.
2. **Functions & Triggers:** Run [functions.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/functions.sql).
3. **Demonstration Dataset:** Run [insert_data.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/insert_data.sql).
4. **Relational Queries:** Run queries from [queries.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/queries.sql).
5. **Interactive Testing:** Run operations from [crud_operations.sql](file:///c:/Users/UJWAL/DBMS%20Mini%20-%20Project/database/crud_operations.sql).

---
*End of Technical Report: docs/database_implementation.md*
