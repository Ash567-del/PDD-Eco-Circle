import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, RegisterParams } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  registerUser: (params: RegisterParams) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  checkVerificationStatus: () => Promise<string>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.loginUser(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const loginAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.loginAdmin(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const registerUser = async (params: RegisterParams) => {
    setIsLoading(true);
    const res = await authService.registerUser(params);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      return { success: false, message: 'No active session.' };
    }
    setIsLoading(true);
    const res = await authService.updateUserProfile(currentUser.id, updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const checkVerificationStatus = async () => {
    if (!currentUser) return 'none';
    const status = await authService.getVerificationStatus(currentUser.id);
    if (currentUser.verificationStatus !== status) {
      setCurrentUser({ ...currentUser, verificationStatus: status });
    }
    return status;
  };

  const approveUser = async (userId: string) => {
    await authService.approveUser(userId);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, verificationStatus: 'approved' });
    }
  };

  const rejectUser = async (userId: string, reason?: string) => {
    await authService.rejectUser(userId, reason);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, verificationStatus: 'rejected', rejectionReason: reason });
    }
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        loginUser,
        loginAdmin,
        registerUser,
        updateProfile,
        checkVerificationStatus,
        approveUser,
        rejectUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
