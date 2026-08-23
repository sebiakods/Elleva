import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
        <Icon size={28} />
      </div>
      <h3 className="mb-2 font-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>
      )}
      {action && (
        <Button
          href={action.href}
          onClick={action.onClick}
          variant="secondary"
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
