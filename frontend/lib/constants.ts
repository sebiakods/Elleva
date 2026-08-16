export const SITE = {
  name: "Ellevadz",
  tagline: "Elle s'élève",
  description:
    "La plateforme algérienne qui accompagne les femmes entrepreneures : financement, business plan, mentorat et outils financiers.",
};

// ─── Public navigation ────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/financing", label: "Financement" },
  { href: "/experts", label: "Expertes" },
  { href: "/institutions", label: "Institutions" },
  { href: "/calculators", label: "Outils financiers" },
  { href: "/business-plan", label: "Business Plan" },
  { href: "/resources", label: "Ressources" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

// ─── Financing ────────────────────────────────────────────────────────────────
export const FINANCING_CATEGORIES = [
  { slug: "bank-loan", label: "Prêt bancaire", icon: "Landmark" },
  { slug: "islamic-finance", label: "Finance islamique", icon: "Moon" },
  { slug: "government-grant", label: "Aide gouvernementale", icon: "Building2" },
  { slug: "startup-funding", label: "Financement startup", icon: "Rocket" },
];

// ─── Expert sidebar nav ───────────────────────────────────────────────────────
export const EXPERT_NAV_LINKS = [
  { href: "/expert", label: "Aperçu", icon: "LayoutDashboard" },
  { href: "/expert/courses", label: "Cours", icon: "GraduationCap" },
  { href: "/expert/business-plans", label: "Business Plans", icon: "FileText" },
  { href: "/expert/entrepreneurs", label: "Entrepreneures", icon: "Users" },
  { href: "/expert/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/expert/qa", label: "Q&A", icon: "HelpCircle" },
  { href: "/expert/calendar", label: "Calendrier", icon: "Calendar" },
  { href: "/expert/notifications", label: "Notifications", icon: "Bell" },
  { href: "/expert/analytics", label: "Analytics", icon: "BarChart2" },
  { href: "/expert/meeting", label: "Réunions", icon: "CalendarPlus" },
  { href: "/expert/profile", label: "Profil", icon: "User" },
  { href: "/expert/settings", label: "Paramètres", icon: "Settings" },
];

// ─── Institution sidebar nav ──────────────────────────────────────────────────
export const INSTITUTION_NAV_LINKS = [
  { href: "/institution", label: "Aperçu", icon: "LayoutDashboard" },
  { href: "/institution/programs", label: "Programmes", icon: "Landmark" },
  { href: "/institution/applications", label: "Candidatures", icon: "ClipboardList" },
  { href: "/institution/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/institution/events", label: "Événements", icon: "CalendarDays" },
  { href: "/institution/documents", label: "Documents", icon: "FolderOpen" },,
  { href: "/institution/analytics", label: "Analytics", icon: "BarChart2" },
  { href: "/institution/profile", label: "Profil", icon: "Building2" },
  { href: "/institution/settings", label: "Paramètres", icon: "Settings" },
];

// ─── Expert specialties ───────────────────────────────────────────────────────
export const EXPERT_SPECIALTIES = [
  { slug: "financement", label: "Financement" },
  { slug: "business-plan", label: "Business Plan" },
  { slug: "marketing", label: "Marketing" },
  { slug: "juridique", label: "Juridique" },
  { slug: "comptabilite", label: "Comptabilité" },
  { slug: "tech", label: "Tech & Digital" },
  { slug: "rh", label: "Ressources humaines" },
];

// ─── Institution types ────────────────────────────────────────────────────────
export const INSTITUTION_TYPES = [
  { slug: "bank", label: "Banque" },
  { slug: "government", label: "Organisme public" },
  { slug: "incubator", label: "Incubateur" },
  { slug: "accelerator", label: "Accélérateur" },
  { slug: "ngo", label: "ONG" },
  { slug: "investor", label: "Investisseur" },
];

// ─── Application statuses ─────────────────────────────────────────────────────
export const APPLICATION_STATUS_MAP = {
  draft: { label: "Brouillon", tone: "neutral" },
  submitted: { label: "Soumise", tone: "wine" },
  under_review: { label: "En révision", tone: "gold" },
  approved: { label: "Approuvée", tone: "rose" },
  rejected: { label: "Refusée", tone: "neutral" },
  waitlisted: { label: "Liste d'attente", tone: "gold" },
} as const;