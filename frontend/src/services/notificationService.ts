import { supabase } from './supabase';
import { Notification } from '../types';
import { toast } from 'sonner';

export const notificationService = {
  async getNotifications(userId: string, limit?: number): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      toast.success('Todas las notificaciones marcadas como leídas');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  async sendNeedNotification(needId: string, userIds: string[], message: string) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: 'Nueva Necesidad Reportada',
        message,
        type: 'info',
        link: `/necesidades/${needId}`,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending need notification:', error);
      return false;
    }
  },

  async sendOfferNotification(offerId: string, userId: string, message: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Nueva Ayuda Ofrecida',
          message,
          type: 'success',
          link: `/ayudas/${offerId}`,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending offer notification:', error);
      return false;
    }
  },

  async sendStatusUpdateNotification(userId: string, needId: string, status: string, message: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: `Estado actualizado: ${status}`,
          message,
          type: 'warning',
          link: `/necesidades/${needId}`,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending status update notification:', error);
      return false;
    }
  },

  async sendAssignmentNotification(userId: string, needId: string, message: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Ayuda Asignada',
          message,
          type: 'success',
          link: `/necesidades/${needId}`,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending assignment notification:', error);
      return false;
    }
  },
};