-- ==============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/crud_operations.sql
-- Description: Standard CRUD (Create, Read, Update, Delete) Data Manipulation
--              Language (DML) operations demonstrating core recruitment workflows.
--
-- ACADEMIC DBMS MINI-PROJECT (CS522L5C / VIVA VOCE REFERENCE)
-- ==============================================================================

-- ==============================================================================
-- SECTION A: INSERT OPERATIONS (CREATE)
-- Demonstrates parameterized insertion across primary and dependent entities.
-- ==============================================================================

-- A.1. Register a Candidate Profile
-- Inserts a newly verified candidate linked to an authentication profile.
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
) VALUES (
    'd1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000005',
    'CND-2027-00106',
    'Rohan Kulkarni',
    DATE '1998-11-22',
    'Male',
    '9876501234',
    'Plot 88, Kothrud',
    'Pune',
    'Maharashtra',
    '411038',
    'General'
);

-- A.2. Add an Educational Qualification
-- Links academic degree credentials to the candidate entity (Foreign Key: candidate_id).
INSERT INTO public.educational_qualifications (
    qualification_id,
    candidate_id,
    qualification_level,
    institution_name,
    board_or_university,
    passing_year,
    percentage
) VALUES (
    gen_random_uuid(),
    'd1000000-0000-0000-0000-000000000006',
    'Undergraduate',
    'College of Engineering Pune',
    'Savitribai Phule Pune University',
    2020,
    87.40
);

-- A.3. Create an Examination Notification
-- Commission administrator publishes a nationwide recruitment notice.
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
    examination_status
) VALUES (
    gen_random_uuid(),
    'GATE-2027',
    'Graduate Aptitude Test in Engineering 2027',
    'Indian Institute of Technology',
    'National entrance test for postgraduate engineering and PSU recruitment.',
    'B.E. / B.Tech / B.Arch / Master degree in Science or Mathematics.',
    DATE '2026-09-01',
    DATE '2027-01-15',
    DATE '2027-02-12',
    1800.00,
    3500,
    'published'
);

-- A.4. Add an Examination Center (Physical Venue)
-- Registers a university or government college testing venue with seating capacity.
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
) VALUES (
    gen_random_uuid(),
    'PUN-COEP-601',
    'COEP Technological University Campus',
    'Wellesley Road, Shivajinagar',
    'Pune',
    'Maharashtra',
    '411005',
    '020-25507000',
    650
);

-- A.5. Allocate a Center to an Examination (Junction Table)
-- Establishes relationship between exam and venue with designated seat quota.
INSERT INTO public.examination_centers (
    examination_id,
    center_id,
    allocated_capacity
) VALUES (
    'e1000000-0000-0000-0000-000000000001', -- SSC CGL 2027
    'f1000000-0000-0000-0000-000000000003', -- Lucknow NP
    200
);

-- A.6. Submit an Examination Application
-- Candidate submits application targeting an approved exam center.
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
) VALUES (
    gen_random_uuid(),
    'APP-2027-0009',
    'd1000000-0000-0000-0000-000000000005', -- Vikram
    'e1000000-0000-0000-0000-000000000001', -- SSC CGL
    'f1000000-0000-0000-0000-000000000004', -- Mumbai GEC
    NOW(),
    'submitted',
    'paid',
    'Application submitted online with required documents.'
);

-- A.7. Generate an Admit Card (Hall Ticket)
-- Generated strictly for accepted applications; roll number assigned deterministically.
INSERT INTO public.admit_cards (
    admit_card_id,
    application_id,
    admit_card_number,
    roll_number,
    issue_date,
    reporting_time,
    examination_instructions
) VALUES (
    gen_random_uuid(),
    'b1000000-0000-0000-0000-000000000005', -- Sneha SSC CGL
    'AC-2027-0006',
    'ROLL-SSCCGL-27004',
    CURRENT_DATE,
    TIME '08:30:00',
    '1. Bring original Government Photo ID. 2. Arrive 45 mins prior to commencement.'
)
ON CONFLICT (application_id) DO NOTHING;

-- A.8. Publish Examination Result
-- Records marks obtained, rank, evaluation status, and sets is_published = TRUE.
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
) VALUES (
    gen_random_uuid(),
    'b1000000-0000-0000-0000-000000000004', -- Rahul UPSC CSE
    124.00,
    200.00,
    38,
    'pass',
    TRUE,
    NOW(),
    'Selected for Mains descriptive examination phase.'
)
ON CONFLICT (application_id) DO UPDATE SET
    marks_obtained = EXCLUDED.marks_obtained,
    rank = EXCLUDED.rank,
    is_published = TRUE,
    published_at = NOW();

-- ==============================================================================
-- SECTION B: SELECT OPERATIONS (READ)
-- Standard queries retrieving datasets for administrative and candidate views.
-- ==============================================================================

-- B.1. Display All Candidates
SELECT 
    candidate_id,
    candidate_number,
    full_name,
    gender,
    phone_number,
    city,
    state,
    category
FROM public.candidates
ORDER BY created_at DESC;

-- B.2. Display All Examinations
SELECT 
    examination_id,
    examination_code,
    examination_name,
    conducting_authority,
    application_start_date,
    application_end_date,
    examination_date,
    total_vacancies,
    examination_status
FROM public.examinations
ORDER BY examination_date ASC;

-- B.3. Display All Examination Centers
SELECT 
    center_id,
    center_code,
    center_name,
    city,
    state,
    total_capacity
FROM public.exam_centers
ORDER BY state ASC, city ASC;

