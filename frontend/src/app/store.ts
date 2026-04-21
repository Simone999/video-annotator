import {
  createElement,
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type AppStore = {
  readonly routes: {
    readonly library: "/";
    readonly review: "/review/:videoId";
  };
};

const AppStoreContext = createContext<AppStore | null>(null);

export function createAppStore(): AppStore {
  return {
    routes: {
      library: "/",
      review: "/review/:videoId",
    },
  };
}

export function AppStoreProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: AppStore;
}) {
  return createElement(AppStoreContext.Provider, { value: store }, children);
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext);

  if (store === null) {
    throw new Error("App store unavailable.");
  }

  return store;
}
