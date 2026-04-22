export function VideoLibraryStatusPanel({
  copy,
  title,
}: {
  copy: string;
  title: string;
}) {
  return (
    <main className="route-status-screen flex min-h-screen items-center justify-center px-6 py-16 text-slate-100">
      <section className="route-status-card w-full max-w-xl p-8">
        <p className="console-kicker text-xs font-semibold text-slate-500">
          Video library route
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">{title}</h1>
        <p className="console-copy mt-3 text-sm leading-6">{copy}</p>
      </section>
    </main>
  );
}
