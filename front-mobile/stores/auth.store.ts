import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  login: async (token) => {
    await AsyncStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },
}));
