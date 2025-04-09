import { useQuery } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";

export function useGetAppliances() {
  return useQuery({
    queryKey: ["appliances"],
    queryFn: async () => {
      const response = await appliances.getAll();
      return response.data;
    },
  });
}
