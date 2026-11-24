-- ==============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/queries.sql
-- Description: Comprehensive relational SQL queries demonstrating joins,
--              aggregations, grouping, filtering, subqueries, and set operations.
--
-- ACADEMIC DBMS MINI-PROJECT (CS522L5C / VIVA VOCE REFERENCE)
-- ==============================================================================

-- ==============================================================================
-- 1. INNER JOIN CANDIDATES AND APPLICATIONS
-- Purpose: Retrieves candidate biographical details alongside their submitted
--          applications, matching on primary-foreign key (candidate_id).
-- ==============================================================================
SELECT 
    c.candidate_number,
    c.full_name,
    c.category,
    c.phone_number,
    a.application_number,
    a.application_status,
    a.payment_status,
    a.applied_at
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
ORDER BY a.applied_at DESC;

-- ==============================================================================
-- 2. INNER JOIN EXAMINATIONS AND APPLICATIONS
-- Purpose: Retrieves notification details joined with incoming applicant volume,
--          connecting examination_id between examinations and applications.
-- ==============================================================================
SELECT 
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    e.examination_date,
    a.application_number,
    a.application_status,
    a.payment_status
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
ORDER BY e.examination_code ASC, a.applied_at DESC;

-- ==============================================================================
-- 3. THREE-TABLE JOIN: CANDIDATES, APPLICATIONS, AND EXAMINATIONS
-- Purpose: Demonstrates multi-table inner joining to create a complete picture of
--          who applied for which recruitment notification and when.
-- ==============================================================================
SELECT 
    c.candidate_number,
    c.full_name AS candidate_name,
    c.category,
    e.examination_code,
    e.examination_name,
    a.application_number,
    a.application_status,
    a.applied_at
FROM public.candidates c
INNER JOIN public.applications a ON c.candidate_id = a.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
ORDER BY e.examination_code ASC, c.full_name ASC;

-- ==============================================================================
-- 4. JUNCTION TABLE JOIN: EXAMINATIONS, EXAMINATION_CENTERS, AND EXAM_CENTERS
-- Purpose: Resolves the Many-to-Many (N:M) relationship between exams and venues,
--          displaying physical centers allocated to each exam and their seat quota.
-- ==============================================================================
SELECT 
    e.examination_code,
    e.examination_name,
    c.center_code,
    c.center_name,
    c.city,
    c.state,
    ec.allocated_capacity,
    c.total_capacity AS center_physical_capacity
FROM public.examinations e
INNER JOIN public.examination_centers ec ON e.examination_id = ec.examination_id
INNER JOIN public.exam_centers c ON ec.center_id = c.center_id
ORDER BY e.examination_code ASC, ec.allocated_capacity DESC;

-- ==============================================================================
-- 5. COMPLETE RECRUITMENT LIFECYCLE JOIN: APPLICATIONS, ADMIT CARDS, AND RESULTS
-- Purpose: Traces an applicant's complete progression from application approval
--          to hall ticket issuance and evaluated scorecard.
-- ==============================================================================
SELECT 
    a.application_number,
    a.application_status,
    ac.roll_number,
    ac.admit_card_number,
    ac.issue_date AS admit_card_issued_on,
    r.marks_obtained,
    r.maximum_marks,
    r.percentage,
    r.rank,
    r.result_status
FROM public.applications a
INNER JOIN public.admit_cards ac ON a.application_id = ac.application_id
INNER JOIN public.results r ON a.application_id = r.application_id
ORDER BY r.rank ASC NULLS LAST;

-- ==============================================================================
-- 6. LEFT OUTER JOIN: CANDIDATES WHO HAVE NOT APPLIED FOR ANY EXAMINATION
-- Purpose: Identifies registered aspirants with zero submitted applications,
--          demonstrating outer joins and IS NULL filtering.
-- ==============================================================================
SELECT 
    c.candidate_id,
    c.candidate_number,
    c.full_name,
    c.phone_number,
    c.city,
    c.created_at AS registered_at
FROM public.candidates c
LEFT JOIN public.applications a ON c.candidate_id = a.candidate_id
WHERE a.application_id IS NULL
ORDER BY c.full_name ASC;

