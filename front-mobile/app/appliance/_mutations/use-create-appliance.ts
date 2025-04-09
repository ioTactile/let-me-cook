import { useMutation } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";
import { CreateApplianceInputs } from "@/app/appliance/_schemas/create-appliance";

export const useCreateAppliance = () => {
  return useMutation({
    mutationFn: async (data: CreateApplianceInputs) => {
      const response = await appliances.create(data);
      return response.data;
    },
  });
};
