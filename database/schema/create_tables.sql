-- ============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/schema/create_tables.sql
-- Description: Complete 9-table relational database design, performance indexes,
--              automated Supabase Auth profile creation triggers, timestamp maintenance,
--              Row Level Security (RLS) policies, and role permissions.
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid() support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLE DEFINITIONS (Nine Core Relational Tables)
-- ============================================================================

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate'
        CHECK (role IN ('admin', 'candidate')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: candidates
CREATE TABLE IF NOT EXISTS public.candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    category VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: educational_qualifications
CREATE TABLE IF NOT EXISTS public.educational_qualifications (
    qualification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(candidate_id)
        ON DELETE CASCADE,
    qualification_level VARCHAR(50) NOT NULL,
    institution_name VARCHAR(150) NOT NULL,
    board_or_university VARCHAR(150) NOT NULL,
    passing_year INTEGER,
    percentage NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: examinations
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
    application_fee NUMERIC(10,2) DEFAULT 0,
    total_vacancies INTEGER NOT NULL,
    examination_status VARCHAR(20) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: exam_centers
CREATE TABLE IF NOT EXISTS public.exam_centers (
    center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_code VARCHAR(30) UNIQUE NOT NULL,
    center_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_number VARCHAR(15),
    total_capacity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: examination_centers (Junction Table)
CREATE TABLE IF NOT EXISTS public.examination_centers (
    examination_id UUID NOT NULL REFERENCES public.examinations(examination_id)
        ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES public.exam_centers(center_id)
        ON DELETE CASCADE,
    allocated_capacity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (examination_id, center_id)
);

-- Table 7: applications
CREATE TABLE IF NOT EXISTS public.applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(40) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL REFERENCES public.candidates(candidate_id),
    examination_id UUID NOT NULL REFERENCES public.examinations(examination_id),
    center_id UUID,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    application_status VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_candidate_exam
        UNIQUE (candidate_id, examination_id),

    CONSTRAINT fk_application_exam_center
        FOREIGN KEY (examination_id, center_id)
        REFERENCES public.examination_centers(examination_id, center_id)
);

-- Table 8: admit_cards
CREATE TABLE IF NOT EXISTS public.admit_cards (
    admit_card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES public.applications(application_id)
        ON DELETE CASCADE,
    admit_card_number VARCHAR(40) UNIQUE NOT NULL,
    roll_number VARCHAR(40) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    reporting_time TIME NOT NULL,
    examination_instructions TEXT,
    admit_card_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 9: results
CREATE TABLE IF NOT EXISTS public.results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES public.applications(application_id)
        ON DELETE CASCADE,
    marks_obtained NUMERIC(7,2) NOT NULL,
    maximum_marks NUMERIC(7,2) NOT NULL,
    rank INTEGER,
    result_status VARCHAR(20) NOT NULL,
    published_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. INDEXES
-- Purpose: Optimize frequently searched, filtered, and joined columns.
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_number ON public.candidates(candidate_number);
CREATE INDEX IF NOT EXISTS idx_qualifications_candidate_id ON public.educational_qualifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_examinations_examination_code ON public.examinations(examination_code);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON public.examinations(examination_status);
CREATE INDEX IF NOT EXISTS idx_examinations_date ON public.examinations(examination_date);
CREATE INDEX IF NOT EXISTS idx_examination_centers_center_id ON public.examination_centers(center_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_examination_id ON public.applications(examination_id);
CREATE INDEX IF NOT EXISTS idx_applications_center_id ON public.applications(center_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_admit_cards_application_id ON public.admit_cards(application_id);
CREATE INDEX IF NOT EXISTS idx_results_application_id ON public.results(application_id);

-- ============================================================================
-- 3. AUTOMATIC PROFILE CREATION AFTER SIGNUP
-- Purpose: Safely provision a public.profiles record when a user signs up via
--          Supabase Auth (auth.users). Always assigns role = 'candidate'.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'candidate', -- Strict: users cannot assign themselves admin role at signup
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. UPDATED TIMESTAMP TRIGGER
-- Purpose: Reusable trigger function to automatically update updated_at timestamps.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_candidates_updated_at ON public.candidates;
CREATE TRIGGER trg_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_examinations_updated_at ON public.examinations;
CREATE TRIGGER trg_examinations_updated_at
BEFORE UPDATE ON public.examinations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. ADMIN VERIFICATION FUNCTION
-- Purpose: Secure SECURITY DEFINER function to check admin role without recursive RLS.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Purpose: Fine-grained access control enforcing candidate data isolation and
--          administrative governance across all nine tables.
-- ============================================================================

-- Enable RLS across all nine tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (
    -- Candidates cannot change their role; admins may promote/demote
    (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.is_admin()
);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- CANDIDATES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "candidates_select_policy" ON public.candidates;
CREATE POLICY "candidates_select_policy" ON public.candidates
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "candidates_insert_policy" ON public.candidates;
CREATE POLICY "candidates_insert_policy" ON public.candidates
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "candidates_update_policy" ON public.candidates;
CREATE POLICY "candidates_update_policy" ON public.candidates
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "candidates_delete_policy" ON public.candidates;
CREATE POLICY "candidates_delete_policy" ON public.candidates
FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- EDUCATIONAL QUALIFICATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "qualifications_select_policy" ON public.educational_qualifications;
CREATE POLICY "qualifications_select_policy" ON public.educational_qualifications
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidates c 
        WHERE c.candidate_id = educational_qualifications.candidate_id 
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "qualifications_insert_policy" ON public.educational_qualifications;
CREATE POLICY "qualifications_insert_policy" ON public.educational_qualifications
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates c 
        WHERE c.candidate_id = educational_qualifications.candidate_id 
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "qualifications_update_policy" ON public.educational_qualifications;
CREATE POLICY "qualifications_update_policy" ON public.educational_qualifications
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidates c 
        WHERE c.candidate_id = educational_qualifications.candidate_id 
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates c 
        WHERE c.candidate_id = educational_qualifications.candidate_id 
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "qualifications_delete_policy" ON public.educational_qualifications;
CREATE POLICY "qualifications_delete_policy" ON public.educational_qualifications
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidates c 
        WHERE c.candidate_id = educational_qualifications.candidate_id 
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

-- ----------------------------------------------------------------------------
-- EXAMINATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "examinations_select_policy" ON public.examinations;
CREATE POLICY "examinations_select_policy" ON public.examinations
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "examinations_admin_insert" ON public.examinations;
CREATE POLICY "examinations_admin_insert" ON public.examinations
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "examinations_admin_update" ON public.examinations;
CREATE POLICY "examinations_admin_update" ON public.examinations
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "examinations_admin_delete" ON public.examinations;
CREATE POLICY "examinations_admin_delete" ON public.examinations
FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- EXAM CENTERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "exam_centers_select_policy" ON public.exam_centers;
CREATE POLICY "exam_centers_select_policy" ON public.exam_centers
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "exam_centers_admin_all" ON public.exam_centers;
CREATE POLICY "exam_centers_admin_all" ON public.exam_centers
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- EXAMINATION_CENTERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "examination_centers_select_policy" ON public.examination_centers;
CREATE POLICY "examination_centers_select_policy" ON public.examination_centers
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "examination_centers_admin_all" ON public.examination_centers;
CREATE POLICY "examination_centers_admin_all" ON public.examination_centers
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- APPLICATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "applications_select_policy" ON public.applications;
CREATE POLICY "applications_select_policy" ON public.applications
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidates c
        WHERE c.candidate_id = applications.candidate_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "applications_insert_policy" ON public.applications;
CREATE POLICY "applications_insert_policy" ON public.applications
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates c
        WHERE c.candidate_id = applications.candidate_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "applications_update_policy" ON public.applications;
CREATE POLICY "applications_update_policy" ON public.applications
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidates c
        WHERE c.candidate_id = applications.candidate_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates c
        WHERE c.candidate_id = applications.candidate_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "applications_delete_policy" ON public.applications;
CREATE POLICY "applications_delete_policy" ON public.applications
FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- ADMIT CARDS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "admit_cards_select_policy" ON public.admit_cards;
CREATE POLICY "admit_cards_select_policy" ON public.admit_cards
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.candidates c ON a.candidate_id = c.candidate_id
        WHERE a.application_id = admit_cards.application_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "admit_cards_admin_all" ON public.admit_cards;
CREATE POLICY "admit_cards_admin_all" ON public.admit_cards
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- RESULTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "results_select_policy" ON public.results;
CREATE POLICY "results_select_policy" ON public.results
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.candidates c ON a.candidate_id = c.candidate_id
        WHERE a.application_id = results.application_id
          AND c.user_id = auth.uid()
    ) OR public.is_admin()
);

DROP POLICY IF EXISTS "results_admin_all" ON public.results;
CREATE POLICY "results_admin_all" ON public.results
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. ROLE PERMISSIONS
-- Purpose: Grant necessary schema privileges to the authenticated role.
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.examinations, public.exam_centers TO anon;

-- ============================================================================
-- 8. LAB DEMONSTRATION OBJECT (Optional - Not part of main 9 application tables)
-- Purpose: Demonstrates PostgreSQL Declarative Range Partitioning
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.examination_archives_partitioned (
    archive_id UUID DEFAULT gen_random_uuid(),
    examination_code VARCHAR(30) NOT NULL,
    examination_name VARCHAR(150) NOT NULL,
    conducting_authority VARCHAR(150) NOT NULL,
    examination_date DATE NOT NULL,
    total_vacancies INTEGER NOT NULL,
    PRIMARY KEY (archive_id, examination_date)
) PARTITION BY RANGE (examination_date);

CREATE TABLE IF NOT EXISTS public.exams_q1_2026 PARTITION OF public.examination_archives_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS public.exams_q2_2026 PARTITION OF public.examination_archives_partitioned
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS public.exams_q3_2026 PARTITION OF public.examination_archives_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS public.exams_q4_2026 PARTITION OF public.examination_archives_partitioned
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');
