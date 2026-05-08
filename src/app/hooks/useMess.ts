import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface MessPlan {
  id: string;
  name: string;
  description: string;
  monthly_fee: number;
  meals_included: string[];
  is_active: boolean;
}

export interface MealBooking {
  id: string;
  student_id: string;
  meal_type: string;
  booking_date: string;
  is_consumed: boolean;
}

export interface MealFeedback {
  id: string;
  student_id: string;
  meal_type: string;
  date: string;
  rating: number;
  comment: string;
  created_at: string;
  student?: any;
}

export function useMess() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MessPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalSubscriptions: 0,
    totalRevenue: 0,
    todaysBookings: 0,
    totalStudents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Plans
      const { data: plansData, error: plansError } = await supabase
        .from('mess_plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch Menus
      const { data: menuData, error: menuError } = await supabase
        .from('mess_menus')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (menuError) throw menuError;
      setMenus(menuData || []);

      // Fetch Inventory
      const { data: invData, error: invError } = await supabase
        .from('inventory_items')
        .select('*');

      if (invError) throw invError;
      setInventory(invData || []);

      // 2. Fetch Subscription if student
      if (user?.role === 'student') {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (student) {
          const { data: subData, error: subError } = await supabase
            .from('student_mess_subscriptions')
            .select(`
              *,
              plan:mess_plans(*)
            `)
            .eq('student_id', student.id)
            .eq('is_active', true)
            .maybeSingle();

          if (subError) throw subError;
          setSubscription(subData);

          // 3. Fetch Bookings
          const { data: bookData, error: bookError } = await supabase
            .from('meal_bookings')
            .select('*')
            .eq('student_id', student.id)
            .order('booking_date', { ascending: false })
            .limit(30);

          if (bookError) throw bookError;
          setBookings(bookData || []);
        }
      }

      // 4. Fetch Global Stats and Feedback if Admin/Warden
      if (user?.role === 'admin' || user?.role === 'warden' || user?.role === 'auditor') {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch all active subscriptions
        const { data: allSubs, error: subsError } = await supabase
          .from('student_mess_subscriptions')
          .select('*, plan:mess_plans(monthly_fee)')
          .eq('is_active', true);

        // Fetch today's bookings
        const { data: allBookings, error: bookingsError } = await supabase
          .from('meal_bookings')
          .select('id')
          .eq('booking_date', today);

        if (!subsError && !bookingsError) {
          const totalRev = allSubs?.reduce((acc, sub: any) => acc + (sub.plan?.monthly_fee || 0), 0) || 0;
          setGlobalStats({
            totalSubscriptions: allSubs?.length || 0,
            totalRevenue: totalRev,
            todaysBookings: allBookings?.length || 0,
            totalStudents: allSubs?.length || 0
          });
        }

        // Fetch Recent Feedback
        const { data: feedData, error: feedError } = await supabase
          .from('meal_feedback')
          .select(`
            *,
            student:students(
              *,
              user:users(*)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!feedError) setFeedback(feedData || []);
      }
    } catch (err: any) {
      console.error('Mess Data Error:', err.message);
      toast.error('Failed to sync culinary node');
    } finally {
      setIsLoading(false);
    }
  };

  const bookMeal = async (type: string, date: string) => {
    if (!user) return;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) throw new Error('Student node not found');

      const { error } = await supabase
        .from('meal_bookings')
        .insert({
          student_id: student.id,
          meal_type: type.toLowerCase(),
          booking_date: date
        });

      if (error) throw error;
      toast.success('Meal protocol scheduled');
      fetchData();
    } catch (err: any) {
      toast.error('Booking failed', { description: err.message });
    }
  };

  const cancelMeal = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('meal_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      toast.success('Meal protocol cancelled');
      fetchData();
    } catch (err: any) {
      toast.error('Cancellation failed', { description: err.message });
    }
  };

  const updateInventory = async (id: string, level: number) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ current_level: level })
        .eq('id', id);

      if (error) throw error;
      toast.success('Inventory node updated');
      fetchData();
    } catch (err: any) {
      toast.error('Inventory update failed', { description: err.message });
    }
  };

  const updateMenu = async (day: number, type: string, item: string, kcal: number = 500) => {
    try {
      const { error } = await supabase
        .from('mess_menus')
        .upsert({
          day_of_week: day,
          meal_type: type.toLowerCase(),
          menu_item: item,
          kcal: kcal
        }, { onConflict: 'day_of_week,meal_type' });

      if (error) throw error;
      
      // Notify all students about the roster update
      const { data: students } = await supabase.from('users').select('id').eq('role', 'student');
      if (students) {
        const notifications = students.map(s => ({
          user_id: s.id,
          type: 'general',
          title: 'Culinary Roster Updated',
          message: `The mess roster for ${day} has been updated. Check the new menu!`,
          link: 'mess'
        }));
        await supabase.from('notifications').insert(notifications);
      }

      toast.success('Roster synchronized & Broadcasted');
      fetchData();
    } catch (err: any) {
      toast.error('Roster update failed', { description: err.message });
    }
  };

  const submitFeedback = async (mealType: string, rating: number, comment: string) => {
    if (!user) return;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) throw new Error('Student node not found');

      const { error } = await supabase
        .from('meal_feedback')
        .insert({
          student_id: student.id,
          meal_type: mealType.toLowerCase(),
          rating,
          comment
        });

      if (error) throw error;
      toast.success('Sentiment Protocol Logged');
      fetchData();
    } catch (err: any) {
      toast.error('Feedback failed', { description: err.message });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    plans,
    subscription,
    bookings,
    menus,
    inventory,
    feedback,
    globalStats,
    isLoading,
    refresh: fetchData,
    bookMeal,
    cancelMeal,
    updateInventory,
    updateMenu,
    submitFeedback
  };
}
