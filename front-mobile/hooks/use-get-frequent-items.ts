import { shoppingLists } from "@/services/api.service";
import { useQuery } from "@tanstack/react-query";

export const useGetFrequentItems = (limit: number = 10) => {
  return useQuery({
    queryKey: ["frequent-items"],
    queryFn: async () => {
      const response = await shoppingLists.getFrequentItems(limit);
      return response.data;
    },
  });
};
