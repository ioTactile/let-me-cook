import { useQuery } from "@tanstack/react-query";
import { fridge } from "@/services/api.service";
import { FridgeItem } from "@/types";

export const useGetFridgeItem = (id: string) => {
  return useQuery<FridgeItem>({
    queryKey: ["fridge", id],
    queryFn: async () => {
      const response = await fridge.getById(id);
      return response.data;
    },
  });
};
