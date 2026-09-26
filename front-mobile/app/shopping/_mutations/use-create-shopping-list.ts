import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateShoppingListInputs } from '@/app/shopping/_schemas/create-shopping-list';
import { shoppingLists } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShoppingListInputs) => shoppingLists.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.all,
      });
    },
  });
};
