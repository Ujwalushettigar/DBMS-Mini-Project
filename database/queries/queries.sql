-- ============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- Course: CS522L5C – Database Management System Laboratory
-- File: database/queries/queries.sql
-- Description: Practical SQL query laboratory manual organized into 15 clearly
--              numbered sections covering core relational DBMS concepts.
-- IMPORTANT NOTES:
-- 1. All queries reference the nine core recruitment database tables.
-- 2. Contains NO main CREATE TABLE statements and NO INSERT statements.
-- 3. All sample data must be populated manually before SELECT queries return records.
-- 4. Destructive DML operations are safely contained within BEGIN ... ROLLBACK blocks.
-- ============================================================================

-- ============================================================================
-- 1. BASIC SELECT QUERIES AND FILTERING
-- Concepts: Column projection, conditional predicates (WHERE), pattern matching (LIKE),
--           sorting (ORDER BY), and null value checks.
-- ============================================================================

-- 1.1 Retrieve all candidate dossiers sorted alphabetically by name
SELECT 
    candidate_id,
    candidate_number,
    full_name,
    date_of_birth,
    gender,
    phone_number,
    city,
    state,
    category
FROM public.candidates
ORDER BY full_name ASC;

-- 1.2 Display all published recruitment examinations
SELECT 
    examination_id,
    examination_code,
    examination_name,
    conducting_authority,
    examination_date,
    application_fee,
    total_vacancies,
    examination_status
FROM public.examinations
WHERE examination_status = 'published'
ORDER BY examination_date ASC;

-- 1.3 Filter candidates by reservation category and state
SELECT 
    candidate_number,
    full_name,
    gender,
    phone_number,
    city,
    state,
    category
FROM public.candidates
WHERE category = 'OBC' 
  AND state = 'Karnataka';

-- 1.4 Search examinations with title matching a pattern using ILIKE (case-insensitive)
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    total_vacancies,
    examination_date
FROM public.examinations
WHERE examination_name ILIKE '%Graduate%'
ORDER BY examination_date ASC;

-- 1.5 Retrieve applications with a pending scrutiny or verification status
SELECT 
    application_number,
    candidate_id,
    examination_id,
    applied_at,
    application_status,
    payment_status
FROM public.applications
WHERE application_status IN ('submitted', 'under_review')
ORDER BY applied_at ASC;


-- ============================================================================
-- 2. UPDATE AND DELETE OPERATIONS
-- Concepts: Safe transactional data manipulation, predicate-bound updates,
--           audit timestamp maintenance, and foreign-key safe deletions.
-- ============================================================================

-- 2.1 Demonstrate UPDATE of candidate contact details (Transactional Demonstration)
BEGIN;
UPDATE public.candidates
SET phone_number = '9876543210',
    address = 'Flat 402, Shanti Vihar, Sector 15',
    city = 'New Delhi',
    pincode = '110001',
    updated_at = NOW()
WHERE candidate_number = 'CND-2026-1001';

-- Verification of update
SELECT candidate_number, full_name, phone_number, address, city, pincode, updated_at
FROM public.candidates
WHERE candidate_number = 'CND-2026-1001';
ROLLBACK; -- Preserves original database state

-- 2.2 Demonstrate UPDATE of an examination status to 'completed'
BEGIN;
UPDATE public.examinations
SET examination_status = 'completed',
    updated_at = NOW()
WHERE examination_code = 'RRB-NTPC-2026'
  AND examination_status = 'published';

-- Verification of status update
SELECT examination_code, examination_name, examination_status, updated_at
FROM public.examinations
WHERE examination_code = 'RRB-NTPC-2026';
ROLLBACK;

-- 2.3 Demonstrate safe DELETE of a test application record
BEGIN;
DELETE FROM public.applications
WHERE application_number = 'APP-TEST-9999'
  AND application_status = 'withdrawn';

-- Verification of deletion
SELECT application_id, application_number, application_status
FROM public.applications
WHERE application_number = 'APP-TEST-9999';
ROLLBACK;


-- ============================================================================
-- 3. TRADITIONAL JOINS USING WHERE CONDITIONS
-- Concepts: Relational algebra theta joins and Cartesian products filtered by
--           WHERE join predicates (comma-separated table syntax from lab manual).
-- ============================================================================

