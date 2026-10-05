import { UserProfile, VerificationStatus, UserRole, RegisterParams } from '../types/auth';

// DEMO / DEVELOPMENT MOCK ACCOUNTS
// Strictly for testing authentication & verification workflows before Supabase integration.
export const DEMO_USERS: (UserProfile & { passwordHash: string })[] = [
  {
    id: 'usr-admin-1',
    fullName: 'Eleanor Vance (Admin)',
    email: 'admin@ecocircle.org',
    phone: '+1 555-0192',
    houseNumber: 'Office #101',
    area: 'Central Management',
    communityName: 'Greenwood Sector 4',
    role: 'admin',
    verificationStatus: 'approved',
    joinedDate: '2026-01-10',
    passwordHash: 'admin123',
  },
  {
    id: 'usr-approved-1',
    fullName: 'Sarah Jenkins',
    email: 'approved@example.com',
    phone: '+1 555-0188',
    houseNumber: 'Flat 18B',
    area: 'Pine Avenue, Sector 2',
    communityName: 'Greenwood Sector 4',
    role: 'user',
    verificationStatus: 'approved',
    joinedDate: '2026-03-01',
    passwordHash: 'user123',
  },
  {
    id: 'usr-pending-1',
    fullName: 'Marcus Chen',
    email: 'pending@example.com',
    phone: '+1 555-0177',
    houseNumber: 'House 88',
    area: 'Oak Lane, Sector 5',
    communityName: 'Greenwood Sector 4',
    role: 'user',
    verificationStatus: 'pending',
    joinedDate: '2026-10-04',
    passwordHash: 'user123',
  },
  {
    id: 'usr-rejected-1',
    fullName: 'John Doe',
    email: 'rejected@example.com',
    phone: '+1 555-0199',
    houseNumber: 'Flat 5',
    area: 'Unknown Street',
    communityName: 'External Community',
    role: 'user',
    verificationStatus: 'rejected',
    rejectionReason: 'Invalid community address proof.',
    joinedDate: '2026-09-15',
    passwordHash: 'user123',
  },
];

let inMemoryUsers = [...DEMO_USERS];
let currentUserSession: UserProfile | null = null;

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    return currentUserSession;
  },

  async loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    await new Promise((res) => setTimeout(res, 600)); // Simulate async auth network delay
    const found = inMemoryUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (found.passwordHash !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (found.role === 'admin') {
      return { success: false, message: 'Admin accounts must log in via Admin Login portal.' };
    }

    const userProfile: UserProfile = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      phone: found.phone,
      houseNumber: found.houseNumber,
      area: found.area,
      communityName: found.communityName,
      role: found.role,
      verificationStatus: found.verificationStatus,
      avatarUrl: found.avatarUrl,
      rejectionReason: found.rejectionReason,
      joinedDate: found.joinedDate,
    };

    currentUserSession = userProfile;
    return { success: true, user: userProfile };
  },

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    await new Promise((res) => setTimeout(res, 600));
    const found = inMemoryUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found || found.passwordHash !== password) {
      return { success: false, message: 'Invalid administrator credentials.' };
    }

    if (found.role !== 'admin') {
      return { success: false, message: 'Access Denied: Account does not have Administrator permissions.' };
    }

    const userProfile: UserProfile = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      phone: found.phone,
      houseNumber: found.houseNumber,
      area: found.area,
      communityName: found.communityName,
      role: found.role,
      verificationStatus: found.verificationStatus,
      avatarUrl: found.avatarUrl,
      joinedDate: found.joinedDate,
    };

    currentUserSession = userProfile;
    return { success: true, user: userProfile };
  },

  async registerUser(params: RegisterParams): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    await new Promise((res) => setTimeout(res, 600));
    const exists = inMemoryUsers.some((u) => u.email.toLowerCase() === params.email.trim().toLowerCase());

    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: params.fullName,
      email: params.email.trim(),
      phone: params.phone,
      houseNumber: params.houseNumber,
      area: params.area,
      communityName: params.communityName,
      role: 'user' as UserRole,
      verificationStatus: 'pending' as VerificationStatus,
      joinedDate: new Date().toISOString().split('T')[0],
      passwordHash: params.password || 'default123',
    };

    inMemoryUsers = [newUser, ...inMemoryUsers];

    const userProfile: UserProfile = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      houseNumber: newUser.houseNumber,
      area: newUser.area,
      communityName: newUser.communityName,
      role: newUser.role,
      verificationStatus: newUser.verificationStatus,
      joinedDate: newUser.joinedDate,
    };

    currentUserSession = userProfile;
    return { success: true, user: userProfile };
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'role' | 'verificationStatus'>>
  ): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const index = inMemoryUsers.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, message: 'User account not found.' };
    }

    // Do NOT allow changing system fields
    const { ...safeUpdates } = updates;
    delete (safeUpdates as any).id;
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).verificationStatus;

    inMemoryUsers[index] = {
      ...inMemoryUsers[index],
      ...safeUpdates,
    };

    const updatedProfile: UserProfile = {
      id: inMemoryUsers[index].id,
      fullName: inMemoryUsers[index].fullName,
      email: inMemoryUsers[index].email,
      phone: inMemoryUsers[index].phone,
      houseNumber: inMemoryUsers[index].houseNumber,
      area: inMemoryUsers[index].area,
      communityName: inMemoryUsers[index].communityName,
      role: inMemoryUsers[index].role,
      verificationStatus: inMemoryUsers[index].verificationStatus,
      avatarUrl: inMemoryUsers[index].avatarUrl,
      joinedDate: inMemoryUsers[index].joinedDate,
    };

    if (currentUserSession && currentUserSession.id === userId) {
      currentUserSession = updatedProfile;
    }

    return { success: true, user: updatedProfile };
  },

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const found = inMemoryUsers.find((u) => u.id === userId);
    return found ? found.verificationStatus : 'pending';
  },

  async approveUser(userId: string): Promise<boolean> {
    inMemoryUsers = inMemoryUsers.map((u) => (u.id === userId ? { ...u, verificationStatus: 'approved' } : u));
    if (currentUserSession && currentUserSession.id === userId) {
      currentUserSession = { ...currentUserSession, verificationStatus: 'approved' };
    }
    return true;
  },

  async rejectUser(userId: string, reason = 'Did not satisfy community verification criteria.'): Promise<boolean> {
    inMemoryUsers = inMemoryUsers.map((u) =>
      u.id === userId ? { ...u, verificationStatus: 'rejected', rejectionReason: reason } : u
    );
    if (currentUserSession && currentUserSession.id === userId) {
      currentUserSession = { ...currentUserSession, verificationStatus: 'rejected', rejectionReason: reason };
    }
    return true;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    return inMemoryUsers.map(({ passwordHash, ...user }) => user);
  },

  async logout(): Promise<void> {
    currentUserSession = null;
  },
};
