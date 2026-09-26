import React from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// `useSyncExternalStore` uses getServerSnapshot during SSR/hydration,
// then switches to the client snapshot — no setState-in-effect needed.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const isClient = React.useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  return isClient ? client : server;
}
