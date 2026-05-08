import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, User, Student } from '../types';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { student_details?: Student }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // 1. Try to load existing profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        // Profile found — optionally load student details
        let studentDetails: Student | undefined;
        if (userData.role === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (studentData) studentDetails = studentData;
        }
        setUser({ ...userData, student_details: studentDetails });
        return;
      }

      // 2. No profile — try to create from auth metadata (requires INSERT policy)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.full_name) {
        const meta = authUser.user_metadata;
        const roleValue = (meta.role || 'student') as string;
        const { data: newProfile, error: insertErr } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email!,
            full_name: meta.full_name || 'New User',
            role: roleValue,
            phone_number: meta.phone_number || null,
            is_active: true,
          })
          .select()
          .single();

        if (!insertErr && newProfile) {
          setUser(newProfile);
          return;
        }

        // 409 = row already exists (e.g. created by trigger) — re-fetch it
        if (insertErr?.code === '23505') {
          const { data: existing } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (existing) {
            setUser(existing);
            return;
          }
        }

        console.warn('Profile auto-create failed:', insertErr?.message);
      }

      // 3. Give up — no profile available, sign out
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('fetchUserProfile error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        console.log('Auth login successful, fetching profile...');
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
