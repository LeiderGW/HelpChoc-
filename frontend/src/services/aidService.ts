import { supabase } from './supabase';
import { AidOffer } from '../types';
import { toast } from 'sonner';

export const aidService = {
  async getOffers(filters?: {
    needId?: string;
    status?: string;
    userId?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: AidOffer[]; total: number; error?: string }> {
    try {
      let query = supabase
        .from('aid_offers')
        .select(`
          *,
          user:users(full_name, email, phone),
          organization:organizations(name, id),
          need:needs(id, product, priority, municipality:municipalities(name)),
          location:locations(*)
        `, { count: 'exact' });

      if (filters?.needId) {
        query = query.eq('need_id', filters.needId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      query = query.order('created_at', { ascending: false });

      const limit = filters?.limit || 20;
      const page = filters?.page || 1;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], total: count || 0 };
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      return { data: [], total: 0, error: error.message };
    }
  },

  async getOfferById(id: string): Promise<AidOffer | null> {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .select(`
          *,
          user:users(full_name, email, phone),
          organization:organizations(name, id, description),
          need:needs(id, product, priority, quantity_needed, unit, municipality:municipalities(name)),
          location:locations(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      return null;
    }
  },

  async createOffer(offerData: Omit<AidOffer, 'id' | 'created_at' | 'updated_at'>): Promise<AidOffer | null> {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .insert([offerData])
        .select()
        .single();

      if (error) throw error;
      toast.success('Ayuda ofrecida exitosamente');
      return data;
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.message || 'Error al ofrecer ayuda');
      return null;
    }
  },

  async updateOffer(id: string, updates: Partial<AidOffer>): Promise<AidOffer | null> {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Ayuda actualizada exitosamente');
      return data;
    } catch (error: any) {
      console.error('Error updating offer:', error);
      toast.error(error.message || 'Error al actualizar la ayuda');
      return null;
    }
  },

  async deleteOffer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aid_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Ayuda eliminada exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.message || 'Error al eliminar la ayuda');
      return false;
    }
  },

  async assignOffer(offerId: string, needId: string, quantity: number): Promise<boolean> {
    try {
      // Update offer status
      const { error: offerError } = await supabase
        .from('aid_offers')
        .update({
          status: 'assigned',
          need_id: needId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (offerError) throw offerError;

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('aid_assignments')
        .insert([{
          need_id: needId,
          offer_id: offerId,
          quantity_assigned: quantity,
          status: 'assigned',
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString(),
        }]);

      if (assignmentError) throw assignmentError;

      // Update need received quantity
      const { data: needData } = await supabase
        .from('needs')
        .select('quantity_received')
        .eq('id', needId)
        .single();

      if (needData) {
        await supabase
          .from('needs')
          .update({
            quantity_received: needData.quantity_received + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', needId);
      }

      toast.success('Ayuda asignada exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error assigning offer:', error);
      toast.error(error.message || 'Error al asignar la ayuda');
      return false;
    }
  },

  async updateOfferStatus(id: string, status: 'assigned' | 'in_transit' | 'delivered' | 'cancelled'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aid_offers')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Estado de ayuda actualizado: ${status}`);
      return true;
    } catch (error: any) {
      console.error('Error updating offer status:', error);
      toast.error(error.message || 'Error al actualizar el estado');
      return false;
    }
  },

  async getMyOffers(): Promise<AidOffer[]> {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) return [];

      const { data, error } = await supabase
        .from('aid_offers')
        .select(`
          *,
          need:needs(id, product, priority, municipality:municipalities(name)),
          organization:organizations(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching my offers:', error);
      return [];
    }
  },

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .select('status');

      if (error) throw error;

      const total = data?.length || 0;
      const available = data?.filter(o => o.status === 'available').length || 0;
      const assigned = data?.filter(o => o.status === 'assigned').length || 0;
      const inTransit = data?.filter(o => o.status === 'in_transit').length || 0;
      const delivered = data?.filter(o => o.status === 'delivered').length || 0;
      const cancelled = data?.filter(o => o.status === 'cancelled').length || 0;

      return {
        total,
        available,
        assigned,
        inTransit,
        delivered,
        cancelled,
        completionRate: total > 0 ? (delivered / total) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting offer statistics:', error);
      return null;
    }
  },
};