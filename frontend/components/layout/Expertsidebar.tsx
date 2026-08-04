import { GenericSidebar } from "@/components/layout/Genericsidebar";
import { EXPERT_NAV_LINKS } from "@/lib/constants";

export function ExpertSidebar() {
  return (
    <GenericSidebar
      links={EXPERT_NAV_LINKS}
      theme="dark"
      sectionLabel="Espace Experte"
    />
  );
}