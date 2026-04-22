import type { ReactNode } from "react";

import { AppStoreProvider, type AppStore } from "./store";

export function AppProviders({
  children,
  store,
}: {
  children: ReactNode;
  store: AppStore;
}) {
  return <AppStoreProvider store={store}>{children}</AppStoreProvider>;
}
