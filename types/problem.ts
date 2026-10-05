export type ProblemCategory =
  | 'water'
  | 'electricity'
  | 'cleanliness'
  | 'roads'
  | 'parking'
  | 'security'
  | 'noise'
  | 'maintenance'
  | 'other';

export type ProblemStatus =
  | 'reported'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface CommunityProblem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  location: string;
  imageUrl?: string;
  reportedById: string;
  reportedByName: string;
  communityName: string;
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
}

export interface CreateProblemParams {
  title: string;
  description: string;
  category: ProblemCategory;
  location: string;
  imageUrl?: string;
  reportedById: string;
  reportedByName: string;
  communityName: string;
}
