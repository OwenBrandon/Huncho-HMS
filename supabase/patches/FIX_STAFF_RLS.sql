-- ============================================================
-- RLS FIX: EXPAND STAFF ROLES TO MAINTENANCE & SECURITY
-- Run this in Supabase SQL Editor to authorize Maintenance Staff and Security Officers
-- ============================================================

-- Update the check_is_staff function to recognize 'maintenance_staff' and 'security'
CREATE OR REPLACE FUNCTION public.check_is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'warden', 'finance_officer', 'auditor', 'maintenance_staff', 'security')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-verify RLS policies exist on complaints for staff
DROP POLICY IF EXISTS "Staff manage all complaints" ON complaints;
CREATE POLICY "Staff manage all complaints" ON complaints
  FOR ALL USING (check_is_staff());

-- Re-verify RLS policies exist on students for staff
DROP POLICY IF EXISTS "Staff can view all students" ON students;
DROP POLICY IF EXISTS "Staff can manage all students" ON students;
CREATE POLICY "Staff can manage all students" ON students
  FOR ALL USING (check_is_staff());
