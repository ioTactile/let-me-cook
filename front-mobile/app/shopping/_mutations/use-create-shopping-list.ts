import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateShoppingListInputs } from "@/app/shopping/_schemas/create-shopping-list";
import { shoppingLists } from "@/services/api.service";

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShoppingListInputs) => {
      const response = await shoppingLists.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};
