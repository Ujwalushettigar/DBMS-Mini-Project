-- ============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- Schema: schema.sql
-- Description: Complete 9-table normalized relational schema (up to 3NF)
--              including Primary Keys (UUID), Foreign Keys, Composite Keys,
--              CHECK & UNIQUE constraints, Indexes, RLS Policies, and Triggers.
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid() support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running (in reverse dependency order)
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS admit_cards CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS examination_centers CASCADE;
DROP TABLE IF EXISTS exam_centers CASCADE;
DROP TABLE IF EXISTS examinations CASCADE;
DROP TABLE IF EXISTS educational_qualifications CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- 1. PROFILES TABLE
-- Purpose: Connects Supabase Authentication (auth.users) with application roles.
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate' CHECK (role IN ('admin', 'candidate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'Application user accounts and RBAC roles linked to Supabase Auth';
COMMENT ON COLUMN profiles.role IS 'System role: admin or candidate. Admin cannot be self-assigned.';

-- ============================================================================
-- 2. CANDIDATES TABLE
-- Purpose: Personal dossier of registered aspirants for recruitment examinations.
-- ============================================================================
CREATE TABLE candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    candidate_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    phone_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE candidates IS 'Demographic and contact dossier of registered applicants';

-- ============================================================================
-- 3. EDUCATIONAL_QUALIFICATIONS TABLE
-- Purpose: Academic history of candidates (1-to-many relationship with candidates).
-- ============================================================================
CREATE TABLE educational_qualifications (
    qualification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    qualification_level VARCHAR(50) NOT NULL CHECK (
        qualification_level IN ('SSLC', 'PUC', 'Diploma', 'Undergraduate', 'Postgraduate', 'Other')
    ),
    institution_name VARCHAR(150) NOT NULL,
    board_or_university VARCHAR(150) NOT NULL,
    passing_year INTEGER NOT NULL CHECK (passing_year BETWEEN 1960 AND 2035),
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0.00 AND percentage <= 100.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE educational_qualifications IS 'Academic qualifications supporting examination eligibility';

-- ============================================================================
-- 4. EXAMINATIONS TABLE
-- Purpose: Government recruitment examination notifications and schedules.
-- ============================================================================
CREATE TABLE examinations (
    examination_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examination_code VARCHAR(30) UNIQUE NOT NULL,
    examination_name VARCHAR(150) NOT NULL,
    conducting_authority VARCHAR(150) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    application_start_date DATE NOT NULL,
    application_end_date DATE NOT NULL,
    examination_date DATE NOT NULL,
    application_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (application_fee >= 0.00),
    total_vacancies INTEGER NOT NULL CHECK (total_vacancies >= 0),
    examination_status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
        examination_status IN ('draft', 'published', 'closed', 'completed')
    ),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_exam_application_dates CHECK (application_end_date >= application_start_date),
    CONSTRAINT chk_exam_conduction_date CHECK (examination_date >= application_end_date)
);

COMMENT ON TABLE examinations IS 'Competitive public examination notices and vacancy declarations';

-- ============================================================================
-- 5. EXAM_CENTERS TABLE
-- Purpose: Physical examination centers and venue capacities.
-- ============================================================================
CREATE TABLE exam_centers (
    center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_code VARCHAR(30) UNIQUE NOT NULL,
    center_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_number VARCHAR(15),
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE exam_centers IS 'Approved physical exam venues with total seating capacity';

-- ============================================================================
-- 6. EXAMINATION_CENTERS TABLE (Junction Table)
-- Purpose: Implements M:N relationship between examinations and exam_centers.
--          Demonstrates Composite Primary Key (examination_id, center_id).
-- ============================================================================
CREATE TABLE examination_centers (
    examination_id UUID NOT NULL REFERENCES examinations(examination_id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES exam_centers(center_id) ON DELETE CASCADE,
    allocated_capacity INTEGER NOT NULL CHECK (allocated_capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (examination_id, center_id)
);

COMMENT ON TABLE examination_centers IS 'Many-to-Many junction linking exams to designated centers with allocated quota';

-- ============================================================================
-- 7. APPLICATIONS TABLE
-- Purpose: Candidate examination application submissions and review workflow.
-- ============================================================================
CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(40) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(candidate_id) ON DELETE RESTRICT,
    examination_id UUID NOT NULL REFERENCES examinations(examination_id) ON DELETE RESTRICT,
    center_id UUID REFERENCES exam_centers(center_id) ON DELETE SET NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    application_status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (
        application_status IN ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')
    ),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'waived')
    ),
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    -- Critical Constraint: Prevents duplicate applications for the same examination
    CONSTRAINT uq_candidate_examination UNIQUE (candidate_id, examination_id)
);

