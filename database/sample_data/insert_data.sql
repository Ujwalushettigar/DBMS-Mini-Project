-- ============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/sample_data/insert_data.sql
-- Description: Realistic demonstration dummy dataset for all nine tables.
--
-- IMPORTANT PREREQUISITES:
-- 1. Run database/schema/create_tables.sql in Supabase SQL Editor.
-- 2. Register the following 4 demo accounts via Supabase Auth (Signup):
--      • admin.demo@example.com (Administrator)
--      • rahul.demo@example.com (Candidate 1)
--      • priya.demo@example.com (Candidate 2)
--      • arjun.demo@example.com (Candidate 3)
-- 3. Promote the admin account in Supabase SQL Editor using:
--      UPDATE public.profiles SET role = 'admin' WHERE email = 'admin.demo@example.com';
-- ============================================================================

-- ============================================================================
-- PREREQUISITE VALIDATION BLOCK
-- Verifies that all 4 required Supabase Auth profiles exist before inserting data.
-- If any profile is missing, raises an exception and halts execution.
-- ============================================================================
DO $$
DECLARE
    v_missing_profiles TEXT := '';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin.demo@example.com') THEN
        v_missing_profiles := v_missing_profiles || '  - admin.demo@example.com (Administrator)' || chr(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'rahul.demo@example.com') THEN
        v_missing_profiles := v_missing_profiles || '  - rahul.demo@example.com (Candidate 1)' || chr(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'priya.demo@example.com') THEN
        v_missing_profiles := v_missing_profiles || '  - priya.demo@example.com (Candidate 2)' || chr(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'arjun.demo@example.com') THEN
        v_missing_profiles := v_missing_profiles || '  - arjun.demo@example.com (Candidate 3)' || chr(10);
    END IF;

    IF v_missing_profiles <> '' THEN
        RAISE EXCEPTION E'\n========================================================================\n[PREREQUISITE CHECK FAILED] Required demonstration accounts missing!\n========================================================================\nPlease register the following accounts via Supabase Auth before running this script:\n%\nAlso ensure the admin account is promoted using:\n  UPDATE public.profiles SET role = ''admin'' WHERE email = ''admin.demo@example.com'';\n========================================================================', v_missing_profiles;
    END IF;

    RAISE NOTICE 'Prerequisite check passed: All 4 demonstration profiles are registered in public.profiles.';
END $$;

BEGIN;

-- ============================================================================
-- 1. CANDIDATES (Three Records)
-- Linked to registered Auth profiles via email lookup.
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
    '11111111-1111-4111-8111-111111111111',
    (SELECT id FROM public.profiles WHERE email = 'rahul.demo@example.com'),
    'CAND2027001',
    'Rahul Sharma',
    DATE '1999-05-14',
    'Male',
    '9880123456',
    '#102, 4th Cross, Malleshwaram',
    'Bengaluru',
    'Karnataka',
    '560003',
    'General',
    NOW(),
    NOW()
),
(
    '22222222-2222-4222-8222-222222222222',
    (SELECT id FROM public.profiles WHERE email = 'priya.demo@example.com'),
    'CAND2027002',
    'Priya Nair',
    DATE '2000-08-22',
    'Female',
    '9880654321',
    '#45, Kadri Temple Road',
    'Mangaluru',
    'Karnataka',
    '575002',
    'OBC',
    NOW(),
    NOW()
),
(
    '33333333-3333-4333-8333-333333333333',
    (SELECT id FROM public.profiles WHERE email = 'arjun.demo@example.com'),
    'CAND2027003',
    'Arjun Patel',
    DATE '1998-11-30',
    'Male',
    '9820112233',
    'Flat 301, Sea Breeze Apartments, Bandra West',
    'Mumbai',
    'Maharashtra',
    '400050',
    'General',
    NOW(),
    NOW()
)
ON CONFLICT (candidate_id) DO NOTHING;

