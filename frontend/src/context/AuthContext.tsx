// context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/profile/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login/`, {
      username,
      password
    });

    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Decode JWT to get user ID (basic decoding)
    const payload = JSON.parse(atob(access.split('.')[1]));
    localStorage.setItem('user_id', payload.user_id);

    await fetchUserProfile();
  };

  const register = async (username: string, email: string, password: string) => {
    await axios.post(`${API_URL}/register/`, {
      username,
      email,
      password
    });

    // Auto-login after registration
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}