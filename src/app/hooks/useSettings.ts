import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

export function useSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [domicile, setDomicile] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);

  const fetchSettings = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch Student Profile if student
      if (user.role === 'student') {
        const { data: profile, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        setStudentProfile(profile);

        // 2. Fetch Domicile Info via view
        const { data: domicileData, error: domicileError } = await supabase
          .from('active_student_rooms')
          .select('*')
          .eq('student_id', profile?.id)
          .single();

        if (domicileError && domicileError.code !== 'PGRST116') throw domicileError;
        setDomicile(domicileData);
      }

      // 3. Fetch System Settings (Admin/Auditor/Finance)
      if (['admin', 'auditor', 'finance_officer'].includes(user.role)) {
        const { data: settings, error: settingsError } = await supabase
          .from('system_settings')
          .select('*');

        if (settingsError) throw settingsError;
        setSystemSettings(settings || []);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err.message);
      toast.error('Failed to sync settings protocol');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Identity node updated');
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    }
  };

  const updateStudentProfile = async (updates: any) => {
    if (!user || user.role !== 'student') return;
    try {
      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Institutional profile updated');
      fetchSettings();
    } catch (err: any) {
      toast.error('Institutional update failed', { description: err.message });
    }
  };

  const updateSystemSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });

      if (error) throw error;
      toast.success('System protocol synchronized');
      fetchSettings();
    } catch (err: any) {
      toast.error('Sync failed', { description: err.message });
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`; // Upload directly to profiles bucket

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // 3. Update User Record
      await updateProfile({ profile_picture_url: publicUrl });
      
      return publicUrl;
    } catch (err: any) {
      toast.error('Identity sync failed', { description: err.message });
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    isLoading,
    studentProfile,
    domicile,
    systemSettings,
    updateProfile,
    updateStudentProfile,
    updateSystemSetting,
    uploadAvatar,
    refresh: fetchSettings
  };
}
