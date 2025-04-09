import { useQuery } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";

export function useGetAppliance(id: string) {
  return useQuery({
    queryKey: ["appliance", id],
    queryFn: async () => {
      const response = await appliances.getById(id);
      return response.data;
    },
  });
}
