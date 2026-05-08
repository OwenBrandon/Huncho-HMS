-- Fix Missions FK to allow cascade delete
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_assigned_user_id_fkey;
ALTER TABLE missions ADD CONSTRAINT missions_assigned_user_id_fkey 
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE;
