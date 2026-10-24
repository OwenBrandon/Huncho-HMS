-- ============================================================
-- SEED DATA: NOVICE STUDENT NODE (AUTH-SYNC)
-- ============================================================

DO $$
DECLARE
    v_user_id UUID := '12b122bb-99fe-45e8-bff3-0cee3f2c3a2c';
    v_student_id UUID;
    v_room_id UUID;
BEGIN
    -- 1. Create/Update User Node for 'Novice' using real Auth UID
    INSERT INTO users (id, email, role, full_name, phone_number, is_active)
    VALUES (v_user_id, 'xxxnovice798@gmail.com', 'student', 'Novice Bruk', '+237 682389152', true)
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- 2. Create/Update Student Node
    INSERT INTO students (user_id, student_id, date_of_birth, gender, onboarding_status, department, year_of_study)
    VALUES (v_user_id, 'STU-NOV-2026', '2005-01-01', 'male', 'pending_assignment', 'Software Engineering', 1)
    ON CONFLICT (user_id) DO UPDATE SET 
        student_id = EXCLUDED.student_id,
        onboarding_status = EXCLUDED.onboarding_status
    RETURNING id INTO v_student_id;

    -- 3. Find an available room
    SELECT id INTO v_room_id FROM rooms WHERE status = 'available' LIMIT 1;

    -- 4. Allocate Room (This will trigger the ENROLLMENT_PROTOCOL)
    IF v_room_id IS NOT NULL THEN
        -- Check if allocation already exists to avoid duplicates
        IF NOT EXISTS (SELECT 1 FROM room_allocations WHERE student_id = v_student_id AND status = 'active') THEN
            INSERT INTO room_allocations (student_id, room_id, allocation_date, status)
            VALUES (v_student_id, v_room_id, CURRENT_DATE, 'active');
            
            RAISE NOTICE 'Novice Student Synchronized with Room and Invoices Generated.';
        ELSE
            RAISE NOTICE 'Novice Student already has an active allocation.';
        END IF;
    ELSE
        RAISE NOTICE 'No available room found. Enrollment protocol pending room availability.';
    END IF;

END
$$;
