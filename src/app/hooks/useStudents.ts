import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Student, User } from '../types';

export function useStudents() {
  const [students, setStudents] = useState<(Student & { user: User })[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch enrolled students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // 2. Fetch pending users (role = 'student' but no record in students table)
      const { data: allStudentUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student');

      if (usersError) throw usersError;

      const enrolledUserIds = new Set((studentsData || []).map(s => s.user_id));
      const pending = (allStudentUsers || []).filter(u => !enrolledUserIds.has(u.id));

      setStudents(studentsData || []);
      setPendingUsers(pending);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enrollUser = async (userId: string, enrollmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: userId,
          ...enrollmentData,
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      
      setStudents(prev => [data, ...prev]);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      
      return data;
    } catch (err: any) {
      console.error('Enrollment error:', err);
      throw err;
    }
  };

  const updateStudent = async (id: string, updateData: any) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      
      setStudents(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err: any) {
      console.error('Update error:', err);
      throw err;
    }
  };

  const updateOnboardingStatus = async (id: string, status: string) => {
    return await updateStudent(id, { onboarding_status: status });
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  return { 
    students, 
    pendingUsers, 
    isLoading, 
    error, 
    refresh: fetchData, 
    enrollUser,
    updateStudent,
    updateOnboardingStatus,
    deleteStudent
  };
}
