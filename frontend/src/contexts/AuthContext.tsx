import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { User as AppUser } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<AppUser>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrganization: boolean;
  isVolunteer: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAppUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAppUser(session.user.id);
      } else {
        setAppUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setAppUser(data);
      setUserRole(data?.role || 'visitor');
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('¡Bienvenido de nuevo!');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };


const signUp = async (
  email: string,
  password: string,
  userData: any
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
        },
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    toast.success(
      '¡Registro exitoso! Por favor, verifica tu correo electrónico.'
    );
  } catch (error: any) {
    console.error('Error en registro:', error);

    toast.error(
      error.message || 'Error al registrar usuario'
    );

    throw error;
  }
};

  

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar sesión');
      throw error;
    }
  };

  const updateUser = async (data: Partial<AppUser>) => {
    try {
      if (!appUser) throw new Error('Usuario no autenticado');
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', appUser.id);
      if (error) throw error;
      setAppUser({ ...appUser, ...data });
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
      throw error;
    }
  };

  const value = {
    user,
    appUser,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isOrganization: userRole === 'organization',
    isVolunteer: userRole === 'volunteer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};


