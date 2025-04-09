import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateShoppingListItemInputs } from "@/app/shopping/_schemas/update-shopping-list-item";
import { shoppingLists } from "@/services/api.service";

export const useUpdateShoppingListItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShoppingListItemInputs;
    }) => {
      const response = await shoppingLists.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};
