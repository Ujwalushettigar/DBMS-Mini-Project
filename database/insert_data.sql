-- ==============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/insert_data.sql
-- Description: Complete, realistic, and idempotent demonstration dataset
--              for all nine relational tables.
--
-- EXECUTION INSTRUCTIONS:
-- 1. In Supabase: Run `npm run seed:users` from the `backend/` directory to create
--    the demonstration accounts in Supabase Auth, or register them on the frontend.
-- 2. Execute this file in the Supabase SQL Editor.
-- ==============================================================================

-- ==============================================================================
-- PREREQUISITE PROVISIONING BLOCK
-- Ensures profile accounts exist for both Supabase Auth and Standalone PostgreSQL
-- ==============================================================================
DO $$
DECLARE
    v_has_auth BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO v_has_auth;

    -- If standalone PostgreSQL (no auth.users schema), provision demo profiles directly
    IF NOT v_has_auth THEN
        INSERT INTO public.profiles (id, email, role) VALUES
            ('a1000000-0000-0000-0000-000000000001', 'admin@gov.in', 'admin'),
            ('c1000000-0000-0000-0000-000000000001', 'rahul.sharma@example.com', 'candidate'),
            ('c1000000-0000-0000-0000-000000000002', 'priya.patel@example.com', 'candidate'),
            ('c1000000-0000-0000-0000-000000000003', 'amit.kumar@example.com', 'candidate'),
            ('c1000000-0000-0000-0000-000000000004', 'sneha.rao@example.com', 'candidate'),
            ('c1000000-0000-0000-0000-000000000005', 'vikram.singh@example.com', 'candidate')
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;
    END IF;
END $$;

BEGIN;

