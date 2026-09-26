import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateShoppingListItemInputs } from "@/app/shopping/_schemas/update-shopping-list-item";
import { shoppingLists } from "@/services/api.service";
import { queryKeys } from "@/lib/query-keys";

export const useUpdateShoppingListItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShoppingListItemInputs;
    }) => shoppingLists.update(id, data),
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
