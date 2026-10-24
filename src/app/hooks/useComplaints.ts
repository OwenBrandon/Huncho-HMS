import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function useComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          student:students(
            *,
            user:users(*)
          ),
          assigned_user:users!assigned_to(*),
          room:rooms(*),
          building:buildings(*)
        `)
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (user.role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (studentData) {
          query = query.eq('student_id', studentData.id);
        } else {
          // No student record yet — return empty
          setComplaints([]);
          setIsLoading(false);
          return;
        }
      } else if (user.role === 'maintenance_staff') {
        // Maintenance staff should see all complaints so they can pick them from the queue
        // No additional filters needed since RLS allows them global read access
      }

      const { data, error } = await query;
      if (error) throw error;
      setComplaints(data || []);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      toast.error('Failed to load complaints registry');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createComplaint = async (complaintData: any) => {
    try {
      // 1. Look up existing student record
      let { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      // 2. If no student record exists, auto-create a minimal one
      if (!studentData) {
        const { data: newStudent, error: studentErr } = await supabase
          .from('students')
          .insert({
            user_id: user?.id,
            student_id: `STU-${Date.now()}`,
            date_of_birth: '2000-01-01',
            gender: 'other',
            emergency_contact_name: 'Not Set',
            emergency_contact_phone: '0000000000',
          })
          .select('id')
          .single();

        if (studentErr || !newStudent) {
          throw new Error('Could not provision student profile. Contact your Admin.');
        }
        studentData = newStudent;
      }

      // 3. Fetch current room allocation if any
      const { data: allocation } = await supabase
        .from('room_allocations')
        .select('room_id')
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .maybeSingle();

      // 4. Insert complaint
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          ...complaintData,
          student_id: studentData.id,
          room_id: allocation?.room_id || null,
          ticket_number: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Complaint Logged', { description: 'Your protocol has been synchronized.' });
      fetchData();
      return data;
    } catch (err: any) {
      toast.error('Log Failed', { description: err.message });
      throw err;
    }
  };


  const updateComplaint = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
      throw err;
    }
  };

  const acknowledgeComplaint = async (id: string) => {
    return updateComplaint(id, {
      status: 'in_progress',
      assigned_to: user?.id, // Claim the ticket automatically
      acknowledged_at: new Date().toISOString()
    });
  };

  const assignComplaint = async (id: string, staffId: string) => {
    return updateComplaint(id, {
      status: 'in_progress',
      assigned_to: staffId,
      updated_at: new Date().toISOString()
    });
  };

  const resolveComplaint = async (id: string, notes: string) => {
    return updateComplaint(id, {
      status: 'resolved',
      resolution_notes: notes,
      resolved_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    complaints,
    isLoading,
    refresh: fetchData,
    createComplaint,
    updateComplaint,
    acknowledgeComplaint,
    assignComplaint,
    resolveComplaint
  };
}
