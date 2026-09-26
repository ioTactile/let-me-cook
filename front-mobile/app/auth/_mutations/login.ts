import { useMutation } from '@tanstack/react-query';
import { auth } from '@/services/api.service';
import { LoginInputs } from '@/app/auth/_schemas/login';
import { useAuth } from '@/stores/auth.store';
import { router } from 'expo-router';
import { useSnackbarStore } from '@/stores/snackbar.store';

export const useLogin = () => {
  const { login } = useAuth();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: async (data: LoginInputs) => {
      const response = await auth.login(data.email, data.password);
      await login(response.token);
      return response;
    },
    onSuccess: () => {
      router.replace('/');
    },
    onError: (error) => {
      showSnackbar(error.message, 'error');
    },
  });
};
