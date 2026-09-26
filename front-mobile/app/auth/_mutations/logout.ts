import { useMutation } from "@tanstack/react-query";
import { auth } from "@/services/api.service";
import { useAuth } from "@/stores/auth.store";
import { router } from "expo-router";
import { useSnackbarStore } from "@/stores/snackbar.store";

export const useLogout = () => {
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: async () => {
      await auth.logout();
      await logout();
    },
    onSuccess: () => {
      router.replace("/auth/login");
    },
    onError: (error) => {
      showSnackbar(error.message, "error");
    },
  });
};
