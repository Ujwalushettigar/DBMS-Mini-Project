-- ==============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/create_tables.sql
-- Description: Complete 9-table relational database schema definition,
--              including primary keys, foreign keys, unique constraints,
--              domain CHECK constraints, performance indexes, generated columns,
--              and Row Level Security (RLS) policies.
--
-- ACADEMIC DBMS MINI-PROJECT (CS522L5C / VIVA VOCE REFERENCE)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- EXTENSIONS
-- Required for cryptographic UUID generation (gen_random_uuid())
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE DEFINITIONS (Nine Core Relational Tables)
-- Created in strict topological dependency order to avoid foreign key errors.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- Purpose: System security and role entity storing credentials and role hierarchy.
-- Primary Key: id (UUID)
-- Foreign Key: References auth.users(id) ON DELETE CASCADE in Supabase Auth.
-- Cardinality: 1:1 with auth.users, 1:1 with candidates, 1:N with examinations.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate'
        CONSTRAINT chk_profile_role CHECK (role IN ('admin', 'candidate')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Stores user authorization role and authentication profile.';
COMMENT ON COLUMN public.profiles.id IS 'Primary key referencing auth.users(id) in Supabase.';
COMMENT ON COLUMN public.profiles.role IS 'Authorization role: admin (controller/officer) or candidate (applicant).';

-- ------------------------------------------------------------------------------
-- Table 2: candidates
-- Purpose: Personal, demographic, and contact information of registered applicants.
-- Primary Key: candidate_id (UUID)
-- Foreign Key: user_id references profiles(id) ON DELETE CASCADE.
-- Cardinality: 1:1 with profiles, 1:N with educational_qualifications, 1:N with applications.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL
        CONSTRAINT fk_candidates_profile REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20)
        CONSTRAINT chk_candidate_gender CHECK (gender IN ('Male', 'Female', 'Transgender', 'Other')),
    phone_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    category VARCHAR(30) DEFAULT 'General'
        CONSTRAINT chk_candidate_category CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS', 'Other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.candidates IS 'Stores verified demographic and biographical data of aspirants.';
COMMENT ON COLUMN public.candidates.candidate_number IS 'Human-readable unique identifier (e.g. CND-2027-00101).';

