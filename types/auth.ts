export type UserRole = 'user' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  houseNumber: string;
  area: string;
  communityName: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  rejectionReason?: string;
  joinedDate: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  phone: string;
  houseNumber: string;
  area: string;
  communityName: string;
  password?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
