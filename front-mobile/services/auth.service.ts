import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/stores/auth.store';

export const initializeAuth = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const { setToken } = useAuth.getState();
    setToken(token);
  }
};
