"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Newspaper,
  FileText,
  Tag,
  MessageSquare,
  Settings,
  LogOut,
  UserCheck,
} from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },

  // New section
  { href: "/admin/requests", label: "Demandes", icon: UserCheck },

  { href: "/admin/programs", label: "Programmes", icon: Landmark },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/business-plans", label: "Business Plans", icon: FileText },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
  { href: "/admin/messages", label: "Support", icon: MessageSquare },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-wine-900 p-5 lg:flex">

      <div className="mb-8 rounded-xl bg-white/95 px-4 py-2 w-fit">
        <Logo />
      </div>

      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
        Administration
      </p>

      <nav className="flex-1 space-y-1">
        {links.map((l) => {
          const active =
            pathname === l.href ||
            (l.href !== "/admin" && pathname.startsWith(l.href));

          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-rise-gradient text-white"
                  : "text-white/70 hover:bg-white/10"
              )}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/login"
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10"
      >
        <LogOut size={18} />
        Déconnexion
      </Link>

    </aside>
  );
}