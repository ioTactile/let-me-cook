import { useQuery } from '@tanstack/react-query';
import { appliances } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export function useGetAppliance(id: string) {
  return useQuery({
    queryKey: queryKeys.appliances.detail(id),
    queryFn: () => appliances.getById(id),
    enabled: !!id,
  });
}
