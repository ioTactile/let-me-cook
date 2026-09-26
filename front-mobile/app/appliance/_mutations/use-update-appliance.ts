import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appliances } from '@/services/api.service';
import type { CreateApplianceInputs } from '@/app/appliance/_schemas/create-appliance';
import { queryKeys } from '@/lib/query-keys';

export const useUpdateAppliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApplianceInputs> }) =>
      appliances.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appliances.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.appliances.detail(variables.id),
      });
    },
  });
};
