import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingLists } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export const useUpdateShoppingListStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => shoppingLists.validate(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.detail(variables.id),
      });
    },
  });
};
