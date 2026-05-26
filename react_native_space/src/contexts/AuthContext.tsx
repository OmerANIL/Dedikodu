import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';
import type { User } from '../types';

interface SignupParams {
  nickname: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: SignupParams) => Promise<{ verificationCode?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => ({}),
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'dedikodu_token';

async function storeToken(token: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function removeToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const fetchMe = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await apiClient.get('/api/auth/me');
      const u = res?.data?.user;
      if (u) {
        setUser(u as User);
      } else {
        setUser(null);
        await removeToken();
      }
    } catch {
      setUser(null);
      await removeToken();
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchMe();
      setIsLoading(false);
    })();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post('/api/auth/login', { email, password });
    const token = res?.data?.token;
    const u = res?.data?.user;
    if (token) {
      await storeToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (u) setUser(u as User);
  }, []);

  const signup = useCallback(async (params: SignupParams) => {
    const res = await apiClient.post('/api/signup', params);
    const token = res?.data?.token;
    const u = res?.data?.user;
    const verificationCode = res?.data?.verificationCode;
    if (token) {
      await storeToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (u) setUser(u as User);
    return { verificationCode };
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
