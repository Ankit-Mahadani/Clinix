import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (name: string, email: string, password: string, password2: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await api.auth.me();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          // Token might be expired or invalid; client interceptor will attempt refresh or clear
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      const data = res.data as any;
      const userData = data.user;
      const accessToken = data.access || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;

      if (!accessToken) {
        throw new Error('Authentication failed: access token not received from server.');
      }

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setToken(accessToken);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  };

  const demoLogin = async () => {
    try {
      await login('demo@clinix.com', 'Password123!');
    } catch {
      await login('demo@meditrack.com', 'Password123!');
    }
  };

  const register = async (name: string, email: string, password: string, password2: string) => {
    const res = await api.auth.register({ name, email, password, password2 });
    if (res.success && res.data) {
      const data = res.data as any;
      const userData = data.user;
      const accessToken = data.access || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;

      if (!accessToken) {
        throw new Error('Registration failed: access token not received from server.');
      }

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setToken(accessToken);
    } else {
      throw new Error(res.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
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