-- ==============================================================================
-- 7. DISPLAY APPLICATIONS WITH CANDIDATE NAMES AND EXAMINATION DETAILS
-- Purpose: Master administrative ledger showing applicants, exam, venue, and status.
-- ==============================================================================
SELECT 
    a.application_number,
    c.full_name AS candidate_name,
    c.category,
    e.examination_name,
    COALESCE(ec.center_name, 'Center Unassigned') AS exam_center,
    COALESCE(ec.city, '-') AS center_city,
    a.application_status,
    a.payment_status
FROM public.applications a
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
LEFT JOIN public.exam_centers ec ON a.center_id = ec.center_id
ORDER BY a.applied_at DESC;

-- ==============================================================================
-- 8. DISPLAY CANDIDATE EDUCATIONAL QUALIFICATIONS WITH CANDIDATE NAMES
-- Purpose: Displays educational background for scrutinizing minimum eligibility.
-- ==============================================================================
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

-- ==============================================================================
-- 9. AGGREGATE FUNCTION & GROUP BY: NUMBER OF APPLICATIONS PER EXAMINATION
-- Purpose: Aggregates total candidate interest and pending scrutiny count per exam.
-- ==============================================================================
SELECT 
    e.examination_code,
    e.examination_name,
    e.total_vacancies,
    COUNT(a.application_id) AS total_applications_received,
    COUNT(CASE WHEN a.application_status = 'accepted' THEN 1 END) AS accepted_applications,
    COUNT(CASE WHEN a.application_status = 'submitted' THEN 1 END) AS pending_scrutiny
FROM public.examinations e
LEFT JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name, e.total_vacancies
ORDER BY total_applications_received DESC;

-- ==============================================================================
-- 10. AGGREGATE FUNCTION & GROUP BY: CANDIDATE ALLOCATION PER EXAM CENTER
-- Purpose: Counts candidates assigned to each physical testing center.
-- ==============================================================================
SELECT 
    c.center_code,
    c.center_name,
    c.city,
    c.state,
    c.total_capacity AS physical_capacity,
    COUNT(a.application_id) AS total_assigned_candidates,
    ROUND((COUNT(a.application_id)::NUMERIC / NULLIF(c.total_capacity, 0)) * 100, 2) AS center_utilization_pct
FROM public.exam_centers c
LEFT JOIN public.applications a ON c.center_id = a.center_id
GROUP BY c.center_id, c.center_code, c.center_name, c.city, c.state, c.total_capacity
ORDER BY total_assigned_candidates DESC;

-- ==============================================================================
-- 11. SUBQUERY & ORDER BY: EXAMINATIONS WITH HIGHEST APPLICATION VOLUME
-- Purpose: Finds the examination(s) that received the maximum number of submissions.
-- ==============================================================================
SELECT 
    e.examination_code,
    e.examination_name,
    e.conducting_authority,
    COUNT(a.application_id) AS total_applicants
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
GROUP BY e.examination_id, e.examination_code, e.examination_name, e.conducting_authority
HAVING COUNT(a.application_id) >= ALL (
    SELECT COUNT(a2.application_id)
    FROM public.applications a2
    GROUP BY a2.examination_id
);

-- ==============================================================================
-- 12. SUBQUERY / NOT EXISTS: CANDIDATES AWAITING ADMIT CARD GENERATION
-- Purpose: Identifies accepted applications that have not yet had an admit card issued.
-- ==============================================================================
SELECT 
    c.candidate_number,
    c.full_name,
    c.phone_number,
    e.examination_code,
    a.application_number,
    a.application_status
FROM public.applications a
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE a.application_status = 'accepted'
  AND NOT EXISTS (
      SELECT 1 
      FROM public.admit_cards ac 
      WHERE ac.application_id = a.application_id
  );

-- ==============================================================================
-- 13. FILTERED JOIN: CANDIDATES WHO PASSED AN EXAMINATION WITH SCORECARD
-- Purpose: Generates merit scorecard list for successful applicants.
-- ==============================================================================
SELECT 
    r.rank,
    c.candidate_number,
    c.full_name AS candidate_name,
    c.category,
    e.examination_name,
    r.marks_obtained,
    r.maximum_marks,
    r.percentage,
    r.result_status
