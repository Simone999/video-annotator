import "../app/app.css";

import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import { createAppStore } from "./store";

export function App() {
  const store = createAppStore();

  return (
    <AppProviders store={store}>
      <AppRouter />
    </AppProviders>
  );
}
