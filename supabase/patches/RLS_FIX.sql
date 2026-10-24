-- ============================================================
-- RLS FIX v5 — Breaking Recursion & Management Logic
-- Run this in Supabase SQL Editor to fix 500 Internal Server Errors
-- ============================================================

-- [STEP 1: Helper Functions to Break Recursion]
-- These functions run with SECURITY DEFINER to bypass RLS loops
CREATE OR REPLACE FUNCTION public.check_is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'warden', 'finance_officer', 'auditor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_admin_or_warden()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'warden')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [STEP 2: USERS TABLE RE-ARCHITECTED]
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Staff can manage all users" ON users;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff can manage all users" ON users
  FOR ALL USING (check_is_admin_or_warden());

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- [STEP 3: STUDENTS TABLE]
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Staff can view all students" ON students;
DROP POLICY IF EXISTS "Staff can manage all students" ON students;
DROP POLICY IF EXISTS "Students can insert their own record" ON students;

CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can manage all students" ON students
  FOR ALL USING (check_is_staff());

-- [STEP 4: COMPLAINTS TABLE]
DROP POLICY IF EXISTS "Students can view their own complaints" ON complaints;
DROP POLICY IF EXISTS "Staff can view assigned complaints" ON complaints;
DROP POLICY IF EXISTS "Students can create complaints" ON complaints;
DROP POLICY IF EXISTS "Staff can manage complaints" ON complaints;

CREATE POLICY "Students manage own complaints" ON complaints
  FOR ALL USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff manage all complaints" ON complaints
  FOR ALL USING (check_is_staff());

-- [STEP 5: PAYMENTS & ATTENDANCE]
DROP POLICY IF EXISTS "Staff can manage all payments" ON payments;
CREATE POLICY "Staff manage all payments" ON payments
  FOR ALL USING (check_is_staff());

DROP POLICY IF EXISTS "Staff can manage all attendance" ON attendance;
CREATE POLICY "Staff manage all attendance" ON attendance
  FOR ALL USING (check_is_staff());

-- [STEP 6: CLEANUP OLD TRIGGERS]
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
