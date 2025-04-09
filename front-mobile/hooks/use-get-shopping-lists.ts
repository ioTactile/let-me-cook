import { useQuery } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";

export const useGetShoppingLists = () => {
  return useQuery({
    queryKey: ["shopping-lists"],
    queryFn: async () => {
      const { data } = await shoppingLists.getAll();
      return data;
    },
  });
};
