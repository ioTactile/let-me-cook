import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "react-use";
import { useState } from "react";
import { shoppingLists } from "@/services/api.service";

export const useSearchItems = (searchTerm: string, limit: number = 10) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    300,
    [searchTerm]
  );

  return useQuery({
    queryKey: ["search-items", debouncedSearchTerm],
    queryFn: async () => {
      const response = await shoppingLists.searchItems(
        debouncedSearchTerm,
        limit
      );
      return response.data;
    },
    enabled: debouncedSearchTerm.length > 2,
  });
};