-- 3.1 Candidates who applied for exams conducted by a specified authority (Traditional join)
SELECT 
    c.candidate_number,
    c.full_name,
    c.category,
    e.examination_name,
    e.conducting_authority,
    a.application_number
FROM public.candidates c, public.applications a, public.examinations e
WHERE c.candidate_id = a.candidate_id
  AND a.examination_id = e.examination_id
  AND e.conducting_authority = 'Staff Selection Commission'
ORDER BY c.full_name ASC;

-- 3.2 Examination venues, assigned cities, and allocated capacity (Traditional join)
SELECT 
    e.examination_code,
    e.examination_name,
    ec.center_code,
    ec.center_name,
    ec.city,
    jc.allocated_capacity
FROM public.examinations e, public.exam_centers ec, public.examination_centers jc
WHERE e.examination_id = jc.examination_id
  AND ec.center_id = jc.center_id
ORDER BY e.examination_name, ec.city;

-- 3.3 Candidate demographic details with application numbers (Traditional 2-table join)
SELECT 
    c.candidate_number,
    c.full_name,
    a.application_number,
    a.application_status,
    a.applied_at
FROM public.candidates c, public.applications a
WHERE c.candidate_id = a.candidate_id
ORDER BY a.applied_at DESC;


-- ============================================================================
-- 4. INNER JOIN, LEFT JOIN, AND MULTI-TABLE JOINS
-- Concepts: ANSI standard JOIN syntax (INNER JOIN, LEFT OUTER JOIN, and
--           n-table associative joins across recruitment entities).
-- ============================================================================

-- 4.1 Candidate application details (ANSI INNER JOIN)
SELECT 
    c.candidate_number,
    c.full_name AS candidate_name,
    a.application_number,
    e.examination_code,
    e.examination_name,
    a.application_status,
    a.applied_at
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
ORDER BY a.applied_at DESC;

-- 4.2 Candidate academic qualifications (INNER JOIN)
SELECT 
    c.candidate_number,
    c.full_name,
    eq.qualification_level,
    eq.institution_name,
    eq.board_or_university,
    eq.passing_year,
    eq.percentage
FROM public.candidates c
INNER JOIN public.educational_qualifications eq ON c.candidate_id = eq.candidate_id
ORDER BY c.candidate_number ASC, eq.passing_year DESC;

-- 4.3 All examinations with their application count, including exams with 0 applications (LEFT JOIN)
SELECT 
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    COUNT(a.application_id) AS total_applications
FROM public.examinations e
LEFT JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name, e.conducting_authority
ORDER BY total_applications DESC;

-- 4.4 Multi-Table 4-Way Join: Candidate, Examination, Assigned Center, and Admit Card
SELECT 
    c.candidate_number,
    c.full_name,
    e.examination_code,
    e.examination_name,
    ec.center_name AS examination_venue,
    ec.city AS venue_city,
    ac.roll_number,
    ac.issue_date,
    ac.reporting_time
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
INNER JOIN public.exam_centers ec ON a.center_id = ec.center_id
INNER JOIN public.admit_cards ac ON a.application_id = ac.application_id
ORDER BY e.examination_code, ac.roll_number ASC;


-- ============================================================================
-- 5. NESTED QUERIES AND SUBQUERIES
-- Concepts: Scalar subqueries, multi-row subqueries with IN / ANY, and
--           correlated subqueries evaluated once per outer row.
-- ============================================================================

-- 5.1 Candidates who obtained marks strictly above the overall average marks (Scalar Subquery)
SELECT 
    c.candidate_number,
    c.full_name,
    e.examination_name,
    r.marks_obtained,
    r.maximum_marks,
    ROUND((SELECT AVG(marks_obtained) FROM public.results WHERE published_at IS NOT NULL), 2) AS overall_average
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.results r ON a.application_id = r.application_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.published_at IS NOT NULL
  AND r.marks_obtained > (
      SELECT AVG(marks_obtained)
      FROM public.results
      WHERE published_at IS NOT NULL
  )
ORDER BY r.marks_obtained DESC;

-- 5.2 Examinations whose application fee is higher than the average application fee
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    application_fee
FROM public.examinations
WHERE application_fee > (
    SELECT AVG(application_fee)
    FROM public.examinations
)
ORDER BY application_fee DESC;

