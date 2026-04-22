export function MaterialSymbolIcon({
  className,
  name,
}: {
  className?: string;
  name: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className ? `material-symbol ${className}` : "material-symbol"}
      data-icon={name}
    />
  );
}
