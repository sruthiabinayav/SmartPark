import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { getSupabaseClient } from '@/template';
import { registerForPushNotificationsAsync } from '@/services/notifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  operationLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name || data.username || 'User',
          username: data.username,
          role: data.role || 'driver',
          createdAt: data.created_at,
        });

        // Register for push notifications
        await registerForPushNotificationsAsync();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function signup(email: string, password: string, name: string, role: UserRole) {
    setOperationLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with role
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ name, role })
          .eq('id', authData.user.id);

        if (updateError) throw updateError;

        await loadUserProfile(authData.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setOperationLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setOperationLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setOperationLoading(false);
    }
  }

  async function logout() {
    setOperationLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    } finally {
      setOperationLoading(false);
    }
  }

  async function refreshUser() {
    if (user) {
      await loadUserProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        operationLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
