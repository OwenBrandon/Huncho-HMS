import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export interface Allocation {
  id: string;
  student_id: string;
  room_id: string;
  allocation_date: string;
  expected_checkout_date: string | null;
  actual_checkout_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  allocation_notes: string | null;
  student?: any;
  studentUser?: any;
  room?: any;
  building?: any;
}

export function useAllocations() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('room_allocations')
        .select(`
          *,
          student:students(
            *,
            user:users(*)
          ),
          room:rooms(
            *,
            building:buildings(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data for the UI
      const transformed = data?.map(a => ({
        ...a,
        studentUser: a.student?.user,
        building: a.room?.building
      })) || [];

      setAllocations(transformed);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to sync stay registry');
    } finally {
      setIsLoading(false);
    }
  };

  const allocateRoom = async (studentId: string, roomId: string, dates: { allocation_date: string, expected_checkout_date?: string }) => {
    try {
      const { data, error: allocError } = await supabase
        .from('room_allocations')
        .insert({
          student_id: studentId,
          room_id: roomId,
          ...dates,
          status: 'active'
        })
        .select()
        .single();

      if (allocError) throw allocError;

      // Also update student onboarding status to 'assigned'
      await supabase
        .from('students')
        .update({ onboarding_status: 'assigned' })
        .eq('id', studentId);

      toast.success('Strategic Allocation Sealed');
      fetchAllocations();
      return data;
    } catch (err: any) {
      toast.error('Allocation failed', { description: err.message });
      throw err;
    }
  };

  const checkoutStudent = async (allocationId: string) => {
    try {
      const { error: checkoutError } = await supabase
        .from('room_allocations')
        .update({
          status: 'completed',
          actual_checkout_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', allocationId);

      if (checkoutError) throw checkoutError;
      
      toast.success('Checkout protocol completed');
      fetchAllocations();
    } catch (err: any) {
      toast.error('Checkout failed', { description: err.message });
    }
  };

  const reassignRoom = async (allocationId: string, newRoomId: string) => {
    try {
      // 1. Complete current allocation
      await supabase
        .from('room_allocations')
        .update({ status: 'completed', actual_checkout_date: new Date().toISOString().split('T')[0] })
        .eq('id', allocationId);

      // 2. Fetch student info from current allocation
      const current = allocations.find(a => a.id === allocationId);
      if (!current) throw new Error('Original allocation node not found');

      // 3. Create new allocation
      await allocateRoom(current.student_id, newRoomId, {
        allocation_date: new Date().toISOString().split('T')[0]
      });

      toast.success('Room Reassignment Protocol Complete');
    } catch (err: any) {
      toast.error('Reassignment failed', { description: err.message });
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  return {
    allocations,
    isLoading,
    error,
    refresh: fetchAllocations,
    allocateRoom,
    checkoutStudent,
    reassignRoom
  };
}
