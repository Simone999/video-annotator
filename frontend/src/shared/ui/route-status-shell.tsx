import type { ReactNode } from "react";

export function RouteStatusShell({
  cardClassName,
  children,
  copy,
  copyClassName,
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName,
}: {
  cardClassName?: string;
  children?: ReactNode;
  copy: string;
  copyClassName?: string;
  eyebrow: string;
  eyebrowClassName?: string;
  title: string;
  titleClassName?: string;
}) {
  const sectionClassName = cardClassName
    ? `route-status-card w-full p-8 ${cardClassName}`
    : "route-status-card w-full max-w-xl p-8";
  const eyebrowTextClassName = eyebrowClassName
    ? `console-kicker text-xs font-semibold ${eyebrowClassName}`
    : "console-kicker text-xs font-semibold text-slate-500";
  const titleTextClassName = titleClassName
    ? `mt-4 text-3xl font-semibold text-slate-50 ${titleClassName}`
    : "mt-4 text-3xl font-semibold text-slate-50";
  const copyTextClassName = copyClassName
    ? `console-copy mt-3 text-sm leading-6 ${copyClassName}`
    : "console-copy mt-3 text-sm leading-6";

  return (
    <main className="route-status-screen flex min-h-screen items-center justify-center px-6 py-16 text-slate-100">
      <section className={sectionClassName}>
        <p className={eyebrowTextClassName}>{eyebrow}</p>
        <h1 className={titleTextClassName}>{title}</h1>
        <p className={copyTextClassName}>{copy}</p>
        {children}
      </section>
    </main>
  );
}
