import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fridge } from "@/services/api.service";

export const useDeleteFridgeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fridge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fridge"] });
    },
  });
};
