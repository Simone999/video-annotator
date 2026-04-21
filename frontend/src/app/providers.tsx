import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";

import { AppStoreProvider, type AppStore } from "./store";

export function AppProviders({
  children,
  store,
}: {
  children: ReactNode;
  store: AppStore;
}) {
  return (
    <AppStoreProvider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </AppStoreProvider>
  );
}
