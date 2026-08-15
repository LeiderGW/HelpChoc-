import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { AidOffer } from '../types';
import { toast } from 'sonner';

export const useAidOffers = (needId?: string) => {
  const [offers, setOffers] = useState<AidOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('aid_offers')
        .select(`
          *,
          user:users(full_name, email),
          organization:organizations(name),
          need:needs(product, priority)
        `)
        .order('created_at', { ascending: false });

      if (needId) {
        query = query.eq('need_id', needId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOffers(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar las ayudas');
    } finally {
      setLoading(false);
    }
  }, [needId]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const createOffer = useCallback(async (offerData: Omit<AidOffer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .insert([offerData])
        .select()
        .single();

      if (error) throw error;
      toast.success('Ayuda ofrecida exitosamente');
      await fetchOffers();
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Error al ofrecer ayuda');
      throw err;
    }
  }, [fetchOffers]);

  const updateOffer = useCallback(async (id: string, updates: Partial<AidOffer>) => {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Ayuda actualizada exitosamente');
      await fetchOffers();
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la ayuda');
      throw err;
    }
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    fetchOffers,
    createOffer,
    updateOffer,
  };
};