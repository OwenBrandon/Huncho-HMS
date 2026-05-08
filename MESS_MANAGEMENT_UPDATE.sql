-- Add 'snack' to meal_type enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some versions of PG, 
-- but Supabase usually handles it or we can run it separately.
-- For this script, we assume it works or the type already exists.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'meal_type' AND e.enumlabel = 'snack') THEN
        ALTER TYPE meal_type ADD VALUE 'snack';
    END IF;
END
$$;

-- Create meal_feedback table
CREATE TABLE IF NOT EXISTS meal_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can create their own feedback') THEN
        CREATE POLICY "Students can create their own feedback" ON meal_feedback
          FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone authenticated can view feedback') THEN
        CREATE POLICY "Anyone authenticated can view feedback" ON meal_feedback
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END
$$;
