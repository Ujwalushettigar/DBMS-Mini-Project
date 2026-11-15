-- ============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/sample_data/insert_data.sql
-- Description: Complete, realistic, and idempotent demonstration dataset
--              for all nine relational tables.
--
-- EXECUTION ORDER:
-- 1. Execute database/schema/create_tables.sql in Supabase SQL Editor.
-- 2. From backend directory, run: npm run seed:users
--    (Alternatively, register the 4 demo accounts via your frontend /register page)
-- 3. Execute this file (database/sample_data/insert_data.sql) in Supabase SQL Editor.
-- 4. Execute queries from database/queries/queries.sql to test DBMS concepts.
-- ============================================================================

-- ============================================================================
-- PREREQUISITE VALIDATION BLOCK
-- Verifies that all 4 required Supabase Auth profiles exist before inserting data.
-- If any profile is missing, raises an exception pointing to `npm run seed:users`.
-- ============================================================================
DO $$
DECLARE
    v_admin_email TEXT;
    v_cand1_email TEXT;
    v_cand2_email TEXT;
    v_cand3_email TEXT;
    v_missing TEXT := '';
BEGIN
    -- Check Admin account (accepts admin@gov.in or admin.demo@example.com)
    SELECT email INTO v_admin_email FROM public.profiles 
    WHERE email IN ('admin@gov.in', 'admin.demo@example.com', 'admin.recruitment@gov.in') LIMIT 1;
    IF v_admin_email IS NULL THEN
        v_missing := v_missing || '  - Administrator: admin@gov.in' || chr(10);
    END IF;

    -- Check Candidate 1 (Rahul)
    SELECT email INTO v_cand1_email FROM public.profiles 
    WHERE email IN ('rahul.sharma@example.com', 'rahul.demo@example.com', 'rohan.sharma@example.com') LIMIT 1;
    IF v_cand1_email IS NULL THEN
        v_missing := v_missing || '  - Candidate 1: rahul.sharma@example.com' || chr(10);
    END IF;

    -- Check Candidate 2 (Priya)
    SELECT email INTO v_cand2_email FROM public.profiles 
    WHERE email IN ('priya.patel@example.com', 'priya.demo@example.com') LIMIT 1;
    IF v_cand2_email IS NULL THEN
        v_missing := v_missing || '  - Candidate 2: priya.patel@example.com' || chr(10);
    END IF;

    -- Check Candidate 3 (Amit)
    SELECT email INTO v_cand3_email FROM public.profiles 
    WHERE email IN ('amit.kumar@example.com', 'amit.verma@example.com', 'arjun.demo@example.com') LIMIT 1;
    IF v_cand3_email IS NULL THEN
        v_missing := v_missing || '  - Candidate 3: amit.kumar@example.com' || chr(10);
    END IF;

    IF v_missing <> '' THEN
        RAISE EXCEPTION E'\n========================================================================\n[PREREQUISITE CHECK FAILED] Required demonstration accounts missing!\n========================================================================\nPlease create the required demonstration accounts by running:\n  cd backend\n  npm run seed:users\n\nor register these accounts via Supabase Auth / Signup:\n%\n========================================================================', v_missing;
    END IF;

    -- Ensure admin account has role = 'admin'
    UPDATE public.profiles 
    SET role = 'admin', updated_at = NOW() 
    WHERE email = v_admin_email AND role <> 'admin';

    RAISE NOTICE 'Prerequisite check passed! Proceeding with idempotent dataset insertion.';
END $$;

BEGIN;