-- 5.3 Candidates who scored above the average score of their specific examination (Correlated Subquery)
SELECT 
    c.candidate_number,
    c.full_name,
    e.examination_code,
    e.examination_name,
    r.marks_obtained
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.results r ON a.application_id = r.application_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.marks_obtained > (
    SELECT AVG(r2.marks_obtained)
    FROM public.results r2
    INNER JOIN public.applications a2 ON r2.application_id = a2.application_id
    WHERE a2.examination_id = a.examination_id
)
ORDER BY e.examination_code, r.marks_obtained DESC;

-- 5.4 Examination that received the highest number of submitted applications (Nested Subquery)
SELECT 
    e.examination_code,
    e.examination_name,
    COUNT(a.application_id) AS application_count
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name
HAVING COUNT(a.application_id) = (
    SELECT MAX(app_count)
    FROM (
        SELECT COUNT(application_id) AS app_count
        FROM public.applications
        GROUP BY examination_id
    ) AS counts
);


-- ============================================================================
-- 6. AGGREGATE FUNCTIONS: COUNT, SUM, AVG, MIN, MAX
-- Concepts: Columnar summarization, mathematical aggregates, and domain metrics.
-- ============================================================================

-- 6.1 Total recruitment vacancies declared across all government examinations (SUM)
SELECT 
    SUM(total_vacancies) AS aggregate_vacancies_declared,
    COUNT(examination_id) AS total_examinations_conducted
FROM public.examinations;

-- 6.2 Application fee metrics across recruitment examinations (MIN, MAX, AVG)
SELECT 
    MIN(application_fee) AS minimum_fee,
    MAX(application_fee) AS maximum_fee,
    ROUND(AVG(application_fee), 2) AS average_application_fee
FROM public.examinations;

-- 6.3 Seating capacity statistics across all physical examination centers (SUM, AVG)
SELECT 
    COUNT(center_id) AS total_centers_registered,
    SUM(total_capacity) AS total_seating_capacity,
    ROUND(AVG(total_capacity), 1) AS average_venue_capacity
FROM public.exam_centers;

-- 6.4 Highest and lowest percentage secured by candidates in qualifying exams (MIN, MAX)
SELECT 
    qualification_level,
    MIN(percentage) AS minimum_percentage,
    MAX(percentage) AS maximum_percentage,
    ROUND(AVG(percentage), 2) AS average_percentage
FROM public.educational_qualifications
GROUP BY qualification_level;


-- ============================================================================
-- 7. GROUP BY AND HAVING
-- Concepts: Grouping sets, grouped aggregations, and post-aggregation filters.
-- ============================================================================

-- 7.1 Count applications submitted per examination (GROUP BY)
SELECT 
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    COUNT(a.application_id) AS total_applications
FROM public.examinations e
LEFT JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name, e.conducting_authority
ORDER BY total_applications DESC;

-- 7.2 Examinations having more than a specified threshold of applications (HAVING)
SELECT 
    e.examination_code,
    e.examination_name,
    COUNT(a.application_id) AS application_count
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name
HAVING COUNT(a.application_id) > 1
ORDER BY application_count DESC;

-- 7.3 Candidates who submitted more than one application (HAVING)
SELECT 
    c.candidate_number,
    c.full_name,
    c.category,
    COUNT(a.application_id) AS applications_count
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
GROUP BY c.candidate_id, c.candidate_number, c.full_name, c.category
HAVING COUNT(a.application_id) > 1
ORDER BY applications_count DESC;

-- 7.4 Test centers where total allocated seats across exams exceed 400 (HAVING)
SELECT 
    ec.center_code,
    ec.center_name,
    ec.city,
    ec.total_capacity,
    SUM(jc.allocated_capacity) AS total_allocated_seats
FROM public.exam_centers ec
INNER JOIN public.examination_centers jc ON ec.center_id = jc.center_id
GROUP BY ec.center_id, ec.center_code, ec.center_name, ec.city, ec.total_capacity
HAVING SUM(jc.allocated_capacity) > 400
ORDER BY total_allocated_seats DESC;

-- 7.5 Conducting authorities managing more than one recruitment examination (HAVING)
SELECT 
    conducting_authority,
    COUNT(examination_id) AS examinations_conducted,
    SUM(total_vacancies) AS aggregate_vacancies
