// services/notifications.service.ts
import api from '@/lib/api';

export interface Notification {
  id: string;
  actor: {
    username: string;
    avatar?: string;
  };
  notification_type: 'comment' | 'reply' | 'follow' | 'rating';
  message: string;
  action_url: string | null;
  preview: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export const notificationsService = {
  async getNotifications(page = 1) {
    const response = await api.get<PaginatedNotifications>(`/notifications/?page=${page}`);  // Remove extra 'notifications/'
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get<{ unread_count: number }>('/notifications/unread_count/');  // Remove extra 'notifications/'
    return response.data.unread_count;
  },

  async markAsRead(notificationId: string) {
    await api.post(`/notifications/${notificationId}/mark_read/`);  // Remove extra 'notifications/'
  },

  async markAllAsRead() {
    await api.post('/notifications/mark_all_read/');  // Remove extra 'notifications/'
  },
};