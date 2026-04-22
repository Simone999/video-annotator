import { RouteStatusShell } from "../../../shared/ui/route-status-shell";

export function VideoLibraryStatusPanel({
  copy,
  title,
}: {
  copy: string;
  title: string;
}) {
  return (
    <RouteStatusShell copy={copy} eyebrow="Video library route" title={title} />
  );
}
