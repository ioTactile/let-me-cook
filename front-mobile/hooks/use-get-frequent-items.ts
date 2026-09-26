import { shoppingLists } from '@/services/api.service';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useGetFrequentItems = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.shoppingLists.frequentItems(),
    queryFn: () => shoppingLists.getFrequentItems(limit),
  });
};
