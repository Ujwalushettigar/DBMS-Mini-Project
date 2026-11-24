-- ==============================================================================
-- GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
-- Database: PostgreSQL 15+ (Supabase Compatible)
-- File: database/functions.sql
-- Description: Stored functions, automated trigger handlers, and concurrency-safe
--              capacity and business constraint enforcement.
--
-- ACADEMIC DBMS MINI-PROJECT (CS522L5C / VIVA VOCE REFERENCE)
-- ==============================================================================

-- ==============================================================================
-- 1. TIMESTAMP MAINTENANCE TRIGGER FUNCTION
-- Purpose: Automatically updates the updated_at column to NOW() on every UPDATE.
-- ==============================================================================
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

COMMENT ON FUNCTION public.set_updated_at() IS 'Trigger function maintaining updated_at timestamp across core entities.';

-- Bind timestamp triggers to tables with updated_at column
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

-- ==============================================================================
-- 2. AUTOMATIC PROFILE CREATION ON SUPABASE AUTH SIGNUP
-- Purpose: Safely creates a public.profiles entry whenever a user registers
--          in auth.users, guaranteeing default role = 'candidate'.
-- ==============================================================================
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
        'candidate',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automates public.profiles creation upon Supabase auth.users signup.';

-- Bind trigger on auth.users (if running in Supabase environment)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ==============================================================================
-- 3. EXAMINATION DATE INTEGRITY VALIDATION
-- Purpose: Validates chronological sanity:
--          application_start_date <= application_end_date <= examination_date
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_examination_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.application_start_date > NEW.application_end_date THEN
        RAISE EXCEPTION 'Invalid Dates: Application start date (%) cannot be after application end date (%).',
            NEW.application_start_date, NEW.application_end_date;
    END IF;

    IF NEW.application_end_date > NEW.examination_date THEN
        RAISE EXCEPTION 'Invalid Dates: Application end date (%) cannot be after examination date (%).',
            NEW.application_end_date, NEW.examination_date;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_examination_dates() IS 'Enforces chronological lifecycle ordering for exam notifications.';

DROP TRIGGER IF EXISTS trg_validate_exam_dates ON public.examinations;
CREATE TRIGGER trg_validate_exam_dates
BEFORE INSERT OR UPDATE OF application_start_date, application_end_date, examination_date
ON public.examinations
FOR EACH ROW EXECUTE FUNCTION public.validate_examination_dates();

-- ==============================================================================
-- 4. RESULT PUBLICATION INTEGRITY
-- Purpose: Prevents premature score publication before marks and status are recorded.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_result_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF (NEW.is_published = TRUE OR NEW.published_at IS NOT NULL) THEN
        IF NEW.marks_obtained IS NULL THEN
            RAISE EXCEPTION 'Cannot publish result: Marks obtained is null for application ID %.', NEW.application_id;
        END IF;

        IF NEW.maximum_marks IS NULL OR NEW.maximum_marks <= 0 THEN
            RAISE EXCEPTION 'Cannot publish result: Maximum marks must be greater than zero.';
        END IF;

        IF NEW.result_status IS NULL OR NEW.result_status = 'pending' THEN
            RAISE EXCEPTION 'Cannot publish result: Final evaluation status cannot be pending.';
        END IF;

        -- Automatically stamp published_at if not explicitly provided
        IF NEW.published_at IS NULL THEN
            NEW.published_at = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_result_publication() IS 'Guarantees complete evaluation before publishing scorecards.';

DROP TRIGGER IF EXISTS trg_validate_result_publication ON public.results;
CREATE TRIGGER trg_validate_result_publication
BEFORE INSERT OR UPDATE OF is_published, published_at, marks_obtained, result_status
ON public.results
FOR EACH ROW EXECUTE FUNCTION public.validate_result_publication();

-- ==============================================================================
-- 5. CONCURRENCY-SAFE CENTER ALLOCATION CAPACITY ENFORCEMENT
-- Purpose: Ensures the sum of seat allocations across all examinations on the
--          SAME examination date cannot exceed the physical total_capacity.
-- Concurrency: Uses row-level lock (FOR UPDATE) on exam_centers to serialize
--              concurrent allocations for the same venue.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_center_allocation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_exam_date DATE;
    v_total_capacity INTEGER;
    v_allocated_sum INTEGER;
BEGIN
    -- Look up the target examination's scheduled examination date
    SELECT examination_date INTO v_exam_date
    FROM public.examinations
    WHERE examination_id = NEW.examination_id;

    IF v_exam_date IS NULL THEN
        RAISE EXCEPTION 'Target examination ID % not found.', NEW.examination_id;
    END IF;

    -- Concurrency Protection: Lock the center row in exam_centers
    SELECT total_capacity INTO v_total_capacity
    FROM public.exam_centers
    WHERE center_id = NEW.center_id
    FOR UPDATE;

    IF v_total_capacity IS NULL THEN
        RAISE EXCEPTION 'Target examination center ID % does not exist.', NEW.center_id;
    END IF;

    IF NEW.allocated_capacity > v_total_capacity THEN
        RAISE EXCEPTION 'Single allocation (%) exceeds total physical capacity (%) for center %.',
            NEW.allocated_capacity, v_total_capacity, NEW.center_id;
    END IF;

    -- Compute existing allocations for this center on the identical exam date
    SELECT COALESCE(SUM(ec.allocated_capacity), 0) INTO v_allocated_sum
    FROM public.examination_centers ec
    JOIN public.examinations e ON ec.examination_id = e.examination_id
    WHERE ec.center_id = NEW.center_id
      AND e.examination_date = v_exam_date
      AND (TG_OP = 'INSERT' OR ec.examination_id <> NEW.examination_id);

    IF (v_allocated_sum + NEW.allocated_capacity) > v_total_capacity THEN
        RAISE EXCEPTION 'Allocation exceeds venue capacity! Date: %, Center Capacity: %, Already Allocated: %, Attempted: %',
            v_exam_date, v_total_capacity, v_allocated_sum, NEW.allocated_capacity;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_center_allocation_capacity() IS 'Concurrency-safe trigger guarding physical exam venue capacity on date.';

