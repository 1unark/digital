// context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, } from '../services/auth.service';
import { User } from '@/types/index';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { accessToken } = authService.getStoredTokens();
    if (accessToken) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { accessToken } = authService.getStoredTokens();
      
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      authService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const { access, refresh } = await authService.login(username, password);
    authService.saveTokens(access, refresh);
    await fetchUserProfile();
  };

  const register = async (username: string, email: string, password: string) => {
    await authService.register(username, email, password);
    await login(username, password);
  };

  const logout = () => {
    authService.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}