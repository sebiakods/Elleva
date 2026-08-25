import { LucideIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";


export function PageShell({
  title,
  badge,
  icon,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  badge?: string;
  icon: LucideIcon;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <>
      <Header title={title} />

      {badge && (
        <div className="mb-6">
          <Badge tone="rose">{badge}</Badge>
        </div>
      )}

      <div className="card-surface shadow-card">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={
            actionLabel
              ? { label: actionLabel, href: actionHref }
              : undefined
          }
        />
      </div>
    </>
  );
}
