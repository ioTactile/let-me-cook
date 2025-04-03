import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

import { useAuth } from "@/services/auth.service";

// Cette fonction vérifie si l'utilisateur est authentifié
export function useProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger vers la page d'accueil si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
      router.replace("/");
    }
  }, [isAuthenticated, segments]);
}
