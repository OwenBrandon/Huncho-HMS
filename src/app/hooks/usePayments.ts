import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function usePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch Payments (Inflows)
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          student:students(
            *,
            user:users(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (paymentError) throw paymentError;

      // Fetch Requisitions (Potential Outflows)
      const { data: requisitionData, error: reqError } = await supabase
        .from('fund_requisitions')
        .select(`
          *,
          requester:requester_id(*)
        `)
        .order('created_at', { ascending: false });

      if (reqError) throw reqError;

      setPayments(paymentData || []);
      setRequisitions(requisitionData || []);
    } catch (err: any) {
      console.error('Error fetching fiscal data:', err);
      toast.error('Failed to load fiscal terminal');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createPayment = async (payment: any) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      toast.success('Fiscal Inflow Logged');
      fetchData();
      return data;
    } catch (err: any) {
      toast.error('Logging Failed', { description: err.message });
      throw err;
    }
  };

  const createRequisition = async (requisition: any) => {
    try {
      const { data, error } = await supabase
        .from('fund_requisitions')
        .insert({
          ...requisition,
          requester_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Requisition Submitted');
      fetchData();
      return data;
    } catch (err: any) {
      toast.error('Submission Failed', { description: err.message });
      throw err;
    }
  };

  const processRequisition = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('fund_requisitions')
        .update({
          status,
          processed_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Requisition ${status === 'approved' ? 'Disbursed' : 'Rejected'}`);
      fetchData();
    } catch (err: any) {
      toast.error('Processing Failed', { description: err.message });
      throw err;
    }
  };

  const updatePayment = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
      throw err;
    }
  };

  const updateRequisition = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('fund_requisitions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    payments,
    requisitions,
    isLoading,
    refresh: fetchData,
    createPayment,
    createRequisition,
    processRequisition,
    updatePayment,
    updateRequisition
  };
}
