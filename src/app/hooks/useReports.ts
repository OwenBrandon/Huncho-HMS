import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { startOfMonth, subDays, format } from 'date-fns';

export function useReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [flowData, setFlowData] = useState<any[]>([]);
  const [densityData, setDensityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Basic Data
      const { data: payments } = await supabase.from('payments').select(`
        id, amount, status, created_at, payment_type, 
        student:students(user:users(full_name))
      `);
      const { data: requisitions } = await supabase.from('fund_requisitions').select('*');

      // 2. Fetch Anomalies (Overdue payments)
      const overdue = payments?.filter(p => p.status === 'pending' && new Date(p.created_at) < subDays(new Date(), 30)) || [];
      const overdueAnomalies = overdue.map((p: any) => ({
        id: p.id.substring(0, 8).toUpperCase(),
        desc: `Overdue payment for ${p.student?.user?.full_name || 'Unknown Student'}`,
        amount: `CFA ${Number(p.amount).toLocaleString()}`,
        level: 'High'
      }));
      setAnomalies(overdueAnomalies);

      // 3. Calculate Audit Stats
      const totalPaid = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const totalApprovedReq = requisitions?.filter(r => r.status === 'approved').reduce((acc, r) => acc + Number(r.amount), 0) || 0;
      const monthlyBurn = requisitions?.filter(r => r.status === 'approved' && new Date(r.created_at) >= startOfMonth(new Date())).reduce((acc, r) => acc + Number(r.amount), 0) || 0;
      
      const verifiedCount = payments?.filter(p => p.status === 'paid').length || 0;
      const totalCount = payments?.length || 1;

      setStats({
        netLiquidity: `CFA ${((totalPaid - totalApprovedReq) / 1000000).toFixed(1)}M`,
        institutionalBurn: `CFA ${(monthlyBurn / 1000).toFixed(0)}k`,
        syncRatio: `${((verifiedCount / totalCount) * 100).toFixed(1)}%`
      });

      // 4. Flow Velocity (7 Days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayLabel = format(d, 'eee');
        const start = new Date(d.setHours(0,0,0,0));
        const end = new Date(d.setHours(23,59,59,999));

        const inflow = payments
          ?.filter(p => p.status === 'paid' && new Date(p.created_at) >= start && new Date(p.created_at) < end)
          .reduce((acc, p) => acc + Number(p.amount), 0) || 0;
        
        const outflow = requisitions
          ?.filter(r => r.status === 'approved' && new Date(r.created_at) >= start && new Date(r.created_at) < end)
          .reduce((acc, r) => acc + Number(r.amount), 0) || 0;

        days.push({ name: dayLabel, inflow, outflow });
      }
      setFlowData(days);

      // 5. Expenditure Density
      const categories = ['Maintenance', 'Mess', 'Supplies', 'Admin'];
      const density = categories.map(cat => {
        const value = requisitions?.filter(r => r.category.toLowerCase().includes(cat.toLowerCase()) && r.status === 'approved').reduce((acc, r) => acc + Number(r.amount), 0) || 0;
        return { name: cat, value };
      });
      setDensityData(density.filter(d => d.value > 0).length > 0 ? density : [
        { name: 'Maintenance', value: 1 }, { name: 'Mess', value: 1 }, { name: 'Supplies', value: 1 }
      ]);

      // 6. Virtual Reports Registry
      const virtualReports = requisitions?.slice(0, 5).map(r => ({
        id: `AUD-${r.id.substring(0, 4)}`,
        name: `Forensic Audit: ${r.category}`,
        date: r.created_at.split('T')[0],
        auditor: 'Finance Desk',
        status: r.status === 'approved' ? 'finalized' : 'under_review',
        score: '100%',
        category: r.category
      })) || [];
      setReports(virtualReports);

    } catch (err: any) {
      console.error('Reports Sync Error:', err);
      toast.error('Failed to sync forensic registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    reports,
    anomalies,
    stats,
    flowData,
    densityData,
    isLoading,
    refresh: fetchData,
    resolveAnomaly: async (id: string) => {
      setAnomalies(prev => prev.filter(a => a.id !== id));
      toast.success('Anomaly Purged');
    }
  };
}
