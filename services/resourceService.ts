import { ResourceItem, ResourceFilterParams, ResourceCategory, ResourceCondition } from '../types/resource';
import { MOCK_RESOURCES } from './mockData';

let inMemoryResources = [...MOCK_RESOURCES];

export interface CreateResourceParams {
  title: string;
  description: string;
  category: ResourceCategory;
  condition: ResourceCondition;
  location: string;
  imageUrl?: string;
  ownerId: string;
  ownerName: string;
  communityName: string;
}

export interface UpdateResourceParams {
  title?: string;
  description?: string;
  category?: ResourceCategory;
  condition?: ResourceCondition;
  location?: string;
  imageUrl?: string;
}

export const resourceService = {
  async getResources(): Promise<ResourceItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...inMemoryResources];
  },

  async getResourceById(id: string): Promise<ResourceItem | null> {
    await new Promise((res) => setTimeout(res, 100));
    const found = inMemoryResources.find((r) => r.id === id);
    return found || null;
  },

  async getResourcesByOwner(ownerId: string): Promise<ResourceItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    return inMemoryResources.filter((r) => r.ownerId === ownerId);
  },

  async createResource(params: CreateResourceParams): Promise<{ success: boolean; resource?: ResourceItem; message?: string }> {
    await new Promise((res) => setTimeout(res, 400));

    if (!params.title || params.title.trim().length < 3) {
      return { success: false, message: 'Title must be at least 3 characters long.' };
    }

    if (!params.description || params.description.trim().length < 10) {
      return { success: false, message: 'Description must be at least 10 characters long.' };
    }

    const defaultImage = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?auto=format&fit=crop&w=600&q=80';

    const newResource: ResourceItem = {
      id: `res-${Date.now()}`,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      condition: params.condition,
      location: params.location.trim(),
      communityName: params.communityName,
      imageUrl: params.imageUrl || defaultImage,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      status: 'available',
      createdAt: 'Just now',
    };

    inMemoryResources = [newResource, ...inMemoryResources];
    return { success: true, resource: newResource };
  },

  async updateResource(
    id: string,
    currentUserId: string,
    updates: UpdateResourceParams
  ): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const target = inMemoryResources.find((r) => r.id === id);

    if (!target) {
      return { success: false, message: 'Resource not found.' };
    }

    // Owner validation
    if (target.ownerId !== currentUserId) {
      return { success: false, message: 'You are not authorized to edit this resource.' };
    }

    inMemoryResources = inMemoryResources.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );

    return { success: true };
  },

  async updateResourceStatus(id: string, status: ResourceItem['status']): Promise<void> {
    inMemoryResources = inMemoryResources.map((r) => (r.id === id ? { ...r, status } : r));
  },

  async deleteResource(id: string, currentUserId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const target = inMemoryResources.find((r) => r.id === id);

    if (!target) {
      return { success: false, message: 'Resource not found.' };
    }

    // Owner validation
    if (target.ownerId !== currentUserId) {
      return { success: false, message: 'You are not authorized to delete this resource.' };
    }

    if (target.status === 'reserved') {
      return { success: false, message: 'Cannot delete a resource with an accepted/reserved request.' };
    }

    inMemoryResources = inMemoryResources.filter((r) => r.id !== id);
    return { success: true };
  },

  async adminRemoveResource(id: string): Promise<{ success: boolean; resource?: ResourceItem; message?: string }> {
    await new Promise((res) => setTimeout(res, 200));
    const target = inMemoryResources.find((r) => r.id === id);
    if (!target) {
      return { success: false, message: 'Resource not found.' };
    }
    inMemoryResources = inMemoryResources.filter((r) => r.id !== id);
    return { success: true, resource: target };
  },

  async searchResources(query: string): Promise<ResourceItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    const q = query.trim().toLowerCase();
    if (!q) return [...inMemoryResources];

    return inMemoryResources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  },

  async filterResources(params: ResourceFilterParams): Promise<ResourceItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    let filtered = [...inMemoryResources];

    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter((r) => r.category === params.category);
    }

    if (params.condition && params.condition !== 'Any') {
      filtered = filtered.filter((r) => r.condition === params.condition);
    }

    if (params.status && params.status !== 'Any') {
      filtered = filtered.filter((r) => r.status === params.status);
    }

    return filtered;
  },

  async getResourceStats(): Promise<{ available: number; requested: number; shared: number }> {
    const available = inMemoryResources.filter((r) => r.status === 'available').length;
    const requested = inMemoryResources.filter((r) => r.status === 'requested').length;
    const shared = inMemoryResources.filter((r) => r.status === 'collected' || r.status === 'reserved').length + 18;
    return { available, requested, shared };
  },
};
