-- ============================================================
-- SMART HOSTEL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL (Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'warden',
  'student',
  'security',
  'finance_officer',
  'maintenance_staff',
  'auditor'
);

CREATE TYPE gender AS ENUM ('male', 'female', 'other');

CREATE TYPE room_type AS ENUM ('single', 'double', 'triple', 'quad');

CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');

CREATE TYPE allocation_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded');

CREATE TYPE payment_type AS ENUM ('hostel_fee', 'mess_fee', 'security_deposit', 'fine', 'other');

CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE complaint_category AS ENUM (
  'maintenance',
  'electrical',
  'plumbing',
  'housekeeping',
  'security',
  'food_quality',
  'other'
);

CREATE TYPE visitor_type AS ENUM ('family', 'friend', 'official', 'vendor', 'other');

CREATE TYPE notification_type AS ENUM (
  'payment_reminder',
  'complaint_update',
  'allocation_update',
  'visitor_alert',
  'general',
  'emergency'
);

-- [NEW UPDATE 2026-05-02] Added for institutional cost tracking
CREATE TYPE expense_category AS ENUM ('utility', 'maintenance', 'administrative', 'inventory', 'other');

-- [NEW UPDATE 2026-05-02] Added for mess operations
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner');

-- [NEW UPDATE 2026-05-02] Added for operational command
CREATE TYPE directive_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- [NEW UPDATE 2026-05-02] Added for student lifecycle orchestration
CREATE TYPE onboarding_status AS ENUM (
  'applied', 
  'verifying', 
  'interviewing', 
  'pending_assignment', 
  'assigned', 
  'reassignment_requested'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  profile_picture_url TEXT,
  signature_url TEXT, -- [NEW UPDATE 2026-05-02] Added for CFO/Admin authorization
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender NOT NULL,
  blood_group VARCHAR(5),
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  emergency_contact_relation VARCHAR(50),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  permanent_address TEXT,
  department VARCHAR(100),
  year_of_study INTEGER,
  admission_date DATE,
  onboarding_status onboarding_status DEFAULT 'applied',
  is_active BOOLEAN DEFAULT true,
  document_id_proof_url TEXT,
  document_address_proof_url TEXT,
  document_photo_url TEXT,
  medical_conditions TEXT,
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  total_floors INTEGER NOT NULL,
  gender_restriction gender,
  warden_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor INTEGER NOT NULL,
  room_type room_type NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  status room_status DEFAULT 'available',
  monthly_rent DECIMAL(10, 2) NOT NULL,
  has_ac BOOLEAN DEFAULT false,
  has_attached_bathroom BOOLEAN DEFAULT false,
  amenities TEXT[], -- Array of amenities
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, room_number),
  CONSTRAINT occupancy_check CHECK (current_occupancy <= capacity)
);

-- Room Allocations table
CREATE TABLE room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_checkout_date DATE,
  actual_checkout_date DATE,
  status allocation_status DEFAULT 'active',
  allocation_notes TEXT,
  allocated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (
    expected_checkout_date IS NULL OR expected_checkout_date > allocation_date
  )
);

-- Ensure only one active allocation per student
CREATE UNIQUE INDEX one_active_allocation_per_student ON room_allocations (student_id) 
WHERE (status = 'active');

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  payment_type payment_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50), -- 'card', 'upi', 'bank_transfer', 'cash'
  transaction_id VARCHAR(100) UNIQUE,
  receipt_url TEXT,
  late_fee DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints/Tickets table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category complaint_category NOT NULL,
  priority complaint_priority DEFAULT 'medium',
  status complaint_status DEFAULT 'open',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id),
  building_id UUID REFERENCES buildings(id),
  assigned_to UUID REFERENCES users(id),
  attachment_urls TEXT[],
  resolution_notes TEXT,
  resolution_report_url TEXT, -- [NEW UPDATE 2026-05-02] Added for formal resolution reporting
  acknowledged_at TIMESTAMPTZ, -- [NEW UPDATE 2026-05-02] Added for Maintenance lifecycle
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors table
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20) NOT NULL,
  visitor_type visitor_type NOT NULL,
  visitor_id_proof_type VARCHAR(50), -- 'aadhar', 'passport', 'driving_license'
  visitor_id_proof_number VARCHAR(100),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  purpose TEXT,
  approved_by UUID REFERENCES users(id),
  security_officer_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table (for students)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_present BOOLEAN DEFAULT true,
  marked_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_via VARCHAR(50)[], -- ['email', 'in_app', 'sms']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mess Plans table
