import { LucideIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";

/**
 * Lightweight wrapper used during Step 4 (routing scaffolding).
 * Every placeholder page renders a consistent preview card so the
 * entire navigation is explorable before full implementation begins.
 *
 * Step 5 will replace the inner content with full implementations
 * while keeping Header usage and prop signatures identical.
 */
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