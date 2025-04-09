import { useMutation } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";

export const useDeleteAppliance = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appliances.delete(id);
      return response.data;
    },
  });
};
