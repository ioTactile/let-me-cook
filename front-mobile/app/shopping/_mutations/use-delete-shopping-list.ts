import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";
import { queryKeys } from "@/lib/query-keys";

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shoppingLists.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.all,
      });
    },
  });
};
