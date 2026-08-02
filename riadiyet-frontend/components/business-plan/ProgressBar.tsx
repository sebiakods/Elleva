export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100">
      <div
        className="h-full rounded-full bg-rise-gradient transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