-- B.4. Display All Applications with Status
SELECT 
    application_id,
    application_number,
    candidate_id,
    examination_id,
    application_status,
    payment_status,
    applied_at
FROM public.applications
ORDER BY applied_at DESC;

-- B.5. Display Qualifications for a Particular Candidate
SELECT 
    qualification_level,
    institution_name,
    board_or_university,
    passing_year,
    percentage
FROM public.educational_qualifications
WHERE candidate_id = 'd1000000-0000-0000-0000-000000000001'
ORDER BY passing_year DESC;

-- B.6. Display All Published Examination Results
SELECT 
    result_id,
    application_id,
    marks_obtained,
    maximum_marks,
    percentage,
    rank,
    result_status,
    published_at
FROM public.results
WHERE is_published = TRUE
ORDER BY rank ASC NULLS LAST;

-- B.7. Display All Issued Admit Cards
SELECT 
    admit_card_id,
    admit_card_number,
    roll_number,
    issue_date,
    reporting_time,
    application_id
FROM public.admit_cards
ORDER BY issue_date DESC;

-- B.8. Display Candidates Registered for a Specific Examination
SELECT 
    a.application_number,
    c.candidate_number,
    c.full_name,
    c.category,
    a.application_status
FROM public.applications a
JOIN public.candidates c ON a.candidate_id = c.candidate_id
WHERE a.examination_id = 'e1000000-0000-0000-0000-000000000001'
ORDER BY a.applied_at ASC;

-- ==============================================================================
-- SECTION C: UPDATE OPERATIONS (MODIFY)
-- Targeted updates reflecting real-world administrative and candidate lifecycle events.
-- ==============================================================================

-- C.1. Update Candidate Phone Number
UPDATE public.candidates
SET phone_number = '9811998877',
    updated_at = NOW()
WHERE candidate_id = 'd1000000-0000-0000-0000-000000000001';

-- C.2. Update Candidate Residential Address
UPDATE public.candidates
SET address = 'House 14B, New Officers Colony, Sector 21',
    city = 'Gurugram',
    state = 'Haryana',
    pincode = '122016',
    updated_at = NOW()
WHERE candidate_id = 'd1000000-0000-0000-0000-000000000001';

-- C.3. Update Examination Vacancies and Description
UPDATE public.examinations
SET total_vacancies = 8900,
    description = 'Revised vacancy matrix: 8,900 Group B and C posts across Union Ministries.',
    updated_at = NOW()
WHERE examination_code = 'SSC-CGL-2027';

-- C.4. Change Examination Status (e.g. from draft to published)
UPDATE public.examinations
SET examination_status = 'published',
    updated_at = NOW()
WHERE examination_code = 'IBPS-PO-2027';

-- C.5. Change Application Status (Administrative Approval)
UPDATE public.applications
SET application_status = 'accepted',
    remarks = 'Application scrutinized and approved by Recruitment Officer.',
    updated_at = NOW()
WHERE application_number = 'APP-2027-0006';

-- C.6. Update Allocated Center Capacity Quota
UPDATE public.examination_centers
SET allocated_capacity = 320
WHERE examination_id = 'e1000000-0000-0000-0000-000000000001'
  AND center_id = 'f1000000-0000-0000-0000-000000000001';

-- C.7. Publish Evaluated Examination Results
UPDATE public.results
SET is_published = TRUE,
    published_at = NOW(),
    remarks = 'Official scorecard published on candidate portal.'
WHERE application_id = 'b1000000-0000-0000-0000-000000000002';

-- ==============================================================================
-- SECTION D: DELETE OPERATIONS (REMOVE)
-- Controlled deletions demonstrating cascading vs. restricted referential integrity.
-- ==============================================================================

-- D.1. Delete a Candidate Educational Qualification
-- Cascades: None. Independent child record removed safely.
DELETE FROM public.educational_qualifications
WHERE qualification_id = 'q1000000-0000-0000-0000-000000000013';

-- D.2. Delete an Admit Card
-- Explanation: Safe removal. Admit card is a child of application. Does not delete application.
DELETE FROM public.admit_cards
WHERE admit_card_number = 'AC-2027-0005';

-- D.3. Delete an Evaluated Result Record
-- Explanation: Safe removal. Deletes scorecard child without affecting the parent application.
DELETE FROM public.results
WHERE result_id = 'r1000000-0000-0000-0000-000000000005';

-- D.4. Delete an Examination-Center Allocation Link
-- Explanation: Junction table record deletion. Permitted only if no active applications
-- reference this (examination_id, center_id) pair due to composite FK constraint.
DELETE FROM public.examination_centers
WHERE examination_id = 'e1000000-0000-0000-0000-000000000004'
  AND center_id = 'f1000000-0000-0000-0000-000000000005'
  AND NOT EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.examination_id = 'e1000000-0000-0000-0000-000000000004'
        AND a.center_id = 'f1000000-0000-0000-0000-000000000005'
  );

-- D.5. Delete a Candidate Record (Referential Integrity Check)
-- Explanation: candidates has ON DELETE CASCADE from profiles.
-- However, applications references candidates WITHOUT cascade (default RESTRICT).
-- Therefore, deleting a candidate who has active applications will fail unless
-- applications are archived or removed first. This guards candidate history.
DELETE FROM public.candidates
WHERE candidate_id = 'd1000000-0000-0000-0000-000000000006'
  AND NOT EXISTS (
      SELECT 1 FROM public.applications WHERE candidate_id = 'd1000000-0000-0000-0000-000000000006'
  );

-- End of File: database/crud_operations.sql
