import { MaterialSymbolIcon } from "../../../app/material-symbol-icon";

type VideoLibraryIconName =
  | "chevronDown"
  | "help"
  | "moreHorizontal"
  | "search"
  | "settings";

export function VideoLibraryIcon({
  className,
  name,
}: {
  className?: string;
  name: VideoLibraryIconName;
}) {
  const symbolName = resolveSymbolName(name);

  return <MaterialSymbolIcon className={className} name={symbolName} />;
}

function resolveSymbolName(name: VideoLibraryIconName): string {
  switch (name) {
    case "search":
      return "search";
    case "settings":
      return "settings";
    case "help":
      return "help";
    case "chevronDown":
      return "expand_more";
    case "moreHorizontal":
      return "more_vert";
  }
}
