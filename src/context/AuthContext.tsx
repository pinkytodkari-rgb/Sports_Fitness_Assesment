import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, AuthSession } from '../services/authService';
import initialProfile from '../data/profile.json';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  login: (email: string, pass: string, rememberMe: boolean, role?: UserRole) => Promise<UserRole>;
  register: (fullName: string, email: string, pass: string, role: UserRole) => Promise<UserRole>;
  logout: () => Promise<void>;
  guestLogin: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(initialProfile as User);
  const [userRole, setUserRoleState] = useState<UserRole>('athlete');
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const session = await authService.getStoredSession();
      if (session && session.rememberMe) {
        setUser(session.user);
        setUserRoleState(session.user.role);
        setToken(session.token);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.log('Error restoring auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    pass: string,
    remMe: boolean,
    role: UserRole = 'athlete'
  ): Promise<UserRole> => {
    setIsLoading(true);
    try {
      const session = await authService.mockLogin(email, pass, remMe, role);
      setUser(session.user);
      setUserRoleState(session.user.role);
      setToken(session.token);
      setIsAuthenticated(true);
      setIsGuest(false);
      return session.user.role;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<UserRole> => {
    setIsLoading(true);
    try {
      const session = await authService.mockRegister(fullName, email, pass, role);
      setUser(session.user);
      setUserRoleState(session.user.role);
      setToken(session.token);
      setIsAuthenticated(true);
      setIsGuest(false);
      return session.user.role;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.clearSession();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUserRoleState('athlete');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  };

  const resetPassword = async (password: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        token,
        isAuthenticated,
        isLoading,
        isGuest,
        rememberMe,
        setRememberMe,
        login,
        register,
        logout,
        guestLogin,
        forgotPassword,
        verifyOtp,
        resetPassword,
        setUserRole,
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
