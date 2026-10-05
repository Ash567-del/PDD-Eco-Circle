import {
  AppNotification,
  CreateNotificationParams,
  NotificationPreferences,
} from '../types/notification';
import { INITIAL_NOTIFICATIONS } from './notificationMockData';

let mockNotifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];

const defaultPreferences: NotificationPreferences = {
  communityUpdates: true,
  eventReminders: true,
  resourceRequests: true,
  problemStatusUpdates: true,
};

let mockPreferencesStore: Record<string, NotificationPreferences> = {};

export const notificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (!userId) return [];
    return mockNotifications.filter((n) => n.userId === userId);
  },

  async getUnreadNotifications(userId: string): Promise<AppNotification[]> {
    if (!userId) return [];
    return mockNotifications.filter((n) => n.userId === userId && n.status === 'unread');
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;
    return mockNotifications.filter((n) => n.userId === userId && n.status === 'unread').length;
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const index = mockNotifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;
    mockNotifications[index] = {
      ...mockNotifications[index],
      status: 'read',
    };
    return true;
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    if (!userId) return false;
    mockNotifications = mockNotifications.map((n) => {
      if (n.userId === userId) {
        return { ...n, status: 'read' };
      }
      return n;
    });
    return true;
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    const initialLen = mockNotifications.length;
    mockNotifications = mockNotifications.filter((n) => n.id !== notificationId);
    return mockNotifications.length < initialLen;
  },

  async createNotification(params: CreateNotificationParams): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...params,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: 'unread',
    };
    mockNotifications.unshift(newNotif);
    return { ...newNotif };
  },

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    if (!userId) return { ...defaultPreferences };
    if (!mockPreferencesStore[userId]) {
      mockPreferencesStore[userId] = { ...defaultPreferences };
    }
    return { ...mockPreferencesStore[userId] };
  },

  async updatePreferences(
    userId: string,
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    if (!userId) return { ...defaultPreferences };
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    mockPreferencesStore[userId] = updated;
    return { ...updated };
  },
};
