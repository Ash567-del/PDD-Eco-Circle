import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ResourceItem } from '../types/resource';
import { ResourceRequest } from '../types/request';
import { resourceService } from '../services/resourceService';
import { requestService } from '../services/requestService';
import { communityService } from '../services/communityService';
import { eventService } from '../services/eventService';
import { problemService } from '../services/problemService';
import { notificationService } from '../services/notificationService';
import { CommunityPost } from '../types/community';
import { CommunityEvent } from '../types/event';
import { CommunityProblem } from '../types/problem';
import {
  AppNotification,
  CreateNotificationParams,
  NotificationPreferences,
} from '../types/notification';
import { useAuth } from './AuthContext';

interface AppDataContextType {
  resources: ResourceItem[];
  requests: ResourceRequest[];
  posts: CommunityPost[];
  events: CommunityEvent[];
  problems: CommunityProblem[];
  notifications: AppNotification[];
  unreadNotifCount: number;
  notificationPreferences: NotificationPreferences;
  refreshData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotificationItem: (id: string) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  sendNotification: (params: CreateNotificationParams) => Promise<void>;
}

const defaultPrefs: NotificationPreferences = {
  communityUpdates: true,
  eventReminders: true,
  resourceRequests: true,
  problemStatusUpdates: true,
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultPrefs
  );

  const refreshData = useCallback(async () => {
    const resList = await resourceService.getResources();
    setResources(resList);

    const postList = await communityService.getPosts();
    setPosts(postList);

    const evtList = await eventService.getEvents();
    setEvents(evtList);

    const probList = await problemService.getProblems();
    setProblems(probList);

    if (currentUser) {
      const reqList = await requestService.getRequestsForOwner(currentUser.id);
      const myReqList = await requestService.getRequestsByRequester(currentUser.id);
      const combined = Array.from(new Set([...reqList, ...myReqList]));
      setRequests(combined);

      const notifs = await notificationService.getNotifications(currentUser.id);
      setNotifications(notifs);

      const count = await notificationService.getUnreadCount(currentUser.id);
      setUnreadNotifCount(count);

      const prefs = await notificationService.getPreferences(currentUser.id);
      setNotificationPreferences(prefs);
    } else {
      setNotifications([]);
      setUnreadNotifCount(0);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const markNotificationAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await refreshData();
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.id);
    await refreshData();
  };

  const deleteNotificationItem = async (id: string) => {
    await notificationService.deleteNotification(id);
    await refreshData();
  };

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!currentUser) return;
    const updated = await notificationService.updatePreferences(currentUser.id, prefs);
    setNotificationPreferences(updated);
  };

  const sendNotification = async (params: CreateNotificationParams) => {
    await notificationService.createNotification(params);
    await refreshData();
  };

  return (
    <AppDataContext.Provider
      value={{
        resources,
        requests,
        posts,
        events,
        problems,
        notifications,
        unreadNotifCount,
        notificationPreferences,
        refreshData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotificationItem,
        updateNotificationPreferences,
        sendNotification,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
