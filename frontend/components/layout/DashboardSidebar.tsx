import { GenericSidebar } from "@/components/layout/Genericsidebar";

const DASHBOARD_NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Aperçu",
    icon: "LayoutDashboard",
  },
  {
    href: "/dashboard/business-plans",
    label: "Business Plans",
    icon: "FileText",
  },
  {
    href: "/dashboard/programs",
    label: "Programmes",
    icon: "Landmark",
  },
  {
    href: "/dashboard/courses",
    label: "Cours",
    icon: "BookOpen",
  },
  {
    href: "/dashboard/meeting",
    label: "Réunions",
    icon: "Video",
  },
  {
    href: "/dashboard/calculators",
    label: "Calculateurs",
    icon: "Calculator",
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: "MessageSquare",
  },
  {
    href: "/dashboard/communaute",
    label: "Communauté",
    icon: "Users",
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: "Bell",
  },
  {
    href: "/dashboard/qa",
    label: "Q&R",
    icon: "HelpCircle",
  },
  {
    href: "/dashboard/profile",
    label: "Profil",
    icon: "User",
  },
  {
    href: "/dashboard/settings",
    label: "Paramètres",
    icon: "Settings",
  },
];

export function DashboardSidebar() {
  return (
    <GenericSidebar
      links={DASHBOARD_NAV_LINKS}
      theme="dark"
      sectionLabel="Tableau de bord"
    />
  );
}