-- ------------------------------------------------------------------------------
-- Table 3: educational_qualifications
-- Purpose: Academic pedigree and eligibility records (SSLC, PUC, Degree, PG).
-- Primary Key: qualification_id (UUID)
-- Foreign Key: candidate_id references candidates(candidate_id) ON DELETE CASCADE.
-- Cardinality: N:1 with candidates (one candidate may possess multiple qualifications).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.educational_qualifications (
    qualification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL
        CONSTRAINT fk_qualifications_candidate REFERENCES public.candidates(candidate_id) ON DELETE CASCADE,
    qualification_level VARCHAR(50) NOT NULL
        CONSTRAINT chk_qualification_level CHECK (
            qualification_level IN (
                'SSLC', 'PUC', 'Diploma', 'Undergraduate', 'Postgraduate',
                'Doctorate', 'B.E.', 'Other', '10th', '12th', 'diploma',
                'bachelors', 'masters', 'doctorate'
            )
        ),
    institution_name VARCHAR(150) NOT NULL,
    board_or_university VARCHAR(150) NOT NULL,
    passing_year INTEGER
        CONSTRAINT chk_passing_year CHECK (passing_year >= 1970 AND passing_year <= 2035),
    percentage NUMERIC(5,2)
        CONSTRAINT chk_qualification_percentage CHECK (percentage >= 0.00 AND percentage <= 100.00),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.educational_qualifications IS 'Tracks degrees, diplomas, and certifications for recruitment eligibility.';

-- ------------------------------------------------------------------------------
-- Table 4: examinations
-- Purpose: Official recruitment notifications published by government commissions.
-- Primary Key: examination_id (UUID)
-- Foreign Key: created_by references profiles(id).
-- Cardinality: 1:N with applications, 1:N with examination_centers.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.examinations (
    examination_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examination_code VARCHAR(30) UNIQUE NOT NULL,
    examination_name VARCHAR(150) NOT NULL,
    conducting_authority VARCHAR(150) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    application_start_date DATE NOT NULL,
    application_end_date DATE NOT NULL,
    examination_date DATE NOT NULL,
    application_fee NUMERIC(10,2) DEFAULT 0.00
        CONSTRAINT chk_application_fee CHECK (application_fee >= 0.00),
    total_vacancies INTEGER NOT NULL
        CONSTRAINT chk_total_vacancies CHECK (total_vacancies > 0),
    examination_status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CONSTRAINT chk_examination_status CHECK (
            examination_status IN ('draft', 'upcoming', 'open', 'published', 'closed', 'completed', 'cancelled')
        ),
    created_by UUID
        CONSTRAINT fk_examinations_creator REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_exam_dates CHECK (
        application_start_date <= application_end_date AND
        application_end_date <= examination_date
    )
);

COMMENT ON TABLE public.examinations IS 'Government recruitment notifications (e.g. UPSC CSE, SSC CGL).';

-- ------------------------------------------------------------------------------
-- Table 5: exam_centers
-- Purpose: Physical examination testing venues, institutions, and capacities.
-- Primary Key: center_id (UUID)
-- Cardinality: 1:N with examination_centers.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_centers (
    center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_code VARCHAR(30) UNIQUE NOT NULL,
    center_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_number VARCHAR(15),
    total_capacity INTEGER NOT NULL
        CONSTRAINT chk_total_capacity CHECK (total_capacity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.exam_centers IS 'Physical testing venues across national districts and cities.';

-- ------------------------------------------------------------------------------
-- Table 6: examination_centers (Junction / Bridge Entity)
-- Purpose: Resolves the Many-to-Many (N:M) relationship between examinations
--          and exam_centers, specifying allocated seat quota per venue.
-- Composite Primary Key: (examination_id, center_id)
-- Foreign Keys:
--   examination_id references examinations(examination_id) ON DELETE CASCADE
--   center_id references exam_centers(center_id) ON DELETE CASCADE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.examination_centers (
    examination_id UUID NOT NULL
        CONSTRAINT fk_ec_examination REFERENCES public.examinations(examination_id) ON DELETE CASCADE,
    center_id UUID NOT NULL
        CONSTRAINT fk_ec_center REFERENCES public.exam_centers(center_id) ON DELETE CASCADE,
    allocated_capacity INTEGER NOT NULL
        CONSTRAINT chk_allocated_capacity CHECK (allocated_capacity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (examination_id, center_id)
);

COMMENT ON TABLE public.examination_centers IS 'Bridge table mapping venues to exams with dedicated seat quotas.';

-- ------------------------------------------------------------------------------
-- Table 7: applications
-- Purpose: Formal application submitted by an eligible candidate for a notification.
-- Primary Key: application_id (UUID)
-- Foreign Keys:
--   candidate_id references candidates(candidate_id)
--   examination_id references examinations(examination_id)
--   (examination_id, center_id) references examination_centers(examination_id, center_id)
-- Business Constraint: UNIQUE(candidate_id, examination_id) prevents multiple submissions.
-- Cardinality: 1:1 with admit_cards, 1:1 with results.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(40) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL
        CONSTRAINT fk_applications_candidate REFERENCES public.candidates(candidate_id),
    examination_id UUID NOT NULL
        CONSTRAINT fk_applications_examination REFERENCES public.examinations(examination_id),
    center_id UUID,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    application_status VARCHAR(30) NOT NULL DEFAULT 'submitted'
        CONSTRAINT chk_application_status CHECK (
            application_status IN ('submitted', 'under_review', 'accepted', 'approved', 'rejected', 'withdrawn')
        ),
    payment_status VARCHAR(20) DEFAULT 'pending'
        CONSTRAINT chk_payment_status CHECK (
            payment_status IN ('pending', 'paid', 'failed', 'waived')
        ),
    remarks TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Relational Integrity: A candidate can submit only ONE application per notification
    CONSTRAINT unique_candidate_exam
        UNIQUE (candidate_id, examination_id),

    -- Relational Integrity: Center chosen must be officially allocated to the examination
    CONSTRAINT fk_application_exam_center
        FOREIGN KEY (examination_id, center_id)
        REFERENCES public.examination_centers(examination_id, center_id)
);

COMMENT ON TABLE public.applications IS 'Candidate application submissions under official administrative review.';

-- ------------------------------------------------------------------------------
-- Table 8: admit_cards (Hall Tickets)
-- Purpose: Hall tickets issued strictly to accepted/approved applicants.
-- Primary Key: admit_card_id (UUID)
-- Foreign Key: application_id references applications(application_id) ON DELETE CASCADE.
-- Cardinality: 1:1 with applications (UNIQUE constraint enforces this relationship).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admit_cards (
    admit_card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL
        CONSTRAINT fk_admit_cards_application REFERENCES public.applications(application_id) ON DELETE CASCADE,
    admit_card_number VARCHAR(40) UNIQUE NOT NULL,
    roll_number VARCHAR(40) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    reporting_time TIME NOT NULL,
    examination_instructions TEXT,
    admit_card_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.admit_cards IS 'Hall tickets generated for scrutinized candidates.';

-- ------------------------------------------------------------------------------
-- Table 9: results
-- Purpose: Marks scored, merit rankings, and qualification status.
-- Primary Key: result_id (UUID)
-- Foreign Key: application_id references applications(application_id) ON DELETE CASCADE.
-- Generated Column: percentage is calculated deterministically by PostgreSQL engine.
-- Cardinality: 1:1 with applications (UNIQUE constraint enforces this relationship).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL
        CONSTRAINT fk_results_application REFERENCES public.applications(application_id) ON DELETE CASCADE,
    marks_obtained NUMERIC(7,2) NOT NULL,
    maximum_marks NUMERIC(7,2) NOT NULL
        CONSTRAINT chk_maximum_marks_positive CHECK (maximum_marks > 0),
    percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        ROUND((marks_obtained / NULLIF(maximum_marks, 0)) * 100, 2)
    ) STORED,
    rank INTEGER
        CONSTRAINT chk_positive_rank CHECK (rank IS NULL OR rank > 0),
    result_status VARCHAR(20) NOT NULL
        CONSTRAINT chk_result_status CHECK (
            result_status IN ('pass', 'fail', 'withheld', 'absent', 'pending', 'qualified', 'not_qualified')
        ),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_marks_range CHECK (marks_obtained >= 0.00 AND marks_obtained <= maximum_marks)
);

COMMENT ON TABLE public.results IS 'Evaluated scorecards and merit list rankings.';
COMMENT ON COLUMN public.results.percentage IS 'Computed percentage: ROUND((marks_obtained / maximum_marks) * 100, 2).';

-- ==============================================================================
-- 2. PERFORMANCE INDEXES
-- Optimizes JOIN conditions, foreign keys, filtering, and sorted lookups.
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_number ON public.candidates(candidate_number);
CREATE INDEX IF NOT EXISTS idx_candidates_category ON public.candidates(category);
CREATE INDEX IF NOT EXISTS idx_qualifications_candidate_id ON public.educational_qualifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_examinations_code ON public.examinations(examination_code);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON public.examinations(examination_status);
CREATE INDEX IF NOT EXISTS idx_examinations_date ON public.examinations(examination_date);
CREATE INDEX IF NOT EXISTS idx_exam_centers_city ON public.exam_centers(city);
CREATE INDEX IF NOT EXISTS idx_examination_centers_center_id ON public.examination_centers(center_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_examination_id ON public.applications(examination_id);
CREATE INDEX IF NOT EXISTS idx_applications_center_id ON public.applications(center_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_admit_cards_application_id ON public.admit_cards(application_id);
CREATE INDEX IF NOT EXISTS idx_admit_cards_roll_number ON public.admit_cards(roll_number);
CREATE INDEX IF NOT EXISTS idx_results_application_id ON public.results(application_id);
CREATE INDEX IF NOT EXISTS idx_results_rank ON public.results(rank);
CREATE INDEX IF NOT EXISTS idx_results_is_published ON public.results(is_published);
CREATE INDEX IF NOT EXISTS idx_results_published_at ON public.results(published_at);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) ACTIVATION
-- Ensures fine-grained security policies can be evaluated on all nine tables.
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Base Public / Authenticated Read Access for notifications and venues
DROP POLICY IF EXISTS "public_examinations_read" ON public.examinations;
CREATE POLICY "public_examinations_read" ON public.examinations
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_centers_read" ON public.exam_centers;
CREATE POLICY "public_centers_read" ON public.exam_centers
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_examination_centers_read" ON public.examination_centers;
CREATE POLICY "public_examination_centers_read" ON public.examination_centers
    FOR SELECT TO public USING (true);

-- End of File: database/create_tables.sql
