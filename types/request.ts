export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ResourceRequest {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceImageUrl?: string;
  requesterId: string;
  requesterName: string;
  requesterCommunity: string;
  ownerId: string;
  ownerName: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  respondedAt?: string;
}