-- ============================================================================
-- 1. CANDIDATES (Three Core Aspirant Records)
-- Linked to registered public.profiles records via email resolution.
-- ============================================================================
INSERT INTO public.candidates (
    candidate_id,
    user_id,
    candidate_number,
    full_name,
    date_of_birth,
    gender,
    phone_number,
    address,
    city,
    state,
    pincode,
    category,
    created_at,
    updated_at
) VALUES
(
    'd1000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.profiles WHERE email IN ('rahul.sharma@example.com', 'rahul.demo@example.com', 'rohan.sharma@example.com') LIMIT 1),
    'CND-2027-00101',
    'Rahul Sharma',
    DATE '1998-04-12',
    'Male',
    '9811223344',
    'Flat 402, Shanti Vihar, Sector 15',
    'New Delhi',
    'Delhi',
    '110001',
    'General',
    TIMESTAMPTZ '2026-01-05 10:05:00+00',
    TIMESTAMPTZ '2026-01-05 10:05:00+00'
),
(
    'd1000000-0000-0000-0000-000000000002',
    (SELECT id FROM public.profiles WHERE email IN ('priya.patel@example.com', 'priya.demo@example.com') LIMIT 1),
    'CND-2027-00102',
    'Priya Patel',
    DATE '1999-07-25',
    'Female',
    '9822334455',
    '34, 4th Cross, Malleshwaram',
    'Bengaluru',
    'Karnataka',
    '560003',
    'OBC',
    TIMESTAMPTZ '2026-01-06 11:35:00+00',
    TIMESTAMPTZ '2026-01-06 11:35:00+00'
),
(
    'd1000000-0000-0000-0000-000000000003',
    (SELECT id FROM public.profiles WHERE email IN ('amit.kumar@example.com', 'amit.verma@example.com', 'arjun.demo@example.com') LIMIT 1),
    'CND-2027-00103',
    'Amit Kumar',
    DATE '1997-11-19',
    'Male',
    '9833445566',
    'Flat 102, Gomti Nagar',
    'Lucknow',
    'Uttar Pradesh',
    '226010',
    'SC',
    TIMESTAMPTZ '2026-01-07 14:20:00+00',
    TIMESTAMPTZ '2026-01-07 14:20:00+00'
)
ON CONFLICT (candidate_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    candidate_number = EXCLUDED.candidate_number,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ============================================================================
-- 2. EDUCATIONAL QUALIFICATIONS (Eight Academic Records)
-- Multi-tier academic credentials across candidates (1:N relationship).
-- ============================================================================
INSERT INTO public.educational_qualifications (
    qualification_id,
    candidate_id,
    qualification_level,
    institution_name,
    board_or_university,
    passing_year,
    percentage,
    created_at
) VALUES
-- Candidate 1: Rahul Sharma (SSLC, PUC, Undergraduate)
(
    'q1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',
    'SSLC',
    'Delhi Public School, RK Puram',
    'CBSE',
    2015,
    91.50,
    TIMESTAMPTZ '2026-01-05 10:10:00+00'
),
(
    'q1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000001',
    'PUC',
    'Delhi Public School, RK Puram',
    'CBSE',
    2017,
    89.20,
    TIMESTAMPTZ '2026-01-05 10:11:00+00'
),
(
    'q1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000001',
    'Undergraduate',
    'Delhi Technological University',
    'DTU',
    2021,
    84.20,
    TIMESTAMPTZ '2026-01-05 10:12:00+00'
),
-- Candidate 2: Priya Patel (SSLC, PUC, Undergraduate)
(
    'q1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000002',
    'SSLC',
    'National Public School, Indiranagar',
    'Karnataka State Board',
    2015,
    93.40,
    TIMESTAMPTZ '2026-01-06 11:38:00+00'
),
(
    'q1000000-0000-0000-0000-000000000005',
    'd1000000-0000-0000-0000-000000000002',
    'PUC',
    'MES Pre-University College',
    'Karnataka PUE Board',
    2017,
    90.10,
    TIMESTAMPTZ '2026-01-06 11:39:00+00'
),
(
    'q1000000-0000-0000-0000-000000000006',
    'd1000000-0000-0000-0000-000000000002',
    'Undergraduate',
    'BMS College of Engineering',
    'VTU Belagavi',
    2021,
    88.00,
    TIMESTAMPTZ '2026-01-06 11:40:00+00'
),
-- Candidate 3: Amit Kumar (SSLC, Undergraduate)
(
    'q1000000-0000-0000-0000-000000000007',
    'd1000000-0000-0000-0000-000000000003',
    'SSLC',
    'La Martiniere College, Lucknow',
    'ICSE',
    2014,
    86.50,
    TIMESTAMPTZ '2026-01-07 14:22:00+00'
),
(
    'q1000000-0000-0000-0000-000000000008',
    'd1000000-0000-0000-0000-000000000003',
    'Undergraduate',
    'University of Lucknow',
    'Lucknow University',
    2020,
    81.25,
    TIMESTAMPTZ '2026-01-07 14:25:00+00'
)
ON CONFLICT (qualification_id) DO UPDATE
SET percentage = EXCLUDED.percentage,
    passing_year = EXCLUDED.passing_year,
    institution_name = EXCLUDED.institution_name,
    board_or_university = EXCLUDED.board_or_university;

-- ============================================================================
-- 3. EXAMINATIONS (Three Public Recruitment Notices Scheduled for 2027)
-- Active application dates allow live web portal testing.
-- ============================================================================
INSERT INTO public.examinations (
    examination_id,
    examination_code,
    examination_name,
    conducting_authority,
    description,
    eligibility_criteria,
    application_start_date,
    application_end_date,
    examination_date,
    application_fee,
    total_vacancies,
    examination_status,
    created_by,
    created_at,
    updated_at
) VALUES
(
    'e1000000-0000-0000-0000-000000000001',
    'SSC-CGL-2027',
    'Combined Graduate Level Examination 2027',
    'Staff Selection Commission',
    'Nationwide recruitment for Group B and Group C non-technical posts across Ministries of India.',
    'Graduation from any recognized university. Age between 18 and 32 years.',
    DATE '2026-10-01',
    DATE '2027-06-30',
    DATE '2027-09-15',
    100.00,
    8400,
    'published',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    TIMESTAMPTZ '2026-10-01 09:00:00+00',
    TIMESTAMPTZ '2026-10-01 09:00:00+00'
),
(
    'e1000000-0000-0000-0000-000000000002',
    'UPSC-CSE-2027',
    'Civil Services (Preliminary) Examination 2027',
    'Union Public Service Commission',
    'Premier national competitive examination for IAS, IPS, and IFS cadres.',
    'Bachelors Degree in any discipline. Age limit 21 to 32 years.',
    DATE '2026-11-01',
    DATE '2027-07-31',
    DATE '2027-10-20',
    100.00,
    1056,
    'published',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    TIMESTAMPTZ '2026-11-01 10:00:00+00',
    TIMESTAMPTZ '2026-11-01 10:00:00+00'
),
(
    'e1000000-0000-0000-0000-000000000003',
    'RRB-NTPC-2027',
    'Non-Technical Popular Categories (NTPC) 2027',
    'Railway Recruitment Control Board',
    'Recruitment of Station Master, Commercial Clerk, and Goods Guard across 21 railway divisions.',
    '12th Standard or Bachelor Degree depending on category.',
    DATE '2026-08-01',
    DATE '2027-05-30',
    DATE '2027-08-10',
    250.00,
    11558,
    'completed',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    TIMESTAMPTZ '2026-08-01 08:30:00+00',
    TIMESTAMPTZ '2026-08-01 08:30:00+00'
)
ON CONFLICT (examination_id) DO UPDATE
SET examination_name = EXCLUDED.examination_name,
    application_start_date = EXCLUDED.application_start_date,
    application_end_date = EXCLUDED.application_end_date,
    examination_date = EXCLUDED.examination_date,
    examination_status = EXCLUDED.examination_status,
    total_vacancies = EXCLUDED.total_vacancies,
    updated_at = NOW();

-- ============================================================================
-- 4. EXAM CENTERS (Four Accredited Physical Venues Across Metropolitan Hubs)
-- ============================================================================
INSERT INTO public.exam_centers (
    center_id,
    center_code,
    center_name,
    address,
    city,
    state,
    pincode,
    contact_number,
    total_capacity,
    created_at
) VALUES
(
    'f1000000-0000-0000-0000-000000000001',
    'DEL-KV-101',
    'Kendriya Vidyalaya No. 1 Delhi Cantt',
    'Sadhu Vaswani Marg, Delhi Cantt, New Delhi',
    'New Delhi',
    'Delhi',
    '110010',
    '011-25691234',
    600,
    TIMESTAMPTZ '2026-01-02 10:00:00+00'
),
(
    'f1000000-0000-0000-0000-000000000002',
    'BLR-GAC-201',
    'Government Arts and Science College',
    'Post Office Road, K.R. Circle, Bengaluru',
    'Bengaluru',
    'Karnataka',
    '560001',
    '080-22214567',
    500,
    TIMESTAMPTZ '2026-01-02 10:30:00+00'
),
(
    'f1000000-0000-0000-0000-000000000003',
    'LKO-NP-301',
    'National Post Graduate College',
    '2 Rana Pratap Marg, Hazratganj, Lucknow',
    'Lucknow',
    'Uttar Pradesh',
    '226001',
    '0522-2612345',
    450,
    TIMESTAMPTZ '2026-01-02 11:00:00+00'
),
(
    'f1000000-0000-0000-0000-000000000004',
    'MUM-GEC-401',
    'Government Polytechnic Bandra',
    '49 Kherwadi, Ali Yavar Jung Marg, Bandra East, Mumbai',
    'Mumbai',
    'Maharashtra',
    '400051',
    '022-26474580',
    550,
    TIMESTAMPTZ '2026-01-02 11:30:00+00'
)
ON CONFLICT (center_id) DO UPDATE
SET center_name = EXCLUDED.center_name,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    total_capacity = EXCLUDED.total_capacity;

-- ============================================================================
-- 5. EXAMINATION CENTERS (Seven Junction Allocations)
-- Maps exams to accredited centers with designated quotas (M:N junction).
-- ============================================================================
INSERT INTO public.examination_centers (
    examination_id,
    center_id,
    allocated_capacity,
    created_at
) VALUES
-- Exam 1: SSC-CGL-2027 allocations
(
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    300,
    TIMESTAMPTZ '2026-10-02 10:00:00+00'
),
(
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000002',
    250,
    TIMESTAMPTZ '2026-10-02 10:00:00+00'
),
(
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000004',
    250,
    TIMESTAMPTZ '2026-10-02 10:00:00+00'
),
-- Exam 2: UPSC-CSE-2027 allocations
(
    'e1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000001',
    250,
    TIMESTAMPTZ '2026-11-02 10:30:00+00'
),
(
    'e1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000002',
    200,
    TIMESTAMPTZ '2026-11-02 10:30:00+00'
),
(
    'e1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000003',
    200,
    TIMESTAMPTZ '2026-11-02 10:30:00+00'
),
-- Exam 3: RRB-NTPC-2027 allocation
(
    'e1000000-0000-0000-0000-000000000003',
    'f1000000-0000-0000-0000-000000000003',
    350,
    TIMESTAMPTZ '2026-08-02 09:00:00+00'
)
ON CONFLICT (examination_id, center_id) DO UPDATE
SET allocated_capacity = EXCLUDED.allocated_capacity;

-- ============================================================================
-- 6. APPLICATIONS (Four Candidate Applications Across Exams)
-- ============================================================================
INSERT INTO public.applications (
    application_id,
    application_number,
    candidate_id,
    examination_id,
    center_id,
    applied_at,
    application_status,
    payment_status,
    remarks,
    updated_at
) VALUES
-- Application 1: Rahul on SSC CGL
(
    'b1000000-0000-0000-0000-000000000001',
    'APP-2027-0001',
    'd1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    TIMESTAMPTZ '2026-10-15 10:15:00+00',
    'accepted',
    'paid',
    'Application documents and identity verified.',
    TIMESTAMPTZ '2026-10-16 14:00:00+00'
),
-- Application 2: Priya on SSC CGL
(
    'b1000000-0000-0000-0000-000000000002',
    'APP-2027-0002',
    'd1000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000002',
    TIMESTAMPTZ '2026-10-18 11:20:00+00',
    'accepted',
    'paid',
    'Eligibility confirmed.',
    TIMESTAMPTZ '2026-10-19 16:00:00+00'
),
-- Application 3: Amit on RRB NTPC
(
    'b1000000-0000-0000-0000-000000000003',
    'APP-2027-0003',
    'd1000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000003',
    'f1000000-0000-0000-0000-000000000003',
    TIMESTAMPTZ '2026-08-20 14:00:00+00',
    'accepted',
    'paid',
    'Approved for RRB examination.',
    TIMESTAMPTZ '2026-08-21 10:00:00+00'
),
-- Application 4: Rahul on UPSC CSE (Submitted / Pending Review)
(
    'b1000000-0000-0000-0000-000000000004',
    'APP-2027-0004',
    'd1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000001',
    TIMESTAMPTZ '2026-11-05 09:30:00+00',
    'submitted',
    'paid',
    'Application under administrative scrutiny.',
    TIMESTAMPTZ '2026-11-05 09:30:00+00'
)
ON CONFLICT (application_id) DO UPDATE
SET application_status = EXCLUDED.application_status,
    payment_status = EXCLUDED.payment_status,
    remarks = EXCLUDED.remarks,
    updated_at = NOW();

-- ============================================================================
-- 7. ADMIT CARDS (Three Issued Examination Hall Tickets)
-- Generated for accepted applications with unique roll numbers.
-- ============================================================================
INSERT INTO public.admit_cards (
    admit_card_id,
    application_id,
    admit_card_number,
    roll_number,
    issue_date,
    reporting_time,
    examination_instructions,
    admit_card_file_url,
    created_at
) VALUES
(
    'ac000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'AC-2027-0001',
    'ROLL-SSCCGL-27001',
    DATE '2027-08-25',
    TIME '08:30:00',
    '1. Bring original Government Photo ID.' || chr(10) || '2. Carry printed Admit Card.' || chr(10) || '3. Electronic items are strictly prohibited.',
    NULL,
    TIMESTAMPTZ '2027-08-25 09:00:00+00'
),
(
    'ac000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    'AC-2027-0002',
    'ROLL-SSCCGL-27002',
    DATE '2027-08-25',
    TIME '08:30:00',
    '1. Bring original Government Photo ID.' || chr(10) || '2. Carry printed Admit Card.',
    NULL,
    TIMESTAMPTZ '2027-08-25 09:00:00+00'
),
(
    'ac000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003',
    'AC-2027-0003',
    'ROLL-RRBNTPC-27001',
    DATE '2027-07-20',
    TIME '08:30:00',
    '1. Bring original Photo ID card.' || chr(10) || '2. Arrive 45 minutes before exam schedule.',
    NULL,
    TIMESTAMPTZ '2027-07-20 09:00:00+00'
)
ON CONFLICT (admit_card_id) DO UPDATE
SET roll_number = EXCLUDED.roll_number,
    issue_date = EXCLUDED.issue_date,
    reporting_time = EXCLUDED.reporting_time;

-- ============================================================================
-- 8. RESULTS (Three Official Candidate Scorecards)
-- Demonstrates percentage computation, ranking, pass/fail, and publication states.
-- ============================================================================
INSERT INTO public.results (
    result_id,
    application_id,
    marks_obtained,
    maximum_marks,
    rank,
    result_status,
    is_published,
    published_at,
    remarks,
    created_at
) VALUES
-- Rahul Sharma (Score: 86.50/100, Rank 1 in exam)
(
    'r1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    86.50,
    100.00,
    1,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-09-25 10:00:00+00',
    'Qualified for document verification round.',
    TIMESTAMPTZ '2027-09-25 09:30:00+00'
),
-- Priya Patel (Score: 78.00/100, Rank 2 in exam)
(
    'r1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    78.00,
    100.00,
    2,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-09-25 10:00:00+00',
    'Qualified for document verification round.',
    TIMESTAMPTZ '2027-09-25 09:30:00+00'
),
-- Amit Kumar (Score: 92.50/100, Rank 1 in exam)
(
    'r1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003',
    92.50,
    100.00,
    1,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-08-20 10:00:00+00',
    'Selected in top merit list for Station Master.',
    TIMESTAMPTZ '2027-08-20 09:30:00+00'
)
ON CONFLICT (result_id) DO UPDATE
SET marks_obtained = EXCLUDED.marks_obtained,
    maximum_marks = EXCLUDED.maximum_marks,
    rank = EXCLUDED.rank,
    result_status = EXCLUDED.result_status,
    is_published = EXCLUDED.is_published,
    published_at = EXCLUDED.published_at,
    remarks = EXCLUDED.remarks;

COMMIT;

-- Verification of inserted records
SELECT 'candidates' AS table_name, COUNT(*) AS count FROM public.candidates
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
