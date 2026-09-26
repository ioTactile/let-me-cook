import { useQuery } from "@tanstack/react-query";
import { fridge } from "@/services/api.service";
import { FridgeItem } from "@/types";
import { queryKeys } from "@/lib/query-keys";

export const useGetFridgeItem = (id: string) => {
  return useQuery<FridgeItem>({
    queryKey: queryKeys.fridge.detail(id),
    queryFn: () => fridge.getById(id),
    enabled: !!id,
  });
};
