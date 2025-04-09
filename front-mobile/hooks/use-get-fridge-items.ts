import { useQuery } from "@tanstack/react-query";
import { fridge } from "@/services/api.service";

export const useGetFridgeItems = () => {
  return useQuery({
    queryKey: ["fridge-items"],
    queryFn: async () => {
      const { data } = await fridge.getAll();
      return data;
    },
  });
};
