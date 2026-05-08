-- ============================================================
-- RLS SECURITY MATRIX OVERRIDE: ENROLLMENT PROTOCOLS
-- ============================================================

-- 1. MESS SUBSCRIPTIONS: Allow Staff Orchestration
DROP POLICY IF EXISTS "Staff can manage mess subscriptions" ON student_mess_subscriptions;
CREATE POLICY "Staff can manage mess subscriptions" ON student_mess_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer', 'auditor'))
  );

-- 2. PAYMENTS: Allow Staff Invoicing
DROP POLICY IF EXISTS "Staff can manage payments" ON payments;
CREATE POLICY "Staff can manage payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer', 'auditor'))
  );

-- 3. NOTIFICATIONS: Allow System/Staff Broadcasting
DROP POLICY IF EXISTS "Staff can create notifications" ON notifications;
CREATE POLICY "Staff can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer'))
  );

-- 4. Ensure students can still see their own records (Reinforce existing)
-- (Supabase might already have these, but we ensure they remain active)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can view their own mess subscriptions') THEN
        CREATE POLICY "Students can view their own mess subscriptions" ON student_mess_subscriptions
          FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
    END IF;
END
$$;
