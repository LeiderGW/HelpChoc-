import { supabase } from './supabase';
import { Need, NeedFilters, ApiResponse } from '../types';
import { calculatePriority } from '../utils/priorityCalculator';

export const needsService = {
  async getNeeds(filters: NeedFilters = {}): Promise<ApiResponse<Need[]>> {
    try {
      let query = supabase
        .from('needs')
        .select(`
          *,
          location:locations(*),
          municipality:municipalities(*),
          department:departments(*),
          reporter:users!needs_reporter_id_fkey(full_name, email)
        `);

      // Apply filters
      if (filters.department) {
        query = query.eq('department_id', filters.department);
      }
      if (filters.municipality) {
        query = query.eq('municipality_id', filters.municipality);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`product.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Calculate computed fields
      const needsWithComputed = data.map((need: any) => ({
        ...need,
        quantity_pending: need.quantity_needed - need.quantity_received,
        coverage_percentage: (need.quantity_received / need.quantity_needed) * 100,
      }));

      return {
        data: needsWithComputed,
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async getNeedById(id: string): Promise<ApiResponse<Need>> {
    try {
      const { data, error } = await supabase
        .from('needs')
        .select(`
          *,
          location:locations(*),
          municipality:municipalities(*),
          department:departments(*),
          reporter:users!needs_reporter_id_fkey(full_name, email, phone),
          verified_by_user:users!needs_verified_by_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const needWithComputed = {
        ...data,
        quantity_pending: data.quantity_needed - data.quantity_received,
        coverage_percentage: (data.quantity_received / data.quantity_needed) * 100,
      };

      return { data: needWithComputed };
    } catch (error: any) {
      return { data: {} as Need, error: error.message };
    }
  },

  async createNeed(needData: Omit<Need, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Need>> {
    try {
      // Calculate priority automatically
      const priority = calculatePriority({
        coverage: (needData.quantity_received / needData.quantity_needed) * 100,
        affected_people: needData.affected_people || 0,
        category: needData.category,
        days_old: 0,
      });

      const { data, error } = await supabase
        .from('needs')
        .insert([
          {
            ...needData,
            priority,
            status: 'pending',
            verification_status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { data: {} as Need, error: error.message };
    }
  },

  async updateNeed(id: string, updates: Partial<Need>): Promise<ApiResponse<Need>> {
    try {
      // Recalculate priority if needed
      if (updates.quantity_needed !== undefined || updates.quantity_received !== undefined) {
        const current = await this.getNeedById(id);
        if (current.data) {
          const coverage = ((updates.quantity_received || current.data.quantity_received) / 
                           (updates.quantity_needed || current.data.quantity_needed)) * 100;
          updates.priority = calculatePriority({
            coverage,
            affected_people: updates.affected_people || current.data.affected_people || 0,
            category: updates.category || current.data.category,
            days_old: 0,
          });
        }
      }

      const { data, error } = await supabase
        .from('needs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { data: {} as Need, error: error.message };
    }
  },

  async deleteNeed(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('needs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { data: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async verifyNeed(id: string, status: 'verified' | 'rejected' | 'insufficient_info', notes?: string): Promise<ApiResponse<Need>> {
    try {
      const { data, error } = await supabase
        .from('needs')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Add verification record
      await supabase
        .from('verification_records')
        .insert([
          {
            need_id: id,
            verified_by: (await supabase.auth.getUser()).data.user?.id,
            status,
            notes,
          },
        ]);

      return { data };
    } catch (error: any) {
      return { data: {} as Need, error: error.message };
    }
  },

  async getNeedsStatistics() {
    try {
      const { data, error } = await supabase
        .from('needs')
        .select('priority, status, category, department_id');
      
      if (error) throw error;

      const total = data?.length || 0;
      const critical = data?.filter(n => n.priority === 'critical').length || 0;
      const high = data?.filter(n => n.priority === 'high').length || 0;
      const medium = data?.filter(n => n.priority === 'medium').length || 0;
      const covered = data?.filter(n => n.status === 'fulfilled').length || 0;

      // Group by category
      const byCategory: { [key: string]: number } = {};
      data?.forEach(n => {
        byCategory[n.category] = (byCategory[n.category] || 0) + 1;
      });

      return {
        total,
        critical,
        high,
        medium,
        covered,
        byCategory,
        data,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  },
};