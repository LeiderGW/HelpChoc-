import { supabase } from './supabase';
import { Organization } from '../types';
import { toast } from 'sonner';

export const organizationService = {
  async getOrganizations(limit?: number, page?: number): Promise<{ data: Organization[]; total: number }> {
    try {
      let query = supabase
        .from('organizations')
        .select('*', { count: 'exact' })
        .order('name');

      if (limit) {
        const start = ((page || 1) - 1) * limit;
        query = query.range(start, start + limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return { data: [], total: 0 };
    }
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  },

  async createOrganization(data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization | null> {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      toast.success('Organización registrada exitosamente');
      return org;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Error al registrar la organización');
      return null;
    }
  },

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Organización actualizada exitosamente');
      return data;
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast.error(error.message || 'Error al actualizar la organización');
      return null;
    }
  },

  async deleteOrganization(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Organización eliminada exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast.error(error.message || 'Error al eliminar la organización');
      return false;
    }
  },

  async verifyOrganization(id: string, verified: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ verified, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Organización ${verified ? 'verificada' : 'desverificada'} exitosamente`);
      return true;
    } catch (error: any) {
      console.error('Error verifying organization:', error);
      toast.error(error.message || 'Error al verificar la organización');
      return false;
    }
  },

  async getOrganizationNeeds(organizationId: string, limit?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('needs')
        .select(`
          *,
          municipality:municipalities(name),
          department:departments(name)
        `)
        .eq('reporter_id', organizationId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching organization needs:', error);
      return [];
    }
  },

  async getOrganizationOffers(organizationId: string, limit?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('aid_offers')
        .select(`
          *,
          need:needs(product, priority),
          user:users(full_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching organization offers:', error);
      return [];
    }
  },

  async getOrganizationStatistics(organizationId: string) {
    try {
      const needs = await this.getOrganizationNeeds(organizationId);
      const offers = await this.getOrganizationOffers(organizationId);

      const totalNeeds = needs.length;
      const criticalNeeds = needs.filter(n => n.priority === 'critical').length;
      const fulfilledNeeds = needs.filter(n => n.status === 'fulfilled').length;
      const totalOffers = offers.length;
      const deliveredOffers = offers.filter(o => o.status === 'delivered').length;

      return {
        totalNeeds,
        criticalNeeds,
        fulfilledNeeds,
        totalOffers,
        deliveredOffers,
        completionRate: totalNeeds > 0 ? (fulfilledNeeds / totalNeeds) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting organization statistics:', error);
      return null;
    }
  },
};