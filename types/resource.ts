export type ResourceCategory =
  | 'Furniture'
  | 'Books'
  | 'Electronics'
  | 'Clothing'
  | 'Kitchen'
  | 'Toys'
  | 'Other';

export type ResourceCondition = 'New' | 'Like New' | 'Good' | 'Used';

export type ResourceAvailabilityStatus = 'available' | 'requested' | 'reserved' | 'collected';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  condition: ResourceCondition;
  location: string;
  communityName: string;
  imageUrl: string;
  ownerId: string;
  ownerName: string;
  status: ResourceAvailabilityStatus;
  createdAt: string;
}

export interface ResourceFilterParams {
  searchQuery?: string;
  category?: ResourceCategory | 'All';
  condition?: ResourceCondition | 'Any';
  status?: ResourceAvailabilityStatus | 'Any';
}
