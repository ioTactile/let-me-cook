import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";

export const useUpdateShoppingListStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await shoppingLists.validate(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
};
