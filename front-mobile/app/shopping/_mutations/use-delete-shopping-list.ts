import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shoppingLists.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};