-- ==============================================================================
-- 1. CANDIDATES (5+ Registered Aspirants)
-- ==============================================================================
-- Dynamic user ID resolution ensures compatibility with both Supabase Auth and Standalone
WITH user_lookup AS (
    SELECT 
        id, 
        email 
    FROM public.profiles
)
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
    category
) VALUES
(
    'd1000000-0000-0000-0000-000000000001',
    COALESCE(
        (SELECT id FROM public.profiles WHERE email = 'rahul.sharma@example.com' LIMIT 1),
        'c1000000-0000-0000-0000-000000000001'
    ),
    'CND-2027-00101',
    'Rahul Sharma',
    DATE '1998-04-12',
    'Male',
    '9811223344',
    'Flat 402, Shanti Vihar, Sector 15',
    'New Delhi',
    'Delhi',
    '110001',
    'General'
),
(
    'd1000000-0000-0000-0000-000000000002',
    COALESCE(
        (SELECT id FROM public.profiles WHERE email = 'priya.patel@example.com' LIMIT 1),
        'c1000000-0000-0000-0000-000000000002'
    ),
    'CND-2027-00102',
    'Priya Patel',
    DATE '1999-07-25',
    'Female',
    '9822334455',
    '34, 4th Cross, Malleshwaram',
    'Bengaluru',
    'Karnataka',
    '560003',
    'OBC'
),
(
    'd1000000-0000-0000-0000-000000000003',
    COALESCE(
        (SELECT id FROM public.profiles WHERE email = 'amit.kumar@example.com' LIMIT 1),
        'c1000000-0000-0000-0000-000000000003'
    ),
    'CND-2027-00103',
    'Amit Kumar',
    DATE '1997-11-19',
    'Male',
    '9833445566',
    'Flat 102, Gomti Nagar',
    'Lucknow',
    'Uttar Pradesh',
    '226010',
    'SC'
),
(
    'd1000000-0000-0000-0000-000000000004',
    COALESCE(
        (SELECT id FROM public.profiles WHERE email = 'sneha.rao@example.com' LIMIT 1),
        'c1000000-0000-0000-0000-000000000004'
    ),
    'CND-2027-00104',
    'Sneha Rao',
    DATE '2000-01-14',
    'Female',
    '9844556677',
    '12, Shivaji Park, Dadar West',
    'Mumbai',
    'Maharashtra',
    '400028',
    'General'
),
(
    'd1000000-0000-0000-0000-000000000005',
    COALESCE(
        (SELECT id FROM public.profiles WHERE email = 'vikram.singh@example.com' LIMIT 1),
        'c1000000-0000-0000-0000-000000000005'
    ),
    'CND-2027-00105',
    'Vikram Singh',
    DATE '1996-09-30',
    'Male',
    '9855667788',
    '56, Salt Lake Sector 1',
    'Kolkata',
    'West Bengal',
    '700064',
    'EWS'
)
ON CONFLICT (candidate_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    category = EXCLUDED.category;

-- ==============================================================================
-- 2. EDUCATIONAL QUALIFICATIONS (12+ Academic Pedigree Records)
-- ==============================================================================
INSERT INTO public.educational_qualifications (
    qualification_id,
    candidate_id,
    qualification_level,
    institution_name,
    board_or_university,
    passing_year,
    percentage
) VALUES
-- Candidate 1: Rahul Sharma (SSLC, PUC, B.E.)
('q1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'SSLC', 'Delhi Public School, RK Puram', 'CBSE', 2015, 91.50),
('q1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'PUC', 'Delhi Public School, RK Puram', 'CBSE', 2017, 89.20),
('q1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Undergraduate', 'Delhi Technological University', 'DTU', 2021, 84.20),

-- Candidate 2: Priya Patel (SSLC, PUC, B.E.)
('q1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'SSLC', 'National Public School, Indiranagar', 'Karnataka State Board', 2015, 93.40),
('q1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'PUC', 'MES Pre-University College', 'Karnataka PUE Board', 2017, 90.10),
('q1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000002', 'Undergraduate', 'BMS College of Engineering', 'VTU Belagavi', 2021, 88.00),

-- Candidate 3: Amit Kumar (SSLC, Degree, PG)
('q1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000003', 'SSLC', 'La Martiniere College, Lucknow', 'ICSE', 2014, 86.50),
('q1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003', 'Undergraduate', 'University of Lucknow', 'Lucknow University', 2020, 81.25),
('q1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000003', 'Postgraduate', 'Jawaharlal Nehru University', 'JNU New Delhi', 2022, 79.50),

-- Candidate 4: Sneha Rao (10th, 12th, B.Com)
('q1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000004', 'SSLC', 'Balmohan Vidyamandir', 'Maharashtra State Board', 2016, 92.80),
('q1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000004', 'Undergraduate', 'St. Xaviers College Mumbai', 'Mumbai University', 2021, 85.40),

-- Candidate 5: Vikram Singh (10th, 12th, B.Tech)
('q1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000005', 'SSLC', 'South Point High School', 'WBBSE', 2013, 89.00),
('q1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000005', 'Undergraduate', 'Jadavpur University', 'Jadavpur University', 2018, 83.10)
ON CONFLICT (qualification_id) DO UPDATE SET
    percentage = EXCLUDED.percentage,
    passing_year = EXCLUDED.passing_year;

-- ==============================================================================
-- 3. EXAMINATIONS (4 National Recruitment Notifications)
-- ==============================================================================
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
    created_by
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
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
    'e1000000-0000-0000-0000-000000000002',
    'UPSC-CSE-2027',
    'Civil Services (Preliminary) Examination 2027',
    'Union Public Service Commission',
    'Premier competitive examination for recruitment to IAS, IPS, and IFS cadres.',
    'Bachelors Degree in any discipline. Age limit 21 to 32 years as on exam year.',
    DATE '2026-11-01',
    DATE '2027-07-31',
    DATE '2027-10-20',
    100.00,
    1056,
    'published',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
    'e1000000-0000-0000-0000-000000000003',
    'RRB-NTPC-2027',
    'Non-Technical Popular Categories (NTPC) 2027',
    'Railway Recruitment Control Board',
    'Recruitment for Station Master, Commercial Apprentice, and Goods Guard across 21 divisions.',
    '12th Standard or Bachelor Degree depending on specific technical level.',
    DATE '2026-08-01',
    DATE '2027-05-30',
    DATE '2027-08-10',
    250.00,
    11558,
    'completed',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
    'e1000000-0000-0000-0000-000000000004',
    'IBPS-PO-2027',
    'Probationary Officers / Management Trainees XIV',
    'Institute of Banking Personnel Selection',
    'Recruitment of Probationary Officers across 11 participating public sector banks.',
    'Degree in any discipline from a recognized University or Central Government equivalent.',
    DATE '2026-12-01',
    DATE '2027-08-15',
    DATE '2027-11-05',
    850.00,
    4455,
    'published',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
)
ON CONFLICT (examination_id) DO UPDATE SET
    examination_status = EXCLUDED.examination_status,
    total_vacancies = EXCLUDED.total_vacancies;

-- ==============================================================================
-- 4. EXAM CENTERS (5 Physical Testing Venues)
-- ==============================================================================
INSERT INTO public.exam_centers (
    center_id,
    center_code,
    center_name,
    address,
    city,
    state,
    pincode,
    contact_number,
    total_capacity
) VALUES
(
    'f1000000-0000-0000-0000-000000000001',
    'DEL-KV-101',
    'Kendriya Vidyalaya No. 1 Delhi Cantt',
    'Sadhu Vaswani Marg, Delhi Cantt',
    'New Delhi',
    'Delhi',
    '110010',
    '011-25691234',
    600
),
(
    'f1000000-0000-0000-0000-000000000002',
    'BLR-GAC-201',
    'Government Arts and Science College',
    'Post Office Road, K.R. Circle',
    'Bengaluru',
    'Karnataka',
    '560001',
    '080-22214567',
    500
),
(
    'f1000000-0000-0000-0000-000000000003',
    'LKO-NP-301',
    'National Post Graduate College',
    '2 Rana Pratap Marg, Hazratganj',
    'Lucknow',
    'Uttar Pradesh',
    '226001',
    '0522-2612345',
    450
),
(
    'f1000000-0000-0000-0000-000000000004',
    'MUM-GEC-401',
    'Government Polytechnic Bandra',
    '49 Kherwadi, Ali Yavar Jung Marg, Bandra East',
    'Mumbai',
    'Maharashtra',
    '400051',
    '022-26474580',
    550
),
(
    'f1000000-0000-0000-0000-000000000005',
    'KOL-MC-501',
    'Maulana Azad College',
    '8 Rafi Ahmed Kidwai Road',
    'Kolkata',
    'West Bengal',
    '700013',
    '033-22443725',
    400
)
ON CONFLICT (center_id) DO UPDATE SET
    total_capacity = EXCLUDED.total_capacity,
    contact_number = EXCLUDED.contact_number;

-- ==============================================================================
-- 5. EXAMINATION_CENTERS (8 Venue Seat Allocations)
-- ==============================================================================
INSERT INTO public.examination_centers (
    examination_id,
    center_id,
    allocated_capacity
) VALUES
-- SSC CGL 2027 allocations
('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 300),
('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 250),
('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 250),

-- UPSC CSE 2027 allocations
('e1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 250),
('e1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 200),
('e1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000003', 200),

-- RRB NTPC 2027 allocations
('e1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 350),

-- IBPS PO 2027 allocations
('e1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000005', 300)
ON CONFLICT (examination_id, center_id) DO UPDATE SET
    allocated_capacity = EXCLUDED.allocated_capacity;

-- ==============================================================================
-- 6. APPLICATIONS (8+ Submissions across Aspirants)
-- ==============================================================================
INSERT INTO public.applications (
    application_id,
    application_number,
    candidate_id,
    examination_id,
    center_id,
    applied_at,
    application_status,
    payment_status,
    remarks
) VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'APP-2027-0001',
    'd1000000-0000-0000-0000-000000000001', -- Rahul
    'e1000000-0000-0000-0000-000000000001', -- SSC CGL
    'f1000000-0000-0000-0000-000000000001', -- Delhi KV
    TIMESTAMPTZ '2026-10-15 10:15:00+05:30',
    'accepted',
    'paid',
    'Identity documents and degree certificates verified.'
),
(
    'b1000000-0000-0000-0000-000000000002',
    'APP-2027-0002',
    'd1000000-0000-0000-0000-000000000002', -- Priya
    'e1000000-0000-0000-0000-000000000001', -- SSC CGL
    'f1000000-0000-0000-0000-000000000002', -- Bengaluru GAC
    TIMESTAMPTZ '2026-10-18 11:20:00+05:30',
    'accepted',
    'paid',
    'OBC non-creamy layer certificate confirmed.'
),
(
    'b1000000-0000-0000-0000-000000000003',
    'APP-2027-0003',
    'd1000000-0000-0000-0000-000000000003', -- Amit
    'e1000000-0000-0000-0000-000000000003', -- RRB NTPC
    'f1000000-0000-0000-0000-000000000003', -- Lucknow NP
    TIMESTAMPTZ '2026-08-20 14:00:00+05:30',
    'accepted',
    'paid',
    'SC certificate validated by district magistrate.'
),
(
    'b1000000-0000-0000-0000-000000000004',
    'APP-2027-0004',
    'd1000000-0000-0000-0000-000000000001', -- Rahul
    'e1000000-0000-0000-0000-000000000002', -- UPSC CSE
    'f1000000-0000-0000-0000-000000000001', -- Delhi KV
    TIMESTAMPTZ '2026-11-05 09:30:00+05:30',
    'accepted',
    'paid',
    'Accepted for Civil Services Preliminary exam.'
),
(
    'b1000000-0000-0000-0000-000000000005',
    'APP-2027-0005',
    'd1000000-0000-0000-0000-000000000004', -- Sneha
    'e1000000-0000-0000-0000-000000000001', -- SSC CGL
    'f1000000-0000-0000-0000-000000000004', -- Mumbai GEC
    TIMESTAMPTZ '2026-10-25 15:45:00+05:30',
    'accepted',
    'paid',
    'Graduation marksheet verified.'
),
(
    'b1000000-0000-0000-0000-000000000006',
    'APP-2027-0006',
    'd1000000-0000-0000-0000-000000000002', -- Priya
    'e1000000-0000-0000-0000-000000000002', -- UPSC CSE
    'f1000000-0000-0000-0000-000000000002', -- Bengaluru GAC
    TIMESTAMPTZ '2026-11-12 16:10:00+05:30',
    'submitted',
    'paid',
    'Awaiting administrative scrutiny.'
),
(
    'b1000000-0000-0000-0000-000000000007',
    'APP-2027-0007',
    'd1000000-0000-0000-0000-000000000005', -- Vikram
    'e1000000-0000-0000-0000-000000000004', -- IBPS PO
    'f1000000-0000-0000-0000-000000000005', -- Kolkata MC
    TIMESTAMPTZ '2026-12-10 12:00:00+05:30',
    'submitted',
    'paid',
    'Application submitted online.'
),
(
    'b1000000-0000-0000-0000-000000000008',
    'APP-2027-0008',
    'd1000000-0000-0000-0000-000000000003', -- Amit
    'e1000000-0000-0000-0000-000000000002', -- UPSC CSE
    'f1000000-0000-0000-0000-000000000003', -- Lucknow NP
    TIMESTAMPTZ '2026-11-15 17:30:00+05:30',
    'under_review',
    'paid',
    'Category certificate resubmission requested.'
)
ON CONFLICT (application_id) DO UPDATE SET
    application_status = EXCLUDED.application_status,
    remarks = EXCLUDED.remarks;

-- ==============================================================================
-- 7. ADMIT CARDS (5 Issued Hall Tickets for Accepted Applications)
-- ==============================================================================
INSERT INTO public.admit_cards (
    admit_card_id,
    application_id,
    admit_card_number,
    roll_number,
    issue_date,
    reporting_time,
    examination_instructions
) VALUES
(
    'ac000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', -- Rahul (SSC CGL)
    'AC-2027-0001',
    'ROLL-SSCCGL-27001',
    DATE '2027-08-25',
    TIME '08:30:00',
    '1. Bring original Government Photo ID (Aadhaar / Voter ID).
2. Carry 2 passport-size photographs.
3. Electronic devices and calculators are strictly prohibited.'
),
(
    'ac000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002', -- Priya (SSC CGL)
    'AC-2027-0002',
    'ROLL-SSCCGL-27002',
    DATE '2027-08-25',
    TIME '08:30:00',
    '1. Bring original Government Photo ID.
2. Carry printed copy of this Hall Ticket.
3. Reporting gate closes at 09:15 AM.'
),
(
    'ac000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003', -- Amit (RRB NTPC)
    'AC-2027-0003',
    'ROLL-RRBNTPC-27001',
    DATE '2027-07-20',
    TIME '08:30:00',
    '1. Bring original Photo ID card.
2. Follow designated railway exam hall guidelines.'
),
(
    'ac000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000004', -- Rahul (UPSC CSE)
    'AC-2027-0004',
    'ROLL-UPSCCSE-27001',
    DATE '2027-09-30',
    TIME '08:00:00',
    '1. UPSC CSE e-Admit Card mandatory.
2. Black ballpoint pen for OMR sheet marking.'
),
(
    'ac000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000005', -- Sneha (SSC CGL)
    'AC-2027-0005',
    'ROLL-SSCCGL-27003',
    DATE '2027-08-25',
    TIME '08:30:00',
    '1. Bring original Photo ID card.
2. Adhere to dress code specifications.'
)
ON CONFLICT (admit_card_id) DO UPDATE SET
    reporting_time = EXCLUDED.reporting_time,
    examination_instructions = EXCLUDED.examination_instructions;

-- ==============================================================================
-- 8. RESULTS (5 Evaluated Scorecards with Computed Percentages & Rankings)
-- ==============================================================================
INSERT INTO public.results (
    result_id,
    application_id,
    marks_obtained,
    maximum_marks,
    rank,
    result_status,
    is_published,
    published_at,
    remarks
) VALUES
(
    'r1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', -- Rahul (SSC CGL)
    86.50,
    100.00,
    1,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-09-25 10:00:00+05:30',
    'Qualified for Tier-II descriptive and skill test round.'
),
(
    'r1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002', -- Priya (SSC CGL)
    78.00,
    100.00,
    2,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-09-25 10:00:00+05:30',
    'Qualified for Tier-II examination round.'
),
(
    'r1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003', -- Amit (RRB NTPC)
    92.50,
    100.00,
    1,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-08-20 10:00:00+05:30',
    'Selected in top merit list for Station Master.'
),
(
    'r1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000004', -- Rahul (UPSC CSE)
    118.50,
    200.00,
    45,
    'pass',
    TRUE,
    TIMESTAMPTZ '2027-11-15 14:00:00+05:30',
    'Cleared Civil Services Preliminary cutoff.'
),
(
    'r1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000005', -- Sneha (SSC CGL)
    52.00,
    100.00,
    128,
    'fail',
    TRUE,
    TIMESTAMPTZ '2027-09-25 10:00:00+05:30',
    'Did not meet the General category qualifying cutoff.'
)
ON CONFLICT (result_id) DO UPDATE SET
    marks_obtained = EXCLUDED.marks_obtained,
    rank = EXCLUDED.rank,
    result_status = EXCLUDED.result_status,
    is_published = EXCLUDED.is_published,
    published_at = EXCLUDED.published_at;

COMMIT;

-- End of File: database/insert_data.sql
