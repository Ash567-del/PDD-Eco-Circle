import { ResourceRequest, RequestStatus } from '../types/request';
import { MOCK_REQUESTS } from './mockData';
import { resourceService } from './resourceService';
import { notificationService } from './notificationService';
import { UserProfile } from '../types/auth';

let inMemoryRequests = [...MOCK_REQUESTS];

export const requestService = {
  async getAllRequests(): Promise<ResourceRequest[]> {
    return [...inMemoryRequests];
  },

  async getRequestsForOwner(ownerId: string): Promise<ResourceRequest[]> {
    await new Promise((res) => setTimeout(res, 150));
    return inMemoryRequests.filter((r) => r.ownerId === ownerId);
  },

  async getRequestsByRequester(requesterId: string): Promise<ResourceRequest[]> {
    await new Promise((res) => setTimeout(res, 150));
    return inMemoryRequests.filter((r) => r.requesterId === requesterId);
  },

  async getRequestsForResource(resourceId: string): Promise<ResourceRequest[]> {
    await new Promise((res) => setTimeout(res, 100));
    return inMemoryRequests.filter((r) => r.resourceId === resourceId);
  },

  async getRequestById(id: string): Promise<ResourceRequest | null> {
    await new Promise((res) => setTimeout(res, 100));
    const found = inMemoryRequests.find((r) => r.id === id);
    return found || null;
  },

  async getExistingUserRequest(resourceId: string, requesterId: string): Promise<ResourceRequest | null> {
    const found = inMemoryRequests.find(
      (r) => r.resourceId === resourceId && r.requesterId === requesterId && r.status !== 'cancelled'
    );
    return found || null;
  },

  async createRequest(
    resourceId: string,
    requester: UserProfile,
    message?: string
  ): Promise<{ success: boolean; request?: ResourceRequest; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const resource = await resourceService.getResourceById(resourceId);

    if (!resource) {
      return { success: false, message: 'Resource not found.' };
    }

    if (resource.ownerId === requester.id) {
      return { success: false, message: 'You cannot request your own resource.' };
    }

    if (resource.status !== 'available' && resource.status !== 'requested') {
      return { success: false, message: 'This resource is no longer available.' };
    }

    // Check duplicate request
    const existing = await this.getExistingUserRequest(resourceId, requester.id);
    if (existing) {
      return { success: false, message: 'You have already requested this resource.' };
    }

    const newRequest: ResourceRequest = {
      id: `req-${Date.now()}`,
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceImageUrl: resource.imageUrl,
      requesterId: requester.id,
      requesterName: requester.fullName,
      requesterCommunity: requester.communityName,
      ownerId: resource.ownerId,
      ownerName: resource.ownerName,
      message: message ? message.trim().slice(0, 500) : '',
      status: 'pending',
      createdAt: 'Just now',
    };

    inMemoryRequests = [newRequest, ...inMemoryRequests];
    await resourceService.updateResourceStatus(resource.id, 'requested');

    // Notify resource owner
    await notificationService.createNotification({
      userId: resource.ownerId,
      type: 'resource_request',
      title: 'New Resource Request',
      message: `${requester.fullName} requested your ${resource.title}.`,
      relatedId: newRequest.id,
      relatedType: 'request',
    });

    return { success: true, request: newRequest };
  },

  async acceptRequest(requestId: string, currentUserId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const req = inMemoryRequests.find((r) => r.id === requestId);

    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    if (req.ownerId !== currentUserId) {
      return { success: false, message: 'Unauthorized: Only the resource owner can accept requests.' };
    }

    if (req.status !== 'pending') {
      return { success: false, message: 'This request is no longer pending.' };
    }

    const now = 'Just now';
    inMemoryRequests = inMemoryRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'accepted' as RequestStatus, respondedAt: now } : r
    );

    // Update resource status to reserved
    await resourceService.updateResourceStatus(req.resourceId, 'reserved');

    // Notify requester
    await notificationService.createNotification({
      userId: req.requesterId,
      type: 'request_accepted',
      title: 'Request Accepted',
      message: `Your request for ${req.resourceTitle} was accepted!`,
      relatedId: req.id,
      relatedType: 'request',
    });

    return { success: true };
  },

  async rejectRequest(requestId: string, currentUserId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const req = inMemoryRequests.find((r) => r.id === requestId);

    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    if (req.ownerId !== currentUserId) {
      return { success: false, message: 'Unauthorized: Only the resource owner can reject requests.' };
    }

    if (req.status !== 'pending') {
      return { success: false, message: 'This request is no longer pending.' };
    }

    const now = 'Just now';
    inMemoryRequests = inMemoryRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'rejected' as RequestStatus, respondedAt: now } : r
    );

    // Notify requester
    await notificationService.createNotification({
      userId: req.requesterId,
      type: 'request_rejected',
      title: 'Request Declined',
      message: `Your request for ${req.resourceTitle} was declined.`,
      relatedId: req.id,
      relatedType: 'request',
    });

    return { success: true };
  },

  async cancelRequest(requestId: string, currentUserId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const req = inMemoryRequests.find((r) => r.id === requestId);

    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    if (req.requesterId !== currentUserId) {
      return { success: false, message: 'Unauthorized: You can only cancel your own requests.' };
    }

    inMemoryRequests = inMemoryRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'cancelled' as RequestStatus } : r
    );

    return { success: true };
  },
};
