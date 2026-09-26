import { useQuery } from '@tanstack/react-query';
import { appliances } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export function useGetAppliances() {
  return useQuery({
    queryKey: queryKeys.appliances.lists(),
    queryFn: () => appliances.getAll(),
  });
}
