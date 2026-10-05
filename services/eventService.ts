import { CommunityEvent, CreateEventParams } from '../types/event';
import { INITIAL_EVENTS } from './eventMockData';
import { notificationService } from './notificationService';

let mockEvents: CommunityEvent[] = [...INITIAL_EVENTS];

export const eventService = {
  async getEvents(): Promise<CommunityEvent[]> {
    return [...mockEvents];
  },

  async getEventById(id: string): Promise<CommunityEvent | null> {
    const event = mockEvents.find((e) => e.id === id);
    return event ? { ...event } : null;
  },

  async getUpcomingEvents(): Promise<CommunityEvent[]> {
    return mockEvents.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
  },

  async getPastEvents(): Promise<CommunityEvent[]> {
    return mockEvents.filter((e) => e.status === 'completed');
  },

  async getJoinedEvents(userId: string): Promise<CommunityEvent[]> {
    if (!userId) return [];
    return mockEvents.filter((e) => e.participantIds.includes(userId));
  },

  async createEvent(params: CreateEventParams): Promise<CommunityEvent> {
    const newEvent: CommunityEvent = {
      ...params,
      id: `evt-${Date.now()}`,
      participantIds: [params.organizerId],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    mockEvents.unshift(newEvent);
    return { ...newEvent };
  },

  async updateEvent(id: string, params: Partial<CommunityEvent>): Promise<CommunityEvent | null> {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index === -1) return null;
    mockEvents[index] = { ...mockEvents[index], ...params };
    return { ...mockEvents[index] };
  },

  async cancelEvent(id: string): Promise<CommunityEvent | null> {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index === -1) return null;
    mockEvents[index] = { ...mockEvents[index], status: 'cancelled' };
    return { ...mockEvents[index] };
  },

  async joinEvent(
    eventId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; event?: CommunityEvent }> {
    if (!userId) {
      return { success: false, message: 'Authentication required.' };
    }

    const index = mockEvents.findIndex((e) => e.id === eventId);
    if (index === -1) {
      return { success: false, message: 'Event not found.' };
    }

    const event = mockEvents[index];

    if (event.status === 'cancelled') {
      return { success: false, message: 'This event has been cancelled.' };
    }

    if (event.status === 'completed') {
      return { success: false, message: 'This event has already ended.' };
    }

    if (event.participantIds.includes(userId)) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    if (event.maxParticipants && event.participantIds.length >= event.maxParticipants) {
      return { success: false, message: 'Event has reached maximum capacity.' };
    }

    const updatedParticipantIds = [...event.participantIds, userId];
    mockEvents[index] = {
      ...event,
      participantIds: updatedParticipantIds,
    };

    // Notify user of successful event registration
    await notificationService.createNotification({
      userId,
      type: 'event_joined',
      title: 'Event Registration',
      message: `You are registered for ${event.title}.`,
      relatedId: event.id,
      relatedType: 'event',
    });

    return {
      success: true,
      message: "You're registered for this event!",
      event: { ...mockEvents[index] },
    };
  },

  async leaveEvent(
    eventId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; event?: CommunityEvent }> {
    if (!userId) {
      return { success: false, message: 'Authentication required.' };
    }

    const index = mockEvents.findIndex((e) => e.id === eventId);
    if (index === -1) {
      return { success: false, message: 'Event not found.' };
    }

    const event = mockEvents[index];

    if (!event.participantIds.includes(userId)) {
      return { success: false, message: 'You are not registered for this event.' };
    }

    const updatedParticipantIds = event.participantIds.filter((id) => id !== userId);
    mockEvents[index] = {
      ...event,
      participantIds: updatedParticipantIds,
    };

    return {
      success: true,
      message: 'Your participation has been cancelled.',
      event: { ...mockEvents[index] },
    };
  },
};
