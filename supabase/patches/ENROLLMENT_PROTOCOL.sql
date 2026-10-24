-- ============================================================
-- INSTITUTIONAL ENROLLMENT & BILLING ORCHESTRATION PROTOCOL
-- ============================================================

-- 1. Ensure standard institutional mess plan exists
INSERT INTO mess_plans (name, description, monthly_fee, meals_included, is_active)
SELECT 'Standard Institutional Plan', 'Full access to breakfast, lunch, and dinner nodes.', 45000.00, '{breakfast, lunch, dinner}', true
WHERE NOT EXISTS (SELECT 1 FROM mess_plans WHERE name = 'Standard Institutional Plan');

-- 2. Strategic Enrollment Processor
CREATE OR REPLACE FUNCTION process_student_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    v_room_rent DECIMAL(10, 2);
    v_mess_plan_id UUID;
    v_mess_fee DECIMAL(10, 2);
    v_student_full_name TEXT;
    v_user_id UUID;
BEGIN
    -- Resolve Room Rent and Metadata
    SELECT monthly_rent INTO v_room_rent FROM rooms WHERE id = NEW.room_id;
    
    -- Resolve Student Metadata for notifications
    SELECT u.full_name, s.user_id INTO v_student_full_name, v_user_id 
    FROM students s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = NEW.student_id;
    
    -- Resolve Default Mess Plan
    SELECT id, monthly_fee INTO v_mess_plan_id, v_mess_fee FROM mess_plans WHERE is_active = true LIMIT 1;

    -- ------------------------------------------------------------
    -- GENERATE FINANCIAL ARTIFACTS (INVOICES)
    -- ------------------------------------------------------------

    -- Room Rent Invoice
    INSERT INTO payments (student_id, payment_type, amount, due_date, status, notes)
    VALUES (NEW.student_id, 'hostel_fee', v_room_rent, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Institutional Room Allocation Rent - Initial Month');

    -- Security Deposit (Standard Institutional Rate)
    INSERT INTO payments (student_id, payment_type, amount, due_date, status, notes)
    VALUES (NEW.student_id, 'security_deposit', 50000.00, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Refundable Institutional Security Deposit');

    -- Maintenance & Technology Fee
    INSERT INTO payments (student_id, payment_type, amount, due_date, status, notes)
    VALUES (NEW.student_id, 'other', 10000.00, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Institutional Maintenance & Technology Registry Fee');

    -- Mess Protocol Subscription & Invoicing
    IF v_mess_plan_id IS NOT NULL THEN
        -- Activate Mess Subscription
        INSERT INTO student_mess_subscriptions (student_id, mess_plan_id, start_date, is_active)
        VALUES (NEW.student_id, v_mess_plan_id, CURRENT_DATE, true)
        ON CONFLICT DO NOTHING;
        
        -- Generate Mess Fee Invoice
        INSERT INTO payments (student_id, payment_type, amount, due_date, status, notes)
        VALUES (NEW.student_id, 'mess_fee', v_mess_fee, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Institutional Mess Subscription Fee - Standard Tier');
    END IF;

    -- ------------------------------------------------------------
    -- STATUS SYNCHRONIZATION
    -- ------------------------------------------------------------
    UPDATE students SET onboarding_status = 'assigned' WHERE id = NEW.student_id;

    -- ------------------------------------------------------------
    -- SYSTEM BROADCAST (NOTIFICATIONS)
    -- ------------------------------------------------------------
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_user_id, 
        'payment_reminder', 
        'Enrollment Invoices Generated', 
        'Welcome to Huncho HMS. Your initial institutional invoices (Room, Mess, Deposit) have been generated. Please finalize payments within 7 days.',
        'payments'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Deployment of the Trigger
DROP TRIGGER IF EXISTS trigger_on_student_enrollment ON room_allocations;
CREATE TRIGGER trigger_on_student_enrollment
AFTER INSERT ON room_allocations
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION process_student_enrollment();
