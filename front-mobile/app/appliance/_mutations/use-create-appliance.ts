import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";
import { CreateApplianceInputs } from "@/app/appliance/_schemas/create-appliance";
import { queryKeys } from "@/lib/query-keys";

export const useCreateAppliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplianceInputs) => appliances.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appliances.all });
    },
  });
};
