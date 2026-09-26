import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useAuth } from '@/stores/auth.store';

export function useProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users away from auth pages
      router.replace('/');
    }
  }, [isAuthenticated, segments]);
}