FROM public.examinations
GROUP BY conducting_authority
HAVING COUNT(examination_id) > 1
ORDER BY examinations_conducted DESC;


-- ============================================================================
-- 8. DATE OPERATIONS AND BETWEEN
-- Concepts: PostgreSQL DATE literals, calendar interval additions, and BETWEEN.
-- ============================================================================

-- 8.1 Retrieve applications submitted within a specific date range
SELECT 
    a.application_number,
    c.full_name AS candidate_name,
    e.examination_name,
    a.applied_at,
    a.application_status
FROM public.applications a
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE a.applied_at BETWEEN DATE '2026-01-01' AND DATE '2026-02-01' + INTERVAL '1 day'
ORDER BY a.applied_at ASC;

-- 8.2 Recruitment examinations scheduled within a target calendar quarter
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    examination_date,
    application_start_date,
    application_end_date,
    total_vacancies
FROM public.examinations
WHERE examination_date BETWEEN DATE '2026-05-01' AND DATE '2026-07-31'
ORDER BY examination_date ASC;

-- 8.3 Count applications submitted per examination within a specified time window
SELECT 
    e.examination_code,
    e.examination_name,
    COUNT(a.application_id) AS applications_in_window
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
WHERE a.applied_at BETWEEN DATE '2026-01-15' AND DATE '2026-01-31' + INTERVAL '1 day'
GROUP BY e.examination_id, e.examination_code, e.examination_name
ORDER BY applications_in_window DESC;


-- ============================================================================
-- 9. UNION, UNION ALL, AND EXCEPT
-- Concepts: Relational set operations with matching column projections.
--           (EXCEPT represents PostgreSQL implementation of Oracle MINUS).
-- ============================================================================

-- 9.1 Examinations with maximum and minimum application fees using UNION
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    application_fee,
    'MAXIMUM FEE' AS fee_classification
FROM public.examinations
WHERE application_fee = (SELECT MAX(application_fee) FROM public.examinations)
UNION
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    application_fee,
    'MINIMUM FEE' AS fee_classification
FROM public.examinations
WHERE application_fee = (SELECT MIN(application_fee) FROM public.examinations)
ORDER BY application_fee DESC;

-- 9.2 Distinct geographic cities (UNION: eliminates duplicate cities)
SELECT city, 'Candidate Residence' AS location_source FROM public.candidates
UNION
SELECT city, 'Exam Venue Location' AS location_source FROM public.exam_centers
ORDER BY city ASC;

-- 9.3 All geographic city records (UNION ALL: preserves duplicates for frequency)
SELECT city, 'Candidate Residence' AS location_source FROM public.candidates
UNION ALL
SELECT city, 'Exam Venue Location' AS location_source FROM public.exam_centers
ORDER BY city ASC;

-- 9.4 Cities hosting examination venues where NO candidate currently resides (EXCEPT)
SELECT city FROM public.exam_centers
EXCEPT
SELECT city FROM public.candidates
ORDER BY city ASC;


-- ============================================================================
-- 10. EXISTS AND NOT EXISTS
-- Concepts: Semi-joins, anti-joins, and relational division (universal quantification).
-- ============================================================================

-- 10.1 Candidates who have submitted at least one application (EXISTS)
SELECT 
    c.candidate_number,
    c.full_name,
    c.phone_number,
    c.city,
    c.category
FROM public.candidates c
WHERE EXISTS (
    SELECT 1
    FROM public.applications a
    WHERE a.candidate_id = c.candidate_id
)
ORDER BY c.full_name ASC;

-- 10.2 Candidates who have NOT submitted any application (NOT EXISTS)
SELECT 
    c.candidate_number,
    c.full_name,
    c.phone_number,
    c.city,
    c.category
FROM public.candidates c
WHERE NOT EXISTS (
    SELECT 1
    FROM public.applications a
    WHERE a.candidate_id = c.candidate_id
)
ORDER BY c.full_name ASC;

-- 10.3 Examinations without any allocated test centers (NOT EXISTS)
SELECT 
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    e.examination_date
FROM public.examinations e
WHERE NOT EXISTS (
    SELECT 1
    FROM public.examination_centers jc
    WHERE jc.examination_id = e.examination_id
)
ORDER BY e.examination_name ASC;

