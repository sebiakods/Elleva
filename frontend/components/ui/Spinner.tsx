export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500 ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

