import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'react-use';
import { useState } from 'react';
import { shoppingLists } from '@/services/api.service';
import { queryKeys } from '@/lib/query-keys';

export const useSearchItems = (searchTerm: string, limit: number = 10) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    300,
    [searchTerm],
  );

  return useQuery({
    queryKey: queryKeys.shoppingLists.searchItems(debouncedSearchTerm),
    queryFn: () => shoppingLists.searchItems(debouncedSearchTerm, limit),
    enabled: debouncedSearchTerm.length > 2,
  });
};
