import { Link, Route, Routes, useParams } from "react-router";

import { UiShellApp } from "../features/ui-shell";
import { LiveReviewApp } from "./live-review-app";
import { useAppStore } from "./store";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<UiShellApp />} path="/" />
      <Route element={<ReviewRoute />} path="/review/:videoId" />
      <Route element={<NotFoundRoute />} path="*" />
    </Routes>
  );
}

function ReviewRoute() {
  const { videoId } = useParams<{ videoId: string }>();

  return <LiveReviewApp initialVideoId={videoId ?? null} />;
}

function NotFoundRoute() {
  const store = useAppStore();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-950">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Route
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Current app route map only serves library and review pages.
        </p>
        <Link
          className="mt-6 inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          to={store.routes.library}
        >
          Back to Library
        </Link>
      </div>
    </main>
  );
}
