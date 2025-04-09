import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateFridgeItemInputs } from "@/app/fridge/_schemas/create-fridge-item";
import { fridge } from "@/services/api.service";

export const useCreateFridgeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFridgeItemInputs) => fridge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fridge"] });
    },
  });
};
