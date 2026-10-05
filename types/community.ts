export type PostType =
  | 'general'
  | 'information'
  | 'announcement'
  | 'question'
  | 'recommendation'
  | 'community_help';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  communityName: string;
  title: string;
  content: string;
  type: PostType;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  commentCount: number;
  isAnnouncement: boolean;
  likedBy: string[]; // List of user IDs who liked the post
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CreatePostParams {
  title: string;
  content: string;
  type: PostType;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  communityName: string;
  isAnnouncement?: boolean;
}

export interface UpdatePostParams {
  title?: string;
  content?: string;
  type?: PostType;
  imageUrl?: string;
}
