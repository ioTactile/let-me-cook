import { useMutation } from '@tanstack/react-query';
import { auth } from '@/services/api.service';
import { RegisterInputs } from '@/app/auth/_schemas/register';
import { useAuth } from '@/stores/auth.store';
import { router } from 'expo-router';
import { useSnackbarStore } from '@/stores/snackbar.store';

export const useRegister = () => {
  const { login } = useAuth();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: async (data: RegisterInputs) => {
      const response = await auth.register(data.email, data.password, data.username);
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
