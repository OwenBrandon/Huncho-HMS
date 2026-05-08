import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_type: string;
  visitor_id_proof_type?: string;
  visitor_id_proof_number?: string;
  student_id: string;
  room_id?: string;
  check_in_time: string;
  check_out_time: string | null;
  purpose: string | null;
  notes: string | null;
  student?: any;
  studentUser?: any;
}

export function useVisitors() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('visitors')
        .select(`
          *,
          student:students(
            *,
            user:users(*)
          )
        `)
        .order('check_in_time', { ascending: false });

      if (user?.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (student) {
          query = query.eq('student_id', student.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformed = data?.map(v => ({
        ...v,
        studentUser: v.student?.user
      })) || [];

      setVisitors(transformed);
    } catch (err: any) {
      console.error('Visitor Sync Error:', err.message);
      toast.error('Failed to sync visitor logs');
    } finally {
      setIsLoading(false);
    }
  };

  const findStudentByNumber = async (studentNumber: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('student_id', studentNumber)
      .single();
    
    if (error) throw error;
    return data.id;
  };

  const searchStudents = async (queryText: string) => {
    if (!queryText || queryText.length < 2) return [];
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          user:users(full_name)
        `)
        .or(`student_id.ilike.%${queryText}%,user.full_name.ilike.%${queryText}%`)
        .limit(10);
      
      if (error) throw error;
      
      return data.map(s => ({
        id: s.id,
        student_id: s.student_id,
        full_name: (s.user as any)?.full_name || 'Unknown'
      }));
    } catch (err) {
      console.error('Student Search Error:', err);
      return [];
    }
  };

  const checkInVisitor = async (visitorData: any) => {
    try {
      let finalStudentId = visitorData.student_id;
      
      // If student_id looks like a student number (STU-XXX or HMS-XXX), look up the UUID
      if (typeof finalStudentId === 'string' && (finalStudentId.startsWith('STU-') || finalStudentId.startsWith('HMS-'))) {
        try {
          finalStudentId = await findStudentByNumber(finalStudentId);
        } catch (err) {
          throw new Error(`Resident ID ${visitorData.student_id} not found in the student registry.`);
        }
      }

      const { data, error } = await supabase
        .from('visitors')
        .insert({
          ...visitorData,
          student_id: finalStudentId,
          security_officer_id: user?.id
        })
        .select(`
          *,
          student:students(
            *,
            user:users(*)
          )
        `)
        .maybeSingle();

      if (error) throw error;
      toast.success('Identity Authorized', { description: `${visitorData.visitor_name} has been logged.` });
      fetchVisitors();
      return data;
    } catch (err: any) {
      toast.error('Check-in failed', { description: err.message });
      throw err;
    }
  };

  const checkOutVisitor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Security Clearance Granted');
      fetchVisitors();
    } catch (err: any) {
      toast.error('Check-out failed', { description: err.message });
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [user]);

  return {
    visitors,
    isLoading,
    refresh: fetchVisitors,
    checkInVisitor,
    checkOutVisitor,
    searchStudents
  };
}
