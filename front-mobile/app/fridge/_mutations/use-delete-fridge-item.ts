import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fridge } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export const useDeleteFridgeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fridge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fridge.all });
    },
  });
};
