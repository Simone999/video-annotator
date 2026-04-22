import { BrowserRouter, Link, Route, Routes } from "react-router";

import { VideoLibraryRoutePage } from "../features/video-library";
import { VideoReviewRoutePage } from "../features/video-review";
import { useAppStore } from "./store";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<VideoLibraryRoutePage />} path="/" />
        <Route element={<VideoReviewRoutePage />} path="/review/:videoId" />
        <Route element={<NotFoundRoute />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

function NotFoundRoute() {
  const store = useAppStore();

  return (
    <main className="route-status-screen flex min-h-screen items-center justify-center px-6 py-16 text-slate-100">
      <div className="route-status-card w-full max-w-md p-8">
        <p className="console-kicker text-xs font-semibold text-slate-500">
          Route
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">
          Page not found
        </h1>
        <p className="console-copy mt-3 text-sm leading-6">
          Current app route map only serves library and review pages.
        </p>
        <Link
          className="ghost-button mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-100"
          to={store.routes.library}
        >
          Back to Library
        </Link>
      </div>
    </main>
  );
}