DROP TRIGGER IF EXISTS trg_validate_center_allocation ON public.examination_centers;
CREATE TRIGGER trg_validate_center_allocation
BEFORE INSERT OR UPDATE OF allocated_capacity, center_id, examination_id
ON public.examination_centers
FOR EACH ROW EXECUTE FUNCTION public.check_center_allocation_capacity();

-- ==============================================================================
-- 6. CONCURRENCY-SAFE APPLICATION CENTER CAPACITY ENFORCEMENT
-- Purpose: Ensures applicant count does not exceed allocated venue capacity.
-- Concurrency: Uses row-level lock (FOR UPDATE) on examination_centers to serialize
--              concurrent applications targeting the same venue allocation.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_application_center_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_allocated_capacity INTEGER;
    v_assigned_count INTEGER;
BEGIN
    IF NEW.center_id IS NOT NULL AND (
        TG_OP = 'INSERT' 
        OR OLD.center_id IS NULL 
        OR OLD.center_id <> NEW.center_id 
        OR OLD.application_status <> NEW.application_status
    ) THEN
        -- Verify that center is mapped to this exam AND lock the row against race conditions
        SELECT allocated_capacity INTO v_allocated_capacity
        FROM public.examination_centers
        WHERE examination_id = NEW.examination_id
          AND center_id = NEW.center_id
        FOR UPDATE;

        IF v_allocated_capacity IS NULL THEN
            RAISE EXCEPTION 'Center ID % is not designated or allocated for examination ID %.',
                NEW.center_id, NEW.examination_id;
        END IF;

        -- Count active applications currently assigned
        SELECT COUNT(*) INTO v_assigned_count
        FROM public.applications
        WHERE examination_id = NEW.examination_id
          AND center_id = NEW.center_id
          AND application_status NOT IN ('rejected', 'withdrawn')
          AND (TG_OP = 'INSERT' OR application_id <> NEW.application_id);

        IF v_assigned_count >= v_allocated_capacity THEN
            RAISE EXCEPTION 'Allocated capacity of % reached for this exam center. Cannot assign more candidates.',
                v_allocated_capacity;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_application_center_capacity() IS 'Guards examination venue quotas against concurrent application submission.';

DROP TRIGGER IF EXISTS trg_validate_application_center_capacity ON public.applications;
CREATE TRIGGER trg_validate_application_center_capacity
BEFORE INSERT OR UPDATE OF center_id, application_status
ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.check_application_center_capacity();

-- ==============================================================================
-- 7. SECURITY HELPER FUNCTION: is_admin()
-- Purpose: Secure SECURITY DEFINER function to verify administrative privileges
--          without causing infinite recursion in RLS policies.
-- ==============================================================================
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

COMMENT ON FUNCTION public.is_admin() IS 'Returns TRUE if the authenticated session belongs to an administrative user.';
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ==============================================================================
-- 8. ANALYTICAL STORED FUNCTION: get_exam_summary_stats()
-- Purpose: Returns aggregated performance and application metrics for an examination.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_exam_summary_stats(p_exam_id UUID)
RETURNS TABLE (
    examination_code VARCHAR(30),
    examination_name VARCHAR(150),
    total_vacancies INTEGER,
    total_applications BIGINT,
    accepted_applications BIGINT,
    admit_cards_issued BIGINT,
    candidates_evaluated BIGINT,
    candidates_passed BIGINT,
    average_marks NUMERIC(5,2),
    highest_marks NUMERIC(7,2)
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT 
        e.examination_code,
        e.examination_name,
        e.total_vacancies,
        COUNT(a.application_id) AS total_applications,
        COUNT(CASE WHEN a.application_status IN ('accepted', 'approved') THEN 1 END) AS accepted_applications,
        COUNT(ac.admit_card_id) AS admit_cards_issued,
        COUNT(r.result_id) AS candidates_evaluated,
        COUNT(CASE WHEN r.result_status = 'pass' THEN 1 END) AS candidates_passed,
        ROUND(AVG(r.marks_obtained), 2) AS average_marks,
        MAX(r.marks_obtained) AS highest_marks
    FROM public.examinations e
    LEFT JOIN public.applications a ON e.examination_id = a.examination_id
    LEFT JOIN public.admit_cards ac ON a.application_id = ac.application_id
    LEFT JOIN public.results r ON a.application_id = r.application_id
    WHERE e.examination_id = p_exam_id
    GROUP BY e.examination_id, e.examination_code, e.examination_name, e.total_vacancies;
$$;

COMMENT ON FUNCTION public.get_exam_summary_stats(UUID) IS 'Computes full lifecycle aggregation statistics for an examination.';

-- End of File: database/functions.sql