CREATE TABLE mess_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_fee DECIMAL(10, 2) NOT NULL,
  meals_included VARCHAR(50)[], -- ['breakfast', 'lunch', 'dinner']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Mess Subscriptions table
CREATE TABLE student_mess_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  mess_plan_id UUID REFERENCES mess_plans(id),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] Directives table (Tactical Commands)
CREATE TABLE directives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  target_unit user_role,
  priority directive_priority DEFAULT 'medium',
  issuer_id UUID REFERENCES users(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] Incident Logs (Protocol 104-B)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reported_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] Fund Requisitions
CREATE TABLE fund_requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  justification TEXT NOT NULL,
  requester_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] Missions/Tasks
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority directive_priority DEFAULT 'medium',
  assigned_role user_role,
  assigned_user_id UUID REFERENCES users(id),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] System Configuration Matrix
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_gender ON students(gender);

CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);

CREATE INDEX idx_allocations_student_id ON room_allocations(student_id);
CREATE INDEX idx_allocations_room_id ON room_allocations(room_id);
CREATE INDEX idx_allocations_status ON room_allocations(status);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

CREATE INDEX idx_complaints_student_id ON complaints(student_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_priority ON complaints(priority);

CREATE INDEX idx_visitors_student_id ON visitors(student_id);
CREATE INDEX idx_visitors_check_in_time ON visitors(check_in_time);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON room_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER FOR ROOM OCCUPANCY UPDATES
-- ============================================================

CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE rooms SET current_occupancy = current_occupancy + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE rooms SET current_occupancy = current_occupancy - 1
    WHERE id = OLD.room_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE rooms SET current_occupancy = current_occupancy - 1
    WHERE id = OLD.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room_occupancy
AFTER INSERT OR UPDATE OR DELETE ON room_allocations
FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- ============================================================
-- VIEWS FOR ANALYTICS
-- ============================================================

-- Active students with room details
CREATE VIEW active_student_rooms AS
SELECT
  s.id as student_id,
  s.student_id as student_number,
  u.full_name,
  u.email,
  r.room_number,
  b.name as building_name,
  ra.allocation_date,
  ra.expected_checkout_date
FROM students s
JOIN users u ON s.user_id = u.id
JOIN room_allocations ra ON s.id = ra.student_id
JOIN rooms r ON ra.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE ra.status = 'active' AND u.is_active = true;

-- Payment summary by student
CREATE VIEW student_payment_summary AS
SELECT
  s.id as student_id,
  s.student_id as student_number,
  u.full_name,
  COUNT(p.id) as total_payments,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as total_pending,
  SUM(CASE WHEN p.status = 'overdue' THEN p.amount ELSE 0 END) as total_overdue
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN payments p ON s.id = p.student_id
GROUP BY s.id, s.student_id, u.full_name;

-- Complaint statistics
CREATE VIEW complaint_statistics AS
SELECT
  category,
  status,
  priority,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours
FROM complaints
WHERE resolved_at IS NOT NULL
GROUP BY category, status, priority;

-- Room occupancy summary
CREATE VIEW room_occupancy_summary AS
SELECT
  b.name as building_name,
  r.room_type,
  COUNT(r.id) as total_rooms,
  SUM(r.capacity) as total_capacity,
  SUM(r.current_occupancy) as current_occupancy,
  ROUND((SUM(r.current_occupancy)::NUMERIC / SUM(r.capacity)::NUMERIC) * 100, 2) as occupancy_percentage
FROM rooms r
JOIN buildings b ON r.building_id = b.id
WHERE r.status != 'maintenance'
GROUP BY b.name, r.room_type;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mess_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'auditor')
    )
  );

-- Students policies
CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'warden', 'finance_officer', 'auditor')
    )
  );

-- Payments policies
CREATE POLICY "Students can view their own payments" ON payments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Finance officers can view all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'finance_officer', 'auditor')
    )
  );