-- ============================================================================
-- 2. EDUCATIONAL QUALIFICATIONS (Eight Records)
-- Each candidate has at least 2 qualifications covering SSLC, PUC, and B.E.
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
-- Qualifications for Candidate 1 (Rahul Sharma)
(
    '41111111-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'SSLC',
    'National High School, Basavanagudi',
    'Karnataka Secondary Education Examination Board',
    2015,
    88.50,
    NOW()
),
(
    '41111111-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'PUC',
    'MES Pre-University College, Malleshwaram',
    'Department of Pre-University Education, Karnataka',
    2017,
    85.20,
    NOW()
),
(
    '41111111-0000-4000-8000-000000000003',
    '11111111-1111-4111-8111-111111111111',
    'B.E.',
    'B.M.S. College of Engineering, Bengaluru',
    'Visvesvaraya Technological University',
    2021,
    81.40,
    NOW()
),
-- Qualifications for Candidate 2 (Priya Nair)
(
    '42222222-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'SSLC',
    'St. Aloysius High School, Mangaluru',
    'Karnataka Secondary Education Examination Board',
    2016,
    92.00,
    NOW()
),
(
    '42222222-0000-4000-8000-000000000002',
    '22222222-2222-4222-8222-222222222222',
    'PUC',
    'Canara Pre-University College, Mangaluru',
    'Department of Pre-University Education, Karnataka',
    2018,
    89.60,
    NOW()
),
(
    '42222222-0000-4000-8000-000000000003',
    '22222222-2222-4222-8222-222222222222',
    'B.E.',
    'NMAM Institute of Technology, Nitte',
    'Visvesvaraya Technological University',
    2022,
    84.75,
    NOW()
),
-- Qualifications for Candidate 3 (Arjun Patel)
(
    '43333333-0000-4000-8000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'SSLC',
    'St. Xavier''s High School, Fort, Mumbai',
    'Maharashtra State Board of Secondary and Higher Secondary Education',
    2014,
    87.20,
    NOW()
),
(
    '43333333-0000-4000-8000-000000000002',
    '33333333-3333-4333-8333-333333333333',
    'B.E.',
    'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    'University of Mumbai',
    2020,
    79.80,
    NOW()
)
ON CONFLICT (qualification_id) DO NOTHING;

-- ============================================================================
-- 3. EXAMINATIONS (Three Records)
-- Conducted in 2027 by KPSC, SSC, and UPSC.
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
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'KSGRE2027',
    'Karnataka State Government Recruitment Examination 2027',
    'Karnataka Public Service Commission',
    'Recruitment examination for Group A and B administrative posts across Karnataka State Civil Services.',
    'Bachelor degree in any discipline from a recognized University. Age between 21 and 35 years.',
    DATE '2027-01-10',
    DATE '2027-03-31',
    DATE '2027-06-20',
    500.00,
    250,
    'open',
    (SELECT id FROM public.profiles WHERE email = 'admin.demo@example.com'),
    NOW(),
    NOW()
),
(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'CGCRE2027',
    'Central Government Clerical Recruitment Examination 2027',
    'Staff Selection Commission',
    'National level competitive test for Lower Division Clerk, Junior Secretariat Assistant, and Data Entry Operator positions.',
    '12th Standard or equivalent from a recognized board. Age between 18 and 27 years.',
    DATE '2027-02-01',
    DATE '2027-04-15',
    DATE '2027-07-10',
    300.00,
    500,
    'open',
    (SELECT id FROM public.profiles WHERE email = 'admin.demo@example.com'),
    NOW(),
    NOW()
),
(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'NASPE2027',
    'National Administrative Services Preliminary Examination 2027',
    'Union Public Service Commission',
    'Premier civil services screening examination for selection to prestigious all-India administrative and police cadres.',
    'Degree from an incorporated university. Age criteria 21 to 32 years.',
    DATE '2027-01-15',
    DATE '2027-03-15',
    DATE '2027-05-23',
    100.00,
    100,
    'upcoming',
    (SELECT id FROM public.profiles WHERE email = 'admin.demo@example.com'),
    NOW(),
    NOW()
)
ON CONFLICT (examination_id) DO NOTHING;

-- ============================================================================
-- 4. EXAM CENTERS (Three Records)
-- Physical venues located in Bengaluru, Mangaluru, and Mumbai.
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
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'BLR-GFGC-01',
    'Government First Grade College, Bengaluru',
    'Post Office Road, K.R. Circle',
    'Bengaluru',
    'Karnataka',
    '560001',
    '080-22214567',
    600,
    NOW()
),
(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'MNG-UCOL-02',
    'University College, Mangaluru',
    'Hampankatta Road',
    'Mangaluru',
    'Karnataka',
    '575001',
    '0824-2422345',
    500,
    NOW()
),
(
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'MUM-GEC-03',
    'Government Engineering College, Mumbai',
    'Mahapalika Marg, Dhobi Talao',
    'Mumbai',
    'Maharashtra',
    '400001',
    '022-22620601',
    750,
    NOW()
)
ON CONFLICT (center_id) DO NOTHING;

