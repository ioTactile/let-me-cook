import { useQuery } from "@tanstack/react-query";
import { fridge } from "@/services/api.service";
import { queryKeys } from "@/lib/query-keys";

export const useGetFridgeItems = () => {
  return useQuery({
    queryKey: queryKeys.fridge.lists(),
    queryFn: () => fridge.getAll(),
  });
};
