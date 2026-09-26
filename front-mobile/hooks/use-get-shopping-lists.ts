import { useQuery } from "@tanstack/react-query";
import { shoppingLists } from "@/services/api.service";
import { queryKeys } from "@/lib/query-keys";

export const useGetShoppingLists = () => {
  return useQuery({
    queryKey: queryKeys.shoppingLists.lists(),
    queryFn: () => shoppingLists.getAll(),
  });
};