-- 10.4 Test centers that are currently NOT mapped to any examination (NOT EXISTS)
SELECT 
    ec.center_code,
    ec.center_name,
    ec.city,
    ec.state,
    ec.total_capacity
FROM public.exam_centers ec
WHERE NOT EXISTS (
    SELECT 1
    FROM public.examination_centers jc
    WHERE jc.center_id = ec.center_id
)
ORDER BY ec.center_name ASC;

-- 10.5 Relational Division: Candidates who applied for ALL exams conducted by 'Staff Selection Commission'
SELECT 
    c.candidate_number,
    c.full_name,
    c.category
FROM public.candidates c
WHERE NOT EXISTS (
    SELECT 1
    FROM public.examinations e
    WHERE e.conducting_authority = 'Staff Selection Commission'
      AND NOT EXISTS (
          SELECT 1
          FROM public.applications a
          WHERE a.candidate_id = c.candidate_id
            AND a.examination_id = e.examination_id
      )
)
ORDER BY c.full_name ASC;


-- ============================================================================
-- 11. HIGHEST AND SECOND-HIGHEST MARKS
-- Concepts: Relational order, maximum scalar evaluation, and subquery exclusion.
-- ============================================================================

-- 11.1 Candidate(s) who obtained the highest marks in any recruitment examination
SELECT 
    c.candidate_number,
    c.full_name,
    e.examination_name,
    r.marks_obtained,
    r.maximum_marks,
    r.rank
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.results r ON a.application_id = r.application_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.marks_obtained = (
    SELECT MAX(marks_obtained)
    FROM public.results
);

-- 11.2 Candidate who secured the second-highest marks (Nested subquery without LIMIT)
SELECT 
    c.candidate_number,
    c.full_name,
    e.examination_name,
    r.marks_obtained,
    r.maximum_marks
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.results r ON a.application_id = r.application_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.marks_obtained = (
    SELECT MAX(marks_obtained)
    FROM public.results
    WHERE marks_obtained < (
        SELECT MAX(marks_obtained)
        FROM public.results
    )
);


-- ============================================================================
-- 12. VIEWS AND VIEW-BASED QUERIES
-- Concepts: CREATE OR REPLACE VIEW, data abstraction, encapsulation of complex
--           multi-table joins, and view querying.
-- ============================================================================

-- 12.1 View: Candidate profile with aggregated application count
CREATE OR REPLACE VIEW public.view_candidate_application_summary AS
SELECT 
    c.candidate_id,
    c.candidate_number,
    c.full_name,
    c.gender,
    c.city,
    c.category,
    COUNT(a.application_id) AS total_applications_submitted
FROM public.candidates c
LEFT JOIN public.applications a ON c.candidate_id = a.candidate_id
GROUP BY c.candidate_id, c.candidate_number, c.full_name, c.gender, c.city, c.category;

-- Query View 1
SELECT * FROM public.view_candidate_application_summary
ORDER BY total_applications_submitted DESC;

-- 12.2 View: Examination scrutiny and application status metrics
CREATE OR REPLACE VIEW public.view_examination_scrutiny_metrics AS
SELECT 
    e.examination_id,
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    COUNT(a.application_id) AS total_applications,
    COUNT(CASE WHEN a.application_status = 'accepted' THEN 1 END) AS accepted_count,
    COUNT(CASE WHEN a.application_status = 'rejected' THEN 1 END) AS rejected_count,
    COUNT(CASE WHEN a.application_status = 'under_review' THEN 1 END) AS under_review_count
FROM public.examinations e
LEFT JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name, e.conducting_authority;

-- Query View 2
SELECT * FROM public.view_examination_scrutiny_metrics
ORDER BY total_applications DESC;

-- 12.3 View: Published official merit roster
CREATE OR REPLACE VIEW public.view_published_merit_list AS
SELECT 
    e.examination_code,
    e.examination_name,
    c.candidate_number,
    c.full_name AS candidate_name,
    c.category,
    r.marks_obtained,
    r.maximum_marks,
    ROUND((r.marks_obtained / r.maximum_marks) * 100, 2) AS percentage_score,
    r.rank,
    r.result_status,
    r.published_at
FROM public.results r
INNER JOIN public.applications a ON r.application_id = a.application_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.published_at IS NOT NULL;

