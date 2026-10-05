export type NotificationType =
  | 'resource_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'event_joined'
  | 'event_reminder'
  | 'community_announcement'
  | 'post_comment'
  | 'post_like'
  | 'problem_update'
  | 'general';

export type NotificationStatus = 'read' | 'unread';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  status: NotificationStatus;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
}

export interface NotificationPreferences {
  communityUpdates: boolean;
  eventReminders: boolean;
  resourceRequests: boolean;
  problemStatusUpdates: boolean;
}
