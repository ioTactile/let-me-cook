import { useQuery } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";
import { queryKeys } from "@/lib/query-keys";

export const useGetShoppingList = (id: string) => {
  return useQuery({
    queryKey: queryKeys.shoppingLists.detail(id),
    queryFn: () => shoppingLists.getById(id),
    enabled: !!id,
  });
};
