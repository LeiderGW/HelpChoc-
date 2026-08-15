import { supabase } from './supabase';
import { User } from '../types';
import { toast } from 'sonner';

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Perfil actualizado exitosamente');
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
      return null;
    }
  },

  async getAllUsers(limit?: number, page?: number): Promise<{ data: User[]; total: number }> {
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (limit) {
        const start = ((page || 1) - 1) * limit;
        query = query.range(start, start + limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], total: 0 };
    }
  },

  async updateUserRole(userId: string, role: 'admin' | 'organization' | 'volunteer' | 'visitor'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Rol de usuario actualizado exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Error al actualizar el rol');
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      // Also delete from auth
      await supabase.auth.admin.deleteUser(userId);
      
      toast.success('Usuario eliminado exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al eliminar el usuario');
      return false;
    }
  },

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  },

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }
  },

  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role');

      if (error) throw error;

      const total = data?.length || 0;
      const admins = data?.filter(u => u.role === 'admin').length || 0;
      const organizations = data?.filter(u => u.role === 'organization').length || 0;
      const volunteers = data?.filter(u => u.role === 'volunteer').length || 0;
      const visitors = data?.filter(u => u.role === 'visitor').length || 0;

      return {
        total,
        admins,
        organizations,
        volunteers,
        visitors,
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return null;
    }
  },
};