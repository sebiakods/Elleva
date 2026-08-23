import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-surface shadow-card p-6",
        hover && "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-bloom",
        className
      )}
    >
      {children}
    </div>
  );
}

