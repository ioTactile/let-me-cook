import { useQuery } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";

export const useGetShoppingList = (id: string) => {
  return useQuery({
    queryKey: ["shopping-list", id],
    queryFn: async () => {
      const { data } = await shoppingLists.getById(id);
      return data;
    },
  });
};
