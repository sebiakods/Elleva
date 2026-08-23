import { GenericSidebar } from "@/components/layout/Genericsidebar";
import { INSTITUTION_NAV_LINKS } from "@/lib/constants";

export function InstitutionSidebar() {
  return (
    <GenericSidebar
      links={INSTITUTION_NAV_LINKS}
      theme="dark"
      sectionLabel="Espace Institution"
    />
  );
}