COMMENT ON TABLE applications IS 'Candidate examination applications with unique candidate-exam constraint';

-- ============================================================================
-- 8. ADMIT_CARDS TABLE
-- Purpose: Official hall tickets generated for accepted examination applications.
-- ============================================================================
CREATE TABLE admit_cards (
    admit_card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    admit_card_number VARCHAR(40) UNIQUE NOT NULL,
    roll_number VARCHAR(40) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    reporting_time TIME NOT NULL,
    examination_instructions TEXT DEFAULT '1. Bring original Photo ID proof (Aadhaar / Passport / Voter ID).\n2. Carry printed Admit Card.\n3. Electronic items, mobile phones and smartwatches are strictly prohibited.',
    admit_card_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE admit_cards IS 'Hall tickets generated strictly for accepted applications';

-- ============================================================================
-- 9. RESULTS TABLE
-- Purpose: Declared marks, ranks, and pass/fail verdicts for applications.
-- ============================================================================
CREATE TABLE results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    marks_obtained NUMERIC(7,2) NOT NULL CHECK (marks_obtained >= 0.00),
    maximum_marks NUMERIC(7,2) NOT NULL CHECK (maximum_marks > 0.00),
    rank INTEGER CHECK (rank IS NULL OR rank > 0),
    result_status VARCHAR(20) NOT NULL CHECK (result_status IN ('pass', 'fail', 'withheld')),
    published_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_results_marks_range CHECK (marks_obtained <= maximum_marks)
);

COMMENT ON TABLE results IS 'Published marksheet, merit rank and qualification status';

-- ============================================================================
-- PERFORMANCE & LOOKUP INDEXES
-- ============================================================================
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_category ON candidates(category);
CREATE INDEX idx_qualifications_candidate_id ON educational_qualifications(candidate_id);
CREATE INDEX idx_examinations_status ON examinations(examination_status);
CREATE INDEX idx_examinations_dates ON examinations(application_start_date, application_end_date);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_examination_id ON applications(examination_id);
CREATE INDEX idx_applications_status ON applications(application_status);
CREATE INDEX idx_admit_cards_application_id ON admit_cards(application_id);
CREATE INDEX idx_admit_cards_roll_number ON admit_cards(roll_number);
CREATE INDEX idx_results_application_id ON results(application_id);
CREATE INDEX idx_results_status ON results(result_status);

-- ============================================================================
-- DATABASE PROCEDURES, FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Maintain updated_at on profiles
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Maintain updated_at on candidates
CREATE TRIGGER trg_candidates_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Maintain updated_at on examinations
CREATE TRIGGER trg_examinations_updated_at
BEFORE UPDATE ON examinations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Maintain updated_at on applications
CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Validate that examination_centers allocated capacity does not exceed center total_capacity
CREATE OR REPLACE FUNCTION validate_center_allocation_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_total_capacity INTEGER;
BEGIN
    SELECT total_capacity INTO v_total_capacity
    FROM exam_centers
    WHERE center_id = NEW.center_id;

    IF NEW.allocated_capacity > v_total_capacity THEN
        RAISE EXCEPTION 'Allocated capacity (%) cannot exceed exam center total capacity (%)',
            NEW.allocated_capacity, v_total_capacity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_center_allocation
BEFORE INSERT OR UPDATE ON examination_centers
FOR EACH ROW EXECUTE FUNCTION validate_center_allocation_capacity();

