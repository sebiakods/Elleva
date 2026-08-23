import { cn } from "@/lib/utils";

export function Select({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      )}
      <select
        className={cn(
          "w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink transition-colors focus-ring focus:border-rose-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

