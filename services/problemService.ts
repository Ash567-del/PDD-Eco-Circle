import { CommunityProblem, CreateProblemParams, ProblemCategory, ProblemStatus } from '../types/problem';
import { INITIAL_PROBLEMS } from './problemMockData';

let mockProblems: CommunityProblem[] = [...INITIAL_PROBLEMS];

export const problemService = {
  async getProblems(): Promise<CommunityProblem[]> {
    return [...mockProblems];
  },

  async getProblemById(id: string): Promise<CommunityProblem | null> {
    const problem = mockProblems.find((p) => p.id === id);
    return problem ? { ...problem } : null;
  },

  async getProblemsByUser(userId: string): Promise<CommunityProblem[]> {
    if (!userId) return [];
    return mockProblems.filter((p) => p.reportedById === userId);
  },

  async getProblemsByStatus(status: ProblemStatus): Promise<CommunityProblem[]> {
    return mockProblems.filter((p) => p.status === status);
  },

  async getProblemsByCategory(category: ProblemCategory): Promise<CommunityProblem[]> {
    return mockProblems.filter((p) => p.category === category);
  },

  async createProblem(params: CreateProblemParams): Promise<CommunityProblem> {
    const now = new Date().toISOString();
    const newProblem: CommunityProblem = {
      ...params,
      id: `prob-${Date.now()}`,
      status: 'reported',
      createdAt: now,
      updatedAt: now,
    };
    mockProblems.unshift(newProblem);
    return { ...newProblem };
  },

  async updateProblem(
    id: string,
    params: Partial<CommunityProblem>
  ): Promise<CommunityProblem | null> {
    const index = mockProblems.findIndex((p) => p.id === id);
    if (index === -1) return null;

    mockProblems[index] = {
      ...mockProblems[index],
      ...params,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockProblems[index] };
  },

  async deleteProblem(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const problem = mockProblems.find((p) => p.id === id);

    if (!problem) {
      return { success: false, message: 'Report not found.' };
    }

    if (problem.reportedById !== userId) {
      return { success: false, message: 'You can only delete your own reports.' };
    }

    if (problem.status !== 'reported') {
      return {
        success: false,
        message: 'Reports that are under review or in progress cannot be deleted.',
      };
    }

    mockProblems = mockProblems.filter((p) => p.id !== id);
    return { success: true, message: 'Problem report deleted successfully.' };
  },
};
