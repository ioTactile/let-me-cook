import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appliances } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export const useDeleteAppliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appliances.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appliances.all });
    },
  });
};
