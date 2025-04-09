import { useMutation } from "@tanstack/react-query";
import { appliances } from "@/services/api.service";
import type { CreateApplianceInputs } from "@/app/appliance/_schemas/create-appliance";

export const useUpdateAppliance = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateApplianceInputs>;
    }) => {
      const response = await appliances.update(id, data);
      return response.data;
    },
  });
};
