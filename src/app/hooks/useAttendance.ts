import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from 'sonner';

export function useAttendance() {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [directives, setDirectives] = useState<any[]>([]);
  const [stats, setStats] = useState({
    presenceCount: 0,
    absenceCount: 0,
    lateIngressCount: 0,
    leaveCount: 0,
    verifiedEntries: 0,
    flaggedIntrusions: 0,
    lateReturns: 0,
    activePatrols: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch All Active Students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          user:users(*),
          room_allocations(
            status,
            room:rooms(
              room_number,
              building:buildings(name)
            )
          )
        `)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // 2. Fetch Today's Attendance
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (attError) throw attError;

      if (!studentsData) {
        setAttendance([]);
        return;
      }

      // 3. Merge Students with Attendance
      const mergedRegistry = studentsData.map(student => {
        const activeAllocation = student.room_allocations?.find((ra: any) => ra.status === 'active');
        const roomInfo = activeAllocation?.room;
        
        const record = attData?.find(r => r.student_id === student.id);
        return {
          id: record?.id || `temp-${student.id}`,
          student_id: student.id,
          student: {
            ...student,
            room: roomInfo
          },
          date: today,
          is_present: record ? record.is_present : false,
          check_in_time: record?.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          check_out_time: record?.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          notes: record?.notes || '',
          is_marked: !!record
        };
      });

      setAttendance(mergedRegistry);

      // 4. Calculate Stats
      const presence = mergedRegistry.filter(r => r.is_present).length;
      const lateThreshold = new Date();
      lateThreshold.setHours(22, 0, 0); // 10 PM
      
      const lateIngress = mergedRegistry.filter(r => {
        if (!r.check_in_time) return false;
        const [time, period] = r.check_in_time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const checkTime = new Date();
        checkTime.setHours(hours, minutes, 0);
        return checkTime > lateThreshold;
      }).length;

      // 5. Fetch Visitors for Security Stats
      const { data: visitorsData } = await supabase
        .from('visitors')
        .select('*')
        .is('check_out_time', null);

      // 6. Fetch Missions for Patrol Stats
      let missionQuery = supabase.from('missions').select('*');
      missionQuery = missionQuery.or(`assigned_role.eq.${user?.role},assigned_user_id.eq.${user?.id}`);
      const { data: missData } = await missionQuery.order('created_at', { ascending: false });
      
      // Filter out missions completed more than 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const filteredMissions = (missData || []).filter(m => {
        if (m.status !== 'completed') return true;
        if (!m.completed_at) return true;
        return new Date(m.completed_at) > oneHourAgo;
      });
      setMissions(filteredMissions);

      const activePatrols = missData?.filter(m => m.assigned_role === 'security' && m.status === 'pending').length || 0;

      const isStudent = user?.role === 'student';
      const studentRecord = isStudent ? mergedRegistry.find((a: any) => a.student?.user_id === user?.id) : null;

      setStats({
        presenceCount: isStudent ? (studentRecord?.is_present ? 1 : 0) : presence,
        absenceCount: isStudent ? (studentRecord?.is_present ? 0 : 1) : (studentsData.length - presence),
        lateIngressCount: isStudent ? (studentRecord?.check_in_time && new Date(studentRecord.check_in_time).getHours() >= 22 ? 1 : 0) : lateIngress,
        leaveCount: 0,
        verifiedEntries: visitorsData?.length || 0,
        flaggedIntrusions: 0,
        lateReturns: 0,
        activePatrols: activePatrols
      });

      // 7. Fetch Directives (Strategic Timeline)
      let dirQuery = supabase.from('directives').select('*');
      
      // Admins and Wardens see all directives. Others see only those targeted at them OR global ones.
      if (user?.role !== 'admin' && user?.role !== 'warden') {
        dirQuery = dirQuery.or(`target_unit.eq.${user?.role},is_global.eq.true`);
      }
      
      const { data: dirData } = await dirQuery.order('created_at', { ascending: false });
      setDirectives(dirData || []);

    } catch (err: any) {
      console.error('Attendance Sync Error:', err.message);
      toast.error('Failed to sync ingress registry');
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (studentId: string, isPresent: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          date: new Date().toISOString().split('T')[0],
          is_present: isPresent,
          check_in_time: isPresent ? new Date().toISOString() : null,
          notes,
          marked_by: user?.id
        }, { onConflict: 'student_id,date' });

      if (error) throw error;
      toast.success('Registry Updated');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to mark attendance', { description: err.message });
    }
  };

  const createMission = async (mission: any) => {
    try {
      const assignedId = mission.assigned_user_id || user?.id;
      const { error } = await supabase
        .from('missions')
        .insert({
          ...mission,
          assigned_user_id: assignedId
        });

      if (error) throw error;
      
      // Dispatch Telemetry Alert
      await createNotification({
        user_id: assignedId,
        title: "New Tactical Objective",
        message: `Strategic Directive: ${mission.title}`,
        type: 'general'
      });

      toast.success('Mission Deployed');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create mission', { description: err.message });
    }
  };

  const updateMissionStatus = async (missionId: string, status: 'pending' | 'completed') => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', missionId);

      if (error) throw error;
      toast.success(status === 'completed' ? 'Mission accomplished' : 'Mission reactivated');
      fetchData();
    } catch (err: any) {
      toast.error('Tactical update failed');
    }
  };

  const createDirective = async (directive: any) => {
    try {
      const { error } = await supabase
        .from('directives')
        .insert({
          ...directive,
          issuer_id: user?.id
        });

      if (error) throw error;
      toast.success('Strategic Protocol Published');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to publish protocol', { description: err.message });
    }
  };

  const fetchStudentActivity = async (studentId: string) => {
    try {
      const { data: attHistory } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(20);

      const { data: visitorHistory } = await supabase
        .from('visitors')
        .select('*')
        .eq('student_id', studentId)
        .order('check_in_time', { ascending: false })
        .limit(20);

      return {
        attendance: attHistory || [],
        visitors: visitorHistory || []
      };
    } catch (err: any) {
      console.error('Activity Sync Error:', err.message);
      return { attendance: [], visitors: [] };
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    attendance,
    missions,
    directives,
    stats,
    isLoading,
    refresh: fetchData,
    markAttendance,
    createMission,
    createDirective,
    updateMissionStatus,
    fetchStudentActivity
  };
}
