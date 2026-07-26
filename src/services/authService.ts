import { User, UserRole } from '../types';
import initialProfile from '../data/profile.json';

const AUTH_KEY = '@athlete_ai_auth_session';

export interface AuthSession {
  user: User;
  token: string;
  rememberMe: boolean;
}

// In-memory fallback for environments without localStorage
let memoryStorage: Record<string, string> = {};

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // Fallback to memory
  }
  return memoryStorage[key] || null;
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    // Fallback to memory
  }
  memoryStorage[key] = value;
};

const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (e) {
    // Fallback to memory
  }
  delete memoryStorage[key];
};

export const authService = {
  async getStoredSession(): Promise<AuthSession | null> {
    const raw = await getStorageItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async saveSession(session: AuthSession): Promise<void> {
    await setStorageItem(AUTH_KEY, JSON.stringify(session));
  },

  async clearSession(): Promise<void> {
    await removeStorageItem(AUTH_KEY);
  },

  async mockLogin(email: string, pass: string, rememberMe: boolean, role: UserRole = 'athlete'): Promise<AuthSession> {
    const mockUser: User = {
      ...(initialProfile as User),
      email: email || 'marcus.vance@athlete.ai',
      role: role,
    };

    const session: AuthSession = {
      user: mockUser,
      token: `token_${Date.now()}`,
      rememberMe,
    };

    if (rememberMe) {
      await this.saveSession(session);
    }
    return session;
  },

  async mockRegister(
    fullName: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<AuthSession> {
    const mockUser: User = {
      ...(initialProfile as User),
      id: `ath_${Date.now()}`,
      name: fullName || 'New Athlete',
      email: email || 'new@athlete.ai',
      role: role,
    };

    const session: AuthSession = {
      user: mockUser,
      token: `token_reg_${Date.now()}`,
      rememberMe: true,
    };

    await this.saveSession(session);
    return session;
  },
};
