export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-rise">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}