-- Function: Automatically create profile upon Supabase auth.users signup
-- Security: ALWAYS sets role to 'candidate' by default. Admins must be provisioned explicitly.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'candidate',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users for Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Helper function: check if currently authenticated user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Profiles are viewable by owner or admin"
ON profiles FOR SELECT
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own email, but role changes disallowed"
ON profiles FOR UPDATE
USING (auth.uid() = id OR is_admin())
WITH CHECK (
    -- Prevent non-admins from changing their role
    (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    OR is_admin()
);

-- 2. CANDIDATES POLICIES
CREATE POLICY "Candidates viewable by self or admin"
ON candidates FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Candidates can insert own record"
ON candidates FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Candidates can update own record, admin can update all"
ON candidates FOR UPDATE
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only admin can delete candidates"
ON candidates FOR DELETE
USING (is_admin());

-- 3. EDUCATIONAL QUALIFICATIONS POLICIES
CREATE POLICY "Qualifications viewable by owner or admin"
ON educational_qualifications FOR SELECT
USING (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = educational_qualifications.candidate_id AND candidates.user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Candidates can insert qualifications for own profile"
ON educational_qualifications FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = educational_qualifications.candidate_id AND candidates.user_id = auth.uid())
);

CREATE POLICY "Candidates can update own qualifications"
ON educational_qualifications FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = educational_qualifications.candidate_id AND candidates.user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Candidates can delete own qualifications"
ON educational_qualifications FOR DELETE
USING (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = educational_qualifications.candidate_id AND candidates.user_id = auth.uid())
    OR is_admin()
);

-- 4. EXAMINATIONS POLICIES
CREATE POLICY "Published exams are viewable by all, drafts viewable by admin"
ON examinations FOR SELECT
USING (examination_status = 'published' OR examination_status = 'closed' OR examination_status = 'completed' OR is_admin());

CREATE POLICY "Only admin can create examinations"
ON examinations FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admin can update examinations"
ON examinations FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admin can delete examinations"
ON examinations FOR DELETE
USING (is_admin());

-- 5. EXAM CENTERS POLICIES
CREATE POLICY "Exam centers viewable by authenticated users"
ON exam_centers FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Only admin can manage exam centers"
ON exam_centers FOR ALL
USING (is_admin());

-- 6. EXAMINATION CENTERS (JUNCTION) POLICIES
CREATE POLICY "Examination center links viewable by authenticated users"
ON examination_centers FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Only admin can manage examination center allocations"
ON examination_centers FOR ALL
USING (is_admin());

-- 7. APPLICATIONS POLICIES
CREATE POLICY "Candidates can view own applications, admin can view all"
ON applications FOR SELECT
USING (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = applications.candidate_id AND candidates.user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Candidates can insert own applications"
ON applications FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = applications.candidate_id AND candidates.user_id = auth.uid())
);

CREATE POLICY "Candidates can withdraw own application, admin can update status"
ON applications FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM candidates WHERE candidates.candidate_id = applications.candidate_id AND candidates.user_id = auth.uid())
    OR is_admin()
);

-- 8. ADMIT CARDS POLICIES
CREATE POLICY "Candidates can view own admit card, admin can view all"
ON admit_cards FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM applications
        JOIN candidates ON applications.candidate_id = candidates.candidate_id
        WHERE applications.application_id = admit_cards.application_id
        AND candidates.user_id = auth.uid()
    )
    OR is_admin()
);

CREATE POLICY "Only admin can generate admit cards"
ON admit_cards FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admin can delete admit cards"
ON admit_cards FOR DELETE
USING (is_admin());

-- 9. RESULTS POLICIES
CREATE POLICY "Candidates view own published results, admin views all"
ON results FOR SELECT
USING (
    (
        published_at IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM applications
            JOIN candidates ON applications.candidate_id = candidates.candidate_id
            WHERE applications.application_id = results.application_id
            AND candidates.user_id = auth.uid()
        )
    )
    OR is_admin()
);

CREATE POLICY "Only admin can manage results"
ON results FOR ALL
USING (is_admin());