-- Complaints policies
CREATE POLICY "Students can view their own complaints" ON complaints
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can view assigned complaints" ON complaints
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'warden', 'maintenance_staff', 'auditor')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Buildings & Rooms Management
CREATE POLICY "Anyone authenticated can view buildings" ON buildings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage buildings" ON buildings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

CREATE POLICY "Anyone authenticated can view rooms" ON rooms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rooms" ON rooms
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

-- Students Management
CREATE POLICY "Admins and Wardens can manage students" ON students
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

-- Room Allocations Management
CREATE POLICY "Students can view their own allocations" ON room_allocations
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view all allocations" ON room_allocations
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer', 'auditor')));

CREATE POLICY "Staff can manage allocations" ON room_allocations
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

CREATE POLICY "Staff can update allocations" ON room_allocations
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

-- Visitors policies
CREATE POLICY "Students can view their own visitors" ON visitors
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view all visitors" ON visitors
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'security', 'auditor')));

CREATE POLICY "Staff can insert visitors" ON visitors
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'security')));

CREATE POLICY "Staff can update visitors" ON visitors
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'security')));

-- Mess Management policies
CREATE POLICY "Anyone authenticated can view mess plans" ON mess_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Students can view their own mess subscriptions" ON student_mess_subscriptions
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view all mess subscriptions" ON student_mess_subscriptions
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer', 'auditor')));

-- Room Allocations policies
CREATE POLICY "Students can view their own allocations" ON room_allocations
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view all allocations" ON room_allocations
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'finance_officer', 'auditor')));

-- Attendance policies
CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view all attendance" ON attendance
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'security', 'auditor')));

-- Audit Logs policies
CREATE POLICY "Admins and Auditors can view audit logs" ON audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'auditor')));

-- [NEW UPDATE 2026-05-02] Institutional Expenses Table
CREATE TABLE institutional_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category expense_category NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  authorized_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW UPDATE 2026-05-02] Meal Bookings Table
CREATE TABLE meal_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  booking_date DATE NOT NULL,
  is_consumed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, booking_date, meal_type)
);

-- ============================================================
-- NEW RLS POLICIES (2026-05-02)
-- ============================================================

ALTER TABLE institutional_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance can view all expenses" ON institutional_expenses
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_officer', 'auditor')));

CREATE POLICY "Students can view their own meal bookings" ON meal_bookings
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- [NEW UPDATE 2026-05-02] New Table RLS Policies
ALTER TABLE directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned missions" ON missions
  FOR SELECT USING (assigned_user_id = auth.uid() OR assigned_role = (SELECT role FROM users WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'auditor')));

CREATE POLICY "Users can create missions" ON missions
  FOR INSERT WITH CHECK (auth.uid() = assigned_user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

CREATE POLICY "Users can update their missions" ON missions
  FOR UPDATE USING (assigned_user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

CREATE POLICY "Staff can view directives" ON directives
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and Wardens can manage directives" ON directives
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden')));

CREATE POLICY "Wardens and Security can view incidents" ON incidents
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'security', 'auditor')));

CREATE POLICY "Finance can view all requisitions" ON fund_requisitions
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_officer', 'auditor')));

CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'auditor')));

-- [NEW UPDATE 2026-05-02] Mess Menus (Weekly Roster Architect)
CREATE TABLE mess_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
  meal_type meal_type NOT NULL,
  menu_item VARCHAR(255) NOT NULL,
  kcal INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week, meal_type)
);

-- [NEW UPDATE 2026-05-02] Inventory Management
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'dry_grains', 'perishables', 'dairy', etc.
  current_level DECIMAL(10, 2) DEFAULT 0,
  min_level DECIMAL(10, 2) DEFAULT 20,
  unit VARCHAR(20) DEFAULT 'units',
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEW RLS POLICIES (Inventory & Menus)
-- ============================================================

ALTER TABLE mess_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mess menus" ON mess_menus
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mess menus" ON mess_menus
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'auditor')));

CREATE POLICY "Staff can view inventory" ON inventory_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage inventory" ON inventory_items
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'warden', 'auditor')));

-- Add triggers for updated_at
CREATE TRIGGER update_mess_menus_updated_at BEFORE UPDATE ON mess_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