-- ============================================================================
-- 5. EXAMINATION CENTERS (Seven Allocations)
-- Maps examinations to centers; allocated_capacity <= total_capacity.
-- ============================================================================
INSERT INTO public.examination_centers (
    examination_id,
    center_id,
    allocated_capacity,
    created_at
) VALUES
-- KSGRE2027 allocations
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    300,
    NOW()
),
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    200,
    NOW()
),
-- CGCRE2027 allocations
(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    250,
    NOW()
),
(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    400,
    NOW()
),
-- NASPE2027 allocations
(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    200,
    NOW()
),
(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    150,
    NOW()
),
(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    300,
    NOW()
)
ON CONFLICT (examination_id, center_id) DO NOTHING;

-- ============================================================================
-- 6. APPLICATIONS (Four Records)
-- Every (examination_id, center_id) exists in examination_centers.
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
(
    '10000000-0000-4000-8000-000000000001',
    'APP2027001',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '2027-01-20 10:15:00+05:30',
    'approved',
    'paid',
    'Candidate eligibility and documents verified successfully.',
    NOW()
),
(
    '10000000-0000-4000-8000-000000000002',
    'APP2027002',
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '2027-01-25 14:30:00+05:30',
    'approved',
    'paid',
    'OBC category reservation documents confirmed.',
    NOW()
),
(
    '10000000-0000-4000-8000-000000000003',
    'APP2027003',
    '33333333-3333-4333-8333-333333333333',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    '2027-02-10 11:00:00+05:30',
    'approved',
    'paid',
    'Application scrutinised and approved for clerical recruitment.',
    NOW()
),
(
    '10000000-0000-4000-8000-000000000004',
    'APP2027004',
    '11111111-1111-4111-8111-111111111111',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '2027-02-15 16:45:00+05:30',
    'submitted',
    'pending',
    'Online submission received, awaiting fee clearance.',
    NOW()
)
ON CONFLICT (application_id) DO NOTHING;

-- ============================================================================
-- 7. ADMIT CARDS (Three Records)
-- Issued exclusively for approved examination applications.
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
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'AC2027001',
    'ROLL2027101',
    DATE '2027-05-15',
    TIME '08:30:00',
    '1. Bring original Government Photo ID and printed Admit Card.\n2. Arrive at least 45 minutes before reporting time.\n3. Electronic devices are strictly prohibited.',
    'https://example.com/admit-cards/AC2027001.pdf',
    NOW()
),
(
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'AC2027002',
    'ROLL2027102',
    DATE '2027-05-15',
    TIME '08:30:00',
    '1. Carry printed Hall Ticket and valid Identity Proof.\n2. Report to Examination Hall by 08:30 AM.',
    'https://example.com/admit-cards/AC2027002.pdf',
    NOW()
),
(
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    'AC2027003',
    'ROLL2027201',
    DATE '2027-06-01',
    TIME '09:00:00',
    '1. Bring original Photo ID proof.\n2. Smartwatches and mobile phones are prohibited inside the examination center.',
    'https://example.com/admit-cards/AC2027003.pdf',
    NOW()
)
ON CONFLICT (admit_card_id) DO NOTHING;

-- ============================================================================
-- 8. RESULTS (Three Records)
-- Evaluation marks, ranks, and pass/fail statuses for tested candidates.
-- ============================================================================
INSERT INTO public.results (
    result_id,
    application_id,
    marks_obtained,
    maximum_marks,
    rank,
    result_status,
    published_at,
    remarks,
    created_at
) VALUES
(
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    86.50,
    100.00,
    1,
    'pass',
    '2027-07-15 10:00:00+05:30',
    'Qualified for interview round with top merit score.',
    NOW()
),
(
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    78.00,
    100.00,
    2,
    'pass',
    '2027-07-15 10:00:00+05:30',
    'Qualified under OBC reservation category quota.',
    NOW()
),
(
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    92.50,
    100.00,
    1,
    'pass',
    '2027-08-01 11:00:00+05:30',
    'Secured overall 1st rank in Central Clerical Examination.',
    NOW()
)
ON CONFLICT (result_id) DO NOTHING;

COMMIT;

