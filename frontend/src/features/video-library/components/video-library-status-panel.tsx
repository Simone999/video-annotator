export function VideoLibraryStatusPanel({
  copy,
  title,
}: {
  copy: string;
  title: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Video library route
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
      </section>
    </main>
  );
}
