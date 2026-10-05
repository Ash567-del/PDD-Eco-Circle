import { CommunityPost, PostComment, CreatePostParams, UpdatePostParams, PostType } from '../types/community';
import { UserProfile } from '../types/auth';
import { MOCK_POSTS, MOCK_COMMENTS } from './communityMockData';

let inMemoryPosts = [...MOCK_POSTS];
let inMemoryComments = [...MOCK_COMMENTS];

export const communityService = {
  async getPosts(): Promise<CommunityPost[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...inMemoryPosts];
  },

  async getPostById(id: string): Promise<CommunityPost | null> {
    await new Promise((res) => setTimeout(res, 100));
    const found = inMemoryPosts.find((p) => p.id === id);
    return found || null;
  },

  async getPostsByType(type: PostType | 'All'): Promise<CommunityPost[]> {
    await new Promise((res) => setTimeout(res, 150));
    if (type === 'All') return [...inMemoryPosts];
    return inMemoryPosts.filter((p) => p.type === type);
  },

  async getPostsByAuthor(authorId: string): Promise<CommunityPost[]> {
    await new Promise((res) => setTimeout(res, 150));
    return inMemoryPosts.filter((p) => p.authorId === authorId);
  },

  async getAnnouncements(): Promise<CommunityPost[]> {
    await new Promise((res) => setTimeout(res, 150));
    return inMemoryPosts.filter((p) => p.isAnnouncement || p.type === 'announcement');
  },

  async createPost(params: CreatePostParams): Promise<{ success: boolean; post?: CommunityPost; message?: string }> {
    await new Promise((res) => setTimeout(res, 350));

    if (!params.title || params.title.trim().length < 3) {
      return { success: false, message: 'Title must be at least 3 characters long.' };
    }

    if (!params.content || params.content.trim().length < 10) {
      return { success: false, message: 'Content must be at least 10 characters long.' };
    }

    const isAnn = params.isAnnouncement || params.type === 'announcement';

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: params.authorId,
      authorName: params.authorName,
      communityName: params.communityName,
      title: params.title.trim(),
      content: params.content.trim(),
      type: params.type,
      imageUrl: params.imageUrl?.trim() || undefined,
      createdAt: 'Just now',
      likeCount: 0,
      commentCount: 0,
      isAnnouncement: isAnn,
      likedBy: [],
    };

    inMemoryPosts = [newPost, ...inMemoryPosts];
    return { success: true, post: newPost };
  },

  async updatePost(
    id: string,
    currentUserId: string,
    updates: UpdatePostParams
  ): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const target = inMemoryPosts.find((p) => p.id === id);

    if (!target) {
      return { success: false, message: 'Post not found.' };
    }

    if (target.authorId !== currentUserId) {
      return { success: false, message: 'You are not authorized to edit this post.' };
    }

    inMemoryPosts = inMemoryPosts.map((p) =>
      p.id === id
        ? {
            ...p,
            ...updates,
            updatedAt: 'Just now',
          }
        : p
    );

    return { success: true };
  },

  async deletePost(id: string, currentUserId: string): Promise<{ success: boolean; message?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const target = inMemoryPosts.find((p) => p.id === id);

    if (!target) {
      return { success: false, message: 'Post not found.' };
    }

    if (target.authorId !== currentUserId) {
      return { success: false, message: 'You are not authorized to delete this post.' };
    }

    inMemoryPosts = inMemoryPosts.filter((p) => p.id !== id);
    inMemoryComments = inMemoryComments.filter((c) => c.postId !== id);
    return { success: true };
  },

  async adminRemovePost(id: string): Promise<{ success: boolean; post?: CommunityPost; message?: string }> {
    await new Promise((res) => setTimeout(res, 200));
    const target = inMemoryPosts.find((p) => p.id === id);
    if (!target) {
      return { success: false, message: 'Post not found.' };
    }
    inMemoryPosts = inMemoryPosts.filter((p) => p.id !== id);
    inMemoryComments = inMemoryComments.filter((c) => c.postId !== id);
    return { success: true, post: target };
  },

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; newCount: number }> {
    const target = inMemoryPosts.find((p) => p.id === postId);
    if (!target) return { liked: false, newCount: 0 };

    const alreadyLiked = target.likedBy.includes(userId);
    let updatedLikedBy: string[];
    let newCount = target.likeCount;

    if (alreadyLiked) {
      updatedLikedBy = target.likedBy.filter((id) => id !== userId);
      newCount = Math.max(0, newCount - 1);
    } else {
      updatedLikedBy = [...target.likedBy, userId];
      newCount = newCount + 1;
    }

    inMemoryPosts = inMemoryPosts.map((p) =>
      p.id === postId ? { ...p, likeCount: newCount, likedBy: updatedLikedBy } : p
    );

    return { liked: !alreadyLiked, newCount };
  },

  async getComments(postId: string): Promise<PostComment[]> {
    await new Promise((res) => setTimeout(res, 100));
    return inMemoryComments.filter((c) => c.postId === postId);
  },

  async addComment(
    postId: string,
    author: UserProfile,
    content: string
  ): Promise<{ success: boolean; comment?: PostComment; message?: string }> {
    await new Promise((res) => setTimeout(res, 200));

    if (!content || !content.trim()) {
      return { success: false, message: 'Comment cannot be empty.' };
    }

    const newComment: PostComment = {
      id: `cmt-${Date.now()}`,
      postId,
      authorId: author.id,
      authorName: author.fullName,
      content: content.trim().slice(0, 300),
      createdAt: 'Just now',
    };

    inMemoryComments = [newComment, ...inMemoryComments];

    // Update comment count on post
    inMemoryPosts = inMemoryPosts.map((p) =>
      p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
    );

    return { success: true, comment: newComment };
  },
};