FROM public.results r
INNER JOIN public.applications a ON r.application_id = a.application_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.result_status = 'pass'
  AND r.is_published = TRUE
ORDER BY r.rank ASC NULLS LAST;

-- ==============================================================================
-- 14. AGGREGATE CALCULATIONS: AVERAGE, MAX, AND MIN MARKS PER EXAMINATION
-- Purpose: Computes statistical distribution of evaluated scores per examination.
-- ==============================================================================
SELECT 
    e.examination_code,
    e.examination_name,
    COUNT(r.result_id) AS total_evaluated,
    ROUND(AVG(r.marks_obtained), 2) AS average_score,
    ROUND(AVG(r.percentage), 2) AS average_percentage,
    MAX(r.marks_obtained) AS highest_score,
    MIN(r.marks_obtained) AS lowest_score
FROM public.examinations e
INNER JOIN public.applications a ON e.examination_id = a.examination_id
INNER JOIN public.results r ON a.application_id = r.application_id
WHERE r.is_published = TRUE
GROUP BY e.examination_id, e.examination_code, e.examination_name
ORDER BY average_percentage DESC;

-- ==============================================================================
-- 15. TOP 5 CANDIDATES BASED ON EVALUATED MARKS (LIMIT / ORDER BY)
-- Purpose: Identifies top rankers across examinations for merit-based appointment.
-- ==============================================================================
SELECT 
    DENSE_RANK() OVER (ORDER BY r.percentage DESC) AS overall_rank,
    c.candidate_number,
    c.full_name,
    e.examination_code,
    r.marks_obtained,
    r.maximum_marks,
    r.percentage
FROM public.results r
INNER JOIN public.applications a ON r.application_id = a.application_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.is_published = TRUE
ORDER BY r.percentage DESC
LIMIT 5;

-- ==============================================================================
-- 16. HAVING CLAUSE: EXAMINATION VENUES WITH OVER 200 ALLOCATED CAPACITY
-- Purpose: Filters grouped centers with high seating capacity quotas.
-- ==============================================================================
SELECT 
    ec.center_code,
    ec.center_name,
    ec.city,
    COUNT(DISTINCT exc.examination_id) AS total_mapped_exams,
    SUM(exc.allocated_capacity) AS total_seats_allocated
FROM public.exam_centers ec
INNER JOIN public.examination_centers exc ON ec.center_id = exc.center_id
GROUP BY ec.center_id, ec.center_code, ec.center_name, ec.city
HAVING SUM(exc.allocated_capacity) >= 250
ORDER BY total_seats_allocated DESC;

-- ==============================================================================
-- 17. DISTINCT: UNIQUE CITIES WITH ACTIVE ASPIRANTS
-- Purpose: Demonstrates SELECT DISTINCT to analyze geographical applicant spread.
-- ==============================================================================
SELECT DISTINCT 
    city, 
    state
FROM public.candidates
ORDER BY state ASC, city ASC;

-- ==============================================================================
-- 18. CORRELATED SUBQUERY: CANDIDATES SCORING ABOVE EXAMINATION AVERAGE
-- Purpose: Identifies exceptional candidates whose score exceeds the exam mean.
-- ==============================================================================
SELECT 
    c.full_name,
    e.examination_code,
    r.marks_obtained,
    r.percentage
FROM public.results r
INNER JOIN public.applications a ON r.application_id = a.application_id
INNER JOIN public.candidates c ON a.candidate_id = c.candidate_id
INNER JOIN public.examinations e ON a.examination_id = e.examination_id
WHERE r.marks_obtained > (
    SELECT AVG(r2.marks_obtained)
    FROM public.results r2
    INNER JOIN public.applications a2 ON r2.application_id = a2.application_id
    WHERE a2.examination_id = a.examination_id
)
ORDER BY r.marks_obtained DESC;

-- End of File: database/queries.sql
