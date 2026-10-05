export type EventType =
  | 'clean_up'
  | 'meeting'
  | 'workshop'
  | 'social'
  | 'sports'
  | 'awareness'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerId: string;
  organizerName: string;
  communityName: string;
  imageUrl?: string;
  participantIds: string[];
  maxParticipants?: number;
  status: EventStatus;
  createdAt: string;
}

export interface CreateEventParams {
  title: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerId: string;
  organizerName: string;
  communityName: string;
  imageUrl?: string;
  maxParticipants?: number;
}
