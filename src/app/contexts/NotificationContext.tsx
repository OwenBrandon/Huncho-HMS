import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { NotificationContextType, Notification } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Notification Fetch Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Set up real-time subscription
      const subscription = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      toast.error('Failed to update alert status');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      toast.error('Failed to clear alerts');
    }
  };

  const createNotification = async (notification: Partial<Notification>) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to dispatch alert:', err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        createNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
