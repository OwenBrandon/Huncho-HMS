import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { startOfMonth, subMonths, format } from 'date-fns';

export function useDashboard(userId?: string) {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [enrollmentGroups, setEnrollmentGroups] = useState<any[]>([]);
  const [staffCounts, setStaffCounts] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Institutional Counts
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: roomCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true });
      const { count: complaintCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
      const { data: payments } = await supabase.from('payments').select('amount, status, created_at, payment_type');

      // 2. Financial Logic
      const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const currentMonth = startOfMonth(new Date());
      const lastMonth = startOfMonth(subMonths(new Date(), 1));
      const revenueThisMonth = payments?.filter(p => p.status === 'paid' && new Date(p.created_at) >= currentMonth).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const revenueLastMonth = payments?.filter(p => p.status === 'paid' && new Date(p.created_at) >= lastMonth && new Date(p.created_at) < currentMonth).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const growth = revenueLastMonth === 0 ? 0 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

      setStats({
        students: studentCount || 0,
        rooms: roomCount || 0,
        revenue: totalRevenue,
        complaints: complaintCount || 0,
        growth: growth.toFixed(1)
      });

      // 3. Revenue Stream
      const stream = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const start = startOfMonth(d);
        const end = startOfMonth(subMonths(d, -1));
        
        const monthPayments = payments?.filter(p => p.status === 'paid' && new Date(p.created_at) >= start && new Date(p.created_at) < end) || [];
        
        const val = monthPayments.reduce((acc, p) => acc + Number(p.amount), 0);
        // Divide by 1000 for 'k' representation in the charts if needed, or just provide raw value. 
        // Admin and Student dashboard use raw 'revenue', Finance dashboard uses 'hostel' and 'mess' and appends 'k'.
        // Assuming raw values are intended, we provide them raw here.
        const hostelVal = monthPayments.filter(p => p.payment_type === 'hostel_fee').reduce((acc, p) => acc + Number(p.amount), 0);
        const messVal = monthPayments.filter(p => p.payment_type === 'mess_fee').reduce((acc, p) => acc + Number(p.amount), 0);
        
        stream.push({ 
          name: format(d, 'MMM'), 
          month: format(d, 'MMM'), // for FinanceDashboard XAxis
          revenue: val, 
          hostel: hostelVal / 1000, // FinanceDashboard appends 'k' to value, so we scale it down here for display
          mess: messVal / 1000 
        });
      }
      setRevenueData(stream);

      // 4. Compliance & Enrollment
      setComplianceData([
        { name: 'Paid', value: payments?.filter(p => p.status === 'paid').length || 0, fill: '#D4FF3F' },
        { name: 'Pending', value: (payments?.length || 1) - (payments?.filter(p => p.status === 'paid').length || 0), fill: '#111111' }
      ]);

      // [FIXED] Enrollment Logic: Joining through buildings and allocations
      const { data: roomData } = await supabase.from('rooms').select('id, building_id, capacity, buildings(name)');
      const { data: allocations } = await supabase.from('room_allocations').select('student_id, room_id').eq('status', 'active');
      
      const buildingGroups = new Map();
      roomData?.forEach(r => {
        const buildings = Array.isArray(r.buildings) ? r.buildings[0] : r.buildings;
        const bName = buildings?.name || 'Unknown';
        const group = buildingGroups.get(bName) || { allocated: 0, capacity: 0 };
        group.capacity += Number(r.capacity) || 0;
        const currentAllocations = allocations?.filter(a => a.room_id === r.id).length || 0;
        group.allocated += currentAllocations;
        buildingGroups.set(bName, group);
      });

      setEnrollmentGroups(Array.from(buildingGroups.entries()).map(([title, data]) => ({
        title,
        allocated: data.allocated.toString(),
        capacity: data.capacity.toString()
      })));

      // 5. Staffing
      const { data: users } = await supabase.from('users').select('role');
      const roles = ['warden', 'maintenance_staff', 'finance_officer', 'security'];
      setStaffCounts(roles.map(r => ({
        name: r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        members: users?.filter(u => u.role === r).length || 0,
        id: r
      })));

      // 6. Recent Activity
      const { data: rPayments } = await supabase.from('payments').select('id, amount, status, created_at, student:students(user:users(full_name))').order('created_at', { ascending: false }).limit(5);
      const { data: rComplaints } = await supabase.from('complaints').select('id, title, status, created_at, student:students(user:users(full_name))').order('created_at', { ascending: false }).limit(5);

      const activity = [
        ...(rPayments?.map(p => {
          const student = Array.isArray(p.student) ? p.student[0] : p.student;
          const user: any = student && Array.isArray(student.user) ? student.user[0] : student?.user;
          return { type: 'payment', id: p.id, title: `Payment from ${user?.full_name || 'Anonymous'}`, amount: p.amount, status: p.status, date: p.created_at };
        }) || []),
        ...(rComplaints?.map(c => {
          const student = Array.isArray(c.student) ? c.student[0] : c.student;
          const user: any = student && Array.isArray(student.user) ? student.user[0] : student?.user;
          return { type: 'complaint', id: c.id, title: c.title, user: user?.full_name || 'Anonymous', status: c.status, date: c.created_at };
        }) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
      setRecentActivity(activity);

      // 7. Missions
      const { data: dbMissions } = await supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(10);
      setMissions(dbMissions || []);

      // 8. Maintenance & Security Modules
      const { count: activeMaint } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).neq('status', 'resolved');
      const { count: activeVisitors } = await supabase.from('visitors').select('*', { count: 'exact', head: true }).is('check_out_time', null);
      const { data: dbVisitors } = await supabase.from('visitors').select('*').order('check_in_time', { ascending: false }).limit(5);
      
      setMaintenanceStats({ activeWorkOrders: activeMaint || 0 });
      setSecurityStats({ activeVisitors: activeVisitors || 0 });
      setVisitorLogs(dbVisitors || []);

      // 9. Student Specific Data
      if (userId) {
        // Fetch student and their active allocation
        const { data: student } = await supabase.from('students').select('id').eq('user_id', userId).single();
        if (student) {
          const { data: allocation } = await supabase
            .from('room_allocations')
            .select('room:rooms(room_number, buildings(name), room_type)')
            .eq('student_id', student.id)
            .eq('status', 'active')
            .single();

          const { data: sPayments } = await supabase.from('payments').select('*').eq('student_id', student.id).order('created_at', { ascending: false });
          const { data: sComplaints } = await supabase.from('complaints').select('*').eq('student_id', student.id).order('created_at', { ascending: false });
          
          setStudentData({
            room: (allocation?.room as any)?.room_number || 'N/A',
            building: Array.isArray((allocation?.room as any)?.buildings) ? (allocation?.room as any)?.buildings[0]?.name : (allocation?.room as any)?.buildings?.name || 'N/A',
            roomType: (allocation?.room as any)?.room_type || 'N/A',
            expenditure: sPayments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0,
            activeRequests: sComplaints?.filter(c => c.status !== 'resolved').length || 0,
            recentInvoices: sPayments?.slice(0, 5) || []
          });
        }
      }

    } catch (error) {
      console.error('Dashboard Data Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    revenueData,
    complianceData,
    recentActivity,
    enrollmentGroups,
    staffCounts,
    missions,
    studentData,
    maintenanceStats,
    securityStats,
    visitorLogs,
    isLoading,
    refresh: fetchData
  };
}
