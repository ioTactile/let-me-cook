export const queryKeys = {
  fridge: {
    all: ['fridge'] as const,
    lists: () => [...queryKeys.fridge.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.fridge.all, 'detail', id] as const,
  },
  appliances: {
    all: ['appliances'] as const,
    lists: () => [...queryKeys.appliances.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.appliances.all, 'detail', id] as const,
  },
  shoppingLists: {
    all: ['shopping-lists'] as const,
    lists: () => [...queryKeys.shoppingLists.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.shoppingLists.all, 'detail', id] as const,
    frequentItems: () => [...queryKeys.shoppingLists.all, 'frequent-items'] as const,
    searchItems: (term: string) => [...queryKeys.shoppingLists.all, 'search-items', term] as const,
  },
} as const;
