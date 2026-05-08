import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { startOfMonth, subMonths, format } from 'date-fns';

export function useAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [departmentalBurn, setDepartmentalBurn] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch KPI Stats
      const { data: payments } = await supabase.from('payments').select('id, amount, status, created_at, payment_type, student:students(user:users(full_name))');
      const { data: requisitions } = await supabase.from('fund_requisitions').select('id, amount, status, created_at, category');

      if (!payments || payments.length === 0) {
        setStats({
          yieldVelocity: '0.0%',
          collectionIndex: '0.0%',
          burnRate: '0.0%',
          liquidity: 'CFA 0'
        });
        setVelocityData([]);
        setSectorData([]);
        setDepartmentalBurn([]);
        setRecentTransactions([]);
        return;
      }

      const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const collectedRevenue = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0);
      const totalBurn = requisitions?.filter(r => r.status === 'approved').reduce((acc, r) => acc + Number(r.amount), 0) || 0;

      // ... trend calculations ...
      const thisMonth = startOfMonth(new Date());
      const lastMonth = startOfMonth(subMonths(new Date(), 1));
      
      const thisMonthRev = payments
        .filter(p => new Date(p.created_at) >= thisMonth)
        .reduce((acc, p) => acc + Number(p.amount), 0);
      
      const lastMonthRev = payments
        .filter(p => new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth)
        .reduce((acc, p) => acc + Number(p.amount), 0);

      const yieldTrend = lastMonthRev > 0 
        ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 
        : (thisMonthRev > 0 ? 100 : 0);

      setStats({
        yieldVelocity: `${yieldTrend >= 0 ? '+' : ''}${yieldTrend.toFixed(1)}%`,
        collectionIndex: `${totalRevenue > 0 ? ((collectedRevenue / totalRevenue) * 100).toFixed(1) : '0.0'}%`,
        burnRate: `${totalRevenue > 0 ? ((totalBurn / totalRevenue) * 100).toFixed(1) : '0.0'}%`,
        liquidity: `CFA ${(collectedRevenue - totalBurn).toLocaleString()}`
      });

      // 2. Velocity Data (Last 6 Months)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const mDate = subMonths(new Date(), i);
        const mName = format(mDate, 'MMM');
        const start = startOfMonth(mDate);
        const end = startOfMonth(subMonths(mDate, -1));

        const mRev = payments
          .filter(p => new Date(p.created_at) >= start && new Date(p.created_at) < end)
          .reduce((acc, p) => acc + Number(p.amount), 0);
        
        const mColl = payments
          .filter(p => p.status === 'paid' && new Date(p.created_at) >= start && new Date(p.created_at) < end)
          .reduce((acc, p) => acc + Number(p.amount), 0);

        const mBurn = requisitions
          ?.filter(r => r.status === 'approved' && new Date(r.created_at) >= start && new Date(r.created_at) < end)
          .reduce((acc, r) => acc + Number(r.amount), 0) || 0;

        months.push({ name: mName, revenue: mRev, collection: mColl, burn: mBurn });
      }
      setVelocityData(months);

      // 3. Sector Concentration
      const sectorGroups = payments.reduce((acc: any, p) => {
        acc[p.payment_type] = (acc[p.payment_type] || 0) + Number(p.amount);
        return acc;
      }, {});
      
      setSectorData(Object.entries(sectorGroups).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      })));

      // 4. Departmental Burn (Budgetary Alignment)
      // Since we don't have a budgets table, we'll use a virtual budget based on last month or defaults
      const categories = ['Mess', 'Maintenance', 'Security', 'Admin'];
      const deptData = categories.map(cat => {
        const actual = requisitions?.filter(r => r.category.toLowerCase().includes(cat.toLowerCase()) && r.status === 'approved').reduce((acc, r) => acc + Number(r.amount), 0) || 0;
        const budget = actual > 0 ? actual * 1.1 : 100000; // Mock budget for now
        return {
          dept: cat,
          budget,
          actual,
          var: actual > budget ? `-${((actual-budget)/budget*100).toFixed(0)}%` : `+${((budget-actual)/budget*100).toFixed(0)}%`
        };
      });
      setDepartmentalBurn(deptData);

      // 5. Recent Transactions (Forensics Sheet)
      const txns = payments.slice(0, 10).map((p: any) => ({
        id: `TXN-${p.id.substring(0, 4).toUpperCase()}`,
        label: `${p.payment_type.toUpperCase()} - ${p.student?.user?.full_name || 'Anonymous'}`,
        amount: Number(p.amount),
        type: 'sync'
      }));
      setRecentTransactions(txns);

    } catch (err: any) {
      console.error('Analytics Sync Error:', err);
      toast.error('Failed to sync strategic intelligence');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    velocityData,
    sectorData,
    departmentalBurn,
    recentTransactions,
    isLoading,
    refresh: fetchData
  };
}