-- Query View 3
SELECT * FROM public.view_published_merit_list
ORDER BY examination_code, rank ASC;

-- 12.4 View: Examination center venue utilization and seat quota
CREATE OR REPLACE VIEW public.view_exam_center_utilization AS
SELECT 
    ec.center_id,
    ec.center_code,
    ec.center_name,
    ec.city,
    ec.state,
    ec.total_capacity,
    COALESCE(SUM(jc.allocated_capacity), 0) AS total_allocated_seats,
    (ec.total_capacity - COALESCE(SUM(jc.allocated_capacity), 0)) AS remaining_seats
FROM public.exam_centers ec
LEFT JOIN public.examination_centers jc ON ec.center_id = jc.center_id
GROUP BY ec.center_id, ec.center_code, ec.center_name, ec.city, ec.state, ec.total_capacity;

-- Query View 4
SELECT * FROM public.view_exam_center_utilization
ORDER BY total_allocated_seats DESC;


-- ============================================================================
-- 13. RANKING USING RANK() AND WINDOW FUNCTIONS
-- Concepts: OVER (PARTITION BY ... ORDER BY ...), RANK(), DENSE_RANK(), and ROW_NUMBER().
-- ============================================================================

-- 13.1 Calculate examination-wise merit rank partitioned by examination
SELECT 
    e.examination_code,
    c.candidate_number,
    c.full_name AS candidate_name,
    r.marks_obtained,
    r.maximum_marks,
    RANK() OVER (
        PARTITION BY e.examination_id 
        ORDER BY r.marks_obtained DESC
    ) AS calculated_merit_rank,
    DENSE_RANK() OVER (
        PARTITION BY e.examination_id 
        ORDER BY r.marks_obtained DESC
    ) AS dense_merit_rank
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.results r ON a.application_id = r.application_id
WHERE r.published_at IS NOT NULL
ORDER BY e.examination_code, calculated_merit_rank ASC;

-- 13.2 Overall top 5 candidates across all published recruitment scorecards
SELECT 
    c.candidate_number,
    c.full_name AS candidate_name,
    e.examination_code,
    e.examination_name,
    r.marks_obtained,
    r.maximum_marks,
    ROUND((r.marks_obtained / r.maximum_marks) * 100, 2) AS percentage,
    ROW_NUMBER() OVER (ORDER BY r.marks_obtained DESC) AS overall_position
FROM public.results r
INNER JOIN public.applications a ON r.application_id = a.application_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.published_at IS NOT NULL
ORDER BY r.marks_obtained DESC
LIMIT 5;


-- ============================================================================
-- 14. ALTER TABLE AND CONSTRAINT DEMONSTRATIONS
-- Concepts: Schema alteration (ADD COLUMN, ADD CONSTRAINT), catalog inspection.
-- ============================================================================

-- 14.1 Demonstrate adding a secondary contact column to candidates
BEGIN;
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(15);

-- Verify column addition in information_schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates' AND column_name = 'alternate_phone';
ROLLBACK; -- Safe demonstration rollback

-- 14.2 Demonstrate adding a CHECK constraint for maximum allowable fee
BEGIN;
ALTER TABLE public.examinations
ADD CONSTRAINT chk_exam_max_fee CHECK (application_fee <= 5000.00);

-- Verify constraint creation
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'examinations' AND constraint_name = 'chk_exam_max_fee';
ROLLBACK;

-- 14.3 Inspect table constraints across the recruitment schema
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type DESC;


-- ============================================================================
-- 15. POSTGRESQL RANGE PARTITIONING DEMONSTRATION
-- Concepts: Practical querying of the declarative range-partitioned table
--           (examination_archives_partitioned) created in create_tables.sql.
-- ============================================================================

-- 15.1 Demonstrate partition pruning (optimizer accesses only target partition: exams_q2_2026)
EXPLAIN SELECT * 
FROM public.examination_archives_partitioned
WHERE examination_date = DATE '2026-05-24';

-- 15.2 Query partitioned records across quarterly boundaries
SELECT 
    examination_code,
    examination_name,
    conducting_authority,
    examination_date,
    total_vacancies
FROM public.examination_archives_partitioned
WHERE examination_date BETWEEN DATE '2026-04-01' AND DATE '2026-06-30'
ORDER BY examination_date ASC;
